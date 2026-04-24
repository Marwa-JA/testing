package com.backend.eventmarketplace.repository;


import com.backend.eventmarketplace.model.Booking;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
public class BookingRepository extends BaseFirestoreRepository<Booking> {

    private static final String COLLECTION = "bookings";

    public BookingRepository(Firestore firestore) {
        super(firestore);
    }

    public Booking save(Booking booking) throws ExecutionException, InterruptedException {
        return super.save(COLLECTION, booking.getId(), booking, Booking.class);
    }

    public Booking findById(String id) throws ExecutionException, InterruptedException {
        return super.getById(COLLECTION, id, Booking.class);
    }

    public List<Booking> findAll() throws ExecutionException, InterruptedException {
        return firestore.collection(COLLECTION)
                .get()
                .get()
                .getDocuments()
                .stream()
                .map(doc -> doc.toObject(Booking.class))
                .collect(Collectors.toList());
    }


    public List<Booking> findByUserId(String userId) throws ExecutionException, InterruptedException {
        return firestore.collection(COLLECTION)
                .whereEqualTo("userId", userId)
                .orderBy("bookingDate", com.google.cloud.firestore.Query.Direction.DESCENDING)
                .get()
                .get()
                .getDocuments()
                .stream()
                .map(doc -> doc.toObject(Booking.class))
                .collect(Collectors.toList());
    }

    public List<Booking> findByEventId(String eventId) throws ExecutionException, InterruptedException {
        return firestore.collection(COLLECTION)
                .whereEqualTo("eventId", eventId)
                .get()
                .get()
                .getDocuments()
                .stream()
                .map(doc -> doc.toObject(Booking.class))
                .collect(Collectors.toList());
    }
}