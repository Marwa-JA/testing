package com.backend.eventmarketplace.dto;

import com.backend.eventmarketplace.model.Booking;
import com.backend.eventmarketplace.model.Payment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Booking booking;
    private Payment payment;
    private String message;
}
