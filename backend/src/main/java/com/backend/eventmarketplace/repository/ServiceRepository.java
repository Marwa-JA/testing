package com.backend.eventmarketplace.repository;

import com.backend.eventmarketplace.model.Service;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Repository
public class ServiceRepository extends BaseFirestoreRepository<Service> {

    private static final String COLLECTION = "services";

    public ServiceRepository(Firestore firestore) {
        super(firestore);
    }

    public Service save(Service service) throws ExecutionException, InterruptedException {
        return super.save(COLLECTION, service.getId(), service, Service.class);
    }

    public Service findById(String id) throws ExecutionException, InterruptedException {
        return super.getById(COLLECTION, id, Service.class);
    }

    public List<Service> findBySupplierId(String supplierId) throws ExecutionException, InterruptedException {
        QuerySnapshot snapshot = firestore.collection(COLLECTION)
                .whereEqualTo("supplierId", supplierId)
                .get().get();
        List<Service> result = new ArrayList<>();
        for (DocumentSnapshot doc : snapshot.getDocuments()) {
            result.add(doc.toObject(Service.class));
        }
        return result;
    }

    public List<Service> findAllAvailable() throws ExecutionException, InterruptedException {
        QuerySnapshot snapshot = firestore.collection(COLLECTION)
                .whereEqualTo("available", true)
                .get().get();
        List<Service> result = new ArrayList<>();
        for (DocumentSnapshot doc : snapshot.getDocuments()) {
            result.add(doc.toObject(Service.class));
        }
        return result;
    }

    public void delete(String id) throws ExecutionException, InterruptedException {
        super.deleteById(COLLECTION, id);
    }
}
