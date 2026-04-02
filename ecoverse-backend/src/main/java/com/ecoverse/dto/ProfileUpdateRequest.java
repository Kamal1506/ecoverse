package com.ecoverse.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String name;
    private String pictureUrl;
    private String nationality;
    private String bio;
}
