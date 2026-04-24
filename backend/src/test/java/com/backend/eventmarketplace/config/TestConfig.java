package com.backend.eventmarketplace.config;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

@TestConfiguration
@Profile("test")
public class TestConfig {

    @Bean
    public FirebaseApp firebaseApp() {
        return Mockito.mock(FirebaseApp.class);
    }

    @Bean
    public FirebaseAuth firebaseAuth() {
        return Mockito.mock(FirebaseAuth.class);
    }

    @Bean
    public Firestore firestore() {
        return Mockito.mock(Firestore.class);
    }
}
