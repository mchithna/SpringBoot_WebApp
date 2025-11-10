package com.fixit.controller;

import com.fixit.dto.ReviewDTO;
import com.fixit.dto.UserReviewDTO;
import com.fixit.entity.Review;
import com.fixit.entity.User;
import com.fixit.service.ReviewService;
import com.fixit.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService service;
    private final UserService userService;

    // FIXED: Constructor injection (no @Autowired field)
    public ReviewController(ReviewService service, UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    // CREATE: POST /api/reviews (requires auth)
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ReviewDTO dto, Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        try {
            Review review = service.save(dto, user);  // FIXED: Uses new overload
            Map<String, Object> response = new HashMap<>();
            response.put("id", review.getId());
            response.put("message", "Review added and rating updated");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // READ ALL for user: GET /api/reviews (requires auth)
    @GetMapping
    public ResponseEntity<List<UserReviewDTO>> list(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        // Use the new service method
        List<UserReviewDTO> reviews = service.getReviewsForUser(user);
        return ResponseEntity.ok(reviews);
    }

    // READ BY PROVIDER: GET /api/reviews/provider/{providerId}
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<Review>> listByProvider(@PathVariable Long providerId) {
        List<Review> reviews = service.findByProviderId(providerId);
        return ResponseEntity.ok(reviews);
    }

    // READ ONE: GET /api/reviews/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Review> getById(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        Review review = service.findById(id);  // FIXED: Use service method (no direct repo)
        if (review == null || !review.getUser().getId().equals(user.getId())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(review);
    }

    // DELETE: DELETE /api/reviews/{id} (admin or owner)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        Review review = service.findById(id);  // FIXED: Use service method
        if (review == null || !review.getUser().getId().equals(user.getId())) {
            return ResponseEntity.notFound().build();
        }
        service.deleteById(id);  // FIXED: Use service method (no direct repo)
        return ResponseEntity.ok(Map.of("message", "Review deleted and rating updated"));
    }
}