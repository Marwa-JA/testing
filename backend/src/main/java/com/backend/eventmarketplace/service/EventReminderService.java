package com.backend.eventmarketplace.service;

import com.backend.eventmarketplace.model.Booking;
import com.backend.eventmarketplace.model.Event;
import com.backend.eventmarketplace.model.User;
import com.backend.eventmarketplace.repository.BookingRepository;
import com.backend.eventmarketplace.repository.EventRepository;
import com.backend.eventmarketplace.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class EventReminderService {

    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public EventReminderService(EventRepository eventRepository, BookingRepository bookingRepository,
                                UserRepository userRepository, EmailService emailService) {
        this.eventRepository = eventRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Scheduled(fixedRate = 3600000) // every hour
    public void sendEventReminders() {
        try {
            Instant now = Instant.now();
            Instant in24h = now.plus(24, ChronoUnit.HOURS);

            List<Event> allEvents = eventRepository.findAll();
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a")
                    .withZone(ZoneId.systemDefault());

            for (Event event : allEvents) {
                if (event.getStatus() != Event.EventStatus.ACTIVE) continue;
                if (event.getEventDateTime() == null) continue;
                if (event.getEventDateTime().isBefore(now) || event.getEventDateTime().isAfter(in24h)) continue;

                List<Booking> bookings = bookingRepository.findByEventId(event.getId());
                String eventDate = dtf.format(event.getEventDateTime());
                String location = event.getLocation() + (event.getCity() != null ? ", " + event.getCity() : "");

                bookings.stream()
                        .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED)
                        .filter(b -> b.getUserEmail() != null && !b.getUserEmail().isBlank())
                        .filter(b -> {
                            try {
                                User u = userRepository.findById(b.getUserId());
                                return isNotificationEnabled(u, "eventReminders");
                            } catch (Exception e) {
                                return true;
                            }
                        })
                        .forEach(b -> emailService.sendReminderEmail(
                                b.getUserEmail(), b.getUserName(),
                                event.getTitle(), eventDate, location));
            }
        } catch (Exception e) {
            System.err.println("Error sending event reminders: " + e.getMessage());
        }
    }

    private boolean isNotificationEnabled(User user, String preferenceKey) {
        if (user == null || user.getNotificationPreferences() == null) return true;
        Boolean value = user.getNotificationPreferences().get(preferenceKey);
        return value == null || value;
    }
}
