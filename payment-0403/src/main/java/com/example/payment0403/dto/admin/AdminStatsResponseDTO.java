package com.example.payment0403.dto.admin;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AdminStatsResponseDTO {
    private long totalTransactions24h;
    private long succeededTransactions24h;
    private long failedTransactions24h;
    private double successRate24h;
    private long revenue24hCents;
    private long fraudEvents24h;

    private long totalTransactions7d;
    private long succeededTransactions7d;
    private long revenue7dCents;

    private List<Map<String, Object>> topOffenders;
    private String generatedAt;
}
