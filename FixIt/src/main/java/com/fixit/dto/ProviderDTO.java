package com.fixit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProviderDTO {
    @NotBlank
    private String name;


    private String location;

    private String contactNo;

    private String bio;
    private String skills;
}