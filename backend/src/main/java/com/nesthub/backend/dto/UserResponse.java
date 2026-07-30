package com.nesthub.backend.dto;

import java.util.UUID;

public record UserResponse(UUID id, String fullName, String email, String role, UUID propertyId) {}
