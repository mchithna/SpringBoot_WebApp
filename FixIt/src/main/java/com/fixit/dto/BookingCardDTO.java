package com.fixit.dto;

import com.fixit.entity.Booking;
import com.fixit.entity.ServiceProvider;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;


// used to safely send booking data to the frontend

@Data
public class BookingCardDTO {

    private Long id;
    private String status;
    private LocalDateTime dateTime;
    private String remarks;
    private BookingProviderDTO provider;

    private String serviceName;
    private String serviceDescription;
    private BigDecimal servicePrice;
    private String serviceCategoryIcon;

    // Inner class for just the provider data we need
    @Data
    public static class BookingProviderDTO {
        private Long id;
        private String name;
        private String photo;
        private String contactNo;
        private Double ratingAvg;

        public BookingProviderDTO(ServiceProvider provider) {
            if (provider != null) {
                this.id = provider.getId();
                this.name = provider.getName();
                this.photo = provider.getPhoto();
                this.contactNo = provider.getContactNo();
                this.ratingAvg = provider.getRatingAvg();
            }
        }
    }

    // Main DTO constructor that maps from the Booking entity
    public BookingCardDTO(Booking booking) {
        this.id = booking.getId();
        this.status = booking.getStatus().name();
        this.dateTime = booking.getDateTime();
        this.remarks = booking.getRemarks();
        this.provider = new BookingProviderDTO(booking.getProvider());
        if (booking.getService() != null) {
            this.serviceName = booking.getService().getName();
            this.serviceDescription = booking.getService().getDescription();
            this.servicePrice = booking.getService().getPrice();
            if (booking.getService().getServiceCategory() != null) {
                this.serviceCategoryIcon = booking.getService().getServiceCategory().getIcon();
            }
        } else {

            this.serviceName = this.remarks;
        }
    }
}