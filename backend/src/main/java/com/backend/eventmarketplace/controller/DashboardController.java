package com.backend.eventmarketplace.controller;

import com.backend.eventmarketplace.service.DashboardService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/organization")
    public ResponseEntity<?> getOrganizationDashboard() throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(dashboardService.getOrganizationDashboard());
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf() {
        try {
            byte[] pdf = dashboardService.exportDashboardPdf();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "dashboard-report.pdf");
            return ResponseEntity.ok().headers(headers).body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}