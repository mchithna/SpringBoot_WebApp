package com.fixit.dto;

import com.fixit.entity.Service;
import lombok.Data;
import java.math.BigDecimal;

//DTO for the service cards on the user dashboard.
// to prevent JSON infinite loops and send only the needed data.

@Data
public class ServiceCardDTO {
    // Service fields
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;

    // Flattened Provider info
    private Long providerId;
    private String providerName;
    private String providerPhoto;
    private String providerLocation;
    private Double providerRatingAvg;
    private int providerReviewCount;

    // Flattened Category info
    private String categoryName;

    // Constructor to map from the entity
    public ServiceCardDTO(Service service) {
        this.id = service.getId();
        this.name = service.getName();
        this.description = service.getDescription();
        this.price = service.getPrice();

        if (service.getProvider() != null) {
            this.providerId = service.getProvider().getId();
            this.providerName = service.getProvider().getName();
            this.providerPhoto = service.getProvider().getPhoto();
            this.providerLocation = service.getProvider().getLocation();
            this.providerRatingAvg = service.getProvider().getRatingAvg();
            // Handle potential null list before getting size
            this.providerReviewCount = (service.getProvider().getReviews() != null) ? service.getProvider().getReviews().size() : 0;
        }

        if (service.getServiceCategory() != null) {
            this.categoryName = service.getServiceCategory().getName();
        }
    }
}