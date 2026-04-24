package com.backend.eventmarketplace.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendWelcomeEmail(String email, String name) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(email);
            message.setSubject("Welcome to Event Marketplace");
            message.setText("Hi " + name + ",\n\nYour Registration was Successful! \n\nThank you for registering at Event Marketplace.\n\nBest regards,\nEvent Marketplace Team");
            mailSender.send(message);
        } catch (MailException e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendConfirmationEmail(String email, String name, String confirmation) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(email);
            message.setSubject("Booking Confirmation");
            message.setText("Hi " + name + ",\n\nYour Booking is confirmed with the following booking Number:" + confirmation +".\n\nBest regards,\nEvent Marketplace Team");
            mailSender.send(message);
        } catch (MailException e) {
            System.err.println("Failed to send Confirmation email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendCancellationEmail(String email, String name, String referenceNumber) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(email);
            message.setSubject("Booking Cancellation Confirmation");
            message.setText("Hi " + name + ",\n\nYour booking with reference number " + referenceNumber + " has been successfully canceled.\n\nIf you have any questions, please contact us.\n\nBest regards,\nEvent Marketplace Team");
            mailSender.send(message);
        } catch (MailException e) {
            System.err.println("Failed to send cancellation email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendReminderEmail(String email, String name, String eventTitle, String eventDate, String eventLocation) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(email);
            message.setSubject("Reminder: " + eventTitle + " is tomorrow!");
            message.setText("Hi " + name + ",\n\n"
                    + "This is a friendly reminder that your event is coming up tomorrow!\n\n"
                    + "Event: " + eventTitle + "\n"
                    + "Date: " + eventDate + "\n"
                    + "Location: " + eventLocation + "\n\n"
                    + "We look forward to seeing you there!\n\n"
                    + "Best regards,\nEvent Marketplace Team");
            mailSender.send(message);
        } catch (MailException e) {
            System.err.println("Failed to send reminder email: " + e.getMessage());
        }
    }

    public void sendEventNotification(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body + "\n\nBest regards,\nEvent Marketplace Team");
            mailSender.send(message);
        } catch (MailException e) {
            System.err.println("Failed to send event notification to " + toEmail + ": " + e.getMessage());
        }
    }
}
