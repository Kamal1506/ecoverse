package com.ecoverse.security;

import com.ecoverse.entity.User;
import com.ecoverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    // Valid bcrypt hash used as a placeholder for OAuth-only users with no local password.
    private static final String OAUTH_PLACEHOLDER_BCRYPT =
            "$2a$10$7EqJtq98hPqEX7fNZaFWoOePaWxn96p36m9K4H0sY5Q4fM9vDOMkK";

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "No user found with email: " + normalizedEmail));

        String roleName = user.getRole().name();
        String authority = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
        String password = user.getPassword();
        if (password == null || password.trim().isEmpty()) {
            password = OAUTH_PLACEHOLDER_BCRYPT;
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                password,
                List.of(new SimpleGrantedAuthority(authority))
        );
    }
}
