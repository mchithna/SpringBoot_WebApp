package com.fixit.controller;

import com.fixit.entity.ServiceProvider;
import com.fixit.entity.User;
import com.fixit.service.FavoriteService;
import com.fixit.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/favorites")
@PreAuthorize("hasRole('CUSTOMER')")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final UserService userService;

    public FavoriteController(FavoriteService favoriteService, UserService userService) {
        this.favoriteService = favoriteService;
        this.userService = userService;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        return userService.findByEmail(authentication.getName());
    }

    @GetMapping
    public ResponseEntity<Set<ServiceProvider>> getMyFavorites(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(favoriteService.getFavorites(user));
    }

    @PostMapping("/{providerId}")
    public ResponseEntity<?> addFavorite(@PathVariable Long providerId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        favoriteService.addFavorite(user, providerId);
        return ResponseEntity.ok(Map.of("message", "Provider added to favorites"));
    }

    @DeleteMapping("/{providerId}")
    public ResponseEntity<?> removeFavorite(@PathVariable Long providerId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        favoriteService.removeFavorite(user, providerId);
        return ResponseEntity.ok(Map.of("message", "Provider removed from favorites"));
    }
}