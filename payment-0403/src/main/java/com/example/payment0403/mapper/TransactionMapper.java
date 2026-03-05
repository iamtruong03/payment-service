package com.example.payment0403.mapper;

import com.example.payment0403.dto.payment.TransactionResponseDTO;
import com.example.payment0403.model.Transaction;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TransactionMapper {

    public TransactionResponseDTO toDTO(Transaction entity) {
        if (entity == null) {
            return null;
        }

        return TransactionResponseDTO.builder()
                .id(entity.getId())
                .paymentIntentId(entity.getPaymentIntentId())
                .amount(entity.getAmount())
                .currency(entity.getCurrency())
                .status(entity.getStatus())
                .declineCode(entity.getDeclineCode())
                .failureMessage(entity.getFailureMessage())
                .ipAddress(entity.getIpAddress())
                .userAgent(entity.getUserAgent())
                .riskScore(entity.getRiskScore())
                .cardLast4(entity.getCardLast4())
                .cardBrand(entity.getCardBrand())
                .cardCountry(entity.getCardCountry())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public List<TransactionResponseDTO> toDTOList(List<Transaction> entities) {
        if (entities == null) {
            return null;
        }
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }
}
