package com.example.payment0403.dto.user;

import com.example.payment0403.model.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserRoleUpdateDTO {

    @NotNull(message = "Role is required")
    private Role role;
}
