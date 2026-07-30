package com.nesthub.backend.controller;

import com.nesthub.backend.dto.CreatePropertyRequest;
import com.nesthub.backend.dto.PropertyResponse;
import com.nesthub.backend.entity.Property;
import com.nesthub.backend.repository.PropertyRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyRepository propertyRepository;

    public PropertyController(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public PropertyResponse create(@Valid @RequestBody CreatePropertyRequest request, Authentication auth) {
        UUID ownerId = (UUID) auth.getPrincipal();
        Property property = new Property();
        property.setName(request.name());
        property.setAddress(request.address());
        property.setOwnerId(ownerId);
        propertyRepository.save(property);
        return toResponse(property);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('OWNER')")
    public List<PropertyResponse> mine(Authentication auth) {
        UUID ownerId = (UUID) auth.getPrincipal();
        return propertyRepository.findByOwnerId(ownerId).stream().map(this::toResponse).toList();
    }

    private PropertyResponse toResponse(Property p) {
        return new PropertyResponse(p.getId(), p.getName(), p.getAddress(), p.getCreatedAt());
    }
}
