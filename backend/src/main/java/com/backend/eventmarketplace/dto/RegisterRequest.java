package com.backend.eventmarketplace.dto;

import com.backend.eventmarketplace.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String phoneNumber;
    private String password;
    private User.UserRole role;
}