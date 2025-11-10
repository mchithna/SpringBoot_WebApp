package com.fixit.dto;

import com.fixit.entity.User;
import lombok.Data;

// DTO for sending User data to the admin dashboard.

@Data
public class AdminUserViewDTO {

    private Long id;
    private String name;
    private String email;
    private String contactNo;
    private String address;
    private int bookingCount;

    public AdminUserViewDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.contactNo = user.getContactNo();
        this.address = user.getAddress();

        // Safely get booking count (handles null list)
        if (user.getBookings() != null) {
            this.bookingCount = user.getBookings().size();
        } else {
            this.bookingCount = 0;
        }
    }
}