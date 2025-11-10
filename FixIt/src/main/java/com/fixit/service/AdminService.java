package com.fixit.service;

import com.fixit.dto.AdminDashboardStatsDTO;
import com.fixit.dto.AdminProviderViewDTO;
import com.fixit.dto.CategoryStatsDTO;

import com.fixit.entity.Role;
import com.fixit.entity.ServiceProvider;
import com.fixit.entity.VerificationStatus;
import com.fixit.exception.ResourceNotFoundException;
import com.fixit.repository.BookingRepository;
import com.fixit.repository.ServiceProviderRepository;
import com.fixit.repository.ServiceRepository;
import com.fixit.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.stream.Collectors;


@Service
public class AdminService {

    private final ServiceProviderRepository providerRepository;
    private final ServiceProviderService providerService;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;

    public AdminService(ServiceProviderRepository providerRepository,
                        ServiceProviderService providerService,
                        UserRepository userRepository,
                        BookingRepository bookingRepository,
                        ServiceRepository serviceRepository) {
        this.providerRepository = providerRepository;
        this.providerService = providerService;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.serviceRepository = serviceRepository;
    }

    /**
     * Approves a service provider.
     */
    public ServiceProvider approveProvider(Long providerId) {
        ServiceProvider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        provider.setStatus(VerificationStatus.VERIFIED);
        return providerRepository.save(provider);
    }

    /**
     * Suspends a service provider.
     */
    public ServiceProvider suspendProvider(Long providerId) {
        ServiceProvider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        provider.setStatus(VerificationStatus.SUSPENDED);
        return providerRepository.save(provider);
    }

    // DASHBOARD STAT
    public AdminDashboardStatsDTO getDashboardStats() {
        AdminDashboardStatsDTO dto = new AdminDashboardStatsDTO();

        // 1. Get the 4 main counts
        dto.setTotalUsers(userRepository.countByRole(Role.CUSTOMER));
        dto.setTotalProviders(providerRepository.countByStatus(VerificationStatus.VERIFIED));
        dto.setTotalBookings(bookingRepository.count());
        dto.setTotalServices(serviceRepository.count());

        // 2. Get the chart/list data and add it to the same DTO
        List<CategoryStatsDTO> bookingStats = bookingRepository.countBookingsPerCategory();
        List<CategoryStatsDTO> serviceStats = serviceRepository.countServicesPerCategory();

        dto.setBookingStats(bookingStats);
        dto.setServiceStats(serviceStats);

        return dto;
    }

    // Get all providers as DTOs
    @Transactional(readOnly = true)
    public List<AdminProviderViewDTO> getAllProviders() {
        return providerService.findAll().stream()
                .map(AdminProviderViewDTO::new)
                .collect(Collectors.toList());
    }

    //Get providers by status as DTOs
    @Transactional(readOnly = true)
    public List<AdminProviderViewDTO> getProvidersByStatus(VerificationStatus status) {
        return providerService.findByStatus(status).stream()
                .map(AdminProviderViewDTO::new)
                .collect(Collectors.toList());
    }

}