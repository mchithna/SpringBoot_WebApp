package com.fixit.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "service_providers")
@Data
public class ServiceProvider {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @NotBlank
    private String name;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "provider_service_categories",
            joinColumns = @JoinColumn(name = "provider_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<ServiceCategory> serviceCategories = new HashSet<>();

    private String location;

    private String contactNo;

    private String photo;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String skills;

    private Double ratingAvg = 0.0;

    @Enumerated(EnumType.STRING)
    private VerificationStatus status = VerificationStatus.PENDING_APPROVAL;

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL)
    @ToString.Exclude // <-- ADD
    @EqualsAndHashCode.Exclude // <-- ADD
    private List<Booking> bookings;

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL)
    @ToString.Exclude // <-- ADD
    @EqualsAndHashCode.Exclude // <-- ADD
    private List<Review> reviews;
}