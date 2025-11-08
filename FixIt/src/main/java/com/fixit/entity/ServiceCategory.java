package com.fixit.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.Set;

@Entity
@Table(name = "service_categories")
@Data
public class ServiceCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // e.g., "Electrical", "Plumbing"

    private String icon; // e.g., "fas fa-bolt" (from frontend)

    @ManyToMany(mappedBy = "serviceCategories")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<ServiceProvider> serviceProviders;
}