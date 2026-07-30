package com.nesthub.backend.controller;

import com.nesthub.backend.dto.CreateUserRequest;
import com.nesthub.backend.dto.UserResponse;
import com.nesthub.backend.entity.Property;
import com.nesthub.backend.entity.Role;
import com.nesthub.backend.entity.User;
import com.nesthub.backend.repository.PropertyRepository;
import com.nesthub.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Account creation follows the NestHub hierarchy:
 * Owner (self-registers) -> creates Manager/Maintenance logins, scoped to a property they own.
 * Manager (reception) -> creates Tenant logins, scoped to their own property.
 * Tenants never self-register here; their portal is a separate app entirely.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PropertyRepository propertyRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public UserResponse create(@Valid @RequestBody CreateUserRequest request, Authentication auth) {
        UUID callerId = (UUID) auth.getPrincipal();
        User caller = userRepository.findById(callerId)
                .orElseThrow(() -> new IllegalArgumentException("Caller not found."));

        Role requestedRole;
        try {
            requestedRole = Role.valueOf(request.role().toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown role: " + request.role());
        }
        if (requestedRole == Role.owner) {
            throw new IllegalArgumentException("Owner accounts can only be created via self-registration.");
        }

        UUID targetPropertyId;
        if (caller.getRole() == Role.owner) {
            if (requestedRole == Role.tenant) {
                throw new IllegalArgumentException("Owners create managers or maintenance staff. Reception creates tenants.");
            }
            if (request.propertyId() == null) {
                throw new IllegalArgumentException("propertyId is required.");
            }
            Property property = propertyRepository.findById(request.propertyId())
                    .orElseThrow(() -> new IllegalArgumentException("Property not found."));
            if (!property.getOwnerId().equals(callerId)) {
                throw new IllegalArgumentException("You don't own that property.");
            }
            targetPropertyId = property.getId();
        } else if (caller.getRole() == Role.manager) {
            if (requestedRole != Role.tenant) {
                throw new IllegalArgumentException("Reception/manager accounts can only create tenant accounts.");
            }
            if (caller.getPropertyId() == null) {
                throw new IllegalArgumentException("Your account isn't attached to a property yet.");
            }
            targetPropertyId = caller.getPropertyId();
        } else {
            throw new IllegalArgumentException("Not authorized to create accounts.");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("An account with that email already exists.");
        }

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(requestedRole);
        user.setPropertyId(targetPropertyId);
        if (requestedRole == Role.tenant) {
            user.setUnitLabel(request.unitLabel());
        }
        userRepository.save(user);
        return toResponse(user);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public List<UserResponse> list(@RequestParam(required = false) UUID propertyId, Authentication auth) {
        UUID callerId = (UUID) auth.getPrincipal();
        User caller = userRepository.findById(callerId)
                .orElseThrow(() -> new IllegalArgumentException("Caller not found."));
        UUID scope = caller.getRole() == Role.manager ? caller.getPropertyId() : propertyId;
        if (scope == null) return List.of();
        return userRepository.findByPropertyId(scope).stream().map(this::toResponse).toList();
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getRole().name(), u.getPropertyId());
    }
}
