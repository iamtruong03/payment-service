package com.example.payment0403.controller;

import com.example.payment0403.dto.ApiResponse;
import com.example.payment0403.dto.user.ChangePasswordRequestDTO;
import com.example.payment0403.dto.user.UserProfileResponseDTO;
import com.example.payment0403.dto.user.UserUpdateRequestDTO;
import com.example.payment0403.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponseDTO>> getMyProfile(Authentication authentication) {
        try {
            return ApiResponse.ok(userService.getCurrentUserProfile(authentication));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponseDTO>> updateMyProfile(
            @Valid @RequestBody UserUpdateRequestDTO request,
            Authentication authentication,
            HttpServletRequest httpServletRequest) {
        try {
            String ip = extractRealIp(httpServletRequest);
            return ApiResponse.ok(userService.updateProfile(authentication, request, ip));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequestDTO request,
            Authentication authentication,
            HttpServletRequest httpServletRequest) {
        try {
            String ip = extractRealIp(httpServletRequest);
            userService.changePassword(authentication, request, ip);
            return ApiResponse.noContent();
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
