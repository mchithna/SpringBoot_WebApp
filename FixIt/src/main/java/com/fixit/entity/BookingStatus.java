package com.fixit.entity;

public enum BookingStatus {
    PENDING,    // Waiting for confirmation
    CONFIRMED,  // Provider accepted
    COMPLETED,  // Service done
    CANCELLED   // Cancelled by user/provider
}