package com.example.payment0403.controller;

import com.example.payment0403.dto.ApiResponse;
import com.example.payment0403.config.StripeConfig;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PublicController {

    private final StripeConfig stripeConfig;

    public PublicController(StripeConfig stripeConfig) {
        this.stripeConfig = stripeConfig;
    }

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<Map<String, String>>> getConfig() {
        try {
            return ApiResponse.ok(Map.of("publishableKey", stripeConfig.getPublishableKey()));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        try {
            return ApiResponse.ok(Map.of(
                    "status", "ok",
                    "service", "payment-0403",
                    "version", "2.0.0"));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
