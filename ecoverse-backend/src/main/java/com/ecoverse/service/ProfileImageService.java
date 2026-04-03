package com.ecoverse.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
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
        if (!isImageContentType(contentType)) {
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
            Map<String, Object> options = new HashMap<>();
            options.put("folder", "ecoverse/profile");
            options.put("public_id", "u" + userId + "_" + UUID.randomUUID());
            options.put("resource_type", "auto");
            options.put("overwrite", false);
            options.put("use_filename", false);
            options.put("unique_filename", true);
            options.put("format", "webp");

            Map<?, ?> result;
            try (InputStream stream = file.getInputStream()) {
                result = cloudinary.uploader().upload(stream, ObjectUtils.asMap(options));
            }

            Object secureUrl = result.get("secure_url");
            if (secureUrl == null) {
                throw new IllegalStateException("Cloudinary upload succeeded without secure URL");
            }
            return secureUrl.toString();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read image file for upload", e);
        } catch (Exception e) {
            throw new IllegalStateException(
                    "Failed to upload image to Cloudinary. Please use JPG, JPEG, PNG, WEBP, or GIF under 25MB.", e);
        }
    }

    private boolean isImageContentType(String contentType) {
        if (contentType == null) return false;
        String ct = contentType.trim().toLowerCase();
        return ct.startsWith("image/");
    }

    private boolean isBlank(Object value) {
        return value == null || value.toString().trim().isEmpty();
    }
}
