package com.example.payment0403.event.listeners;

import com.example.payment0403.audit.AuditService;
import com.example.payment0403.event.events.PaymentCreatedEvent;
import com.example.payment0403.event.events.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuditEventListener {

    private final AuditService auditService;

    @EventListener
    public void handlePaymentCreatedEvent(PaymentCreatedEvent event) {
        auditService.logAction(event.getUserId(), "CREATE_PAYMENT",
                "PaymentIntent: " + event.getPaymentIntentId(), event.getIpAddress());
    }

    @EventListener
    public void handleUserRegisteredEvent(UserRegisteredEvent event) {
        auditService.logAction(event.getUserId(), "REGISTER_USER",
                "Email: " + event.getEmail(), "unknown");
    }

    @EventListener
    public void handleUserLoggedInEvent(com.example.payment0403.event.events.UserLoggedInEvent event) {
        auditService.logAction(event.getUserId(), "LOGIN",
                "Email: " + event.getEmail(), event.getIpAddress());
    }
}
