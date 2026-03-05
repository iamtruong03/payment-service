package com.example.payment0403.controller;

import com.example.payment0403.dto.ApiResponse;
import com.example.payment0403.dto.payment.PaymentIntentRequestDTO;
import com.example.payment0403.dto.payment.TransactionResponseDTO;
import com.example.payment0403.model.User;
import com.example.payment0403.service.StripeService;
import com.example.payment0403.service.TransactionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final StripeService stripeService;
    private final TransactionService transactionService;

    public PaymentController(StripeService stripeService,
            TransactionService transactionService) {
        this.stripeService = stripeService;
        this.transactionService = transactionService;
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/create-intent")
    public ResponseEntity<ApiResponse<Map<String, ?>>> createPaymentIntent(
            @RequestBody(required = false) PaymentIntentRequestDTO requestDto,
            HttpServletRequest request,
            Authentication authentication) {
        try {
            User currentUser = resolveUser(authentication);
            String ipAddress = extractRealIp(request);
            String userAgent = request.getHeader("User-Agent");
            return ApiResponse.ok(stripeService.processPaymentIntent(requestDto, currentUser, ipAddress, userAgent));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/my-transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponseDTO>>> getMyTransactions(
            Authentication authentication) {
        try {
            User currentUser = resolveUser(authentication);
            return ApiResponse.ok(transactionService.getUserTransactions(currentUser.getId()));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponseDTO>> getTransactionById(
            @PathVariable(name = "id") Long id,
            Authentication authentication) {
        try {
            User currentUser = resolveUser(authentication);
            return ApiResponse.ok(transactionService.getTransactionById(id, currentUser));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/cancel-intent/{paymentIntentId}")
    public ResponseEntity<ApiResponse<Map<String, ?>>> cancelPaymentIntent(
            @PathVariable("paymentIntentId") String paymentIntentId,
            Authentication authentication) {
        try {
            User currentUser = resolveUser(authentication);
            return ApiResponse.ok(transactionService.cancelPaymentIntent(paymentIntentId, currentUser));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    private User resolveUser(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }

    private String extractRealIp(HttpServletRequest request) {
        String ip = request.getHeader("CF-Connecting-IP");
        if (isValidIp(ip))
            return sanitizeIp(ip);
        ip = request.getHeader("X-Forwarded-For");
        if (isValidIp(ip))
            return sanitizeIp(ip.split(",")[0].trim());
        ip = request.getHeader("X-Real-IP");
        if (isValidIp(ip))
            return sanitizeIp(ip);
        return request.getRemoteAddr();
    }

    private boolean isValidIp(String ip) {
        return ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip);
    }

    private String sanitizeIp(String ip) {
        return ip.length() > 45 ? ip.substring(0, 45) : ip;
    }
}
