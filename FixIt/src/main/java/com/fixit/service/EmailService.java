package com.fixit.service;

import com.fixit.dto.ContactDTO;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends the "Contact Us" form submission to the admin.
     */
    public void sendContactForm(ContactDTO contactDTO) {
        // Email to be sent TO the admin
        SimpleMailMessage adminMessage = new SimpleMailMessage();
        adminMessage.setTo("admin@fixit.com"); // Your admin email
        adminMessage.setSubject("New Contact Form Submission from: " + contactDTO.getName());
        adminMessage.setFrom(contactDTO.getEmail()); // Reply-to
        adminMessage.setText(
                "You have a new contact form submission:\n" +
                        "Name: " + contactDTO.getName() + "\n" +
                        "Email: " + contactDTO.getEmail() + "\n" +
                        "Phone: " + contactDTO.getPhone() + "\n\n" +
                        "Message:\n" + contactDTO.getMessage()
        );

        // (Optional) Confirmation email to the user
        SimpleMailMessage userMessage = new SimpleMailMessage();
        userMessage.setTo(contactDTO.getEmail());
        userMessage.setSubject("We've received your message - FixIt");
        userMessage.setText(
                "Hi " + contactDTO.getName() + ",\n\n" +
                        "Thank you for contacting FixIt. We have received your message and a team member will get back to you shortly.\n\n" +
                        "Best regards,\nThe FixIt Team"
        );

        try {
            mailSender.send(adminMessage);
            mailSender.send(userMessage);
        } catch (Exception e) {
            // Log the error, but don't fail the request
            System.err.println("Error sending contact email: " + e.getMessage());
        }
    }

    // You can add other email methods here (e.g., sendBookingConfirmation)
}