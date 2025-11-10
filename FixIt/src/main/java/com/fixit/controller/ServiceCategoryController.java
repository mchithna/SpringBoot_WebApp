package com.fixit.controller;

import com.fixit.entity.Service;
import com.fixit.entity.ServiceCategory;
import com.fixit.dto.ServiceCardDTO;
import com.fixit.repository.ServiceCategoryRepository;
import com.fixit.repository.ServiceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceCategoryController {

    private final ServiceCategoryRepository categoryRepository;
    private final ServiceRepository serviceRepository;

    public ServiceCategoryController(ServiceCategoryRepository categoryRepository,
                                     ServiceRepository serviceRepository) {
        this.categoryRepository = categoryRepository;
        this.serviceRepository = serviceRepository;
    }

    // PUBLIC Endpoint: GET /api/services/categories
    // Used by the frontend to populate filter dropdowns.

    @GetMapping("/categories")
    public ResponseEntity<List<ServiceCategory>> getServiceCategories() {
        List<ServiceCategory> categories = categoryRepository.findAll();
        return ResponseEntity.ok(categories);
    }

    // PUBLIC Endpoint: GET /api/services
    // Used by the "Search Services" tab to find all available services.

    @GetMapping
    public ResponseEntity<Page<ServiceCardDTO>> listServices(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal minPrice, // <-- ADD THIS
            @RequestParam(required = false) BigDecimal maxPrice, // <-- ADD THIS
            @RequestParam(required = false) Double minRating,   // <-- ADD THIS
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Service> servicesPage = serviceRepository.findByFilters(
                categoryId, location, minPrice, maxPrice, minRating, pageable
        );
        Page<ServiceCardDTO> servicesDtoPage = servicesPage.map(ServiceCardDTO::new);

        return ResponseEntity.ok(servicesDtoPage);
    }
}