package com.fixit.dto;

import com.fixit.entity.Booking;
import com.fixit.entity.User;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// transports booking data to the *Provider* Dashboard.

@Data
public class ProviderBookingDTO {

    private Long id;
    private String status;
    private LocalDateTime dateTime;
    private String remarks; // The user's note
    private String serviceName;
    private BigDecimal servicePrice;
    private UserInfoDTO user; // Nested DTO for customer info

    // Inner DTO for just the user data we need
    @Data
    public static class UserInfoDTO {
        private Long id;
        private String name;
        private String photo;
        private String contactNo;

        public UserInfoDTO(User user) {
            if (user != null) {
                this.id = user.getId();
                this.name = user.getName();
                this.contactNo = user.getContactNo();
                // We'll just use a UI avatar for the customer
                this.photo = "https://ui-avatars.com/api/?name=" + user.getName().replace(" ", "+") + "&background=3b82f6&color=fff";
            }
        }
    }

    // Main DTO constructor
    public ProviderBookingDTO(Booking booking) {
        this.id = booking.getId();
        this.status = booking.getStatus().name();
        this.dateTime = booking.getDateTime();
        this.remarks = booking.getRemarks();

        if (booking.getService() != null) {
            this.serviceName = booking.getService().getName();
            this.servicePrice = booking.getService().getPrice();
        } else {
            this.serviceName = "Service (details unavailable)";
        }

        this.user = new UserInfoDTO(booking.getUser());
    }
}