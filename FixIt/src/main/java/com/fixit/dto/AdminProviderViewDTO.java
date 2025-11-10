package com.fixit.dto;

import com.fixit.entity.ServiceProvider;
import com.fixit.entity.ServiceCategory;
import com.fixit.entity.VerificationStatus;
import lombok.Data;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * DTO for safely sending provider data (including email) to the admin dashboard.
 * This prevents JSON serialization loops.
 */
@Data
public class AdminProviderViewDTO {

    private Long id;
    private String name;
    private String location;
    private String contactNo;
    private String email;
    private VerificationStatus status;
    private String categories; // A comma-separated list of category names

    public AdminProviderViewDTO(ServiceProvider provider) {
        this.id = provider.getId();
        this.name = provider.getName();
        this.location = provider.getLocation();
        this.contactNo = provider.getContactNo();
        this.status = provider.getStatus();

        // Safely get email from the associated user
        if (provider.getUser() != null) {
            this.email = provider.getUser().getEmail();
        } else {
            this.email = "N/A";
        }

        // Safely get and join category names
        Set<ServiceCategory> cats = provider.getServiceCategories();
        if (cats != null && !cats.isEmpty()) {
            this.categories = cats.stream()
                    .map(ServiceCategory::getName)
                    .collect(Collectors.joining(", "));
        } else {
            this.categories = "N/A";
        }
    }
}