package com.example.payment0403.service;

import com.example.payment0403.audit.AuditService;
import com.example.payment0403.dto.user.*;
import com.example.payment0403.event.events.UserCreatedEvent;
import com.example.payment0403.event.events.UserDisabledEvent;
import com.example.payment0403.event.events.UserRoleChangedEvent;
import com.example.payment0403.exception.EmailAlreadyExistsException;
import com.example.payment0403.exception.UserNotFoundException;
import com.example.payment0403.logging.LoggingService;
import com.example.payment0403.mapper.UserMapper;
import com.example.payment0403.model.Role;
import com.example.payment0403.model.User;
import com.example.payment0403.model.UserStatus;
import com.example.payment0403.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final LoggingService loggingService;
    private final ApplicationEventPublisher eventPublisher;

    // ─────────────────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────────────────

    public Page<UserResponseDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toResponseDTO);
    }

    public UserResponseDTO getUserById(Long id) {
        return userMapper.toResponseDTO(findOrThrow(id));
    }

    // ─────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────

    @Transactional
    public UserResponseDTO createUser(UserCreateRequestDTO request,
            Authentication adminAuth,
            String ipAddress) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        Role role = request.getRole() != null ? request.getRole() : Role.USER;

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .status(UserStatus.ACTIVE)
                .build();

        userRepository.save(user);

        String adminId = resolveAdminId(adminAuth);
        auditService.logAction(user.getId(), "ADMIN_CREATE_USER",
                "Created by admin " + adminId, ipAddress);

        eventPublisher.publishEvent(new UserCreatedEvent(this, user.getId(), user.getEmail(), ipAddress));
        loggingService.logApiRequest("POST", "/api/admin/users", ipAddress, user.getId(), 201);

        return userMapper.toResponseDTO(user);
    }

    // ─────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────

    @Transactional
    public UserResponseDTO updateUser(Long id,
            UserUpdateRequestDTO request,
            Authentication adminAuth,
            String ipAddress) {
        User user = findOrThrow(id);
        user.setFullName(request.getFullName());
        userRepository.save(user);

        String adminId = resolveAdminId(adminAuth);
        auditService.logAction(user.getId(), "ADMIN_UPDATE_USER",
                "Updated by admin " + adminId, ipAddress);

        return userMapper.toResponseDTO(user);
    }

    // ─────────────────────────────────────────────────────────
    // STATUS
    // ─────────────────────────────────────────────────────────

    @Transactional
    public UserResponseDTO updateUserStatus(Long id,
            UserStatusUpdateDTO request,
            Authentication adminAuth,
            String ipAddress) {
        User user = findOrThrow(id);
        UserStatus previousStatus = user.getStatus();
        user.setStatus(request.getStatus());
        userRepository.save(user);

        String adminId = resolveAdminId(adminAuth);
        String reason = request.getReason() != null ? request.getReason() : "No reason provided";

        auditService.logAction(user.getId(), "ADMIN_CHANGE_USER_STATUS",
                previousStatus + " -> " + request.getStatus() + " | " + reason, ipAddress);

        if (request.getStatus() == UserStatus.DISABLED || request.getStatus() == UserStatus.LOCKED) {
            eventPublisher.publishEvent(
                    new UserDisabledEvent(this, user.getId(), user.getEmail(), adminId, reason));
        }

        return userMapper.toResponseDTO(user);
    }

    // ─────────────────────────────────────────────────────────
    // ROLE
    // ─────────────────────────────────────────────────────────

    @Transactional
    public UserResponseDTO updateUserRole(Long id,
            UserRoleUpdateDTO request,
            Authentication adminAuth,
            String ipAddress) {
        User user = findOrThrow(id);
        Role oldRole = user.getRole();
        user.setRole(request.getRole());
        userRepository.save(user);

        String adminId = resolveAdminId(adminAuth);
        auditService.logAction(user.getId(), "ADMIN_CHANGE_USER_ROLE",
                oldRole + " -> " + request.getRole(), ipAddress);

        eventPublisher.publishEvent(
                new UserRoleChangedEvent(this, user.getId(), user.getEmail(), oldRole, request.getRole(), adminId));

        return userMapper.toResponseDTO(user);
    }

    // ─────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────

    @Transactional
    public void deleteUser(Long id, Authentication adminAuth, String ipAddress) {
        User user = findOrThrow(id);
        userRepository.delete(user);

        String adminId = resolveAdminId(adminAuth);
        auditService.logAction(user.getId(), "ADMIN_DELETE_USER",
                "Deleted email: " + user.getEmail() + " by admin " + adminId, ipAddress);

        loggingService.logApiRequest("DELETE", "/api/admin/users/" + id, ipAddress, null, 204);
    }

    // ─────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────

    private User findOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    private String resolveAdminId(Authentication auth) {
        if (auth == null)
            return "system";
        User admin = (User) auth.getPrincipal();
        return String.valueOf(admin.getId());
    }
}
