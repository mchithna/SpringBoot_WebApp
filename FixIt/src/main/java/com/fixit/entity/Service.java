package com.fixit.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.math.BigDecimal;

import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "services")
@Data
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name; // e.g., "Leaky Faucet Repair"

    private String description;

    @Positive
    private BigDecimal price;

    // The provider who offers this specific service
    @ManyToOne
    @JoinColumn(name = "provider_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ServiceProvider provider;

    // The category this service belongs to
    @ManyToOne
    @JoinColumn(name = "service_category_id")
    @ToString.Exclude // <-- ADD
    @EqualsAndHashCode.Exclude // <-- ADD
    private ServiceCategory serviceCategory;

    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Favorite> favoritedBy = new HashSet<>();
}