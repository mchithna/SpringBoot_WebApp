package com.fixit.repository;

import com.fixit.entity.Favorite;
import com.fixit.entity.FavoriteId;
import com.fixit.entity.Service;
import com.fixit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {

    // Find all favorites for a specific user
    List<Favorite> findAllByUser(User user);

    // Find all favorite services for a specific user
    @Query("SELECT f.service FROM Favorite f WHERE f.user.id = :userId")
    List<Service> findServicesByUserId(Long userId);

    // Get just the IDs of the favorite services for a user
    @Query("SELECT f.service.id FROM Favorite f WHERE f.user.id = :userId")
    Set<Long> findServiceIdsByUserId(Long userId);
}