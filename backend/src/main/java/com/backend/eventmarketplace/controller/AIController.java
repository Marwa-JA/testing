package com.backend.eventmarketplace.controller;

import com.backend.eventmarketplace.model.Event;
import com.backend.eventmarketplace.repository.EventRepository;
import com.backend.eventmarketplace.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    private final AIService aiService;
    private final EventRepository eventRepository;

    public AIController(AIService aiService, EventRepository eventRepository) {
        this.aiService = aiService;
        this.eventRepository = eventRepository;
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, String>> messages = (List<Map<String, String>>) request.get("messages");

            // Build event context from real data
            List<Event> activeEvents = eventRepository.findAll().stream()
                    .filter(e -> e.getStatus() == Event.EventStatus.ACTIVE)
                    .collect(Collectors.toList());

            String eventContext = buildEventContext(activeEvents);

            // Inject event data into the system message
            List<Map<String, String>> enriched = new ArrayList<>();
            for (Map<String, String> msg : messages) {
                if ("system".equals(msg.get("role"))) {
                    enriched.add(Map.of("role", "system", "content",
                            msg.get("content") + "\n\n" + eventContext));
                } else {
                    enriched.add(msg);
                }
            }

            String reply = aiService.chat(enriched);
            return ResponseEntity.ok(Map.of("response", reply));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    private String buildEventContext(List<Event> events) {
        if (events.isEmpty()) {
            return "CURRENT EVENTS DATABASE: There are currently no active events listed on the platform.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("CURRENT EVENTS DATABASE (use ONLY this data to answer questions about events — never make up events):\n");
        for (Event e : events) {
            sb.append(String.format("- \"%s\" | Type: %s | Location: %s, %s | Price: $%.2f | Available seats: %d/%d | Booking: %s\n",
                    e.getTitle(),
                    e.getEventType() != null ? e.getEventType().name().replace("_", " ") : "N/A",
                    e.getLocation() != null ? e.getLocation() : "N/A",
                    e.getCity() != null ? e.getCity() : "N/A",
                    e.getTicketPrice() != null ? e.getTicketPrice() : 0.0,
                    e.getAvailableSeats() != null ? e.getAvailableSeats() : 0,
                    e.getCapacity() != null ? e.getCapacity() : 0,
                    Boolean.TRUE.equals(e.getBookingEnabled()) ? "Open" : "Closed"));
        }
        sb.append("\nIMPORTANT: If the user asks about events in a city or location not listed above, say there are currently no events in that area. NEVER invent or fabricate event names, dates, or details.");
        return sb.toString();
    }
}
