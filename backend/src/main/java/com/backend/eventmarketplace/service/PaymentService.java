package com.backend.eventmarketplace.service;

import com.backend.eventmarketplace.model.Payment;
import com.backend.eventmarketplace.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public Payment createPayment(String bookingId, String userId, String eventId,
                                 Double amount, Payment.PaymentMethod method) throws ExecutionException, InterruptedException {
        Payment payment = new Payment();
        payment.setId(null);
        payment.setBookingId(bookingId);
        payment.setUserId(userId);
        payment.setEventId(eventId);
        payment.setAmount(amount);
        payment.setMethod(method != null ? method : Payment.PaymentMethod.CASH);
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setTransactionId("MODULE1-" + bookingId);
        payment.setCreatedAt(Instant.now());
        payment.setCompletedAt(Instant.now());

        return paymentRepository.save(payment);
    }

    public Payment getPaymentById(String paymentId) throws ExecutionException, InterruptedException {
        return paymentRepository.findById(paymentId);
    }

    public List<Payment> getUserPayments(String userId) throws ExecutionException, InterruptedException {
        return paymentRepository.findByUser(userId);
    }

    public Payment processPayment(String paymentId, Payment.PaymentMethod method) throws Exception {
        throw new UnsupportedOperationException("Real payment processing is Module 2");
    }

    public Payment refundPayment(String paymentId) throws Exception {
        throw new UnsupportedOperationException("Refunds are Module 2");
    }

    public String initiateStripePayment(String paymentId, Double amount) throws Exception {
        throw new UnsupportedOperationException("Stripe integration is Module 2");
    }

    public String initiatePayPalPayment(String paymentId, Double amount) throws Exception {
        throw new UnsupportedOperationException("PayPal integration is Module 2");
    }
}