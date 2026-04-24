package com.backend.eventmarketplace.service;

import com.backend.eventmarketplace.dto.BookingRequest;
import com.backend.eventmarketplace.dto.BookingResponse;
import com.backend.eventmarketplace.model.Booking;
import com.backend.eventmarketplace.model.Event;
import com.backend.eventmarketplace.model.Payment;
import com.backend.eventmarketplace.model.User;
import com.backend.eventmarketplace.repository.BookingRepository;
import com.backend.eventmarketplace.repository.EventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private EventRepository eventRepository;
    @Mock private PaymentService paymentService;
    @Mock private AuthService authService;
    @Mock private EmailService emailService;
    @Mock private ServiceService serviceService;

    @InjectMocks
    private BookingService bookingService;

    private Event activeEvent;
    private User testUser;
    private Booking savedBooking;
    private Payment stubPayment;

    @BeforeEach
    void setUp() {
        activeEvent = new Event();
        activeEvent.setId("event-1");
        activeEvent.setTitle("Test Event");
        activeEvent.setTicketPrice(50.0);
        activeEvent.setCapacity(100);
        activeEvent.setAvailableSeats(10);
        activeEvent.setBookingEnabled(true);
        activeEvent.setEventType(Event.EventType.PUBLIC_EVENT);
        activeEvent.setEventDateTime(Instant.now().plus(7, ChronoUnit.DAYS));

        testUser = new User();
        testUser.setId("user-1");
        testUser.setName("Alice");
        testUser.setEmail("alice@example.com");
        testUser.setPhoneNumber("+1234567890");

        savedBooking = new Booking();
        savedBooking.setId("booking-1");
        savedBooking.setReferenceNumber("BK-2026-ABCD1234");
        savedBooking.setUserId("user-1");
        savedBooking.setEventId("event-1");
        savedBooking.setStatus(Booking.BookingStatus.CONFIRMED);
        savedBooking.setEventDateTime(activeEvent.getEventDateTime());
        savedBooking.setUserEmail("alice@example.com");

        stubPayment = new Payment();
        stubPayment.setId("payment-1");
    }

    // --- createBooking ---

    @Test
    @DisplayName("throws when event does not exist")
    void createBooking_nullEvent_throws() throws Exception {
        when(eventRepository.findById("missing")).thenReturn(null);

        BookingRequest req = requestFor("missing", 1);
        assertThatThrownBy(() -> bookingService.createBooking("user-1", req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not available for booking");
    }

    @Test
    @DisplayName("throws when booking is disabled on event")
    void createBooking_bookingDisabled_throws() throws Exception {
        activeEvent.setBookingEnabled(false);
        when(eventRepository.findById("event-1")).thenReturn(activeEvent);

        BookingRequest req = requestFor("event-1", 2);
        assertThatThrownBy(() -> bookingService.createBooking("user-1", req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not available for booking");
    }

    @Test
    @DisplayName("throws when number of seats is zero")
    void createBooking_zeroSeats_throws() throws Exception {
        when(eventRepository.findById("event-1")).thenReturn(activeEvent);

        BookingRequest req = requestFor("event-1", 0);
        assertThatThrownBy(() -> bookingService.createBooking("user-1", req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid number of seats");
    }

    @Test
    @DisplayName("throws when number of seats is negative")
    void createBooking_negativeSeats_throws() throws Exception {
        when(eventRepository.findById("event-1")).thenReturn(activeEvent);

        BookingRequest req = requestFor("event-1", -3);
        assertThatThrownBy(() -> bookingService.createBooking("user-1", req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid number of seats");
    }

    @Test
    @DisplayName("throws when requested seats exceed available seats")
    void createBooking_notEnoughSeats_throws() throws Exception {
        activeEvent.setAvailableSeats(2);
        when(eventRepository.findById("event-1")).thenReturn(activeEvent);

        BookingRequest req = requestFor("event-1", 5);
        assertThatThrownBy(() -> bookingService.createBooking("user-1", req))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Not enough seats");
    }

    @Test
    @DisplayName("throws when HOST_PACKAGE event is booked without a selected date")
    void createBooking_hostPackageWithoutDate_throws() throws Exception {
        activeEvent.setEventType(Event.EventType.HOST_PACKAGE);
        when(eventRepository.findById("event-1")).thenReturn(activeEvent);
        when(authService.getUserById("user-1")).thenReturn(testUser);

        BookingRequest req = requestFor("event-1", 1);
        req.setSelectedDateTime(null);

        assertThatThrownBy(() -> bookingService.createBooking("user-1", req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("select a date and time");
    }

    @Test
    @DisplayName("throws when HOST_PACKAGE selected date is before available-from date")
    void createBooking_hostPackageBeforeAvailableDate_throws() throws Exception {
        Instant availableFrom = Instant.now().plus(5, ChronoUnit.DAYS);
        activeEvent.setEventType(Event.EventType.HOST_PACKAGE);
        activeEvent.setEventDateTime(availableFrom);
        when(eventRepository.findById("event-1")).thenReturn(activeEvent);
        when(authService.getUserById("user-1")).thenReturn(testUser);

        BookingRequest req = requestFor("event-1", 1);
        req.setSelectedDateTime(Instant.now().plus(2, ChronoUnit.DAYS));

        assertThatThrownBy(() -> bookingService.createBooking("user-1", req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("on or after the available-from date");
    }

    @Test
    @DisplayName("throws when HOST_PACKAGE selected date is already booked")
    void createBooking_hostPackageDateAlreadyBooked_throws() throws Exception {
        Instant bookedDate = Instant.parse("2027-06-15T10:00:00Z");
        activeEvent.setEventType(Event.EventType.HOST_PACKAGE);
        activeEvent.setEventDateTime(Instant.now().minus(1, ChronoUnit.DAYS));
        when(eventRepository.findById("event-1")).thenReturn(activeEvent);
        when(authService.getUserById("user-1")).thenReturn(testUser);

        Booking existingBooking = new Booking();
        existingBooking.setEventDateTime(bookedDate);
        existingBooking.setStatus(Booking.BookingStatus.CONFIRMED);
        when(bookingRepository.findByEventId("event-1")).thenReturn(List.of(existingBooking));

        BookingRequest req = requestFor("event-1", 1);
        req.setSelectedDateTime(bookedDate);

        assertThatThrownBy(() -> bookingService.createBooking("user-1", req))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already booked");
    }

    @Test
    @DisplayName("calculates correct total price including selected services")
    void createBooking_withServices_addsPricesToTotal() throws Exception {
        com.backend.eventmarketplace.model.Service catering = new com.backend.eventmarketplace.model.Service();
        catering.setId("svc-1");
        catering.setPrice(100.0);

        when(eventRepository.findById("event-1")).thenReturn(activeEvent);
        when(authService.getUserById("user-1")).thenReturn(testUser);
        when(serviceService.getServiceById("svc-1")).thenReturn(catering);
        when(bookingRepository.save(any())).thenReturn(savedBooking);
        when(paymentService.createPayment(any(), any(), any(), anyDouble(), any())).thenReturn(stubPayment);

        BookingRequest req = requestFor("event-1", 2);
        req.setSelectedServiceIds(List.of("svc-1"));

        BookingResponse response = bookingService.createBooking("user-1", req);

        // 2 seats × £50 + £100 service = £200
        assertThat(response).isNotNull();
        verify(paymentService).createPayment(any(), eq("user-1"), eq("event-1"), eq(200.0), any());
    }

    @Test
    @DisplayName("successful booking returns response with booking and payment")
    void createBooking_validRequest_returnsResponse() throws Exception {
        when(eventRepository.findById("event-1")).thenReturn(activeEvent);
        when(authService.getUserById("user-1")).thenReturn(testUser);
        when(bookingRepository.save(any())).thenReturn(savedBooking);
        when(paymentService.createPayment(any(), any(), any(), anyDouble(), any())).thenReturn(stubPayment);

        BookingRequest req = requestFor("event-1", 2);
        BookingResponse response = bookingService.createBooking("user-1", req);

        assertThat(response.getBooking()).isNotNull();
        assertThat(response.getPayment()).isNotNull();
        assertThat(response.getMessage()).isEqualTo("Booking successful");
        verify(bookingRepository, times(2)).save(any());
    }

    // --- cancelBooking ---

    @Test
    @DisplayName("throws when booking to cancel does not exist")
    void cancelBooking_notFound_throws() throws Exception {
        when(bookingRepository.findById("missing")).thenReturn(null);

        assertThatThrownBy(() -> bookingService.cancelBooking("missing", "user-1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Booking not found");
    }

    @Test
    @DisplayName("throws when a different user tries to cancel the booking")
    void cancelBooking_wrongUser_throws() throws Exception {
        savedBooking.setUserId("user-1");
        when(bookingRepository.findById("booking-1")).thenReturn(savedBooking);

        assertThatThrownBy(() -> bookingService.cancelBooking("booking-1", "user-2"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not allowed to cancel");
    }

    @Test
    @DisplayName("throws when event date has already passed")
    void cancelBooking_pastEvent_throws() throws Exception {
        savedBooking.setUserId("user-1");
        savedBooking.setEventDateTime(Instant.now().minus(1, ChronoUnit.DAYS));
        when(bookingRepository.findById("booking-1")).thenReturn(savedBooking);

        assertThatThrownBy(() -> bookingService.cancelBooking("booking-1", "user-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot cancel a booking after the event date");
    }

    @Test
    @DisplayName("cancels booking and sets status to CANCELED and payment to REFUNDED")
    void cancelBooking_valid_cancelsAndRefunds() throws Exception {
        savedBooking.setUserId("user-1");
        savedBooking.setEventDateTime(Instant.now().plus(3, ChronoUnit.DAYS));

        Booking canceledBooking = new Booking();
        canceledBooking.setId("booking-1");
        canceledBooking.setStatus(Booking.BookingStatus.CANCELED);
        canceledBooking.setPaymentStatus(Booking.PaymentStatus.REFUNDED);
        canceledBooking.setUserEmail("alice@example.com");
        canceledBooking.setUserName("Alice");
        canceledBooking.setReferenceNumber("BK-2026-ABCD1234");

        when(bookingRepository.findById("booking-1")).thenReturn(savedBooking);
        when(bookingRepository.save(any())).thenReturn(canceledBooking);

        Booking result = bookingService.cancelBooking("booking-1", "user-1");

        assertThat(result.getStatus()).isEqualTo(Booking.BookingStatus.CANCELED);
        assertThat(result.getPaymentStatus()).isEqualTo(Booking.PaymentStatus.REFUNDED);
    }

    // --- filtering ---

    @Test
    @DisplayName("getUserUpcomingBookings returns only future, non-canceled bookings")
    void getUserUpcomingBookings_filtersCorrectly() throws Exception {
        Instant future = Instant.now().plus(5, ChronoUnit.DAYS);
        Instant past = Instant.now().minus(5, ChronoUnit.DAYS);

        Booking upcoming = booking("b1", "user-1", future, Booking.BookingStatus.CONFIRMED);
        Booking pastBooking = booking("b2", "user-1", past, Booking.BookingStatus.CONFIRMED);
        Booking canceled = booking("b3", "user-1", future, Booking.BookingStatus.CANCELED);

        when(bookingRepository.findByUserId("user-1")).thenReturn(List.of(upcoming, pastBooking, canceled));

        List<Booking> result = bookingService.getUserUpcomingBookings("user-1");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("b1");
    }

    @Test
    @DisplayName("getUserPastBookings returns only past, non-canceled bookings")
    void getUserPastBookings_filtersCorrectly() throws Exception {
        Instant future = Instant.now().plus(5, ChronoUnit.DAYS);
        Instant past = Instant.now().minus(5, ChronoUnit.DAYS);

        Booking upcoming = booking("b1", "user-1", future, Booking.BookingStatus.CONFIRMED);
        Booking pastBooking = booking("b2", "user-1", past, Booking.BookingStatus.CONFIRMED);
        Booking canceledPast = booking("b3", "user-1", past, Booking.BookingStatus.CANCELED);

        when(bookingRepository.findByUserId("user-1")).thenReturn(List.of(upcoming, pastBooking, canceledPast));

        List<Booking> result = bookingService.getUserPastBookings("user-1");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("b2");
    }

    // --- generateBookingReference ---

    @Test
    @DisplayName("generateBookingReference produces correct BK-YEAR-XXXX format")
    void generateBookingReference_hasCorrectFormat() {
        String ref = bookingService.generateBookingReference();

        assertThat(ref).matches("BK-\\d{4}-[A-F0-9]{8}");
    }

    @Test
    @DisplayName("generateBookingReference produces unique values")
    void generateBookingReference_isUnique() {
        String ref1 = bookingService.generateBookingReference();
        String ref2 = bookingService.generateBookingReference();

        assertThat(ref1).isNotEqualTo(ref2);
    }

    // --- helpers ---

    private BookingRequest requestFor(String eventId, int seats) {
        BookingRequest req = new BookingRequest();
        req.setEventId(eventId);
        req.setNumberOfSeats(seats);
        return req;
    }

    private Booking booking(String id, String userId, Instant dateTime, Booking.BookingStatus status) {
        Booking b = new Booking();
        b.setId(id);
        b.setUserId(userId);
        b.setEventDateTime(dateTime);
        b.setStatus(status);
        return b;
    }
}
