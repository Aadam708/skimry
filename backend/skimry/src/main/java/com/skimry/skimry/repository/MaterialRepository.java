package com.skimry.skimry.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skimry.skimry.entity.Material;

public interface MaterialRepository extends JpaRepository<Material, UUID> {
}
