package com.example.payment0403.mapper;

import com.example.payment0403.dto.admin.FraudLogResponseDTO;
import com.example.payment0403.model.FraudLog;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class FraudLogMapper {

    public FraudLogResponseDTO toDTO(FraudLog entity) {
        if (entity == null) {
            return null;
        }

        return FraudLogResponseDTO.builder()
                .id(entity.getId())
                .ipAddress(entity.getIpAddress())
                .userAgent(entity.getUserAgent())
                .paymentIntentId(entity.getPaymentIntentId())
                .eventType(entity.getEventType())
                .riskScore(entity.getRiskScore())
                .reason(entity.getReason())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public List<FraudLogResponseDTO> toDTOList(List<FraudLog> entities) {
        if (entities == null) {
            return null;
        }
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }
}
