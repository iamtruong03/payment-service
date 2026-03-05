package com.example.payment0403.controller;

import com.example.payment0403.dto.ApiResponse;
import com.example.payment0403.dto.admin.AdminStatsResponseDTO;
import com.example.payment0403.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponseDTO>> getStats() {
        try {
            return ApiResponse.ok(adminService.getSystemStats());
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTransactions(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "status", defaultValue = "all") String status) {
        try {
            int finalSize = Math.min(size, 100);
            return ApiResponse.ok(adminService.getPagedTransactions(page, finalSize, status));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/fraud-logs")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFraudLogs(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "eventType", defaultValue = "all") String eventType) {
        try {
            int finalSize = Math.min(size, 100);
            return ApiResponse.ok(adminService.getPagedFraudLogs(page, finalSize, eventType));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/ip/{ip}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getIpStatus(@PathVariable(name = "ip") String ip) {
        try {
            return ApiResponse.ok(adminService.getIpAnalysis(ip));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/ip/{ip}/block")
    public ResponseEntity<ApiResponse<Map<String, Object>>> blockIp(
            @PathVariable(name = "ip") String ip,
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            long duration = 3600L;
            String reason = "Manual block by admin";

            if (body != null) {
                if (body.containsKey("durationSeconds"))
                    duration = Long.parseLong(body.get("durationSeconds").toString());
                if (body.containsKey("reason"))
                    reason = body.get("reason").toString();
            }

            adminService.blockIp(ip, duration, reason);

            return ApiResponse.ok(Map.of(
                    "ip", ip,
                    "action", "BLOCKED",
                    "durationSeconds", duration,
                    "reason", reason,
                    "unblockAt", LocalDateTime.now().plusSeconds(duration).toString()));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @DeleteMapping("/ip/{ip}/block")
    public ResponseEntity<ApiResponse<Map<String, Object>>> unblockIp(@PathVariable(name = "ip") String ip) {
        try {
            adminService.unblockIp(ip);
            return ApiResponse.ok(Map.of(
                    "ip", ip,
                    "action", "UNBLOCKED",
                    "message", "IP has been unblocked successfully"));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/ip/{ip}/transactions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getIpTransactions(
            @PathVariable(name = "ip") String ip,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        try {
            return ApiResponse.ok(adminService.getIpTransactions(ip, page, size));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/top-offenders")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopOffenders() {
        try {
            return ApiResponse.ok(adminService.getTopOffenders());
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
