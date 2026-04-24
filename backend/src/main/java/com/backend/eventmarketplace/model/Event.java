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
public class Event {

    @DocumentId
    private String id;
    private String title;
    private String description;
    private EventType eventType;
    private String location;
    private String city;
    private Instant eventDateTime;
    private Double ticketPrice;
    private Integer capacity;
    private Integer availableSeats;
    private List<String> imageUrls;
    private String videoUrl;
    private String supplierNotes;
    private EventStatus status;
    private Boolean bookingEnabled;
    private Instant createdAt;
    private Instant updatedAt;
    private Integer totalBookings;
    private Double totalRevenue;
    private String organizerEmail;

    public enum EventType {
        PUBLIC_EVENT,
        HOST_PACKAGE
    }

    public enum EventStatus {
        ACTIVE,
        CANCELED,
        COMPLETED
    }
}