package com.backend.eventmarketplace.repository;

import com.backend.eventmarketplace.model.Event;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
public class EventRepository extends BaseFirestoreRepository<Event> {

    private static final String COLLECTION = "events";

    public EventRepository(Firestore firestore) {
        super(firestore);
    }

    public Event save(Event event) throws ExecutionException, InterruptedException {
        return super.save(COLLECTION, event.getId(), event, Event.class);
    }

    public Event findById(String id) throws ExecutionException, InterruptedException {
        return super.getById(COLLECTION, id, Event.class);
    }

    public void deleteById(String id) throws ExecutionException, InterruptedException {
        super.deleteById(COLLECTION, id);
    }

    public List<Event> findAll() throws ExecutionException, InterruptedException {
        return firestore.collection(COLLECTION)
                .get()
                .get()
                .getDocuments()
                .stream()
                .map(doc -> doc.toObject(Event.class))
                .collect(Collectors.toList());
    }

}