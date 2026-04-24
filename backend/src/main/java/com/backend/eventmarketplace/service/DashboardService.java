package com.backend.eventmarketplace.service;

import com.backend.eventmarketplace.dto.DashboardStats;
import com.backend.eventmarketplace.dto.EventStatsDTO;
import com.backend.eventmarketplace.dto.ProviderPerformanceDTO;
import com.backend.eventmarketplace.model.Booking;
import com.backend.eventmarketplace.model.Event;
import com.backend.eventmarketplace.model.Supplier;
import com.backend.eventmarketplace.repository.BookingRepository;
import com.backend.eventmarketplace.repository.EventRepository;
import com.backend.eventmarketplace.repository.ServiceRepository;
import com.backend.eventmarketplace.repository.SupplierRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class DashboardService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final ServiceRepository serviceRepository;
    private final SupplierRepository supplierRepository;

    public DashboardService(BookingRepository bookingRepository, EventRepository eventRepository,
                            ServiceRepository serviceRepository, SupplierRepository supplierRepository) {
        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
        this.serviceRepository = serviceRepository;
        this.supplierRepository = supplierRepository;
    }

    public DashboardStats getOrganizationDashboard() throws ExecutionException, InterruptedException {
        List<Event> events = eventRepository.findAll();
        List<Booking> allBookings = bookingRepository.findAll();

        List<EventStatsDTO> eventStats = events.stream().map(event -> {
            int totalBookings = event.getTotalBookings() != null ? event.getTotalBookings() : 0;
            int totalCapacity = event.getCapacity() != null ? event.getCapacity() : 0;
            int availableSeats = totalCapacity - totalBookings;
            double totalRevenue = event.getTotalRevenue() != null ? event.getTotalRevenue() : 0.0;
            return new EventStatsDTO(event.getId(), event.getTitle(), totalBookings, totalCapacity, availableSeats, totalRevenue);
        }).toList();

        int overallBookings = eventStats.stream().mapToInt(EventStatsDTO::getTotalBookings).sum();
        double overallRevenue = eventStats.stream().mapToDouble(EventStatsDTO::getTotalRevenue).sum();

        long totalCancellations = allBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CANCELED)
                .count();

        long confirmedBookings = allBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED)
                .count();

        int totalCapacity = events.stream()
                .mapToInt(e -> e.getCapacity() != null ? e.getCapacity() : 0)
                .sum();

        double cancellationRate = allBookings.isEmpty() ? 0.0
                : Math.round((totalCancellations * 100.0 / allBookings.size()) * 10.0) / 10.0;

        double attendanceRate = totalCapacity == 0 ? 0.0
                : Math.round((confirmedBookings * 100.0 / totalCapacity) * 10.0) / 10.0;

        List<Booking> recentBookings = allBookings.stream()
                .filter(b -> b.getBookingDate() != null)
                .sorted(Comparator.comparing(Booking::getBookingDate).reversed())
                .limit(10)
                .toList();

        List<EventStatsDTO> mostPopularEvents = eventStats.stream()
                .sorted(Comparator.comparingInt(EventStatsDTO::getTotalBookings).reversed())
                .limit(3)
                .toList();

        // Provider performance: count how many bookings included each service
        java.util.Map<String, Integer> serviceBookingCount = new java.util.HashMap<>();
        for (Booking b : allBookings) {
            if (b.getStatus() == Booking.BookingStatus.CONFIRMED && b.getSelectedServiceIds() != null) {
                for (String serviceId : b.getSelectedServiceIds()) {
                    serviceBookingCount.merge(serviceId, 1, Integer::sum);
                }
            }
        }

        List<ProviderPerformanceDTO> providerPerformance = new java.util.ArrayList<>();
        for (java.util.Map.Entry<String, Integer> entry : serviceBookingCount.entrySet()) {
            try {
                com.backend.eventmarketplace.model.Service svc = serviceRepository.findById(entry.getKey());
                if (svc != null) {
                    Supplier supplier = supplierRepository.findById(svc.getSupplierId());
                    String supplierName = supplier != null ? supplier.getName() : "Unknown Provider";
                    // Merge into existing entry for same supplier
                    providerPerformance.stream()
                            .filter(p -> p.getSupplierId().equals(svc.getSupplierId()))
                            .findFirst()
                            .ifPresentOrElse(
                                    p -> p.setBookingCount(p.getBookingCount() + entry.getValue()),
                                    () -> providerPerformance.add(new ProviderPerformanceDTO(svc.getSupplierId(), supplierName, entry.getValue()))
                            );
                }
            } catch (Exception ignored) {}
        }
        providerPerformance.sort(Comparator.comparingInt(ProviderPerformanceDTO::getBookingCount).reversed());

        DashboardStats stats = new DashboardStats();
        stats.setEventStats(eventStats);
        stats.setTotalBookings(overallBookings);
        stats.setTotalRevenue(overallRevenue);
        stats.setRecentBookings(recentBookings);
        stats.setTotalEvents(events.size());
        stats.setTotalCancellations((int) totalCancellations);
        stats.setCancellationRate(cancellationRate);
        stats.setAttendanceRate(attendanceRate);
        stats.setMostPopularEvents(mostPopularEvents);
        stats.setProviderPerformance(providerPerformance);
        return stats;
    }

    public byte[] exportDashboardPdf() throws Exception {
        DashboardStats stats = getOrganizationDashboard();

        Document doc = new Document(PageSize.A4, 40, 40, 50, 50);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(doc, out);
        doc.open();

        Font titleFont = new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD, BaseColor.DARK_GRAY);
        Font sectionFont = new Font(Font.FontFamily.HELVETICA, 13, Font.BOLD, new BaseColor(60, 60, 120));
        Font labelFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 10);
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);

        // Title
        Paragraph title = new Paragraph("Event Marketplace — Dashboard Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(4);
        doc.add(title);

        Paragraph date = new Paragraph("Generated: " + LocalDate.now(), normalFont);
        date.setAlignment(Element.ALIGN_CENTER);
        date.setSpacingAfter(16);
        doc.add(date);

        // Summary stats
        doc.add(new Paragraph("Summary", sectionFont));
        doc.add(new Paragraph(" "));

        PdfPTable summaryTable = new PdfPTable(4);
        summaryTable.setWidthPercentage(100);
        summaryTable.setSpacingAfter(16);
        addSummaryCell(summaryTable, "Total Events", String.valueOf(stats.getTotalEvents()), labelFont, normalFont);
        addSummaryCell(summaryTable, "Total Bookings", String.valueOf(stats.getTotalBookings()), labelFont, normalFont);
        addSummaryCell(summaryTable, "Total Revenue", String.format("$%.2f", stats.getTotalRevenue()), labelFont, normalFont);
        addSummaryCell(summaryTable, "Cancellations", String.valueOf(stats.getTotalCancellations()), labelFont, normalFont);
        doc.add(summaryTable);

        PdfPTable ratesTable = new PdfPTable(2);
        ratesTable.setWidthPercentage(50);
        ratesTable.setHorizontalAlignment(Element.ALIGN_LEFT);
        ratesTable.setSpacingAfter(20);
        addSummaryCell(ratesTable, "Cancellation Rate", stats.getCancellationRate() + "%", labelFont, normalFont);
        addSummaryCell(ratesTable, "Attendance Rate", stats.getAttendanceRate() + "%", labelFont, normalFont);
        doc.add(ratesTable);

        // Events table
        doc.add(new Paragraph("Events Breakdown", sectionFont));
        doc.add(new Paragraph(" "));

        PdfPTable eventsTable = new PdfPTable(5);
        eventsTable.setWidthPercentage(100);
        eventsTable.setWidths(new float[]{3f, 1.2f, 1.2f, 1.2f, 1.5f});
        eventsTable.setSpacingAfter(16);

        BaseColor headerBg = new BaseColor(60, 60, 120);
        for (String h : new String[]{"Event", "Bookings", "Capacity", "Available", "Revenue"}) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(headerBg);
            cell.setPadding(6);
            eventsTable.addCell(cell);
        }

        boolean alt = false;
        for (EventStatsDTO e : stats.getEventStats()) {
            BaseColor rowBg = alt ? new BaseColor(240, 240, 250) : BaseColor.WHITE;
            addTableRow(eventsTable, normalFont, rowBg,
                    e.getEventTitle(),
                    String.valueOf(e.getTotalBookings()),
                    String.valueOf(e.getTotalCapacity()),
                    String.valueOf(e.getAvailableSeats()),
                    String.format("$%.2f", e.getTotalRevenue()));
            alt = !alt;
        }
        doc.add(eventsTable);

        doc.close();
        return out.toByteArray();
    }

    private void addSummaryCell(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(8);
        cell.setBackgroundColor(new BaseColor(245, 245, 255));
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + "\n", labelFont));
        p.add(new Chunk(value, valueFont));
        cell.addElement(p);
        table.addCell(cell);
    }

    private void addTableRow(PdfPTable table, Font font, BaseColor bg, String... values) {
        for (String v : values) {
            PdfPCell cell = new PdfPCell(new Phrase(v, font));
            cell.setPadding(5);
            cell.setBackgroundColor(bg);
            table.addCell(cell);
        }
    }
}
