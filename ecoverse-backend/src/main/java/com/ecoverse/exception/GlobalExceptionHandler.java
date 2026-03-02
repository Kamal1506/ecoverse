package com.ecoverse.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── Validation errors (@Valid failed) ────────────────────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String field = ((FieldError) error).getField();
            fieldErrors.put(field, error.getDefaultMessage());
        });

        return ResponseEntity.badRequest().body(Map.of(
                "status",    400,
                "error",     "Validation Failed",
                "fields",    fieldErrors,
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    // ── Wrong email or password ──────────────────────────────────────────────
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(
            BadCredentialsException ex) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "status",    401,
                "error",     "Invalid Credentials",
                "message",   "Email or password is incorrect.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    // ── Duplicate email, user not found, etc. ────────────────────────────────
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(
            IllegalArgumentException ex) {

        return ResponseEntity.badRequest().body(Map.of(
                "status",    400,
                "error",     "Bad Request",
                "message",   ex.getMessage(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    // ── Catch-all for unexpected errors ─────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        return ResponseEntity.internalServerError().body(Map.of(
                "status",    500,
                "error",     "Internal Server Error",
                "message",   ex.getMessage(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}