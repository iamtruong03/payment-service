package com.example.payment0403.event.events;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class UserDisabledEvent extends ApplicationEvent {
    private final Long userId;
    private final String email;
    private final String disabledByAdminId;
    private final String reason;

    public UserDisabledEvent(Object source, Long userId, String email, String disabledByAdminId, String reason) {
        super(source);
        this.userId = userId;
        this.email = email;
        this.disabledByAdminId = disabledByAdminId;
        this.reason = reason;
    }
}
