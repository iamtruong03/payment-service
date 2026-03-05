package com.example.payment0403.event.events;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class FraudDetectedEvent extends ApplicationEvent {
    private final String ipAddress;
    private final String reason;
    private final int riskScore;

    public FraudDetectedEvent(Object source, String ipAddress, String reason, int riskScore) {
        super(source);
        this.ipAddress = ipAddress;
        this.reason = reason;
        this.riskScore = riskScore;
    }
}
