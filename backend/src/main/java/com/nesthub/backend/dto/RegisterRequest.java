package com.nesthub.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Self-registration is owner-only. Managers, maintenance, and tenants are created
// from inside a dashboard (see CreateUserRequest / UserController) — never here.
public record RegisterRequest(
        @NotBlank String fullName,
        @Email @NotBlank String email,
        @Size(min = 6) String password
) {}
