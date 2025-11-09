package com.fixit.dto;

import com.fixit.entity.ServiceCategory;
import com.fixit.entity.ServiceProvider;
import lombok.Data;

import java.util.Set;
@Data
public class ProviderDashboardDTO {

    // Fields from ServiceProvider
    private Long id;
    private String name;
    private String location;
    private String contactNo;
    private String photo;
    private Double ratingAvg;

    private Set<ServiceCategory> serviceCategories;
    private String bio;
    private String skills;
    // Fields from the nested User
    private String userEmail;

    public ProviderDashboardDTO(ServiceProvider provider) {
        this.id = provider.getId();
        this.name = provider.getName();
        this.location = provider.getLocation();
        this.contactNo = provider.getContactNo();
        this.photo = provider.getPhoto();
        this.ratingAvg = provider.getRatingAvg();

        this.serviceCategories = provider.getServiceCategories();

        this.bio = provider.getBio();
        this.skills = provider.getSkills();

        if (provider.getUser() != null) {
            this.userEmail = provider.getUser().getEmail();
        }
    }
}