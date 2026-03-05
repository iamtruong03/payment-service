package com.example.payment0403.auth;

import com.example.payment0403.model.Role;
import com.example.payment0403.model.User;
import com.example.payment0403.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.payment0403.dto.auth.AuthResponseDTO;
import com.example.payment0403.dto.auth.LoginRequestDTO;
import com.example.payment0403.dto.auth.MessageResponseDTO;
import com.example.payment0403.dto.auth.RegisterRequestDTO;
import com.example.payment0403.event.events.UserLoggedInEvent;
import com.example.payment0403.event.events.UserRegisteredEvent;
import org.springframework.context.ApplicationEventPublisher;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final ApplicationEventPublisher eventPublisher;

    public MessageResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(user);

        eventPublisher.publishEvent(new UserRegisteredEvent(this, user.getId(), user.getEmail()));

        return new MessageResponseDTO("User registered successfully");
    }

    public AuthResponseDTO login(LoginRequestDTO request, String ipAddress) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String jwtToken = jwtService.generateToken(user);

        eventPublisher.publishEvent(new UserLoggedInEvent(this, user.getId(), user.getEmail(), ipAddress));

        return new AuthResponseDTO(jwtToken);
    }
}
