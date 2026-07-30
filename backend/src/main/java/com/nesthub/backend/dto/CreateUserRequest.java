package com.nesthub.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateUserRequest(
        @NotBlank String fullName,
        @Email @NotBlank String email,
        @Size(min = 6) String password,
        @NotBlank String role,      // "manager" | "maintenance" | "tenant"
        UUID propertyId,            // required when caller is owner; ignored/forced when caller is manager
        String unitLabel            // tenants only
) {}
