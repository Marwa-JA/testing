package com.backend.eventmarketplace;

import com.backend.eventmarketplace.config.TestConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestConfig.class)
class EventmarketplaceApplicationTests {

    @MockitoBean
    JavaMailSender mailSender;

    @Test
    void contextLoads() {
    }
}
