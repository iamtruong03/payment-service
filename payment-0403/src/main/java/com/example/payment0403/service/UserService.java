package com.example.payment0403.service;

import com.example.payment0403.audit.AuditService;
import com.example.payment0403.dto.user.ChangePasswordRequestDTO;
import com.example.payment0403.dto.user.UserProfileResponseDTO;
import com.example.payment0403.dto.user.UserUpdateRequestDTO;
import com.example.payment0403.exception.InvalidPasswordException;
import com.example.payment0403.exception.UserDisabledException;
import com.example.payment0403.logging.LoggingService;
import com.example.payment0403.mapper.UserMapper;
import com.example.payment0403.model.User;
import com.example.payment0403.model.UserStatus;
import com.example.payment0403.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final LoggingService loggingService;

    /**
     * Get current authenticated user's profile
     */
    public UserProfileResponseDTO getCurrentUserProfile(Authentication authentication) {
        User user = resolveUser(authentication);
        return userMapper.toProfileDTO(user);
    }

    /**
     * Update the current user's profile (fullName etc.)
     */
    @Transactional
    public UserProfileResponseDTO updateProfile(Authentication authentication,
            UserUpdateRequestDTO request,
            String ipAddress) {
        User user = resolveUser(authentication);

        user.setFullName(request.getFullName());
        userRepository.save(user);

        auditService.logAction(user.getId(), "USER_UPDATE_PROFILE",
                "Updated fullName", ipAddress);
        loggingService.logApiRequest("PUT", "/api/users/me", ipAddress, user.getId(), 200);

        return userMapper.toProfileDTO(user);
    }

    /**
     * Change password for the current user
     */
    @Transactional
    public void changePassword(Authentication authentication,
            ChangePasswordRequestDTO request,
            String ipAddress) {
        User user = resolveUser(authentication);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidPasswordException();
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditService.logAction(user.getId(), "USER_CHANGE_PASSWORD", "Password changed", ipAddress);
    }

    // ---- Helpers ----

    private User resolveUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        if (user.getStatus() == UserStatus.DISABLED || user.getStatus() == UserStatus.LOCKED) {
            throw new UserDisabledException(user.getEmail());
        }
        return user;
    }
}
