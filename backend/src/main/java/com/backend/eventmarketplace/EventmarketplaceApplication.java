package com.backend.eventmarketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EventmarketplaceApplication {

	public static void main(String[] args) {
		SpringApplication.run(EventmarketplaceApplication.class, args);
	}

}
