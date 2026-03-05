package com.example.payment0403.service;

import com.example.payment0403.dto.payment.PaymentIntentRequestDTO;
import com.example.payment0403.dto.payment.TransactionResponseDTO;
import com.example.payment0403.mapper.TransactionMapper;
import com.example.payment0403.model.Transaction;
import com.example.payment0403.model.User;
import com.example.payment0403.repository.TransactionRepository;
import com.example.payment0403.repository.UserRepository;
import com.stripe.exception.CardException;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.net.RequestOptions;
import com.stripe.param.PaymentIntentCancelParams;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class StripeService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final FraudDetectionService fraudDetectionService;
    private final RateLimiterService rateLimiterService;
    private final TransactionMapper transactionMapper;

    public StripeService(TransactionRepository transactionRepository,
            UserRepository userRepository,
            FraudDetectionService fraudDetectionService,
            RateLimiterService rateLimiterService,
            TransactionMapper transactionMapper) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.fraudDetectionService = fraudDetectionService;
        this.rateLimiterService = rateLimiterService;
        this.transactionMapper = transactionMapper;
    }

    public Map<String, Object> processPaymentIntent(PaymentIntentRequestDTO requestDto,
            User currentUser, String ipAddress, String userAgent) throws StripeException {

        String idempotencyKey = requestDto != null ? requestDto.getIdempotencyKey() : null;
        if (idempotencyKey != null) {
            Optional<Transaction> existingTx = transactionRepository.findByIdempotencyKey(idempotencyKey);
            if (existingTx.isPresent()) {
                TransactionResponseDTO dto = transactionMapper.toDTO(existingTx.get());
                return Map.of(
                        "paymentIntentId", dto.getPaymentIntentId(),
                        "clientSecret", "already_created",
                        "status", dto.getStatus(),
                        "amount", dto.getAmount(),
                        "currency", dto.getCurrency(),
                        "isDuplicate", true);
            }
        } else {
            idempotencyKey = UUID.randomUUID().toString();
        }

        if (!rateLimiterService.isAllowed(ipAddress)) {
            long retryAfter = rateLimiterService.getBlockRemainingSeconds(ipAddress);
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many requests. Please try again in " + retryAfter + " seconds.");
        }

        String cardFingerprint = requestDto != null ? requestDto.getCardFingerprint() : null;
        var fraudResult = fraudDetectionService.evaluateRequest(ipAddress, userAgent, cardFingerprint);
        if (fraudResult.blocked()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "This request has been blocked for security reasons.");
        }

        long amount = 1000L;
        String currency = "usd";
        if (requestDto != null) {
            if (requestDto.getAmount() != null)
                amount = requestDto.getAmount();
            if (requestDto.getCurrency() != null)
                currency = requestDto.getCurrency();
        }

        return createPaymentIntent(amount, currency, ipAddress, userAgent,
                fraudResult.riskScore(), currentUser.getId(), idempotencyKey);
    }

    public Map<String, Object> createPaymentIntent(long amountInCents, String currency,
            String ipAddress, String userAgent, int riskScore, Long userId, String idempotencyKey)
            throws StripeException {

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(currency.toLowerCase())
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build())

                .setPaymentMethodOptions(
                        PaymentIntentCreateParams.PaymentMethodOptions.builder()
                                .setCard(
                                        PaymentIntentCreateParams.PaymentMethodOptions.Card.builder()
                                                .setRequestThreeDSecure(
                                                        PaymentIntentCreateParams.PaymentMethodOptions.Card.RequestThreeDSecure.AUTOMATIC)
                                                .build())
                                .build())

                .putMetadata("ip_address", ipAddress != null ? ipAddress : "unknown")
                .putMetadata("user_agent", userAgent != null ? userAgent : "unknown")
                .putMetadata("risk_score", String.valueOf(riskScore))
                .putMetadata("source", "payment-0403-spring")
                .build();

        RequestOptions options = RequestOptions.builder()
                .setIdempotencyKey(idempotencyKey)
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params, options);

        saveInitialTransaction(paymentIntent, amountInCents, currency, ipAddress, userAgent, riskScore, userId,
                idempotencyKey);

        Map<String, Object> result = new HashMap<>();
        result.put("clientSecret", paymentIntent.getClientSecret());
        result.put("paymentIntentId", paymentIntent.getId());
        result.put("status", paymentIntent.getStatus());
        result.put("amount", amountInCents);
        result.put("currency", currency);

        return result;
    }

    public Map<String, Object> getPaymentStatus(String paymentIntentId, String ipAddress) throws StripeException {
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        String status = paymentIntent.getStatus();

        updateTransactionStatus(paymentIntent);

        Map<String, Object> result = new HashMap<>();
        result.put("paymentIntentId", paymentIntent.getId());
        result.put("amount", paymentIntent.getAmount());
        result.put("currency", paymentIntent.getCurrency());
        result.put("rawStatus", status);

        switch (status) {
            case "succeeded" -> {
                result.put("status", "succeeded");
                result.put("message", "Payment successful! Thank you for your purchase.");
                result.put("success", true);
            }
            case "requires_action" -> {
                result.put("status", "requires_action");
                result.put("message", "Additional authentication required (3D Secure). Please complete verification.");
                result.put("success", false);
            }
            case "payment_failed" -> {
                result.put("status", "declined");
                result.put("message", "Payment failed. Please check your card details.");
                result.put("success", false);
                if (paymentIntent.getLastPaymentError() != null) {
                    result.put("declineCode", paymentIntent.getLastPaymentError().getDeclineCode());
                    result.put("errorMessage", paymentIntent.getLastPaymentError().getMessage());
                }
            }
            case "canceled" -> {
                result.put("status", "canceled");
                result.put("message", "Payment was canceled.");
                result.put("success", false);
            }
            case "processing" -> {
                result.put("status", "processing");
                result.put("message", "Payment is being processed. Please wait.");
                result.put("success", false);
            }
            default -> {
                result.put("status", status);
                result.put("message", "Payment status: " + status);
                result.put("success", false);
            }
        }

        return result;
    }

    public Map<String, Object> cancelPaymentIntent(String paymentIntentId) throws StripeException {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            String currentStatus = paymentIntent.getStatus();

            if (!"succeeded".equals(currentStatus) && !"canceled".equals(currentStatus)) {
                PaymentIntentCancelParams params = PaymentIntentCancelParams.builder()
                        .setCancellationReason(PaymentIntentCancelParams.CancellationReason.ABANDONED)
                        .build();

                paymentIntent = paymentIntent.cancel(params);
                updateTransactionStatus(paymentIntent);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("paymentIntentId", paymentIntent.getId());
            result.put("status", paymentIntent.getStatus());
            result.put("success", "canceled".equals(paymentIntent.getStatus()));
            return result;
        } catch (StripeException e) {
            throw e;
        }
    }

    public Map<String, Object> handleCardException(CardException e, String ipAddress, String userAgent) {
        fraudDetectionService.analyzePaymentResult(ipAddress, false, e.getDeclineCode(), null, userAgent);

        Map<String, Object> error = new HashMap<>();
        error.put("status", "declined");
        error.put("success", false);
        error.put("declineCode", e.getDeclineCode());
        error.put("stripeCode", e.getCode());
        error.put("message", buildUserFriendlyMessage(e.getDeclineCode()));
        return error;
    }

    private void saveInitialTransaction(PaymentIntent pi, long amount, String currency,
            String ipAddress, String userAgent, int riskScore, Long userId, String idempotencyKey) {
        try {
            if (transactionRepository.findByPaymentIntentId(pi.getId()).isPresent()) {
                return;
            }

            User user = userId != null
                    ? userRepository.findById(userId).orElse(null)
                    : null;

            Transaction tx = Transaction.builder()
                    .paymentIntentId(pi.getId())
                    .amount(amount)
                    .currency(currency)
                    .status(pi.getStatus())
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .riskScore(riskScore)
                    .user(user)
                    .idempotencyKey(idempotencyKey)
                    .build();
            transactionRepository.save(tx);
        } catch (Exception e) {
            // Error intentionally swallowed after log removal
        }
    }

    public void updateTransactionStatus(PaymentIntent pi) {
        try {
            transactionRepository.findByPaymentIntentId(pi.getId()).ifPresent(tx -> {
                tx.setStatus(pi.getStatus());
                populateCardDetails(tx, pi);

                if (pi.getLastPaymentError() != null) {
                    tx.setFailureMessage(pi.getLastPaymentError().getMessage());
                    tx.setDeclineCode(pi.getLastPaymentError().getDeclineCode());
                }

                transactionRepository.save(tx);
            });
        } catch (Exception e) {
            // Error intentionally swallowed after log removal
        }
    }

    public String getClientSecret(String paymentIntentId) {
        try {
            PaymentIntent pi = PaymentIntent.retrieve(paymentIntentId);
            return pi.getClientSecret();
        } catch (Exception e) {
            return null;
        }
    }

    private void populateCardDetails(Transaction tx, PaymentIntent pi) {
        if (pi.getLatestChargeObject() != null || pi.getLatestCharge() != null) {
            try {
                com.stripe.model.Charge charge = pi.getLatestChargeObject();
                if (charge == null && pi.getLatestCharge() != null) {
                    charge = com.stripe.model.Charge.retrieve(pi.getLatestCharge());
                }

                if (charge != null && charge.getPaymentMethodDetails() != null &&
                        charge.getPaymentMethodDetails().getCard() != null) {
                    var card = charge.getPaymentMethodDetails().getCard();
                    tx.setCardBrand(card.getBrand());
                    tx.setCardLast4(card.getLast4());
                    tx.setCardCountry(card.getCountry());
                }
            } catch (Exception e) {
                // Error intentionally swallowed after log removal
            }
        }
    }

    private String buildUserFriendlyMessage(String declineCode) {
        if (declineCode == null)
            return "Your card was declined. Please try a different card.";
        return switch (declineCode) {
            case "insufficient_funds" -> "Your card has insufficient funds. Please try a different card.";
            case "lost_card" -> "This card cannot be used. Please use another card.";
            case "stolen_card" -> "This card cannot be used. Please use another card.";
            case "expired_card" -> "Your card has expired. Please use a valid card.";
            case "incorrect_cvc" -> "Incorrect security code. Please check and try again.";
            case "card_declined" -> "Your card was declined. Please try a different payment method.";
            case "processing_error" -> "A processing error occurred. Please try again.";
            case "do_not_honor" -> "Your bank declined this transaction. Please contact your bank.";
            case "fraudulent" -> "This transaction was declined for security reasons.";
            default -> "Your card was declined (code: " + declineCode + "). Please try again.";
        };
    }
}
