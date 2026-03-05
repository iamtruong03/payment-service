package com.example.payment0403.service;

import com.example.payment0403.model.FraudLog;
import com.example.payment0403.repository.FraudLogRepository;
import com.example.payment0403.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class FraudDetectionService {

    private static final int RISK_THRESHOLD = 70;

    private final TransactionRepository transactionRepository;
    private final FraudLogRepository fraudLogRepository;
    private final RateLimiterService rateLimiterService;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public FraudDetectionService(TransactionRepository transactionRepository,
            FraudLogRepository fraudLogRepository,
            RateLimiterService rateLimiterService,
            org.springframework.context.ApplicationEventPublisher eventPublisher) {
        this.transactionRepository = transactionRepository;
        this.fraudLogRepository = fraudLogRepository;
        this.rateLimiterService = rateLimiterService;
        this.eventPublisher = eventPublisher;
    }

    public record FraudCheckResult(boolean blocked, int riskScore, String reason, String eventType) {
    }

    public FraudCheckResult evaluateRequest(String ipAddress, String userAgent, String cardFingerprint) {
        int riskScore = 0;
        List<String> reasons = new ArrayList<>();

        if (rateLimiterService.isBlocked(ipAddress)) {
            long remainingSeconds = rateLimiterService.getBlockRemainingSeconds(ipAddress);
            String reason = String.format("IP %s is blocked for %d more seconds", ipAddress, remainingSeconds);
            saveFraudLog(ipAddress, 100, "IP_BLOCKED", reason, null, userAgent, "BLOCKED");
            return new FraudCheckResult(true, 100, reason, "IP_BLOCKED");
        }

        if (!rateLimiterService.isAllowed(ipAddress)) {
            riskScore += 30;
            reasons.add("API rate limit exceeded");
        }

        if (!rateLimiterService.isPaymentAttemptAllowed(ipAddress)) {
            riskScore += 40;
            reasons.add("Too many payment attempts per minute");
        }

        if (cardFingerprint != null && !cardFingerprint.isEmpty()) {
            if (!rateLimiterService.isCardDiversityAllowed(ipAddress, cardFingerprint)) {
                riskScore += 50;
                reasons.add("Too many different cards from same IP");
            }
        }

        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long declineCount = transactionRepository.countDeclinesByIpAfter(ipAddress, oneHourAgo);
        if (declineCount >= 3) {
            riskScore += (int) Math.min(declineCount * 10, 40);
            reasons.add(String.format("High decline rate: %d declines in last hour", declineCount));
        }

        long distinctCards = transactionRepository.countDistinctCardsByIpAfter(ipAddress, oneHourAgo);
        if (distinctCards >= 3) {
            riskScore += (int) Math.min(distinctCards * 10, 40);
            reasons.add(String.format("Using %d distinct cards from same IP in 1 hour", distinctCards));
        }

        String combinedReason = reasons.isEmpty() ? "No fraud signals detected" : String.join("; ", reasons);

        if (riskScore >= RISK_THRESHOLD) {
            rateLimiterService.blockIp(ipAddress, 3600);
            saveFraudLog(ipAddress, riskScore, "SUSPICIOUS_PATTERN", combinedReason, null, userAgent, "BLOCKED");

            return new FraudCheckResult(true, riskScore, "Transaction blocked due to suspicious activity",
                    "SUSPICIOUS_PATTERN");
        }

        if (riskScore > 0) {
            saveFraudLog(ipAddress, riskScore, "FLAGGED", combinedReason, null, userAgent, "MONITORED");
        } else {
            saveFraudLog(ipAddress, 0, "CLEAN", "No suspicious signals", null, userAgent, "ALLOWED");
        }

        return new FraudCheckResult(false, riskScore, combinedReason, riskScore > 0 ? "FLAGGED" : "CLEAN");
    }

    public void analyzePaymentResult(String ipAddress, boolean succeeded,
            String declineCode, String paymentIntentId, String userAgent) {
        if (succeeded) {
            rateLimiterService.resetDeclineCounter(ipAddress);
        } else {
            boolean shouldBlock = rateLimiterService.recordDeclineAndCheckBlock(ipAddress);

            if (shouldBlock) {
                String reason = String.format("IP %s blocked: %d consecutive declines (code: %s)",
                        ipAddress, 5, declineCode);
                saveFraudLog(ipAddress, 90, "CONSECUTIVE_DECLINES", reason, paymentIntentId, userAgent, "BLOCKED");
            }
        }
    }

    public void handleStripeDeclineEvent(String ipAddress, String paymentIntentId,
            String declineCode, String userAgent) {
        if (ipAddress == null)
            return;

        boolean shouldBlock = rateLimiterService.recordDeclineAndCheckBlock(ipAddress);
        String reason = String.format("Stripe reported decline via webhook: pi=%s, code=%s",
                paymentIntentId, declineCode);

        if (shouldBlock) {
            saveFraudLog(ipAddress, 90, "CARD_TESTING_DETECTED", reason, paymentIntentId, userAgent, "BLOCKED");
        } else {
            saveFraudLog(ipAddress, 40, "DECLINE_RECORDED", reason, paymentIntentId, userAgent, "MONITORED");
        }
    }

    private void saveFraudLog(String ipAddress, int riskScore, String eventType,
            String reason, String paymentIntentId,
            String userAgent, String actionTaken) {
        try {
            FraudLog fraudLog = FraudLog.builder()
                    .ipAddress(ipAddress)
                    .riskScore(riskScore)
                    .eventType(eventType)
                    .reason(reason != null ? reason.substring(0, Math.min(reason.length(), 1000)) : "Unknown")
                    .paymentIntentId(paymentIntentId)
                    .userAgent(userAgent != null ? userAgent.substring(0, Math.min(userAgent.length(), 500)) : null)
                    .actionTaken(actionTaken)
                    .build();

            fraudLogRepository.save(fraudLog);
            if ("BLOCKED".equals(actionTaken)) {
                eventPublisher.publishEvent(new com.example.payment0403.event.events.FraudDetectedEvent(
                        this, ipAddress, reason, riskScore));
            }
        } catch (Exception e) {
            // Error intentionally swallowed after log removal
        }
    }
}
