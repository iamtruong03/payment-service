package com.example.payment0403.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.example.payment0403.model.User;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RequestLoggingFilter extends OncePerRequestFilter {

    private final LoggingService loggingService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        filterChain.doFilter(request, response);

        Long userId = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            userId = user.getId();
        }

        String ipAddress = extractRealIp(request);
        loggingService.logApiRequest(request.getMethod(), request.getRequestURI(), ipAddress, userId,
                response.getStatus());
    }

    private String extractRealIp(HttpServletRequest request) {
        String ip = request.getHeader("CF-Connecting-IP");
        if (isValidIp(ip))
            return ip;

        ip = request.getHeader("X-Forwarded-For");
        if (isValidIp(ip))
            return ip.split(",")[0].trim();

        ip = request.getHeader("X-Real-IP");
        if (isValidIp(ip))
            return ip;

        return request.getRemoteAddr();
    }

    private boolean isValidIp(String ip) {
        return ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip);
    }
}
