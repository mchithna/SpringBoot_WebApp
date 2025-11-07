package com.fixit.controller;

import com.fixit.dto.ProviderDTO;
import com.fixit.dto.RegisterRequest;
import com.fixit.entity.Role;
import com.fixit.entity.ServiceCategory;
import com.fixit.entity.ServiceProvider;
import com.fixit.entity.User;
import com.fixit.exception.ResourceNotFoundException;
import com.fixit.repository.ServiceCategoryRepository;
import com.fixit.service.ServiceProviderService;
import com.fixit.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/providers")
public class ServiceProviderController {

    private final ServiceProviderService service;
    private final ServiceCategoryRepository categoryRepository;
    private final UserService userService;

    public ServiceProviderController(ServiceProviderService service,
                                     ServiceCategoryRepository categoryRepository,
                                     UserService userService) {
        this.service = service;
        this.categoryRepository = categoryRepository;
        this.userService = userService;
    }

    @PostMapping("/register")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> registerProvider(@Valid @RequestBody RegisterRequest request) {
        if (userService.findByEmail(request.getEmail()) != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        // 1. Create the User entity
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setContactNo(request.getPhone());
        user.setRole(Role.PROVIDER);
        User savedUser = userService.save(user); // This part was working

        // 2. Create the ServiceProvider entity
        ServiceProvider provider = new ServiceProvider();
        provider.setName(savedUser.getName());
        provider.setContactNo(savedUser.getContactNo());
        provider.setUser(savedUser); // Link to the User

        service.save(provider);

        return ResponseEntity.ok(Map.of("message", "Provider registered successfully, pending approval."));
    }


    @GetMapping
    public ResponseEntity<Page<ServiceProvider>> list(
            @RequestParam(required = false) Long categoryId, // <-- CHANGED
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ServiceProvider> providers;

        if (categoryId != null || location != null) {
            providers = service.findByFilters(categoryId, location, pageable);
        } else {
            providers = service.findAll(pageable);
        }
        return ResponseEntity.ok(providers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        // ... (no change)
        ServiceProvider provider = service.findById(id);
        if (provider == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(provider);
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody ProviderDTO dto) {
        // Find the category by its ID

        ServiceProvider updated = new ServiceProvider();
        updated.setName(dto.getName());
        updated.setLocation(dto.getLocation());
        updated.setContactNo(dto.getContactNo());

        ServiceProvider result = service.update(id, updated);
        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("message", "Provider updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {

        service.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Provider deleted"));
    }

    @PostMapping("/{id}/photo")
    public ResponseEntity<?> uploadPhoto(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws IOException {

        String photoUrl = service.uploadPhoto(file, id);
        if (photoUrl == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Upload failed"));
        }
        return ResponseEntity.ok(Map.of("photoUrl", photoUrl));
    }
}