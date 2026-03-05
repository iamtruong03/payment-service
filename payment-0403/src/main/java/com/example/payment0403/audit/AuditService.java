package com.example.payment0403.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditRepository auditRepository;

    public void logAction(Long userId, String action, String resource, String ipAddress) {
        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .action(action)
                .resource(resource)
                .ipAddress(ipAddress)
                .build();
        auditRepository.save(auditLog);
    }
}
