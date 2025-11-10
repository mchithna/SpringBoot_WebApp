package com.fixit.repository;

import com.fixit.entity.ServiceProvider;
import com.fixit.entity.VerificationStatus;
import org.springframework.data.domain.Page;
// MODIFIED: Corrected the import from 'java.awt.print.Pageable'
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional; // <-- IMPORT THIS

@Repository
public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, Long> {

    @Query("SELECT DISTINCT p FROM ServiceProvider p LEFT JOIN p.serviceCategories c " +
            "WHERE (:categoryId IS NULL OR c.id = :categoryId) " +
            "AND (:location IS NULL OR LOWER(p.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
            "AND p.status = 'VERIFIED' " + // Added a filter to only show verified providers
            "ORDER BY p.ratingAvg DESC")
    Page<ServiceProvider> findByFilters(@Param("categoryId") Long categoryId,
                                        @Param("location") String location,
                                        Pageable pageable);

    List<ServiceProvider> findByStatus(VerificationStatus status);

    // count providers by status
    long countByStatus(VerificationStatus status);
    // add this to find a provider by their linked user ID
    Optional<ServiceProvider> findByUserId(Long userId);
}