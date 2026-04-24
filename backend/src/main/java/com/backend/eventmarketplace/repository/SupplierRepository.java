package com.backend.eventmarketplace.repository;

import com.backend.eventmarketplace.model.Supplier;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Repository
public class SupplierRepository extends BaseFirestoreRepository<Supplier> {

    private static final String COLLECTION = "suppliers";

    public SupplierRepository(Firestore firestore) {
        super(firestore);
    }

    public Supplier save(Supplier supplier) throws ExecutionException, InterruptedException {
        return super.save(COLLECTION, supplier.getId(), supplier, Supplier.class);
    }

    public Supplier findById(String id) throws ExecutionException, InterruptedException {
        return super.getById(COLLECTION, id, Supplier.class);
    }

    public Supplier findByUserId(String userId) throws ExecutionException, InterruptedException {
        QuerySnapshot snapshot = firestore.collection(COLLECTION)
                .whereEqualTo("userId", userId)
                .limit(1)
                .get().get();

        if (snapshot.isEmpty()) return null;
        return snapshot.getDocuments().get(0).toObject(Supplier.class);
    }

    public List<Supplier> findAll() throws ExecutionException, InterruptedException {
        QuerySnapshot snapshot = firestore.collection(COLLECTION)
                .get().get();
        List<Supplier> result = new ArrayList<>();
        for (DocumentSnapshot doc : snapshot.getDocuments()) {
            result.add(doc.toObject(Supplier.class));
        }
        return result;
    }

    public void delete(String id) throws ExecutionException, InterruptedException {
        firestore.collection(COLLECTION)
                .document(id)
                .delete()
                .get();
    }
}
