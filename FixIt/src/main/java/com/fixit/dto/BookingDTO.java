package com.fixit.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingDTO {
    @NotNull
    private Long providerId;

    @NotNull
    private Long serviceId;

    @Future  // Must be future date
    @NotNull
    private LocalDateTime dateTime;

    private String remarks;  // Optional
}