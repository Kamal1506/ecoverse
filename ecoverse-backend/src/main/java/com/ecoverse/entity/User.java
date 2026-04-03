package com.ecoverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    public enum Role {
        ADMIN, USER, ROLE_ADMIN, ROLE_USER;

        public String normalized() {
            return name().startsWith("ROLE_") ? name().substring(5) : name();
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    // nullable — Google users have no password
    @Column
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private Role role = Role.USER;

    @Column(name = "total_xp", nullable = false)
    @Builder.Default
    private Integer totalXp = 0;

    // "LOCAL" or "GOOGLE"
    @Column(nullable = false, length = 10)
    @Builder.Default
    private String provider = "LOCAL";

    // Profile picture URL or a data URL uploaded by the player
    @Column(name = "picture_url", length = 1000)
private String pictureUrl;

    @Column(length = 80)
    private String nationality;

    @Column(length = 500)
    private String bio;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
