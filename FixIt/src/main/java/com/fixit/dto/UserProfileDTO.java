package com.fixit.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for receiving profile updates from the User Dashboard.
 * Does not include password.
 */
@Data
public class UserProfileDTO {

    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    private String phone; // In user-dashboard, this is 'phone'

    private String address;
}