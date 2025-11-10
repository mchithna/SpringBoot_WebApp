package com.fixit.controller;

import com.fixit.dto.ContactDTO;
import com.fixit.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final EmailService emailService;

    public ContactController(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * PUBLIC Endpoint: POST /api/contact
     * Handles the "Contact Us" form submission from index.html
     */
    @PostMapping
    public ResponseEntity<?> submitContactForm(@Valid @RequestBody ContactDTO contactDTO) {
        try {
            // The email service will send the email asynchronously
            emailService.sendContactForm(contactDTO);

            // Return an immediate success response to the user
            return ResponseEntity.ok(Map.of("message", "Message sent successfully!"));
        } catch (Exception e) {
            // Catch any potential synchronous errors
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to send message."));
        }
    }
}