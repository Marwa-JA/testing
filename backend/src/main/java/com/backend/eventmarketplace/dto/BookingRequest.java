package com.backend.eventmarketplace.dto;

import com.backend.eventmarketplace.model.Payment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
    private String eventId;
    private Integer numberOfSeats;
    private Payment.PaymentMethod paymentMethod;
    private List<String> selectedServiceIds;
    private Instant selectedDateTime;
}