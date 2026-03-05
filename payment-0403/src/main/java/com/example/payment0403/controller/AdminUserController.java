package com.example.payment0403.controller;

import com.example.payment0403.dto.ApiResponse;
import com.example.payment0403.dto.user.*;
import com.example.payment0403.service.UserManagementService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserManagementService userManagementService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserResponseDTO>>> getAllUsers(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        try {
            PageRequest pageable = PageRequest.of(page, Math.min(size, 100), Sort.by("createdAt").descending());
            return ApiResponse.ok(userManagementService.getAllUsers(pageable));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getUserById(@PathVariable(name = "id") Long id) {
        try {
            return ApiResponse.ok(userManagementService.getUserById(id));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponseDTO>> createUser(
            @Valid @RequestBody UserCreateRequestDTO request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        try {
            String ip = extractRealIp(httpRequest);
            return ApiResponse.created(userManagementService.createUser(request, authentication, ip));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateUser(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody UserUpdateRequestDTO request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        try {
            String ip = extractRealIp(httpRequest);
            return ApiResponse.ok(userManagementService.updateUser(id, request, authentication, ip));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateUserStatus(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody UserStatusUpdateDTO request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        try {
            String ip = extractRealIp(httpRequest);
            return ApiResponse.ok(userManagementService.updateUserStatus(id, request, authentication, ip));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateUserRole(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody UserRoleUpdateDTO request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        try {
            String ip = extractRealIp(httpRequest);
            return ApiResponse.ok(userManagementService.updateUserRole(id, request, authentication, ip));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable(name = "id") Long id,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        try {
            String ip = extractRealIp(httpRequest);
            userManagementService.deleteUser(id, authentication, ip);
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
