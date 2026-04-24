package com.backend.eventmarketplace.controller;

import com.backend.eventmarketplace.dto.BookingRequest;
import com.backend.eventmarketplace.dto.BookingResponse;
import com.backend.eventmarketplace.model.Booking;
import com.backend.eventmarketplace.model.Payment;
import com.backend.eventmarketplace.service.BookingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    @Mock private BookingService bookingService;
    @InjectMocks private BookingController bookingController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(bookingController).build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
    }

    @Test
    @DisplayName("POST /api/bookings returns 200 with booking response on success")
    void createBooking_success_returns200() throws Exception {
        Booking booking = new Booking();
        booking.setId("b1");
        booking.setReferenceNumber("BK-2026-ABCD1234");
        booking.setStatus(Booking.BookingStatus.CONFIRMED);

        Payment payment = new Payment();
        payment.setId("p1");

        BookingResponse response = new BookingResponse();
        response.setBooking(booking);
        response.setPayment(payment);
        response.setMessage("Booking successful");

        when(bookingService.createBooking(eq("user-1"), any(BookingRequest.class))).thenReturn(response);

        BookingRequest request = new BookingRequest();
        request.setEventId("event-1");
        request.setNumberOfSeats(2);
        request.setPaymentMethod(Payment.PaymentMethod.CREDIT_CARD);

        mockMvc.perform(post("/api/bookings")
                        .param("userId", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Booking successful"))
                .andExpect(jsonPath("$.booking.referenceNumber").value("BK-2026-ABCD1234"));
    }

    @Test
    @DisplayName("POST /api/bookings returns 400 when service throws IllegalArgumentException")
    void createBooking_invalidInput_returns400() throws Exception {
        when(bookingService.createBooking(any(), any()))
                .thenThrow(new IllegalArgumentException("Event not available for booking"));

        BookingRequest request = new BookingRequest();
        request.setEventId("disabled-event");
        request.setNumberOfSeats(1);

        mockMvc.perform(post("/api/bookings")
                        .param("userId", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Event not available for booking"));
    }

    @Test
    @DisplayName("GET /api/bookings/{id} returns 200 with booking when found")
    void getBooking_found_returns200() throws Exception {
        Booking booking = new Booking();
        booking.setId("b1");
        booking.setStatus(Booking.BookingStatus.CONFIRMED);

        when(bookingService.getBookingById("b1")).thenReturn(booking);

        mockMvc.perform(get("/api/bookings/b1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("b1"));
    }

    @Test
    @DisplayName("GET /api/bookings/{id} returns 404 when booking does not exist")
    void getBooking_notFound_returns404() throws Exception {
        when(bookingService.getBookingById("missing")).thenReturn(null);

        mockMvc.perform(get("/api/bookings/missing"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/bookings/{id}/cancel returns 200 with canceled booking")
    void cancelBooking_success_returns200() throws Exception {
        Booking canceled = new Booking();
        canceled.setId("b1");
        canceled.setStatus(Booking.BookingStatus.CANCELED);

        when(bookingService.cancelBooking("b1", "user-1")).thenReturn(canceled);

        mockMvc.perform(put("/api/bookings/b1/cancel")
                        .param("userId", "user-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELED"));
    }

    @Test
    @DisplayName("PUT /api/bookings/{id}/cancel returns 400 when cancellation fails")
    void cancelBooking_pastEvent_returns400() throws Exception {
        when(bookingService.cancelBooking(any(), any()))
                .thenThrow(new IllegalStateException("Cannot cancel a booking after the event date"));

        mockMvc.perform(put("/api/bookings/b1/cancel")
                        .param("userId", "user-1"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Cannot cancel a booking after the event date"));
    }

    @Test
    @DisplayName("GET /api/bookings/user/{userId}/upcoming returns list of upcoming bookings")
    void getUserUpcomingBookings_returns200() throws Exception {
        Booking upcoming = new Booking();
        upcoming.setId("b1");
        upcoming.setEventDateTime(Instant.now().plus(5, ChronoUnit.DAYS));
        upcoming.setStatus(Booking.BookingStatus.CONFIRMED);

        when(bookingService.getUserUpcomingBookings("user-1")).thenReturn(List.of(upcoming));

        mockMvc.perform(get("/api/bookings/user/user-1/upcoming"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("b1"));
    }

    @Test
    @DisplayName("POST /api/bookings/notify/{eventId} returns 400 when subject is blank")
    void notifyAttendees_blankSubject_returns400() throws Exception {
        mockMvc.perform(post("/api/bookings/notify/event-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"subject\":\"\",\"message\":\"Hello\"}"))
                .andExpect(status().isBadRequest());
    }
}
