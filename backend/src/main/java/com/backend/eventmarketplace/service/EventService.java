package com.backend.eventmarketplace.service;

import com.backend.eventmarketplace.model.Booking;
import com.backend.eventmarketplace.model.Event;
import com.backend.eventmarketplace.model.User;
import com.backend.eventmarketplace.repository.BookingRepository;
import com.backend.eventmarketplace.repository.EventRepository;
import com.backend.eventmarketplace.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ExecutionException;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class EventService {

    private static final Logger logger = Logger.getLogger(EventService.class.getName());

    private final EventRepository eventRepository;
    private final StorageService storageService;
    private final BookingRepository bookingRepository;
    private final EmailService emailService;
    private final AIService aiService;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository, StorageService storageService,
                        BookingRepository bookingRepository, EmailService emailService,
                        AIService aiService, UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.storageService = storageService;
        this.bookingRepository = bookingRepository;
        this.emailService = emailService;
        this.aiService = aiService;
        this.userRepository = userRepository;
    }

    public Event createEvent(Event event) throws ExecutionException, InterruptedException {
        event.setId(null);
        event.setStatus(Event.EventStatus.ACTIVE);
        event.setCreatedAt(Instant.now());
        event.setUpdatedAt(Instant.now());
        event.setAvailableSeats(event.getCapacity());
        event.setTotalBookings(0);
        event.setTotalRevenue(0.0);
        event.setBookingEnabled(event.getBookingEnabled());
        return eventRepository.save(event);
    }

    public Event updateEvent(String eventId, Event updated) throws ExecutionException, InterruptedException {
        Event existing = eventRepository.findById(eventId);
        if (existing == null) {
            throw new IllegalArgumentException("Event not found");
        }

        Event.EventStatus oldStatus = existing.getStatus();

        // Track changes before applying updates
        List<String> changes = new ArrayList<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a").withZone(ZoneId.systemDefault());

        if (!Objects.equals(existing.getTitle(), updated.getTitle())) {
            changes.add("- Title: \"" + existing.getTitle() + "\" → \"" + updated.getTitle() + "\"");
        }
        if (!Objects.equals(existing.getDescription(), updated.getDescription())) {
            changes.add("- Description has been updated");
        }
        if (!Objects.equals(existing.getEventDateTime(), updated.getEventDateTime())) {
            String oldDt = existing.getEventDateTime() != null ? dtf.format(existing.getEventDateTime()) : "N/A";
            String newDt = updated.getEventDateTime() != null ? dtf.format(updated.getEventDateTime()) : "N/A";
            changes.add("- Date & Time: " + oldDt + " → " + newDt);
        }
        if (!Objects.equals(existing.getLocation(), updated.getLocation())) {
            changes.add("- Location: \"" + existing.getLocation() + "\" → \"" + updated.getLocation() + "\"");
        }
        if (!Objects.equals(existing.getCity(), updated.getCity())) {
            changes.add("- City: \"" + existing.getCity() + "\" → \"" + updated.getCity() + "\"");
        }
        if (!Objects.equals(existing.getTicketPrice(), updated.getTicketPrice())) {
            changes.add("- Price: $" + (existing.getTicketPrice() != null ? String.format("%.2f", existing.getTicketPrice()) : "0.00")
                    + " → $" + (updated.getTicketPrice() != null ? String.format("%.2f", updated.getTicketPrice()) : "0.00"));
        }
        if (!Objects.equals(existing.getCapacity(), updated.getCapacity())) {
            changes.add("- Capacity: " + existing.getCapacity() + " → " + updated.getCapacity());
        }
        if (!Objects.equals(existing.getStatus(), updated.getStatus())) {
            changes.add("- Status: " + existing.getStatus() + " → " + updated.getStatus());
        }
        if (!Objects.equals(existing.getBookingEnabled(), updated.getBookingEnabled())) {
            changes.add("- Booking: " + (Boolean.TRUE.equals(existing.getBookingEnabled()) ? "Open" : "Closed")
                    + " → " + (Boolean.TRUE.equals(updated.getBookingEnabled()) ? "Open" : "Closed"));
        }
        if (!Objects.equals(existing.getSupplierNotes(), updated.getSupplierNotes())) {
            changes.add("- Additional information has been updated");
        }

        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setEventDateTime(updated.getEventDateTime());
        existing.setLocation(updated.getLocation());
        existing.setCity(updated.getCity());
        existing.setTicketPrice(updated.getTicketPrice());
        existing.setCapacity(updated.getCapacity());
        existing.setAvailableSeats(updated.getAvailableSeats());
        existing.setEventType(updated.getEventType());
        existing.setImageUrls(updated.getImageUrls());
        existing.setVideoUrl(updated.getVideoUrl());
        existing.setSupplierNotes(updated.getSupplierNotes());
        existing.setBookingEnabled(updated.getBookingEnabled());
        existing.setStatus(updated.getStatus());
        existing.setUpdatedAt(Instant.now());

        Event saved = eventRepository.save(existing);

        try {
            List<Booking> bookings = bookingRepository.findByEventId(eventId);
            boolean wasCanceled = updated.getStatus() == Event.EventStatus.CANCELED
                    && oldStatus != Event.EventStatus.CANCELED;

            String subject;
            String body;

            if (wasCanceled) {
                subject = "Event Canceled: " + saved.getTitle();
                body = "We're sorry, the event \"" + saved.getTitle() + "\" has been canceled.\n\n"
                        + "If you have an active booking, a refund will be processed automatically.";
            } else if (!changes.isEmpty()) {
                subject = "Event Updated: " + saved.getTitle();
                body = "The event \"" + saved.getTitle() + "\" has been updated.\n\n"
                        + "Here's what changed:\n" + String.join("\n", changes)
                        + "\n\nPlease review the latest details.";
            } else {
                return saved;
            }

            bookings.stream()
                    .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED)
                    .filter(b -> {
                        try {
                            User u = userRepository.findById(b.getUserId());
                            return isNotificationEnabled(u, "eventUpdates");
                        } catch (Exception e) {
                            return true;
                        }
                    })
                    .map(Booking::getUserEmail)
                    .filter(email -> email != null && !email.isBlank())
                    .distinct()
                    .forEach(email -> emailService.sendEventNotification(email, subject, body));
        } catch (Exception e) {
            System.err.println("Failed to notify attendees of event update: " + e.getMessage());
        }

        return saved;
    }

    public void deleteEvent(String eventId) throws ExecutionException, InterruptedException {
        eventRepository.deleteById(eventId);
    }

    public Event getEventById(String eventId) throws ExecutionException, InterruptedException {
        return eventRepository.findById(eventId);
    }

    public List<Event> getAllEvents() throws ExecutionException, InterruptedException {
        return eventRepository.findAll();
    }

    public Event toggleBookingEnabled(String eventId) throws ExecutionException, InterruptedException {
        Event event = eventRepository.findById(eventId);
        if (event == null) {
            throw new IllegalArgumentException("Event not found");
        }
        boolean current = Boolean.TRUE.equals(event.getBookingEnabled());
        event.setBookingEnabled(!current);
        event.setUpdatedAt(Instant.now());
        return eventRepository.save(event);
    }

    public Event uploadEventVideo(String eventId, MultipartFile file) throws Exception {
        Event event = eventRepository.findById(eventId);
        if (event == null) {
            throw new IllegalArgumentException("Event not found");
        }

        String safeFilename = file.getOriginalFilename() == null ? "video" :
                file.getOriginalFilename().replaceAll("\\s+", "_");
        String objectName = String.format("event_videos/%s_%d_%s",
                eventId, System.currentTimeMillis(), safeFilename);

        String downloadUrl = storageService.uploadFile(file.getBytes(), file.getContentType(), objectName);
        event.setVideoUrl(downloadUrl);
        event.setUpdatedAt(Instant.now());

        return eventRepository.save(event);
    }

    public Event uploadEventMedia(String eventId, MultipartFile file) throws Exception {
        Event event = eventRepository.findById(eventId);
        if (event == null) {
            throw new IllegalArgumentException("Event not found");
        }

        String safeFilename = file.getOriginalFilename() == null ? "image" :
                file.getOriginalFilename().replaceAll("\\s+", "_");
        String objectName = String.format("event_images/%s_%d_%s",
                eventId, System.currentTimeMillis(), safeFilename);

        String downloadUrl = storageService.uploadFile(file.getBytes(), file.getContentType(), objectName);

        List<String> urls = new ArrayList<>();
        if (event.getImageUrls() != null) {
            urls.addAll(event.getImageUrls());
        }
        urls.add(downloadUrl);
        event.setImageUrls(urls);
        event.setUpdatedAt(Instant.now());

        return eventRepository.save(event);
    }

    public List<Map<String, Object>> planEventWithAI(Map<String, String> params) throws Exception {
        List<Event> allEvents = eventRepository.findAll();

        String requestedType = params.getOrDefault("eventType", "").toUpperCase().replace(" ", "_");
        List<Event> candidates = allEvents.stream()
                .filter(e -> e.getStatus() == Event.EventStatus.ACTIVE)
                .filter(e -> Boolean.TRUE.equals(e.getBookingEnabled()))
                .filter(e -> requestedType.isEmpty() || (e.getEventType() != null && e.getEventType().name().contains(requestedType)))
                .collect(Collectors.toList());

        if (candidates.isEmpty()) {
            candidates = allEvents.stream()
                    .filter(e -> e.getStatus() == Event.EventStatus.ACTIVE)
                    .collect(Collectors.toList());
        }

        StringBuilder eventList = new StringBuilder();
        for (int i = 0; i < candidates.size(); i++) {
            Event e = candidates.get(i);
            eventList.append(String.format("[%d] ID=%s | %s | %s, %s | $%.2f | %d seats\n",
                    i + 1, e.getId(), e.getTitle(), e.getLocation(), e.getCity(),
                    e.getTicketPrice() != null ? e.getTicketPrice() : 0.0,
                    e.getAvailableSeats() != null ? e.getAvailableSeats() : 0));
        }

        String prompt = String.format(
                "A user is looking for an event with these requirements:\n" +
                "- Event type: %s\n- Guests: %s\n- Budget: %s\n- Location: %s\n- Description: %s\n\n" +
                "Available events:\n%s\n" +
                "Return ONLY the IDs of the top 3 best matching events, one per line, in this exact format:\n" +
                "ID: <event_id>\nReason: <one sentence why>\n\n" +
                "If fewer than 3 events match, return only the ones that do.",
                params.getOrDefault("eventType", "Any"),
                params.getOrDefault("guestCount", "Unknown"),
                params.getOrDefault("budget", "Any"),
                params.getOrDefault("location", "Any"),
                params.getOrDefault("description", ""),
                eventList
        );

        String aiResponse = aiService.chat(List.of(
                Map.of("role", "system", "content", "You are an event recommendation engine. Follow the output format strictly."),
                Map.of("role", "user", "content", prompt)
        ));

        // Parse AI response: extract event IDs and reasons
        Map<String, Event> eventMap = candidates.stream().collect(Collectors.toMap(Event::getId, e -> e));
        List<Map<String, Object>> results = new ArrayList<>();
        String[] lines = aiResponse.split("\n");
        String currentId = null;
        for (String line : lines) {
            String cleaned = stripMarkdown(line);
            String extractedId = extractAfterPrefix(cleaned, "ID");
            String extractedReason = extractAfterPrefix(cleaned, "Reason");
            if (extractedId != null) {
                currentId = extractedId;
            }
            if (extractedReason != null && currentId != null) {
                Event matched = eventMap.get(currentId);
                if (matched != null) {
                    results.add(Map.of(
                            "id", matched.getId(),
                            "title", matched.getTitle(),
                            "location", matched.getLocation() + ", " + matched.getCity(),
                            "price", matched.getTicketPrice() != null ? matched.getTicketPrice() : 0.0,
                            "availableSeats", matched.getAvailableSeats() != null ? matched.getAvailableSeats() : 0,
                            "reason", extractedReason,
                            "eventType", matched.getEventType() != null ? matched.getEventType().name() : ""
                    ));
                }
                currentId = null;
            } else if (extractedId == null && extractedReason == null && currentId != null) {
                // If line has ID: and Reason: on the same line (some models do this)
                // or if the reason is on the same line after the ID
            }
        }

        if (results.isEmpty()) {
            logger.warning("AI planner parsing produced 0 results. Raw response:\n" + aiResponse);
        }
        return results;
    }

    public List<Event> getSmartRecommendations(String userId) throws Exception {
        List<Booking> pastBookings = bookingRepository.findByUserId(userId);
        List<Event> allActive = eventRepository.findAll().stream()
                .filter(e -> e.getStatus() == Event.EventStatus.ACTIVE)
                .filter(e -> Boolean.TRUE.equals(e.getBookingEnabled()))
                .collect(Collectors.toList());

        if (allActive.isEmpty()) return List.of();

        // Build context from past bookings
        String pastContext = pastBookings.stream()
                .map(Booking::getEventTitle)
                .filter(t -> t != null && !t.isBlank())
                .distinct()
                .collect(Collectors.joining(", "));

        if (pastContext.isBlank()) {
            // No history — return top 3 by available seats as fallback
            return allActive.stream().limit(3).collect(Collectors.toList());
        }

        StringBuilder eventList = new StringBuilder();
        for (Event e : allActive) {
            eventList.append(String.format("ID=%s | %s | %s | $%.2f\n",
                    e.getId(), e.getTitle(), e.getCity(),
                    e.getTicketPrice() != null ? e.getTicketPrice() : 0.0));
        }

        String prompt = String.format(
                "This user previously attended: %s\n\n" +
                "From these active events, recommend the 3 best matches:\n%s\n" +
                "Return ONLY the event IDs, one per line, in this format:\nID: <event_id>",
                pastContext, eventList
        );

        String aiResponse = aiService.chat(List.of(
                Map.of("role", "system", "content", "You are an event recommendation engine. Follow the output format strictly."),
                Map.of("role", "user", "content", prompt)
        ));

        Map<String, Event> eventMap = allActive.stream().collect(Collectors.toMap(Event::getId, e -> e));
        List<Event> recommendations = new ArrayList<>();
        for (String line : aiResponse.split("\n")) {
            String cleaned = stripMarkdown(line);
            String extractedId = extractAfterPrefix(cleaned, "ID");
            if (extractedId != null) {
                Event e = eventMap.get(extractedId);
                if (e != null) recommendations.add(e);
                if (recommendations.size() == 3) break;
            }
        }

        if (recommendations.isEmpty()) {
            logger.warning("AI recommendations parsing produced 0 results. Raw response:\n" + aiResponse);
            return allActive.stream().limit(3).collect(Collectors.toList());
        }
        return recommendations;
    }

    private boolean isNotificationEnabled(User user, String preferenceKey) {
        if (user == null || user.getNotificationPreferences() == null) return true;
        Boolean value = user.getNotificationPreferences().get(preferenceKey);
        return value == null || value;
    }

    private String stripMarkdown(String line) {
        return line.trim()
                .replaceAll("^[\\-\\*•]+\\s*", "")   // strip leading bullets
                .replace("**", "")                     // strip bold markers
                .replace("`", "")                      // strip backticks
                .trim();
    }

    private String extractAfterPrefix(String line, String prefix) {
        Pattern pattern = Pattern.compile("(?i)^" + prefix + "\\s*[:=]\\s*(.+)");
        Matcher matcher = pattern.matcher(line);
        if (matcher.find()) {
            return matcher.group(1).trim().replaceAll("[\"']", "");
        }
        return null;
    }

}