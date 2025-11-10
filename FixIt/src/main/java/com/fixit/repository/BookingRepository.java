package com.fixit.repository;

import com.fixit.entity.Booking;
import com.fixit.entity.BookingStatus;
import com.fixit.dto.CategoryStatsDTO;
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

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.status = :status")
    List<Booking> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") BookingStatus status);

    //Find bookings by provider ID for the Provider Dashboard
    List<Booking> findByProviderId(Long providerId);


    List<Booking> findByProviderIdAndStatus(Long providerId, BookingStatus status);


    //Query to count bookings per service category
    @Query("SELECT new com.fixit.dto.CategoryStatsDTO(b.service.serviceCategory.name, COUNT(b.id)) " +
            "FROM Booking b WHERE b.service.serviceCategory.name IS NOT NULL " +
            "GROUP BY b.service.serviceCategory.name " +
            "ORDER BY COUNT(b.id) DESC")
    List<CategoryStatsDTO> countBookingsPerCategory();
}