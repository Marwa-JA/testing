package com.backend.eventmarketplace.repository;

import com.backend.eventmarketplace.model.Review;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Repository
public class ReviewRepository extends BaseFirestoreRepository<Review> {

    private static final String COLLECTION = "reviews";

    public ReviewRepository(Firestore firestore) {
        super(firestore);
    }

    public Review save(Review review) throws ExecutionException, InterruptedException {
        return super.save(COLLECTION, review.getId(), review, Review.class);
    }

    public Review findById(String id) throws ExecutionException, InterruptedException {
        return super.getById(COLLECTION, id, Review.class);
    }

    public List<Review> findByEventId(String eventId) throws ExecutionException, InterruptedException {
        QuerySnapshot snapshot = firestore.collection(COLLECTION)
                .whereEqualTo("eventId", eventId)
                .get().get();
        List<Review> result = new ArrayList<>();
        for (DocumentSnapshot doc : snapshot.getDocuments()) {
            result.add(doc.toObject(Review.class));
        }
        return result;
    }

    public List<Review> findBySupplierId(String supplierId) throws ExecutionException, InterruptedException {
        QuerySnapshot snapshot = firestore.collection(COLLECTION)
                .whereEqualTo("supplierId", supplierId)
                .get().get();
        List<Review> result = new ArrayList<>();
        for (DocumentSnapshot doc : snapshot.getDocuments()) {
            result.add(doc.toObject(Review.class));
        }
        return result;
    }

    public Review findByUserIdAndEventId(String userId, String eventId) throws ExecutionException, InterruptedException {
        QuerySnapshot snapshot = firestore.collection(COLLECTION)
                .whereEqualTo("userId", userId)
                .whereEqualTo("eventId", eventId)
                .limit(1)
                .get().get();
        if (snapshot.isEmpty()) return null;
        return snapshot.getDocuments().get(0).toObject(Review.class);
    }

    public void delete(String id) throws ExecutionException, InterruptedException {
        super.deleteById(COLLECTION, id);
    }
}
