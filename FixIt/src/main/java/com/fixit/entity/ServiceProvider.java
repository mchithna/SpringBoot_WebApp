package com.fixit.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "service_providers")
@Data
public class ServiceProvider {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @NotBlank
    private String serviceType;

    private String location;

    private String contactNo;

    private String photo;

    private Double ratingAvg = 0.0;

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL)
    private List<Booking> bookings;

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL)
    private List<Review> reviews;
}