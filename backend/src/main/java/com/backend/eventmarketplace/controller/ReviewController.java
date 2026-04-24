package com.backend.eventmarketplace.controller;

import com.backend.eventmarketplace.model.Review;
import com.backend.eventmarketplace.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Review review) {
        try {
            Review created = reviewService.createReview(review);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<?> getEventReviews(@PathVariable String eventId) {
        try {
            List<Review> reviews = reviewService.getEventReviews(eventId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<?> getSupplierReviews(@PathVariable String supplierId) {
        try {
            List<Review> reviews = reviewService.getSupplierReviews(supplierId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/average/event/{eventId}")
    public ResponseEntity<?> getEventAverageRating(@PathVariable String eventId) {
        try {
            Double avg = reviewService.getEventAverageRating(eventId);
            return ResponseEntity.ok(Map.of("average", avg != null ? avg : 0.0, "eventId", eventId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/average/supplier/{supplierId}")
    public ResponseEntity<?> getSupplierAverageRating(@PathVariable String supplierId) {
        try {
            Double avg = reviewService.getSupplierAverageRating(supplierId);
            return ResponseEntity.ok(Map.of("average", avg != null ? avg : 0.0, "supplierId", supplierId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable String reviewId) {
        try {
            reviewService.deleteReview(reviewId);
            return ResponseEntity.ok("Review deleted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
