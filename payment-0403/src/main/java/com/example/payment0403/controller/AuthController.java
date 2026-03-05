package com.example.payment0403.controller;

import com.example.payment0403.auth.AuthService;
import com.example.payment0403.dto.ApiResponse;
import com.example.payment0403.dto.auth.AuthResponseDTO;
import com.example.payment0403.dto.auth.LoginRequestDTO;
import com.example.payment0403.dto.auth.MessageResponseDTO;
import com.example.payment0403.dto.auth.RegisterRequestDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<MessageResponseDTO>> register(
            @Valid @RequestBody RegisterRequestDTO request) {
        try {
            return ApiResponse.ok(authService.register(request));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(
            @Valid @RequestBody LoginRequestDTO request,
            HttpServletRequest httpRequest) {
        try {
            String ipAddress = extractRealIp(httpRequest);
            return ApiResponse.ok(authService.login(request, ipAddress));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    private String extractRealIp(HttpServletRequest request) {
        String ip = request.getHeader("CF-Connecting-IP");
        if (isValidIp(ip))
            return ip;
        ip = request.getHeader("X-Forwarded-For");
        if (isValidIp(ip))
            return ip.split(",")[0].trim();
        ip = request.getHeader("X-Real-IP");
        if (isValidIp(ip))
            return ip;
        return request.getRemoteAddr();
    }

    private boolean isValidIp(String ip) {
        return ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip);
    }
}
