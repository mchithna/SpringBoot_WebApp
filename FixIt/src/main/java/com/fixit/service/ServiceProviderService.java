package com.fixit.service;

import com.fixit.entity.*;
import com.fixit.repository.ReviewRepository;
import com.fixit.repository.ServiceCategoryRepository;
import com.fixit.repository.ServiceProviderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ServiceProviderService {
    private final ServiceProviderRepository providerRepository;
    private final ReviewRepository reviewRepository;
    private final ServiceCategoryRepository categoryRepository; // <-- ADD THIS

    public ServiceProviderService(ServiceProviderRepository providerRepository,
                                  ReviewRepository reviewRepository,
                                  ServiceCategoryRepository categoryRepository) { // <-- ADD THIS
        this.providerRepository = providerRepository;
        this.reviewRepository = reviewRepository;
        this.categoryRepository = categoryRepository; // <-- ADD THIS
    }

    public ServiceProvider save(ServiceProvider provider) {
        if (provider.getRatingAvg() == null) {
            provider.setRatingAvg(0.0);
        }
        if (provider.getStatus() == null) {
            provider.setStatus(VerificationStatus.PENDING_APPROVAL);
        }
        return providerRepository.save(provider);
    }

    public List<ServiceProvider> findAll() {
        return providerRepository.findAll();
    }
    public Page<ServiceProvider> findAll(Pageable pageable) {
        return providerRepository.findAll(pageable);
    }

    public ServiceProvider findById(Long id) {
        return providerRepository.findById(id).orElse(null);
    }


    public ServiceProvider update(Long id, ServiceProvider updatedProvider) {
        ServiceProvider existing = findById(id);
        if (existing == null) {
            return null;
        }
        existing.setName(updatedProvider.getName());

        if (updatedProvider.getServiceCategory() != null) {
            existing.setServiceCategory(updatedProvider.getServiceCategory());
        }

        existing.setLocation(updatedProvider.getLocation());
        existing.setContactNo(updatedProvider.getContactNo());
        return save(existing);
    }

    public void deleteById(Long id) {
        providerRepository.deleteById(id);
    }


    public Page<ServiceProvider> findByFilters(Long categoryId, String location, Pageable pageable) {
        return providerRepository.findByFilters(categoryId, location, pageable);
    }


    public void updateRatingAvg(Long providerId) {
        ServiceProvider provider = findById(providerId);
        if (provider != null) {
            List<Double> ratings = reviewRepository.findByProviderId(providerId).stream()
                    .mapToDouble(Review::getRating)
                    .boxed().toList();
            if (ratings.isEmpty()) {
                provider.setRatingAvg(0.0);
            } else {
                provider.setRatingAvg(ratings.stream().mapToDouble(Double::doubleValue).average().orElse(0.0));
            }
            save(provider);
        }
    }

    public String uploadPhoto(MultipartFile file, Long providerId) throws IOException {
        if (file.isEmpty()) { return null; }
        String uploadDir = "src/main/resources/static/uploads/";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) { Files.createDirectories(uploadPath); }
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.write(filePath, file.getBytes());
        ServiceProvider provider = findById(providerId);
        if (provider != null) {
            provider.setPhoto("/uploads/" + fileName);
            save(provider);
        }
        return "/uploads/" + fileName;
    }

    public List<ServiceProvider> findByStatus(VerificationStatus status) {
        return providerRepository.findByStatus(status);
    }

    public ServiceProvider updateStatus(Long providerId, VerificationStatus status) {
        // ... (existing logic)
        ServiceProvider provider = findById(providerId);
        if (provider != null) {
            provider.setStatus(status);
            return providerRepository.save(provider);
        }
        return null;
    }

    public long getProviderCount() {
        return providerRepository.count();
    }
    public Optional<ServiceProvider> findByUser(User user) {
        if (user == null) {
            return Optional.empty();
        }
        return providerRepository.findByUserId(user.getId());
    }
}
