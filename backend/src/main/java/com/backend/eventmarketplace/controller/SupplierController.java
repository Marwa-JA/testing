package com.backend.eventmarketplace.controller;

import com.backend.eventmarketplace.model.Supplier;
import com.backend.eventmarketplace.service.SupplierService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = "*")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @PostMapping
    public ResponseEntity<?> registerSupplier(@RequestBody Supplier supplier) {
        try {
            Supplier created = supplierService.registerSupplier(supplier);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSupplierById(@PathVariable String id) {
        try {
            Supplier supplier = supplierService.getSupplierById(id);
            return supplier != null ? ResponseEntity.ok(supplier) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getSupplierByUser(@PathVariable String userId) {
        try {
            Supplier supplier = supplierService.getSupplierByUserId(userId);
            return supplier != null ? ResponseEntity.ok(supplier) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllSuppliers() {
        try {
            List<Supplier> suppliers = supplierService.getAllSupplier();
            return ResponseEntity.ok(suppliers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSupplier(@PathVariable String id, @RequestBody Supplier supplier) {
        try {
            Supplier updated = supplierService.updateSupplier(id, supplier);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSupplier(@PathVariable String id) {
        try {
            supplierService.deleteSupplier(id);
            return ResponseEntity.ok("Supplier deleted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}