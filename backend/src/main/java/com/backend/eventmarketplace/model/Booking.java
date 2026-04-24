package com.backend.eventmarketplace.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.google.cloud.firestore.annotation.DocumentId;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @DocumentId
    private String id;
    private String referenceNumber;
    private String userId;
    private String eventId;
    private Integer numberOfSeats;
    private Double totalPrice;
    private BookingStatus status;
    private Instant bookingDate;
    private Instant createdAt;
    private String paymentId;
    private PaymentStatus paymentStatus;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String eventTitle;
    private Instant eventDateTime;
    private String eventLocation;
    private List<String> selectedServiceIds;

    public enum BookingStatus {
        PENDING,
        CONFIRMED,
        CANCELED
    }

    public enum PaymentStatus {
        PENDING,
        COMPLETED,
        FAILED,
        REFUNDED
    }
}