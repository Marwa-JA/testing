package com.backend.eventmarketplace.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.google.cloud.firestore.annotation.DocumentId;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {

    @DocumentId
    private String id;
    private String userId;
    private String name;
    private String email;
    private String phoneNumber;
    private String description;
    private ServiceType serviceType;
    private String city;
    private Instant createdAt;
    private Instant updatedAt;

    public enum ServiceType {
        CATERING,
        DECORATION,
        ENTERTAINMENT,
        PHOTOGRAPHY,
        VENUE,
        EQUIPMENT,
        OTHER
    }
}