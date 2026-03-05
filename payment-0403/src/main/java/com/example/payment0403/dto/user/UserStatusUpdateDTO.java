package com.example.payment0403.dto.user;

import com.example.payment0403.model.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserStatusUpdateDTO {

    @NotNull(message = "Status is required")
    private UserStatus status;

    private String reason;
}
