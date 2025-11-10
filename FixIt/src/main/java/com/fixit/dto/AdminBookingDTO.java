package com.fixit.dto;

import com.fixit.entity.Booking;
import com.fixit.entity.ServiceProvider;
import com.fixit.entity.User;

import java.time.format.DateTimeFormatter;

public class AdminBookingDTO {

    private Long id;
    private AdminBookingUserDTO customer;
    private AdminBookingProviderDTO provider;
    private String serviceName;
    private String serviceDescription; // ADDED
    private String servicePrice;
    private String dateTime;
    private String status;
    private String remarks; // ADDED

    // Inner static class for Customer info
    private static class AdminBookingUserDTO {
        private String name;

        public AdminBookingUserDTO(User user) {
            if (user != null) {
                this.name = user.getName();
            } else {
                this.name = "Customer N/A";
            }
        }

        // Getters
        public String getName() { return name; }
    }

    // Inner static class for Provider info
    private static class AdminBookingProviderDTO {
        private String name;
        private String contactNo; // ADDED

        public AdminBookingProviderDTO(ServiceProvider provider) {
            if (provider != null) {
                this.name = provider.getName();
                this.contactNo = provider.getContactNo(); // ADDED
            } else {
                this.name = "Provider N/A";
                this.contactNo = "N/A"; // ADDED
            }
        }

        // Getters
        public String getName() { return name; }
        public String getContactNo() { return contactNo; } // ADDED
    }

    // Main Constructor
    public AdminBookingDTO(Booking booking) {
        this.id = booking.getId();
        this.customer = new AdminBookingUserDTO(booking.getUser());
        this.provider = new AdminBookingProviderDTO(booking.getProvider());

        // Safe handling for Service
        if (booking.getService() != null) {
            this.serviceName = booking.getService().getName();
            this.serviceDescription = booking.getService().getDescription(); // ADDED
            if (booking.getService().getPrice() != null) {
                this.servicePrice = String.format("Rs.%.2f", booking.getService().getPrice());
            } else {
                this.servicePrice = "N/A";
            }
        } else {
            this.serviceName = "Service N/A";
            this.serviceDescription = "N/A"; // ADDED
            this.servicePrice = "N/A";
        }

        // Safe handling for DateTime
        if (booking.getDateTime() != null) {
            this.dateTime = booking.getDateTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } else {
            this.dateTime = "N/A";
        }

        // Safe handling for Status
        if (booking.getStatus() != null) {
            this.status = booking.getStatus().toString();
        } else {
            this.status = "N/A";
        }

        // ADDED: Safe handling for Remarks
        this.remarks = booking.getRemarks() != null ? booking.getRemarks() : "No remarks provided.";
    }

    // Getters
    public Long getId() { return id; }
    public AdminBookingUserDTO getCustomer() { return customer; }
    public AdminBookingProviderDTO getProvider() { return provider; }
    public String getServiceName() { return serviceName; }
    public String getServicePrice() { return servicePrice; }
    public String getDateTime() { return dateTime; }
    public String getStatus() { return status; }
    public String getServiceDescription() { return serviceDescription; } // ADDED
    public String getRemarks() { return remarks; } // ADDED
}