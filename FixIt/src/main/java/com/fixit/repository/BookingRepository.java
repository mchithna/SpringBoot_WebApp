package com.fixit.repository;

import com.fixit.entity.Booking;
import com.fixit.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId")
    List<Booking> findByUserId(@Param("userId") Long userId);

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.status = :status AND b.dateTime > :now")
    List<Booking> findByUserIdAndStatusAndDateTimeAfter(@Param("userId") Long userId,
                                                        @Param("status") BookingStatus status,
                                                        @Param("now") LocalDateTime now);

    // NEW: Find bookings by provider ID for the Provider Dashboard
    List<Booking> findByProviderId(Long providerId);
}