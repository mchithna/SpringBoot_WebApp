package com.fixit.service;

import com.fixit.dto.ReviewDTO;
import com.fixit.entity.Review;
import com.fixit.entity.ServiceProvider;
import com.fixit.entity.User;
import com.fixit.entity.ReviewStatus;
import com.fixit.exception.ResourceNotFoundException;
import com.fixit.repository.ReviewRepository;
import com.fixit.repository.ServiceProviderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ServiceProviderService providerService;
    private final ServiceProviderRepository providerRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ServiceProviderService providerService,
                         ServiceProviderRepository providerRepository) {
        this.reviewRepository = reviewRepository;
        this.providerService = providerService;
        this.providerRepository = providerRepository;
    }

    public Review save(Review review) {
        Review saved = reviewRepository.save(review);
        if (saved.getStatus() == ReviewStatus.APPROVED) {
            providerService.updateRatingAvg(review.getProvider().getId());
        }
        return saved;
    }

    public Review save(ReviewDTO dto, User user) {
        ServiceProvider provider = providerRepository.findById(dto.getProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found: " + dto.getProviderId()));

        Review review = new Review();
        review.setUser(user);
        review.setProvider(provider);
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setStatus(ReviewStatus.PENDING);

        return reviewRepository.save(review);
    }

    public List<Review> findAll() {
        return reviewRepository.findAll();
    }

    public List<Review> findByUser(User user) {
        if (user == null || user.getId() == null) {
            return List.of();
        }
        return reviewRepository.findByUserId(user.getId());
    }

    public List<Review> findByUserId(Long userId) {
        return reviewRepository.findByUserId(userId);
    }

    public Review findById(Long id) {
        return reviewRepository.findById(id).orElse(null);
    }

    public void deleteById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        Long providerId = review.getProvider().getId();
        reviewRepository.deleteById(id);
        providerService.updateRatingAvg(providerId);
    }

    public List<Review> findByProviderId(Long providerId) {
        return reviewRepository.findByProviderId(providerId);
    }

    // Admin Moderation ---

    public List<Review> findByStatus(ReviewStatus status) {
        return reviewRepository.findByStatus(status);
    }

    public Review approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        review.setStatus(ReviewStatus.APPROVED);
        return save(review);
    }

    public Review rejectReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        review.setStatus(ReviewStatus.REJECTED);
        return reviewRepository.save(review);
    }
}