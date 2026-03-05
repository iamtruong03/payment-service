package com.example.payment0403.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class UserDisabledException extends RuntimeException {

    public UserDisabledException(String email) {
        super("User account is disabled or locked: " + email);
    }
}
