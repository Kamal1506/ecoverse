package com.ecoverse.service;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileImageService {

    private final Cloudinary cloudinary;

    public String uploadProfilePhoto(MultipartFile file, Long userId) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Profile image file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        Object cloudName = cloudinary.config.cloudName;
        Object apiKey = cloudinary.config.apiKey;
        Object apiSecret = cloudinary.config.apiSecret;
        if (isBlank(cloudName) || isBlank(apiKey) || isBlank(apiSecret)) {
            throw new IllegalStateException(
                    "Image upload service is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
        }

        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    Map.of(
                            "folder", "ecoverse/profile",
                            "public_id", "u" + userId + "_" + UUID.randomUUID(),
                            "resource_type", "image",
                            "overwrite", false
                    )
            );

            Object secureUrl = result.get("secure_url");
            if (secureUrl == null) {
                throw new IllegalStateException("Cloudinary upload succeeded without secure URL");
            }
            return secureUrl.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to upload image to Cloudinary", e);
        }
    }

    private boolean isBlank(Object value) {
        return value == null || value.toString().trim().isEmpty();
    }
}
