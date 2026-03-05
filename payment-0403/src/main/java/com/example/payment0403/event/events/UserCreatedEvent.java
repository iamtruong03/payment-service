package com.example.payment0403.event.events;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class UserCreatedEvent extends ApplicationEvent {
    private final Long userId;
    private final String email;
    private final String ipAddress;

    public UserCreatedEvent(Object source, Long userId, String email, String ipAddress) {
        super(source);
        this.userId = userId;
        this.email = email;
        this.ipAddress = ipAddress;
    }
}
