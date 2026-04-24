package com.backend.eventmarketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventStatsDTO {
    private String eventId;
    private String eventTitle;
    private Integer totalBookings;
    private Integer totalCapacity;
    private Integer availableSeats;
    private Double totalRevenue;
}
