package com.example.payment0403.controller;

import com.example.payment0403.config.StripeConfig;
import com.example.payment0403.dto.ApiResponse;
import com.example.payment0403.service.WebhookService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhook")
public class WebhookController {

    private final StripeConfig stripeConfig;
    private final WebhookService webhookService;

    public WebhookController(StripeConfig stripeConfig, WebhookService webhookService) {
        this.stripeConfig = stripeConfig;
        this.webhookService = webhookService;
    }

    @PostMapping("/stripe")
    public ResponseEntity<ApiResponse<Map<String, String>>> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            Event event = Webhook.constructEvent(
                    payload,
                    sigHeader,
                    stripeConfig.getWebhookSecret());

            webhookService.processEvent(event);

            return ApiResponse.ok(Map.of(
                    "received", "true",
                    "eventType", event.getType()));

        } catch (SignatureVerificationException e) {
            return ApiResponse.error("Invalid signature", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
