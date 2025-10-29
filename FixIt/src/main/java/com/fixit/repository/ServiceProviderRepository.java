package com.fixit.repository;

import com.fixit.entity.ServiceProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, Long>{

        @Query("SELECT p FROM ServiceProvider p " +
                "WHERE (:serviceType IS NULL OR p.serviceType = :serviceType) " +
                "AND (:location IS NULL OR LOWER(p.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
                "ORDER BY p.ratingAvg DESC")
        Page<ServiceProvider> findByFilters(@Param("serviceType") String serviceType,
                                            @Param("location") String location,
                                            Pageable pageable);

        // Standard findAll supports Pageable
        // For top: Use findAll with Sort, or add custom if needed
    }
}
