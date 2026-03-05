package com.example.payment0403.mapper;

import com.example.payment0403.dto.user.UserProfileResponseDTO;
import com.example.payment0403.dto.user.UserResponseDTO;
import com.example.payment0403.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponseDTO toResponseDTO(User entity) {
        if (entity == null)
            return null;
        return UserResponseDTO.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .fullName(entity.getFullName())
                .role(entity.getRole())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public UserProfileResponseDTO toProfileDTO(User entity) {
        if (entity == null)
            return null;
        return UserProfileResponseDTO.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .fullName(entity.getFullName())
                .role(entity.getRole())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
