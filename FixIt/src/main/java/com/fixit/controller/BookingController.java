package com.fixit.controller;

import com.fixit.dto.BookingDTO;
import com.fixit.entity.Booking;
import com.fixit.entity.User;
import com.fixit.service.BookingService;
import com.fixit.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService service;
    private final UserService userService;

    public BookingController(BookingService service, UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody BookingDTO dto, Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        try {
            Booking booking = service.save(dto, user);
            Map<String, Object> response = new HashMap<>();
            response.put("id", booking.getId());
            response.put("message", "Booking created and email sent");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Booking>> list(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        List<Booking> bookings = service.findByUser(user);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Booking>> upcoming(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        List<Booking> upcoming = service.findUpcomingByUser(user);
        return ResponseEntity.ok(upcoming);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getById(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        Booking booking = service.findById(id);
        if (booking == null || !booking.getUser().getId().equals(user.getId())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        Booking booking = service.findById(id);
        if (booking == null || !booking.getUser().getId().equals(user.getId())) {
            return ResponseEntity.notFound().build();
        }
        String statusStr = body.get("status");
        try {
            service.updateStatus(id, statusStr);
            return ResponseEntity.ok(Map.of("message", "Status updated to " + statusStr + " and email sent"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancel(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        Booking booking = service.findById(id);
        if (booking == null || !booking.getUser().getId().equals(user.getId())) {
            return ResponseEntity.notFound().build();
        }
        if (!"PENDING".equals(booking.getStatus().name())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot cancel non-pending booking"));
        }
        service.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Booking cancelled and email sent"));
    }
}
