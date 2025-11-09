package com.fixit.controller;

import com.fixit.dto.ProviderServiceViewDTO;
import com.fixit.dto.ServiceDTO;
import com.fixit.entity.Service;
import com.fixit.entity.ServiceCategory;
import com.fixit.entity.ServiceProvider;
import com.fixit.entity.User;
import com.fixit.exception.ResourceNotFoundException;
import com.fixit.repository.ServiceCategoryRepository;
import com.fixit.repository.ServiceRepository;
import com.fixit.service.ServiceProviderService;
import com.fixit.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/providers/services")
@PreAuthorize("hasRole('PROVIDER')")
public class ProviderServiceController {

    private final ServiceRepository serviceRepository;
    private final ServiceProviderService providerService;
    private final UserService userService;
    private final ServiceCategoryRepository categoryRepository;

    public ProviderServiceController(ServiceRepository serviceRepository,
                                     ServiceProviderService providerService,
                                     UserService userService,
                                     ServiceCategoryRepository categoryRepository) {
        this.serviceRepository = serviceRepository;
        this.providerService = providerService;
        this.userService = userService;
        this.categoryRepository = categoryRepository;
    }

    // Helper to get the provider from the logged-in user
    private ServiceProvider getProviderFromAuth(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        return providerService.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found for user"));
    }

    // GET /api/providers/services
    // Gets the logged-in provider's list of services

    @GetMapping
    public ResponseEntity<List<ProviderServiceViewDTO>> getMyServices(Authentication authentication) {
        ServiceProvider provider = getProviderFromAuth(authentication);

        // Convert the list of Service entities to a list of DTOs
        List<ProviderServiceViewDTO> serviceDTOs = serviceRepository.findByProviderId(provider.getId())
                .stream()
                .map(ProviderServiceViewDTO::new) // Uses the DTO constructor
                .collect(Collectors.toList());

        return ResponseEntity.ok(serviceDTOs);
    }
    // POST /api/providers/services
    // Adds a new service to the provider's list.

    @PostMapping
    public ResponseEntity<ProviderServiceViewDTO> addService(@Valid @RequestBody ServiceDTO serviceDTO, Authentication authentication) {
        ServiceProvider provider = getProviderFromAuth(authentication);
        ServiceCategory category = categoryRepository.findById(serviceDTO.getServiceCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Service newService = new Service();
        newService.setName(serviceDTO.getName());
        newService.setDescription(serviceDTO.getDescription());
        newService.setPrice(serviceDTO.getPrice());
        newService.setProvider(provider);
        newService.setServiceCategory(category);

        Service savedService = serviceRepository.save(newService);
        // Convert to DTO before returning
        return ResponseEntity.status(HttpStatus.CREATED).body(new ProviderServiceViewDTO(savedService));
    }

    //PUT /api/providers/services/{serviceId}
    // Updates one of the provider's existing services.

    @PutMapping("/{serviceId}")
    public ResponseEntity<ProviderServiceViewDTO> updateService(@PathVariable Long serviceId,
                                                                @Valid @RequestBody ServiceDTO serviceDTO,
                                                                Authentication authentication) {
        ServiceProvider provider = getProviderFromAuth(authentication);

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        // Security check: Ensure this provider owns this service
        if (!service.getProvider().getId().equals(provider.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        ServiceCategory category = categoryRepository.findById(serviceDTO.getServiceCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        service.setName(serviceDTO.getName());
        service.setDescription(serviceDTO.getDescription());
        service.setPrice(serviceDTO.getPrice());
        service.setServiceCategory(category);

        Service updatedService = serviceRepository.save(service);
        // Convert to DTO before returning
        return ResponseEntity.ok(new ProviderServiceViewDTO(updatedService));
    }

    /**
     * DELETE /api/providers/services/{serviceId}
     * Deletes one of the provider's services.
     */
    @DeleteMapping("/{serviceId}")
    public ResponseEntity<?> deleteService(@PathVariable Long serviceId, Authentication authentication) {
        ServiceProvider provider = getProviderFromAuth(authentication);

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        // Security check
        if (!service.getProvider().getId().equals(provider.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        serviceRepository.delete(service);
        return ResponseEntity.ok(Map.of("message", "Service deleted successfully"));
    }
}