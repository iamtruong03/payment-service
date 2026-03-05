package com.example.payment0403.service;

import com.example.payment0403.repository.TransactionRepository;
import com.stripe.model.Charge;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class WebhookService {

    private final TransactionRepository transactionRepository;
    private final FraudDetectionService fraudDetectionService;
    private final StripeService stripeService;

    public WebhookService(TransactionRepository transactionRepository,
            FraudDetectionService fraudDetectionService,
            StripeService stripeService) {
        this.transactionRepository = transactionRepository;
        this.fraudDetectionService = fraudDetectionService;
        this.stripeService = stripeService;
    }

    public void processEvent(Event event) {
        switch (event.getType()) {
            case "payment_intent.succeeded" -> handlePaymentSucceeded(event);
            case "payment_intent.payment_failed" -> handlePaymentFailed(event);
            case "payment_intent.canceled" -> handlePaymentCanceled(event);
            case "charge.succeeded" -> handleChargeSucceeded(event);
            case "charge.refunded" -> handleChargeRefunded(event);
            default -> {
            }
        }
    }

    private void handlePaymentSucceeded(Event event) {
        PaymentIntent paymentIntent = deserializePaymentIntent(event);
        if (paymentIntent == null)
            return;

        stripeService.updateTransactionStatus(paymentIntent);
    }

    private void handlePaymentFailed(Event event) {
        PaymentIntent paymentIntent = deserializePaymentIntent(event);
        if (paymentIntent == null)
            return;

        String piId = paymentIntent.getId();
        stripeService.updateTransactionStatus(paymentIntent);

        String ipAddress = paymentIntent.getMetadata().get("ip_address");
        String userAgent = paymentIntent.getMetadata().get("user_agent");
        if (ipAddress != null && !ipAddress.equals("unknown")) {
            String declineCode = paymentIntent.getLastPaymentError() != null
                    ? paymentIntent.getLastPaymentError().getDeclineCode()
                    : null;
            fraudDetectionService.handleStripeDeclineEvent(ipAddress, piId, declineCode, userAgent);
        }
    }

    private void handlePaymentCanceled(Event event) {
        PaymentIntent paymentIntent = deserializePaymentIntent(event);
        if (paymentIntent == null)
            return;

        stripeService.updateTransactionStatus(paymentIntent);
    }

    private void handleChargeSucceeded(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        Charge charge = null;
        try {
            if (deserializer.getObject().isPresent()) {
                charge = (Charge) deserializer.getObject().get();
            } else {
                charge = (Charge) deserializer.deserializeUnsafe();
            }
        } catch (Exception e) {
            // Error intentionally swallowed after log removal
        }

        if (charge != null && charge.getPaymentIntent() != null) {
            String piId = charge.getPaymentIntent();

            final Charge finalCharge = charge;
            transactionRepository.findByPaymentIntentId(piId).ifPresent(tx -> {
                tx.setStatus("succeeded");
                if (finalCharge.getPaymentMethodDetails() != null
                        && finalCharge.getPaymentMethodDetails().getCard() != null) {
                    var card = finalCharge.getPaymentMethodDetails().getCard();
                    tx.setCardBrand(card.getBrand());
                    tx.setCardLast4(card.getLast4());
                    tx.setCardCountry(card.getCountry());
                }
                transactionRepository.save(tx);
            });
        }
    }

    private void handleChargeRefunded(Event event) {
        try {
            EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
            if (deserializer.getObject().isPresent()) {
                Charge charge = (Charge) deserializer.getObject().get();
                String piId = charge.getPaymentIntent();

                if (piId != null) {
                    transactionRepository.findByPaymentIntentId(piId).ifPresent(tx -> {
                        tx.setStatus("refunded");
                        tx.setFailureMessage("Charge refunded via Stripe");
                        transactionRepository.save(tx);
                    });
                }
            }
        } catch (Exception e) {
            // Error intentionally swallowed after log removal
        }
    }

    private PaymentIntent deserializePaymentIntent(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        Optional<StripeObject> stripeObject = deserializer.getObject();

        if (stripeObject.isEmpty()) {
            try {
                return (PaymentIntent) deserializer.deserializeUnsafe();
            } catch (Exception e) {
                return null;
            }
        }

        if (!(stripeObject.get() instanceof PaymentIntent paymentIntent)) {
            return null;
        }

        return paymentIntent;
    }
}
