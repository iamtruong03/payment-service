package com.example.payment0403.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
public class RateLimiterService {

    private final RedisTemplate<String, String> redisTemplate;

    @Value("${rate-limit.payment.max-requests:10}")
    private int maxPaymentRequests;

    @Value("${rate-limit.payment.window-seconds:60}")
    private int paymentWindowSeconds;

    @Value("${rate-limit.attempts.max-per-minute:5}")
    private int maxAttemptsPerMinute;

    @Value("${rate-limit.cards.max-per-hour:3}")
    private int maxCardsPerHour;

    @Value("${rate-limit.decline.max-consecutive:5}")
    private int maxConsecutiveDeclines;

    @Value("${rate-limit.decline.block-seconds:3600}")
    private int declineBlockSeconds;

    public RateLimiterService(@Qualifier("redisTemplate") RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean isAllowed(String ipAddress) {
        if (isBlocked(ipAddress)) {
            return false;
        }

        String key = "rate:payment:" + ipAddress;
        return checkAndIncrement(key, maxPaymentRequests, paymentWindowSeconds);
    }

    public boolean isPaymentAttemptAllowed(String ipAddress) {
        String key = "attempt:payment:" + ipAddress;
        return checkAndIncrement(key, maxAttemptsPerMinute, 60);
    }

    public boolean isCardDiversityAllowed(String ipAddress, String cardFingerprint) {
        try {
            String setKey = "cards:set:" + ipAddress;

            redisTemplate.opsForSet().add(setKey, cardFingerprint);
            redisTemplate.expire(setKey, Duration.ofHours(1));

            Long distinctCount = redisTemplate.opsForSet().size(setKey);
            if (distinctCount == null)
                distinctCount = 0L;

            if (distinctCount > maxCardsPerHour) {
                return false;
            }
        } catch (Exception e) {
            return true;
        }

        return true;
    }

    public boolean recordDeclineAndCheckBlock(String ipAddress) {
        String key = "decline:consecutive:" + ipAddress;

        try {
            Long count = redisTemplate.opsForValue().increment(key);
            if (count != null && count == 1) {
                redisTemplate.expire(key, Duration.ofHours(1));
            }

            if (count != null && count >= maxConsecutiveDeclines) {
                blockIp(ipAddress, declineBlockSeconds);
                return true;
            }
        } catch (Exception e) {
            // Error intentionally swallowed after log removal
        }

        return false;
    }

    public void resetDeclineCounter(String ipAddress) {
        try {
            String key = "decline:consecutive:" + ipAddress;
            redisTemplate.delete(key);
        } catch (Exception e) {
            // Error intentionally swallowed after log removal
        }
    }

    public void blockIp(String ipAddress, long durationSeconds) {
        try {
            String key = "block:ip:" + ipAddress;
            redisTemplate.opsForValue().set(key, "BLOCKED", durationSeconds, TimeUnit.SECONDS);
        } catch (Exception e) {
            // Error intentionally swallowed after log removal
        }
    }

    public void unblockIp(String ipAddress) {
        try {
            String blockKey = "block:ip:" + ipAddress;
            String declineKey = "decline:consecutive:" + ipAddress;
            redisTemplate.delete(blockKey);
            redisTemplate.delete(declineKey);
        } catch (Exception e) {
            // Error intentionally swallowed after log removal
        }
    }

    public boolean isBlocked(String ipAddress) {
        try {
            String key = "block:ip:" + ipAddress;
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            return false; // fail-open: assume not blocked if Redis is down
        }
    }

    public long getBlockRemainingSeconds(String ipAddress) {
        try {
            String key = "block:ip:" + ipAddress;
            Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
            return ttl != null && ttl > 0 ? ttl : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    private boolean checkAndIncrement(String key, int maxRequests, int windowSeconds) {
        try {
            Long current = redisTemplate.opsForValue().increment(key);

            if (current == null) {
                return true;
            }

            if (current == 1) {
                redisTemplate.expire(key, Duration.ofSeconds(windowSeconds));
            }

            if (current > maxRequests) {
                return false;
            }
        } catch (Exception e) {
            return true;
        }

        return true;
    }
}
