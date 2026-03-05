package com.example.payment0403.service;

import com.example.payment0403.model.Role;
import com.example.payment0403.model.Transaction;
import com.example.payment0403.model.User;
import com.example.payment0403.repository.TransactionRepository;
import com.example.payment0403.repository.UserRepository;
import com.stripe.exception.StripeException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

import com.example.payment0403.dto.payment.TransactionResponseDTO;
import com.example.payment0403.event.events.PaymentCreatedEvent;
import com.example.payment0403.mapper.TransactionMapper;
import org.springframework.context.ApplicationEventPublisher;

@Service
public class TransactionService {

        private final TransactionRepository transactionRepository;
        private final UserRepository userRepository;
        private final TransactionMapper transactionMapper;
        private final ApplicationEventPublisher eventPublisher;
        private final StripeService stripeService;

        public TransactionService(TransactionRepository transactionRepository,
                        UserRepository userRepository,
                        TransactionMapper transactionMapper,
                        ApplicationEventPublisher eventPublisher,
                        StripeService stripeService) {
                this.transactionRepository = transactionRepository;
                this.userRepository = userRepository;
                this.transactionMapper = transactionMapper;
                this.eventPublisher = eventPublisher;
                this.stripeService = stripeService;
        }

        public TransactionResponseDTO createTransaction(String paymentIntentId, long amount, String currency,
                        String status, Long userId, String ipAddress, String userAgent, int riskScore) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

                Transaction tx = Transaction.builder()
                                .paymentIntentId(paymentIntentId)
                                .amount(amount)
                                .currency(currency)
                                .status(status)
                                .user(user)
                                .ipAddress(ipAddress)
                                .userAgent(userAgent)
                                .riskScore(riskScore)
                                .build();

                tx = transactionRepository.save(tx);

                eventPublisher.publishEvent(
                                new PaymentCreatedEvent(this, userId, paymentIntentId, amount, ipAddress, userAgent));

                return transactionMapper.toDTO(tx);
        }

        public List<TransactionResponseDTO> getUserTransactions(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
                return transactionMapper.toDTOList(transactionRepository.findByUserOrderByCreatedAtDesc(user));
        }

        public TransactionResponseDTO getTransactionById(Long transactionId, User currentUser) {
                Transaction tx;
                if (currentUser.getRole() == Role.ADMIN) {
                        tx = transactionRepository.findById(transactionId)
                                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                        "Transaction not found"));
                } else {
                        tx = transactionRepository.findByIdAndUser(transactionId, currentUser)
                                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                                                        "Access denied: transaction does not belong to you"));
                }

                TransactionResponseDTO dto = transactionMapper.toDTO(tx);

                // Nếu giao dịch chưa thành công, lấy clientSecret để frontend có thể resume
                if (!"succeeded".equals(tx.getStatus())) {
                        dto.setClientSecret(stripeService.getClientSecret(tx.getPaymentIntentId()));
                }

                return dto;
        }

        public void validateTransactionOwnership(Long transactionId, Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

                boolean owned = transactionRepository.findByIdAndUser(transactionId, user).isPresent();
                if (!owned) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                                        "Access denied: transaction does not belong to you");
                }
        }

        public List<TransactionResponseDTO> getAllTransactions() {
                return transactionMapper.toDTOList(transactionRepository.findAllByOrderByCreatedAtDesc(
                                org.springframework.data.domain.Pageable.unpaged()).getContent());
        }

        /**
         * Validates ownership/role and cancels the PaymentIntent via Stripe.
         * Throws ResponseStatusException for 404 / 403 cases.
         */
        public Map<String, Object> cancelPaymentIntent(String paymentIntentId, User currentUser)
                        throws StripeException {
                Transaction tx = transactionRepository.findByPaymentIntentId(paymentIntentId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Transaction not found"));

                if (currentUser.getRole() != Role.ADMIN &&
                                (tx.getUser() == null || !tx.getUser().getId().equals(currentUser.getId()))) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
                }

                return stripeService.cancelPaymentIntent(paymentIntentId);
        }
}
