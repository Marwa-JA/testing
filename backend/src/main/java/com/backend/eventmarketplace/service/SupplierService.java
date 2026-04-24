package com.backend.eventmarketplace.service;

import com.backend.eventmarketplace.model.Supplier;
import com.backend.eventmarketplace.model.User;
import com.backend.eventmarketplace.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final AuthService authService;

    public SupplierService(SupplierRepository supplierRepository, AuthService authService) {
        this.supplierRepository = supplierRepository;
        this.authService = authService;
    }

    public Supplier registerSupplier(Supplier supplier) throws ExecutionException, InterruptedException {
       User user =  this.authService.getUserById(supplier.getUserId());
       supplier.setName(user.getName());
       supplier.setEmail(user.getEmail());
       supplier.setPhoneNumber(user.getPhoneNumber());
        return supplierRepository.save(supplier);
    }

    public Supplier getSupplierById(String supplierId) throws ExecutionException, InterruptedException {
        return supplierRepository.findById(supplierId);
    }

    public Supplier getSupplierByUserId(String userId) throws ExecutionException, InterruptedException {
        return supplierRepository.findByUserId(userId);
    }

    public Supplier updateSupplier(String supplierId, Supplier supplier) throws ExecutionException, InterruptedException {
        Supplier existing = supplierRepository.findById(supplierId);
        if (existing == null) {
            throw new RuntimeException("Supplier not found");
        }

        supplier.setId(supplierId);
        supplier.setCreatedAt(existing.getCreatedAt());
        return supplierRepository.save(supplier);
    }

    public void deleteSupplier(String supplierId) throws ExecutionException, InterruptedException {
        supplierRepository.delete(supplierId);
    }

    public  List<Supplier> getAllSupplier() throws ExecutionException, InterruptedException {
        return supplierRepository.findAll();
    }

}