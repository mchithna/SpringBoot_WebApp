package com.fixit.dto;

import com.fixit.entity.Service;
import lombok.Data;
import java.math.BigDecimal;



@Data
public class ServiceCardDTO {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;

    private Long providerId;
    private String providerName;
    private String providerPhoto;
    private String providerLocation;
    private Double providerRatingAvg;
    private int providerReviewCount;
    private String categoryName;

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
            this.providerReviewCount = (service.getProvider().getReviews() != null) ? service.getProvider().getReviews().size() : 0;
        }

        if (service.getServiceCategory() != null) {
            this.categoryName = service.getServiceCategory().getName();
        }
    }
}