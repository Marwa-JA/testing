package com.backend.eventmarketplace.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Repository;
import java.util.concurrent.ExecutionException;

@Repository
public class BaseFirestoreRepository<T> {

    protected final Firestore firestore;

    public BaseFirestoreRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    protected T save(String collectionName, String id, T entity, Class<T> clazz)
            throws ExecutionException, InterruptedException {
        CollectionReference collection = firestore.collection(collectionName);
        DocumentReference docRef;

        if (id == null || id.isEmpty()) {
            docRef = collection.document();
        } else {
            docRef = collection.document(id);
        }

        ApiFuture<WriteResult> future = docRef.set(entity);
        future.get();
        return getById(collectionName, docRef.getId(), clazz);
    }

    protected T getById(String collectionName, String id, Class<T> clazz)
            throws ExecutionException, InterruptedException {
        DocumentSnapshot snapshot = firestore.collection(collectionName)
                .document(id)
                .get()
                .get();
        if (!snapshot.exists()) return null;
        T entity = snapshot.toObject(clazz);
        return entity;
    }

    protected void deleteById(String collectionName, String id)
            throws ExecutionException, InterruptedException {
        firestore.collection(collectionName)
                .document(id)
                .delete()
                .get();
    }
}