package com.backend.eventmarketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProviderPerformanceDTO {
    private String supplierId;
    private String supplierName;
    private int bookingCount;
}
