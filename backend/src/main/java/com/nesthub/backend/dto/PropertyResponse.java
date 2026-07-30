package com.nesthub.backend.dto;

import java.time.Instant;
import java.util.UUID;

public record PropertyResponse(UUID id, String name, String address, Instant createdAt) {}
