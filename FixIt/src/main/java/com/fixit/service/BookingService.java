package com.fixit.service;

import com.fixit.dto.AdminBookingDTO;
import com.fixit.dto.BookingDTO;
import com.fixit.entity.Booking;
import com.fixit.entity.BookingStatus;
import com.fixit.entity.ServiceProvider;
import com.fixit.entity.User;
import com.fixit.repository.BookingRepository;
import com.fixit.repository.ServiceProviderRepository;
import com.fixit.repository.ServiceRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;


@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final ServiceProviderRepository providerRepository;
    private final ServiceRepository serviceRepository;

    private final JavaMailSender mailSender;

    public BookingService(BookingRepository bookingRepository,
                          ServiceProviderRepository providerRepository,
                          ServiceRepository serviceRepository,
                          JavaMailSender mailSender) {
        this.bookingRepository = bookingRepository;
        this.providerRepository = providerRepository;
        this.serviceRepository = serviceRepository;
        this.mailSender = mailSender;
    }

    public Booking save(Booking booking) {
        Booking saved = bookingRepository.save(booking);
        return saved;
    }

    public Booking save(BookingDTO dto, User user) {
        com.fixit.entity.Service service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new IllegalArgumentException("Service not found: " + dto.getServiceId()));

        // Get the provider from the service
        ServiceProvider provider = service.getProvider();
        if (provider == null) {
            throw new IllegalArgumentException("Provider not found: " + dto.getProviderId());
        }
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setProvider(provider);
        booking.setService(service);
        booking.setDateTime(dto.getDateTime());
        booking.setRemarks(dto.getRemarks());
        booking.setStatus(BookingStatus.PENDING);
        return save(booking);
    }

    public List<Booking> findAll() {
        return bookingRepository.findAll();
    }
    public Page<Booking> findAll(Pageable pageable) {
        return bookingRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<AdminBookingDTO> findAllAsAdminDTO(Pageable pageable) {
        Page<Booking> bookingPage = bookingRepository.findAll(pageable);
        return bookingPage.map(AdminBookingDTO::new);
    }

    public List<Booking> findByUser(User user) {
        if (user == null || user.getId() == null) {
            return List.of();
        }
        return bookingRepository.findByUserId(user.getId());
    }

    // Fetches bookings for a user, optionally filtering by status.

    public List<Booking> findByUser(User user, String statusStr) {
        if (user == null || user.getId() == null) {
            return List.of();
        }

        if (statusStr == null || statusStr.isEmpty() || statusStr.equalsIgnoreCase("all")) {
            // No status or "all" - return all bookings for the user
            return bookingRepository.findByUserId(user.getId());
        } else {
            // A specific status is requested
            try {
                BookingStatus status = BookingStatus.valueOf(statusStr.toUpperCase());
                return bookingRepository.findByUserIdAndStatus(user.getId(), status);
            } catch (IllegalArgumentException e) {
                // Handle invalid status string
                return List.of();
            }
        }
    }

    public Booking findById(Long id) {
        return bookingRepository.findById(id).orElse(null);
    }

    public Booking updateStatus(Long id, BookingStatus status) {
        Booking booking = findById(id);
        if (booking != null) {
            booking.setStatus(status);
            Booking updated = save(booking);
            return updated;
        }
        return null;
    }

    public Booking updateStatus(Long id, String statusStr) {
        try {
            BookingStatus status = BookingStatus.valueOf(statusStr.toUpperCase());
            return updateStatus(id, status);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + statusStr);
        }
    }

    public void deleteById(Long id) {
        updateStatus(id, BookingStatus.CANCELLED);
    }

    private void sendConfirmationEmail(Booking booking) {
    }
    private void sendStatusUpdateEmail(Booking booking) {
    }

    // Get total booking count for dashboard stats.

    public long getBookingCount() {
        return bookingRepository.count();
    }
    public List<Booking> findByProviderId(Long providerId) {
        return bookingRepository.findByProviderId(providerId);
    }

    public List<Booking> findByProviderIdAndStatus(Long providerId, String statusStr) {
        if (statusStr == null || statusStr.isEmpty() || statusStr.equalsIgnoreCase("all")) {
            // No status or "all" - return all bookings for the provider
            return bookingRepository.findByProviderId(providerId);
        } else {
            // A specific status is requested
            try {
                BookingStatus status = BookingStatus.valueOf(statusStr.toUpperCase());
                return bookingRepository.findByProviderIdAndStatus(providerId, status);
            } catch (IllegalArgumentException e) {
                // Handle invalid status string
                return List.of();
            }
        }
    }
}