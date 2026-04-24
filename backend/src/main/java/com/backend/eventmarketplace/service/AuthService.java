package com.backend.eventmarketplace.service;

import com.backend.eventmarketplace.dto.RegisterRequest;
import com.backend.eventmarketplace.model.User;
import com.backend.eventmarketplace.repository.UserRepository;
import com.google.firebase.auth.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.concurrent.ExecutionException;

@Service
public class AuthService {

    private final FirebaseAuth firebaseAuth;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final EmailService emailService;

    public AuthService(FirebaseAuth firebaseAuth, UserRepository userRepository, StorageService storageService, EmailService emailService) {
        this.firebaseAuth = firebaseAuth;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.emailService = emailService;
    }

    public User registerUser(RegisterRequest request) throws Exception {
        UserRecord.CreateRequest createReq = new UserRecord.CreateRequest()
                .setEmail(request.getEmail())
                .setPassword(request.getPassword())
                .setDisplayName(request.getName());

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            createReq.setPhoneNumber(request.getPhoneNumber());
        }

        UserRecord userRecord = firebaseAuth.createUser(createReq);

        User user = new User();
        user.setId(userRecord.getUid());
        user.setName(request.getName());
        user.setEmail(request.getEmail().trim());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setProfilePictureUrl(null);
        user.setRole(request.getRole() != null ? request.getRole() : User.UserRole.USER);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        User savedUser = userRepository.save(user);

        try {
            this.emailService.sendWelcomeEmail(user.getEmail(), user.getName());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return savedUser;
    }

    public FirebaseToken verifyToken(String idToken) throws Exception {
        return firebaseAuth.verifyIdToken(idToken);
    }

    public User getUserById(String uid) throws ExecutionException, InterruptedException {
        return userRepository.findById(uid);
    }

    public User updateUserProfile(String userId, User user, MultipartFile file) throws Exception {

        User existing = userRepository.findById(userId);
        if (existing == null) {
            throw new RuntimeException("User not found");
        }

        if (file != null && !file.isEmpty()) {
            String safeFilename = file.getOriginalFilename() == null ? "photo" :
                    file.getOriginalFilename().replaceAll("\\s+", "_");
            String objectName = String.format("profile_pictures/%s_%d_%s",
                    userId, System.currentTimeMillis(), safeFilename);

            String downloadUrl = storageService.uploadFile(file.getBytes(), file.getContentType(), objectName);
            user.setProfilePictureUrl(downloadUrl);
        } else {
            user.setProfilePictureUrl(existing.getProfilePictureUrl());
        }

        if (user.getEmail() != null && !user.getEmail().equals(existing.getEmail())) {
            try {
                UserRecord.UpdateRequest request = new UserRecord.UpdateRequest(userId)
                        .setEmail(user.getEmail());
                FirebaseAuth.getInstance().updateUser(request);
            } catch (Exception e) {
                throw new RuntimeException("Failed to update Firebase Auth email: " + e.getMessage(), e);
            }
        }

        user.setId(userId);
        user.setCreatedAt(existing.getCreatedAt());
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    public User deleteProfilePicture(String uid) throws Exception {
        User user = userRepository.findById(uid);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        String imageUrl = user.getProfilePictureUrl();
        if (imageUrl == null || imageUrl.isBlank()) {
            throw new RuntimeException("No profile picture to delete");
        }

        String bucketName = "eventmareketplace.firebasestorage.app";
        String prefix = "https://storage.googleapis.com/" + bucketName + "/";

        if (!imageUrl.startsWith(prefix)) {
            throw new RuntimeException("Invalid profile picture URL format");
        }

        String objectName = imageUrl.substring(prefix.length());
        storageService.deleteFile(objectName);
        user.setProfilePictureUrl(null);
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }


    public User updateNotificationPreferences(String uid, java.util.Map<String, Boolean> preferences) throws Exception {
        User user = userRepository.findById(uid);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        user.setNotificationPreferences(preferences);
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    public void deleteUserAccount(String uid) throws Exception {
        firebaseAuth.deleteUser(uid);
        userRepository.deleteById(uid);
    }
}