package com.example.payment0403.dto.payment;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionResponseDTO {
    private Long id;
    private String paymentIntentId;
    private long amount;
    private String currency;
    private String status;
    private String declineCode;
    private String failureMessage;
    private String ipAddress;
    private String userAgent;
    private int riskScore;
    private String cardLast4;
    private String cardBrand;
    private String cardCountry;
    private String clientSecret;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
