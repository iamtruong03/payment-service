package com.example.payment0403.dto.payment;

import lombok.Data;

@Data
public class PaymentIntentRequestDTO {
    private Long amount;
    private String currency;
    private String cardFingerprint;
    private String idempotencyKey;
}
