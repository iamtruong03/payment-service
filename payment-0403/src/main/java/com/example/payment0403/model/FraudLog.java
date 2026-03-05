package com.example.payment0403.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "fraud_logs", indexes = {
        @Index(name = "idx_fraud_ip", columnList = "ip_address"),
        @Index(name = "idx_fraud_created_at", columnList = "created_at"),
        @Index(name = "idx_fraud_risk_score", columnList = "risk_score")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FraudLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Column(name = "risk_score", nullable = false)
    private Integer riskScore;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "reason", nullable = false, length = 1000)
    private String reason;

    @Column(name = "payment_intent_id", length = 100)
    private String paymentIntentId;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "action_taken", length = 20)
    private String actionTaken;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
