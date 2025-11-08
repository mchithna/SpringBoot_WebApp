package com.fixit.service;

// ... (imports)
import com.fixit.dto.BookingDTO;
import com.fixit.entity.Booking;
import com.fixit.entity.BookingStatus;
import com.fixit.entity.ServiceProvider;
import com.fixit.entity.User;
import com.fixit.repository.BookingRepository;
import com.fixit.repository.ServiceProviderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
// ...

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final ServiceProviderRepository providerRepository;
    private final JavaMailSender mailSender;

    public BookingService(BookingRepository bookingRepository,
                          ServiceProviderRepository providerRepository,
                          JavaMailSender mailSender) {
        this.bookingRepository = bookingRepository;
        this.providerRepository = providerRepository;
        this.mailSender = mailSender;
    }

    public Booking save(Booking booking) {
        Booking saved = bookingRepository.save(booking);
        return saved;
    }

    public Booking save(BookingDTO dto, User user) {
        ServiceProvider provider = providerRepository.findById(dto.getProviderId()).orElse(null);
        if (provider == null) {
            throw new IllegalArgumentException("Provider not found: " + dto.getProviderId());
        }
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setProvider(provider);
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


    public List<Booking> findByUser(User user) {
        if (user == null || user.getId() == null) {
            return List.of();
        }
        return bookingRepository.findByUserId(user.getId());
    }

    public List<Booking> findUpcomingByUser(User user) {
        if (user == null || user.getId() == null) {
            return List.of();
        }
        return bookingRepository.findByUserIdAndStatusAndDateTimeAfter(user.getId(), BookingStatus.PENDING, LocalDateTime.now());
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

    // NEW: Get total booking count for dashboard stats.

    public long getBookingCount() {
        return bookingRepository.count();
    }
    public List<Booking> findByProviderId(Long providerId) {
        return bookingRepository.findByProviderId(providerId);
    }
}