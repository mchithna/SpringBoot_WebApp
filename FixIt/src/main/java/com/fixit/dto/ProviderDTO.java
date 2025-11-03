package com.fixit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProviderDTO {
    @NotBlank
    private String name;

    @NotNull
    private Long serviceCategoryId;

    private String location;

    private String contactNo;
}