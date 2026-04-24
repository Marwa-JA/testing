package com.backend.eventmarketplace.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.google.cloud.firestore.annotation.DocumentId;

import java.time.Instant;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @DocumentId
    private String id;
    private String name;
    private String email;
    private String phoneNumber;
    private String profilePictureUrl;
    private UserRole role;
    private Instant createdAt;
    private Instant updatedAt;
    private Map<String, Boolean> notificationPreferences;

    public enum UserRole {
        USER,
        ORGANIZER,
        SUPPLIER
    }
}