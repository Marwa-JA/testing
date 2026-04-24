package com.backend.eventmarketplace.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.google.cloud.firestore.annotation.DocumentId;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @DocumentId
    private String id;
    private String userId;
    private String userName;
    private String eventId;
    private String supplierId;
    private Integer rating;
    private String comment;
    private Instant createdAt;
}