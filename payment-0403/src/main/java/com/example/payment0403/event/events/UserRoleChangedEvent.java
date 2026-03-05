package com.example.payment0403.event.events;

import com.example.payment0403.model.Role;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class UserRoleChangedEvent extends ApplicationEvent {
    private final Long userId;
    private final String email;
    private final Role oldRole;
    private final Role newRole;
    private final String changedByAdminId;

    public UserRoleChangedEvent(Object source, Long userId, String email,
            Role oldRole, Role newRole, String changedByAdminId) {
        super(source);
        this.userId = userId;
        this.email = email;
        this.oldRole = oldRole;
        this.newRole = newRole;
        this.changedByAdminId = changedByAdminId;
    }
}
