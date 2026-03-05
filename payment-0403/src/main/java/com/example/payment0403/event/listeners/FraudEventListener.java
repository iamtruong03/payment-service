package com.example.payment0403.event.listeners;

import com.example.payment0403.event.events.FraudDetectedEvent;
import com.example.payment0403.logging.LoggingService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FraudEventListener {

    private final LoggingService loggingService;

    @EventListener
    public void handleFraudDetectedEvent(FraudDetectedEvent event) {
        loggingService.logFraudAlert(event.getIpAddress(), event.getReason(), event.getRiskScore());
    }
}
