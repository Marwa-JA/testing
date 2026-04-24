package com.backend.eventmarketplace.controller;

import com.backend.eventmarketplace.model.Service;
import com.backend.eventmarketplace.service.ServiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class ServiceController {

    private final ServiceService serviceService;

    public ServiceController(ServiceService serviceService) {
        this.serviceService = serviceService;
    }

    @PostMapping
    public ResponseEntity<?> createService(@RequestBody Service service) {
        try {
            Service created = serviceService.createService(service);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableServices() {
        try {
            List<Service> services = serviceService.getAllAvailableServices();
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{serviceId}")
    public ResponseEntity<?> getServiceById(@PathVariable String serviceId) {
        try {
            Service service = serviceService.getServiceById(serviceId);
            return ResponseEntity.ok(service);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<?> getServicesBySupplierId(@PathVariable String supplierId) {
        try {
            List<Service> services = serviceService.getServicesBySupplierId(supplierId);
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{serviceId}")
    public ResponseEntity<?> updateService(@PathVariable String serviceId, @RequestBody Service service) {
        try {
            Service updated = serviceService.updateService(serviceId, service);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{serviceId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String serviceId, @RequestBody Map<String, String> body) {
        try {
            Service.ServiceStatus status = Service.ServiceStatus.valueOf(body.get("status"));
            Service updated = serviceService.updateStatus(serviceId, status);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status value");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{serviceId}")
    public ResponseEntity<?> deleteService(@PathVariable String serviceId) {
        try {
            serviceService.deleteService(serviceId);
            return ResponseEntity.ok("Service deleted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
