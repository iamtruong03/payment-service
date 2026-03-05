package com.example.payment0403.repository;

import com.example.payment0403.model.Transaction;
import com.example.payment0403.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

        Optional<Transaction> findByPaymentIntentId(String paymentIntentId);

        Optional<Transaction> findByIdempotencyKey(String idempotencyKey);

        List<Transaction> findByUserOrderByCreatedAtDesc(User user);

        Optional<Transaction> findByIdAndUser(Long id, User user);

        @Query("SELECT COUNT(t) FROM Transaction t WHERE t.ipAddress = :ip AND t.createdAt > :since")
        long countByIpAddressAfter(@Param("ip") String ipAddress, @Param("since") LocalDateTime since);

        @Query("SELECT COUNT(DISTINCT CONCAT(t.cardLast4, t.cardBrand)) FROM Transaction t " +
                        "WHERE t.ipAddress = :ip AND t.createdAt > :since AND t.cardLast4 IS NOT NULL")
        long countDistinctCardsByIpAfter(@Param("ip") String ipAddress, @Param("since") LocalDateTime since);

        @Query("SELECT COUNT(t) FROM Transaction t WHERE t.ipAddress = :ip " +
                        "AND t.declineCode IS NOT NULL AND t.createdAt > :since")
        long countDeclinesByIpAfter(@Param("ip") String ipAddress, @Param("since") LocalDateTime since);

        List<Transaction> findTop10ByIpAddressOrderByCreatedAtDesc(String ipAddress);

        List<Transaction> findByStatusAndCreatedAtAfter(String status, LocalDateTime since);

        long countByCreatedAtAfter(LocalDateTime since);

        long countByStatusAndCreatedAtAfter(String status, LocalDateTime since);

        Page<Transaction> findAllByOrderByCreatedAtDesc(Pageable pageable);

        Page<Transaction> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

        Page<Transaction> findByIpAddressOrderByCreatedAtDesc(String ipAddress, Pageable pageable);

        @Query("SELECT t.ipAddress, COUNT(t) as cnt FROM Transaction t " +
                        "WHERE t.status = 'payment_failed' AND t.createdAt > :since " +
                        "GROUP BY t.ipAddress ORDER BY cnt DESC")
        List<Object[]> findTopDeclinedIPs(@Param("since") LocalDateTime since, Pageable pageable);

        @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
                        "WHERE t.status = 'succeeded' AND t.createdAt > :since")
        Long sumSucceededAmount(@Param("since") LocalDateTime since);
}
