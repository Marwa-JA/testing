package com.backend.eventmarketplace.controller;


import com.backend.eventmarketplace.dto.LoginResponse;
import com.backend.eventmarketplace.dto.RegisterRequest;
import com.backend.eventmarketplace.model.User;
import com.backend.eventmarketplace.service.AuthService;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = authService.registerUser(request);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String token) {
        try {
            String idToken = token.replace("Bearer ", "");
            FirebaseToken firebaseToken = authService.verifyToken(idToken);
            User user = authService.getUserById(firebaseToken.getUid());

            LoginResponse response = new LoginResponse();
            response.setFirebaseToken(idToken);
            response.setUser(user);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token");
        }
    }

    @PutMapping(value = "/user/{uid}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProfile(
            @PathVariable String uid,
            @RequestPart("user") User newUser,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            User user = authService.updateUserProfile(uid, newUser, file);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/user/{uid}/profile-picture")
    public ResponseEntity<?> deleteProfilePicture(@PathVariable String uid) {
        try {
            User updatedUser = authService.deleteProfilePicture(uid);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/user/{uid}/notifications")
    public ResponseEntity<?> updateNotificationPreferences(
            @PathVariable String uid,
            @RequestBody java.util.Map<String, Boolean> preferences) {
        try {
            User user = authService.updateNotificationPreferences(uid, preferences);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/user/{uid}")
    public ResponseEntity<?> deleteAccount(@PathVariable String uid) {
        try {
            authService.deleteUserAccount(uid);
            return ResponseEntity.ok("Account deleted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}