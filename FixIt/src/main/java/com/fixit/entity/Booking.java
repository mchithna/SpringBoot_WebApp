package com.fixit.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @ManyToOne
    @JoinColumn(name = "provider_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ServiceProvider provider;

    @ManyToOne
    @JoinColumn(name = "service_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Service service;

    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "date_time")
    private LocalDateTime dateTime;

    private String remarks;

    // Constructors
    public Booking() {}

    public Booking(User user, ServiceProvider provider, LocalDateTime dateTime, String remarks) {
        this.user = user;
        this.provider = provider;
        this.dateTime = dateTime;
        this.remarks = remarks;
    }

    // Getters/setters (Lombok @Data handles)
}