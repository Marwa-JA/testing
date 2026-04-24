package com.backend.eventmarketplace.dto;

import com.backend.eventmarketplace.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String firebaseToken;
    private User user;
}
