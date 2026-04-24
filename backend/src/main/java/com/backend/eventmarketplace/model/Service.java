package com.backend.eventmarketplace.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.google.cloud.firestore.annotation.DocumentId;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Service {

    @DocumentId
    private String id;
    private String supplierId;
    private String name;
    private String description;
    private double price;
    private boolean available;
    private ServiceStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    public enum ServiceStatus {
        IN_PROGRESS,
        CANCELED
    }
}
