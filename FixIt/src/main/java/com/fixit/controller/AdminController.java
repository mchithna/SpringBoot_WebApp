package com.fixit.controller;


import com.fixit.dto.AdminBookingDTO;
import com.fixit.dto.AdminDashboardStatsDTO;
import com.fixit.dto.AdminProviderViewDTO;
import com.fixit.dto.AdminUserViewDTO;
import com.fixit.entity.*;
import com.fixit.security.JwtUtil;
import com.fixit.service.AdminService;
import com.fixit.service.BookingService;
import com.fixit.service.ServiceProviderService;
import com.fixit.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") // Secures all endpoints in this class
public class AdminController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final ServiceProviderService providerService;
    private final AdminService adminService;
    private final BookingService bookingService;

    public AdminController(AuthenticationManager authenticationManager,
                           JwtUtil jwtUtil,
                           UserService userService,
                           ServiceProviderService providerService,
                           AdminService adminService,
                           BookingService bookingService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.providerService = providerService;
        this.adminService = adminService;
        this.bookingService = bookingService;
    }

    //Admin-specific login endpoint, as defined in api-config.js.
        // This is public, but only allows ADMIN roles to log in.

    @PostMapping("/login")
    @PreAuthorize("permitAll()") // This specific endpoint is public
    public ResponseEntity<?> loginAdmin(@RequestBody LoginRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            User user = (User) auth.getPrincipal();

            // CRITICAL: Only allow ADMIN role to login here
            if (user.getRole() != Role.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied. Not an admin."));
            }

            String jwt = jwtUtil.generateToken(user);
            Map<String, Object> userResponse = Map.of(
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "role", user.getRole().name()
            );
            return ResponseEntity.ok(Map.of("token", jwt, "user", userResponse));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
    }
    @GetMapping("/dashboard-stats")
    public ResponseEntity<AdminDashboardStatsDTO> getDashboardStats() {
        AdminDashboardStatsDTO stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    //Get providers for the "Provider Management" page.

    @GetMapping("/providers")
    public ResponseEntity<List<AdminProviderViewDTO>> getProviders(
            @RequestParam(required = false) VerificationStatus status) {

        List<AdminProviderViewDTO> providers;
        if (status != null) {
            providers = adminService.getProvidersByStatus(status);
        } else {
            providers = adminService.getAllProviders();
        }
        return ResponseEntity.ok(providers);
    }

    // Endpoint to approve a provider.

    @PostMapping("/providers/{id}/approve")
    public ResponseEntity<?> approveProvider(@PathVariable Long id) {
        ServiceProvider provider = providerService.updateStatus(id, VerificationStatus.VERIFIED);
        if (provider == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("message", "Provider approved", "providerId", id));
    }

    //Endpoint to suspend a provider.

    @PostMapping("/providers/{id}/suspend")
    public ResponseEntity<?> suspendProvider(@PathVariable Long id) {
        ServiceProvider provider = providerService.updateStatus(id, VerificationStatus.SUSPENDED);
        if (provider == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("message", "Provider suspended", "providerId", id));
    }


    // Get all CUSTOMER users with pagination.

    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserViewDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) { // <-- Pagination params
        Pageable pageable = PageRequest.of(page, size);
        Page<AdminUserViewDTO> userPage = userService.findAllCustomers(pageable);
        return ResponseEntity.ok(userPage);
    }
    // Endpoint to delete a user.

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Could not delete user. They may have related bookings or reviews."));
        }
    }

    // Get all bookings with pagination for Admin
    @GetMapping("/bookings")
    public ResponseEntity<Page<AdminBookingDTO>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookingPage = bookingService.findAll(pageable);
        Page<AdminBookingDTO> bookingDTOPage = bookingPage.map(AdminBookingDTO::new);
        return ResponseEntity.ok(bookingDTOPage);
    }
}
