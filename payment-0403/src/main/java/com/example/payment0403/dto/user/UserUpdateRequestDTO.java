package com.example.payment0403.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserUpdateRequestDTO {

    @NotBlank(message = "Full name is required")
    private String fullName;
}
