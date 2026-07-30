package com.nesthub.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CreatePropertyRequest(@NotBlank String name, String address) {}
