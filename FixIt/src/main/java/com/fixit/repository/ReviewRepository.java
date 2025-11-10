package com.fixit.repository;

import com.fixit.entity.Review;
import com.fixit.entity.ReviewStatus; // <-- IMPORT THIS
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // ... (keep findByUserId and findByProviderId) ...
    @Query("SELECT r FROM Review r WHERE r.user.id = :userId")
    List<Review> findByUserId(@Param("userId") Long userId);

    @Query("SELECT r FROM Review r WHERE r.provider.id = :providerId")
    List<Review> findByProviderId(@Param("providerId") Long providerId);

    // Find reviews by status for Admin Moderation
    List<Review> findByStatus(ReviewStatus status);
    // Find all reviews for a user, ordered by most recent
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);

}