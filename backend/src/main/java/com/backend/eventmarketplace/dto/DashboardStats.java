package com.backend.eventmarketplace.dto;

import com.backend.eventmarketplace.model.Booking;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class DashboardStats {
    private List<EventStatsDTO> eventStats;
    private Integer totalBookings;
    private Double totalRevenue;
    private List<Booking> recentBookings;
    private Integer totalEvents;
    private Integer totalCancellations;
    private Double cancellationRate;
    private Double attendanceRate;
    private List<EventStatsDTO> mostPopularEvents;
    private List<ProviderPerformanceDTO> providerPerformance;
}