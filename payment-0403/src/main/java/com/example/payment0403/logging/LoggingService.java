package com.example.payment0403.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class LoggingService {

    private static final Logger log = LoggerFactory.getLogger(LoggingService.class);

    public void logApiRequest(String method, String uri, String ipAddress, Long userId, int status) {
        log.info("API Request [userId={}]: {} {} from ip={}, status={}",
                userId != null ? userId : "guest", method, uri, ipAddress, status);
    }

    public void logError(String message, Throwable error) {
        log.error("System Error: {}", message, error);
    }

    public void logFraudAlert(String ipAddress, String reason, int riskScore) {
        log.warn("FRAUD ALERT [ip={}]: {} (RiskScore: {})", ipAddress, reason, riskScore);
    }
}
