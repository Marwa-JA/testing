package com.backend.eventmarketplace.service;

import com.backend.eventmarketplace.model.Booking;
import com.backend.eventmarketplace.model.Service;
import com.backend.eventmarketplace.model.User;
import com.backend.eventmarketplace.repository.BookingRepository;
import com.backend.eventmarketplace.repository.ServiceRepository;
import com.backend.eventmarketplace.repository.UserRepository;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.ExecutionException;

@org.springframework.stereotype.Service
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final BookingRepository bookingRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;

    public ServiceService(ServiceRepository serviceRepository, BookingRepository bookingRepository,
                          EmailService emailService, UserRepository userRepository) {
        this.serviceRepository = serviceRepository;
        this.bookingRepository = bookingRepository;
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    public Service createService(Service service) throws ExecutionException, InterruptedException {
        service.setId(null);
        service.setCreatedAt(Instant.now());
        service.setUpdatedAt(Instant.now());
        if (service.getStatus() == null) {
            service.setStatus(Service.ServiceStatus.IN_PROGRESS);
        }
        return serviceRepository.save(service);
    }

    public List<Service> getServicesBySupplierId(String supplierId) throws ExecutionException, InterruptedException {
        return serviceRepository.findBySupplierId(supplierId);
    }

    public Service updateService(String serviceId, Service updated) throws ExecutionException, InterruptedException {
        Service existing = serviceRepository.findById(serviceId);
        if (existing == null) {
            throw new RuntimeException("Service not found");
        }
        updated.setId(serviceId);
        updated.setCreatedAt(existing.getCreatedAt());
        updated.setUpdatedAt(Instant.now());
        return serviceRepository.save(updated);
    }

    public Service updateStatus(String serviceId, Service.ServiceStatus status) throws ExecutionException, InterruptedException {
        Service existing = serviceRepository.findById(serviceId);
        if (existing == null) {
            throw new RuntimeException("Service not found");
        }
        Service.ServiceStatus oldStatus = existing.getStatus();
        existing.setStatus(status);
        existing.setUpdatedAt(Instant.now());
        Service saved = serviceRepository.save(existing);

        if (oldStatus != status) {
            notifyBookingsOfServiceChange(saved, oldStatus, status);
        }

        return saved;
    }

    private void notifyBookingsOfServiceChange(Service service, Service.ServiceStatus oldStatus, Service.ServiceStatus newStatus) {
        try {
            List<Booking> allBookings = bookingRepository.findAll();
            String statusLabel = newStatus == Service.ServiceStatus.CANCELED ? "Canceled" : "In Progress";
            String subject = "Service Update: " + service.getName() + " is now " + statusLabel;
            String body = "A service included in your booking has been updated.\n\n"
                    + "Service: " + service.getName() + "\n"
                    + "Status changed: " + (oldStatus != null ? oldStatus : "N/A") + " → " + newStatus + "\n"
                    + (newStatus == Service.ServiceStatus.CANCELED
                        ? "\nPlease contact the provider for more details or to arrange an alternative."
                        : "");

            allBookings.stream()
                    .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED)
                    .filter(b -> b.getSelectedServiceIds() != null && b.getSelectedServiceIds().contains(service.getId()))
                    .filter(b -> b.getUserEmail() != null && !b.getUserEmail().isBlank())
                    .filter(b -> {
                        try {
                            User u = userRepository.findById(b.getUserId());
                            return isNotificationEnabled(u, "eventUpdates");
                        } catch (Exception e) {
                            return true;
                        }
                    })
                    .map(Booking::getUserEmail)
                    .distinct()
                    .forEach(email -> emailService.sendEventNotification(email, subject, body));
        } catch (Exception e) {
            System.err.println("Failed to notify users of service status change: " + e.getMessage());
        }
    }

    private boolean isNotificationEnabled(User user, String preferenceKey) {
        if (user == null || user.getNotificationPreferences() == null) return true;
        Boolean value = user.getNotificationPreferences().get(preferenceKey);
        return value == null || value;
    }

    public Service getServiceById(String serviceId) throws ExecutionException, InterruptedException {
        Service service = serviceRepository.findById(serviceId);
        if (service == null) {
            throw new RuntimeException("Service not found");
        }
        return service;
    }

    public List<Service> getAllAvailableServices() throws ExecutionException, InterruptedException {
        return serviceRepository.findAllAvailable();
    }

    public void deleteService(String serviceId) throws ExecutionException, InterruptedException {
        serviceRepository.delete(serviceId);
    }
}
