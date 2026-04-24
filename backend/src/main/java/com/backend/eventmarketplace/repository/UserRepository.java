package com.backend.eventmarketplace.repository;

import com.backend.eventmarketplace.model.User;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Repository;

import java.util.concurrent.ExecutionException;

@Repository
public class UserRepository extends BaseFirestoreRepository<User> {

    private static final String COLLECTION = "users";

    public UserRepository(Firestore firestore) {
        super(firestore);
    }

    public User save(User user) throws ExecutionException, InterruptedException {
        return super.save(COLLECTION, user.getId(), user, User.class);
    }

    public User findById(String id) throws ExecutionException, InterruptedException {
        return super.getById(COLLECTION, id, User.class);
    }

    public void deleteById(String id) throws ExecutionException, InterruptedException {
        super.deleteById(COLLECTION, id);
    }
}
