package com.fixit.dto;

import com.fixit.entity.Review;
import lombok.Data;

import java.time.LocalDateTime;


@Data
public class UserReviewDTO {

    private Long id;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private String providerName;
    private String providerPhoto;
    private String status;

    public UserReviewDTO(Review review) {
        this.id = review.getId();
        this.rating = review.getRating();
        this.comment = review.getComment();
        this.createdAt = review.getCreatedAt();
        this.status = review.getStatus().name();

        if (review.getProvider() != null) {
            this.providerName = review.getProvider().getName();
            this.providerPhoto = review.getProvider().getPhoto() != null ?
                    review.getProvider().getPhoto() :
                    "https://ui-avatars.com/api/?name=" + review.getProvider().getName().replace(" ", "+") + "&background=10b981&color=fff";
        }
    }
}