package com.example.payment0403.dto.admin;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class FraudLogResponseDTO {
    private Long id;
    private String ipAddress;
    private String userAgent;
    private String paymentIntentId;
    private String eventType;
    private int riskScore;
    private String reason;
    private LocalDateTime createdAt;
}
