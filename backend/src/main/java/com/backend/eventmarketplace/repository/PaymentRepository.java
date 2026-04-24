package com.backend.eventmarketplace.repository;


import com.backend.eventmarketplace.model.Payment;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Repository
public class PaymentRepository extends BaseFirestoreRepository<Payment> {

    private static final String COLLECTION = "payments";

    public PaymentRepository(Firestore firestore) {
        super(firestore);
    }

    public Payment save(Payment payment) throws ExecutionException, InterruptedException {
        return super.save(COLLECTION, payment.getId(), payment, Payment.class);
    }

    public Payment findById(String id) throws ExecutionException, InterruptedException {
        return super.getById(COLLECTION, id, Payment.class);
    }

    public List<Payment> findByUser(String userId) throws ExecutionException, InterruptedException {
        QuerySnapshot snapshot = firestore.collection(COLLECTION)
                .whereEqualTo("userId", userId)
                .get()
                .get();

        List<Payment> result = new ArrayList<>();
        for (DocumentSnapshot doc : snapshot.getDocuments()) {
            Payment p = doc.toObject(Payment.class);
            result.add(p);
        }
        return result;
    }
}
