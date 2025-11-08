package com.fixit.controller;

import com.fixit.entity.Service;
import com.fixit.entity.ServiceCategory;
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
    public ResponseEntity<Page<Service>> listServices(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Service> services = serviceRepository.findByFilters(categoryId, location, pageable);
        return ResponseEntity.ok(services);
    }
}