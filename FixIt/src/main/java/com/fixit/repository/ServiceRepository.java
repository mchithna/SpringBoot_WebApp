package com.fixit.repository;

import com.fixit.dto.CategoryStatsDTO;
import com.fixit.entity.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    List<Service> findByProviderId(Long providerId);

    List<Service> findByServiceCategoryId(Long categoryId);

    // Finds all services, with optional filters for category and location,
    // only showing services from VERIFIED providers.

    @Query("SELECT s FROM Service s JOIN s.provider p " +
            "WHERE (:categoryId IS NULL OR s.serviceCategory.id = :categoryId) " +
            //"(p.status = 'VERIFIED') " +

            "AND (:location IS NULL OR :location = '' OR LOWER(p.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
            "AND (:minPrice IS NULL OR s.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR s.price <= :maxPrice) " +
            "AND (:minRating IS NULL OR p.ratingAvg >= :minRating) " +
            "ORDER BY p.ratingAvg DESC, s.price ASC")
    Page<Service> findByFilters(
            @Param("categoryId") Long categoryId,
            @Param("location") String location,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minRating") Double minRating,
            Pageable pageable);
    @Query("SELECT new com.fixit.dto.CategoryStatsDTO(s.serviceCategory.name, COUNT(s.id)) " +
            "FROM Service s WHERE s.serviceCategory.name IS NOT NULL " +
            "GROUP BY s.serviceCategory.name " +
            "ORDER BY COUNT(s.id) DESC")
    List<CategoryStatsDTO> countServicesPerCategory();
}