package com.fixit.repository;

import com.fixit.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    List<Service> findByProviderId(Long providerId);

    List<Service> findByServiceCategoryId(Long categoryId);
}