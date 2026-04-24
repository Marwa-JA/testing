package com.backend.eventmarketplace.service;

import com.google.cloud.storage.Bucket;
import org.springframework.stereotype.Service;

import com.google.cloud.storage.Acl;
import com.google.cloud.storage.Blob;
import com.google.firebase.cloud.StorageClient;

@Service
public class StorageService {

    public String uploadFile(byte[] bytes, String contentType, String objectName) {
        com.google.cloud.storage.Bucket bucket = StorageClient.getInstance().bucket("eventmareketplace.firebasestorage.app");
        Blob blob = bucket.create(objectName, bytes, contentType);
        blob.createAcl(Acl.of(Acl.User.ofAllUsers(), Acl.Role.READER));
        return String.format("https://storage.googleapis.com/%s/%s", "eventmareketplace.firebasestorage.app", objectName);
    }

    public void deleteFile(String objectName) {
        Bucket bucket = StorageClient.getInstance().bucket("eventmareketplace.firebasestorage.app");

        Blob blob = bucket.get(objectName);
        if (blob != null) {
            blob.delete();
        }
    }
}
