package com.backend.eventmarketplace.controller;

import com.backend.eventmarketplace.dto.BookingRequest;
import com.backend.eventmarketplace.dto.BookingResponse;
import com.backend.eventmarketplace.model.Booking;
import com.backend.eventmarketplace.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestParam String userId,
                                           @RequestBody BookingRequest request) {
        try {
            BookingResponse response = bookingService.createBooking(userId, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBooking(@PathVariable String id) {
        try {
            Booking booking = bookingService.getBookingById(id);
            return booking != null ? ResponseEntity.ok(booking) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping()
    public ResponseEntity<?> getAllBookings() {
        try {
            List<Booking> booking = bookingService.getAllBookings();
            return booking != null ? ResponseEntity.ok(booking) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}/upcoming")
    public ResponseEntity<?> getUserUpcomingBookings(@PathVariable String userId) {
        try {
            List<Booking> bookings = bookingService.getUserUpcomingBookings(userId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}/past")
    public ResponseEntity<?> getUserPastBookings(@PathVariable String userId) {
        try {
            List<Booking> bookings = bookingService.getUserPastBookings(userId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable String id, @RequestParam String userId) {
        try {
            Booking booking = bookingService.cancelBooking(id, userId);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/event/{eventId}/booked-dates")
    public ResponseEntity<?> getBookedDates(@PathVariable String eventId) {
        try {
            List<String> dates = bookingService.getBookedDatesForEvent(eventId);
            return ResponseEntity.ok(dates);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/notify/{eventId}")
    public ResponseEntity<?> notifyAttendees(
            @PathVariable String eventId,
            @RequestBody Map<String, String> body) {
        try {
            String subject = body.get("subject");
            String message = body.get("message");
            if (subject == null || subject.isBlank() || message == null || message.isBlank()) {
                return ResponseEntity.badRequest().body("Subject and message are required");
            }
            int count = bookingService.notifyEventAttendees(eventId, subject, message);
            return ResponseEntity.ok(Map.of("notified", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}