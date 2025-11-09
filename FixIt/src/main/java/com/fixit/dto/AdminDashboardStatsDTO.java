package com.fixit.dto;

import lombok.Data;
import java.util.List;

@Data
public class AdminDashboardStatsDTO {
    private long totalUsers;
    private long totalProviders;
    private long totalBookings;
    private long totalServices;

    private List<CategoryStatsDTO> bookingStats;
    private List<CategoryStatsDTO> serviceStats;
}