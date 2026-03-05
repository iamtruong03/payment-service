package com.example.payment0403.event.events;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class PaymentCreatedEvent extends ApplicationEvent {
    private final Long userId;
    private final String paymentIntentId;
    private final long amount;
    private final String ipAddress;
    private final String userAgent;

    public PaymentCreatedEvent(Object source, Long userId, String paymentIntentId, long amount, String ipAddress,
            String userAgent) {
        super(source);
        this.userId = userId;
        this.paymentIntentId = paymentIntentId;
        this.amount = amount;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
    }
}
