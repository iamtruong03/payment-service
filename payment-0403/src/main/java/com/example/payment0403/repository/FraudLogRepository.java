package com.example.payment0403.repository;

import com.example.payment0403.model.FraudLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FraudLogRepository extends JpaRepository<FraudLog, Long> {

    List<FraudLog> findByIpAddressAndCreatedAtAfterOrderByCreatedAtDesc(
            String ipAddress, LocalDateTime since);

    long countByIpAddress(String ipAddress);

    @Query("SELECT f FROM FraudLog f WHERE f.riskScore >= :threshold AND f.createdAt > :since ORDER BY f.riskScore DESC")
    List<FraudLog> findHighRiskEvents(@Param("threshold") int threshold, @Param("since") LocalDateTime since);

    List<FraudLog> findByEventTypeAndCreatedAtAfter(String eventType, LocalDateTime since);
}
