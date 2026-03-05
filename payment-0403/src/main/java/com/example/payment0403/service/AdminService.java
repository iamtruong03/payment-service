package com.example.payment0403.service;

import com.example.payment0403.dto.admin.AdminStatsResponseDTO;
import com.example.payment0403.mapper.FraudLogMapper;
import com.example.payment0403.mapper.TransactionMapper;
import com.example.payment0403.model.FraudLog;
import com.example.payment0403.model.Transaction;
import com.example.payment0403.repository.FraudLogRepository;
import com.example.payment0403.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class AdminService {

    private final TransactionRepository transactionRepository;
    private final FraudLogRepository fraudLogRepository;
    private final RateLimiterService rateLimiterService;
    private final TransactionMapper transactionMapper;
    private final FraudLogMapper fraudLogMapper;

    public AdminService(TransactionRepository transactionRepository,
            FraudLogRepository fraudLogRepository,
            RateLimiterService rateLimiterService,
            TransactionMapper transactionMapper,
            FraudLogMapper fraudLogMapper) {
        this.transactionRepository = transactionRepository;
        this.fraudLogRepository = fraudLogRepository;
        this.rateLimiterService = rateLimiterService;
        this.transactionMapper = transactionMapper;
        this.fraudLogMapper = fraudLogMapper;
    }

    public AdminStatsResponseDTO getSystemStats() {
        LocalDateTime last24h = LocalDateTime.now().minusHours(24);
        LocalDateTime last7d = LocalDateTime.now().minusDays(7);

        long totalTx24h = transactionRepository.countByCreatedAtAfter(last24h);
        long succeededTx24h = transactionRepository.countByStatusAndCreatedAtAfter("succeeded", last24h);
        long failedTx24h = transactionRepository.countByStatusAndCreatedAtAfter("payment_failed", last24h);
        Long revenue24h = transactionRepository.sumSucceededAmount(last24h);

        long totalFraudLogs24h = fraudLogRepository.findByEventTypeAndCreatedAtAfter("BLOCKED", last24h).size()
                + fraudLogRepository.findByEventTypeAndCreatedAtAfter("FLAGGED", last24h).size()
                + fraudLogRepository.findByEventTypeAndCreatedAtAfter("IP_BLOCKED", last24h).size()
                + fraudLogRepository.findByEventTypeAndCreatedAtAfter("CONSECUTIVE_DECLINES", last24h).size();

        long totalTx7d = transactionRepository.countByCreatedAtAfter(last7d);
        long succeededTx7d = transactionRepository.countByStatusAndCreatedAtAfter("succeeded", last7d);
        Long revenue7d = transactionRepository.sumSucceededAmount(last7d);

        List<Object[]> topOffendersRaw = transactionRepository.findTopDeclinedIPs(last24h, PageRequest.of(0, 5));
        List<Map<String, Object>> topOffenders = new ArrayList<>();
        for (Object[] row : topOffendersRaw) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("ip", row[0]);
            entry.put("declineCount", row[1]);
            entry.put("blocked", rateLimiterService.isBlocked((String) row[0]));
            topOffenders.add(entry);
        }

        double successRate = totalTx24h > 0
                ? Math.round((succeededTx24h * 100.0 / totalTx24h) * 10.0) / 10.0
                : 0.0;

        return AdminStatsResponseDTO.builder()
                .totalTransactions24h(totalTx24h)
                .succeededTransactions24h(succeededTx24h)
                .failedTransactions24h(failedTx24h)
                .successRate24h(successRate)
                .revenue24hCents(revenue24h != null ? revenue24h : 0L)
                .fraudEvents24h(totalFraudLogs24h)
                .totalTransactions7d(totalTx7d)
                .succeededTransactions7d(succeededTx7d)
                .revenue7dCents(revenue7d != null ? revenue7d : 0L)
                .topOffenders(topOffenders)
                .generatedAt(LocalDateTime.now().toString())
                .build();
    }

    public Map<String, Object> getPagedTransactions(int page, int size, String status) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Transaction> txPage;

        if ("all".equals(status)) {
            txPage = transactionRepository.findAllByOrderByCreatedAtDesc(pageable);
        } else {
            txPage = transactionRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("content", transactionMapper.toDTOList(txPage.getContent()));
        result.put("totalElements", txPage.getTotalElements());
        result.put("totalPages", txPage.getTotalPages());
        result.put("currentPage", page);
        result.put("pageSize", size);
        return result;
    }

    public Map<String, Object> getPagedFraudLogs(int page, int size, String eventType) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<FraudLog> logsPage = fraudLogRepository.findAll(pageable);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("content", fraudLogMapper.toDTOList(logsPage.getContent()));
        result.put("totalElements", logsPage.getTotalElements());
        result.put("totalPages", logsPage.getTotalPages());
        result.put("currentPage", page);
        return result;
    }

    public Map<String, Object> getIpAnalysis(String ip) {
        boolean blocked = rateLimiterService.isBlocked(ip);
        long blockRemaining = rateLimiterService.getBlockRemainingSeconds(ip);

        LocalDateTime since24h = LocalDateTime.now().minusHours(24);
        long totalTx = transactionRepository.countByIpAddressAfter(ip, since24h);
        long declines = transactionRepository.countDeclinesByIpAfter(ip, since24h);
        long fraudEvents = fraudLogRepository.countByIpAddress(ip);

        List<FraudLog> recentFraud = fraudLogRepository.findByIpAddressAndCreatedAtAfterOrderByCreatedAtDesc(ip,
                since24h);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ip", ip);
        result.put("blocked", blocked);
        result.put("blockRemainingSeconds", blockRemaining);
        result.put("totalTx24h", totalTx);
        result.put("declines24h", declines);
        result.put("totalFraudEvents", fraudEvents);
        result.put("recentFraudLogs", fraudLogMapper.toDTOList(recentFraud));
        return result;
    }

    @Transactional
    public void blockIp(String ip, Long duration, String reason) {
        rateLimiterService.blockIp(ip, duration);
    }

    @Transactional
    public void unblockIp(String ip) {
        rateLimiterService.unblockIp(ip);
    }

    public Map<String, Object> getIpTransactions(String ip, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Transaction> txPage = transactionRepository.findByIpAddressOrderByCreatedAtDesc(ip, pageable);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ip", ip);
        result.put("content", transactionMapper.toDTOList(txPage.getContent()));
        result.put("totalElements", txPage.getTotalElements());
        result.put("totalPages", txPage.getTotalPages());
        return result;
    }

    public List<Map<String, Object>> getTopOffenders() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        List<Object[]> raw = transactionRepository.findTopDeclinedIPs(since, PageRequest.of(0, 10));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            String ip = (String) row[0];
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("ip", ip);
            entry.put("declineCount", row[1]);
            entry.put("blocked", rateLimiterService.isBlocked(ip));
            entry.put("blockRemainingSeconds", rateLimiterService.getBlockRemainingSeconds(ip));
            result.add(entry);
        }
        return result;
    }
}
