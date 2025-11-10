package com.fixit.service;

import com.fixit.dto.ServiceCardDTO;
import com.fixit.entity.Favorite;
import com.fixit.entity.FavoriteId;
import com.fixit.entity.Service;
import com.fixit.entity.User;
import com.fixit.exception.ResourceNotFoundException;
import com.fixit.repository.FavoriteRepository;
import com.fixit.repository.ServiceProviderRepository;
import com.fixit.repository.ServiceRepository;
import com.fixit.repository.UserRepository;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;

    public FavoriteService(FavoriteRepository favoriteRepository,
                           UserRepository userRepository,
                           ServiceRepository serviceRepository) {
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
    }

    /**
     * Gets the currently authenticated user.
     */
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    /**
     * Adds a service to the current user's favorites.
     */
    @Transactional
    public void addFavorite(Long serviceId) {
        User user = getCurrentUser();
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        FavoriteId favoriteId = new FavoriteId(user.getId(), service.getId());

        // Only add if it doesn't already exist
        if (!favoriteRepository.existsById(favoriteId)) {
            Favorite favorite = new Favorite(user, service);
            favoriteRepository.save(favorite);
        }
    }

    /**
     * Removes a service from the current user's favorites.
     */
    @Transactional
    public void removeFavorite(Long serviceId) {
        User user = getCurrentUser();
        FavoriteId favoriteId = new FavoriteId(user.getId(), serviceId);

        // Only remove if it exists
        if (favoriteRepository.existsById(favoriteId)) {
            favoriteRepository.deleteById(favoriteId);
        } else {
            // Optional: throw an exception if trying to remove non-existent favorite
            // throw new ResourceNotFoundException("Favorite not found");
        }
    }

    /**
     * Gets a list of the current user's favorite services.
     */
    @Transactional(readOnly = true)
    public List<ServiceCardDTO> getFavoriteServices() {
        User user = getCurrentUser();
        List<Service> services = favoriteRepository.findServicesByUserId(user.getId());

        // Convert the list of Service entities to a list of ServiceCardDTOs
        return services.stream()
                .map(ServiceCardDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Gets a set of IDs for the current user's favorite services.
     * This is useful for the frontend to know which services are 'liked'.
     */
    @Transactional(readOnly = true)
    public Set<Long> getFavoriteServiceIds() {
        User user = getCurrentUser();
        return favoriteRepository.findServiceIdsByUserId(user.getId());
    }
}