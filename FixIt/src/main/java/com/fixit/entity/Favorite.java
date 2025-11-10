package com.fixit.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "favorites")
public class Favorite {

    @EmbeddedId
    private FavoriteId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("serviceId")
    @JoinColumn(name = "service_id")
    private Service service;

    public Favorite() {}

    public Favorite(User user, Service service) {
        this.user = user;
        this.service = service;
        this.id = new FavoriteId(user.getId(), service.getId());
    }
}