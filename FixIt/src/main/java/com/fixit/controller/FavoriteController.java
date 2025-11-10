package com.fixit.controller;

import com.fixit.dto.ServiceCardDTO;
import com.fixit.service.FavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/favorites")
@PreAuthorize("hasRole('CUSTOMER')")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    //Adds a service to the current user's favorites.

    @PostMapping("/{serviceId}")
    public ResponseEntity<?> addFavorite(@PathVariable Long serviceId) {
        favoriteService.addFavorite(serviceId);
        return ResponseEntity.ok(Map.of("message", "Service added to favorites"));
    }

    //Removes a service from the current user's favorites.

    @DeleteMapping("/{serviceId}")
    public ResponseEntity<?> removeFavorite(@PathVariable Long serviceId) {
        favoriteService.removeFavorite(serviceId);
        return ResponseEntity.ok(Map.of("message", "Service removed from favorites"));
    }

    //Gets all favorite services for the current user.

    @GetMapping
    public ResponseEntity<List<ServiceCardDTO>> getFavoriteServices() {
        List<ServiceCardDTO> favorites = favoriteService.getFavoriteServices();
        return ResponseEntity.ok(favorites);
    }

    // Gets just the IDs of all favorite services for the current user.

    @GetMapping("/ids")
    public ResponseEntity<Set<Long>> getFavoriteServiceIds() {
        Set<Long> favoriteIds = favoriteService.getFavoriteServiceIds();
        return ResponseEntity.ok(favoriteIds);
    }
}