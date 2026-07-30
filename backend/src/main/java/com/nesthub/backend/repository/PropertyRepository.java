package com.nesthub.backend.repository;

import com.nesthub.backend.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PropertyRepository extends JpaRepository<Property, UUID> {
    List<Property> findByOwnerId(UUID ownerId);
}
