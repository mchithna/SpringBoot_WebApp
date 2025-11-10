package com.fixit.entity;

// ... (imports)
import com.fixit.entity.ReviewStatus; // <-- IMPORT THIS
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode; // <-- IMPORT
import lombok.ToString; // <-- IMPORT

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
public class Review {
    // ... (id, user, provider, rating, comment... )
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @ToString.Exclude // <-- ADD
    @EqualsAndHashCode.Exclude // <-- ADD
    private User user;

    @ManyToOne
    @JoinColumn(name = "provider_id")
    @ToString.Exclude // <-- ADD
    @EqualsAndHashCode.Exclude // <-- ADD
    private ServiceProvider provider;

    @Min(1) @Max(5)
    private Integer rating;

    @NotBlank
    private String comment;

    private LocalDateTime createdAt = LocalDateTime.now();

    // NEW: Field for admin moderation
    @Enumerated(EnumType.STRING)
    private ReviewStatus status = ReviewStatus.PENDING;
}