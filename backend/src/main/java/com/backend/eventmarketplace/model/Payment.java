package com.backend.eventmarketplace.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.google.cloud.firestore.annotation.DocumentId;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @DocumentId
    private String id;
    private String bookingId;
    private String userId;
    private String eventId;
    private Double amount;
    private PaymentStatus status;
    private PaymentMethod method;
    private String transactionId;
    private String gatewayResponse;
    private Instant createdAt;
    private Instant completedAt;

    public enum PaymentStatus {
        PENDING,
        COMPLETED,
        FAILED,
        REFUNDED
    }

    public enum PaymentMethod {
        CREDIT_CARD,
        PAYPAL,
        STRIPE,
        CASH,
        BANK_TRANSFER
    }
}