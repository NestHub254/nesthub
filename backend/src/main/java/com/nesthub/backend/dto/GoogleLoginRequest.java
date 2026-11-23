package com.nesthub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record GoogleLoginRequest(
        @NotBlank String credential,
        @NotBlank @Pattern(regexp = "staff|tenant") String portal,
        boolean register) {}
