package com.fixit.controller;

import com.fixit.dto.ProviderDTO;
import com.fixit.dto.ProviderDashboardDTO;
import com.fixit.entity.*;
import com.fixit.exception.ResourceNotFoundException;
import com.fixit.repository.ServiceCategoryRepository;
import com.fixit.service.BookingService;
import com.fixit.service.ServiceProviderService;
import com.fixit.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/providers/dashboard")
@PreAuthorize("hasRole('PROVIDER')") // Secures all endpoints for the logged-in provider
public class ProviderDashboardController {

    private final ServiceProviderService providerService;
    private final UserService userService;
    private final BookingService bookingService;
    private final ServiceCategoryRepository categoryRepository;

    public ProviderDashboardController(ServiceProviderService providerService, UserService userService, BookingService bookingService, ServiceCategoryRepository categoryRepository) {
        this.providerService = providerService;
        this.userService = userService;
        this.bookingService = bookingService;
        this.categoryRepository = categoryRepository;
    }

    // Helper to get the provider from the logged-in user
    private ServiceProvider getProviderFromAuth(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        return providerService.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found for user"));
    }

    //GET /api/providers/dashboard/profile

    @GetMapping("/profile")
    public ResponseEntity<ProviderDashboardDTO> getMyProfile(Authentication authentication) {
        ServiceProvider provider = getProviderFromAuth(authentication);
        // Convert to DTO before returning
        return ResponseEntity.ok(new ProviderDashboardDTO(provider));
    }
    //PUT /api/providers/dashboard/profile

    @PutMapping("/profile")
    public ResponseEntity<ProviderDashboardDTO> updateMyProfile(@Valid @RequestBody ProviderDTO dto, Authentication authentication) {
        ServiceProvider provider = getProviderFromAuth(authentication);


        provider.setName(dto.getName());
        provider.setContactNo(dto.getContactNo());
        provider.setLocation(dto.getLocation());
        provider.setBio(dto.getBio());
        provider.setSkills(dto.getSkills());
        User user = provider.getUser();
        user.setName(dto.getName());
        userService.save(user);

        ServiceProvider savedProvider = providerService.save(provider);
        // Convert to DTO before returning
        return ResponseEntity.ok(new ProviderDashboardDTO(savedProvider));
    }

    // To update the provider's service categories
    @PutMapping("/categories")
    public ResponseEntity<?> updateProviderCategories(@RequestBody List<Long> categoryIds, Authentication authentication) {
        ServiceProvider provider = getProviderFromAuth(authentication);

        // Find all categories from the list of IDs
        Set<ServiceCategory> categories = categoryIds.stream()
                .map(id -> categoryRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("ServiceCategory not found with id: " + id)))
                .collect(Collectors.toSet());

        // Set the new categories on the provider
        provider.setServiceCategories(categories);
        providerService.save(provider);
        userService.save(provider.getUser());


        return ResponseEntity.ok(Map.of("message", "Service categories updated successfully"));
    }

     // GET /api/providers/dashboard/bookings

    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getMyBookings(Authentication authentication) {
        ServiceProvider provider = getProviderFromAuth(authentication);
        return ResponseEntity.ok(bookingService.findByProviderId(provider.getId()));
    }

    // POST /api/providers/dashboard/bookings/{id}/accept

    @PostMapping("/bookings/{id}/accept")
    public ResponseEntity<?> acceptBooking(@PathVariable Long id, Authentication authentication) {
        ServiceProvider provider = getProviderFromAuth(authentication);
        Booking booking = bookingService.findById(id);

        if (booking == null || !booking.getProvider().getId().equals(provider.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Cannot modify this booking"));
        }

        bookingService.updateStatus(id, BookingStatus.CONFIRMED);
        return ResponseEntity.ok(Map.of("message", "Booking confirmed"));
    }

    /**
     * POST /api/providers/dashboard/bookings/{id}/complete
     * To complete a confirmed booking
     */
    @PostMapping("/bookings/{id}/complete")
    public ResponseEntity<?> completeBooking(@PathVariable Long id, Authentication authentication) {
        ServiceProvider provider = getProviderFromAuth(authentication);
        Booking booking = bookingService.findById(id);

        if (booking == null || !booking.getProvider().getId().equals(provider.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Cannot modify this booking"));
        }

        bookingService.updateStatus(id, BookingStatus.COMPLETED);
        return ResponseEntity.ok(Map.of("message", "Booking marked as completed"));
    }

}