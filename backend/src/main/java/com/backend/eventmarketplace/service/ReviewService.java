package com.backend.eventmarketplace.service;

import com.backend.eventmarketplace.model.Review;
import com.backend.eventmarketplace.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.OptionalDouble;
import java.util.concurrent.ExecutionException;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public Review createReview(Review review) throws ExecutionException, InterruptedException {
        if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        Review existing = reviewRepository.findByUserIdAndEventId(review.getUserId(), review.getEventId());
        if (existing != null) {
            throw new IllegalStateException("You have already reviewed this event");
        }
        review.setId(null);
        review.setCreatedAt(Instant.now());
        return reviewRepository.save(review);
    }

    public List<Review> getEventReviews(String eventId) throws ExecutionException, InterruptedException {
        return reviewRepository.findByEventId(eventId);
    }

    public List<Review> getSupplierReviews(String supplierId) throws ExecutionException, InterruptedException {
        return reviewRepository.findBySupplierId(supplierId);
    }

    public Double getEventAverageRating(String eventId) throws ExecutionException, InterruptedException {
        List<Review> reviews = reviewRepository.findByEventId(eventId);
        OptionalDouble avg = reviews.stream()
                .filter(r -> r.getRating() != null)
                .mapToInt(Review::getRating)
                .average();
        return avg.isPresent() ? Math.round(avg.getAsDouble() * 10.0) / 10.0 : null;
    }

    public Double getSupplierAverageRating(String supplierId) throws ExecutionException, InterruptedException {
        List<Review> reviews = reviewRepository.findBySupplierId(supplierId);
        OptionalDouble avg = reviews.stream()
                .filter(r -> r.getRating() != null)
                .mapToInt(Review::getRating)
                .average();
        return avg.isPresent() ? Math.round(avg.getAsDouble() * 10.0) / 10.0 : null;
    }

    public Double getAverageRating(String entityId) throws ExecutionException, InterruptedException {
        Double eventAvg = getEventAverageRating(entityId);
        if (eventAvg != null) return eventAvg;
        return getSupplierAverageRating(entityId);
    }

    public void deleteReview(String reviewId) throws ExecutionException, InterruptedException {
        reviewRepository.delete(reviewId);
    }
}
