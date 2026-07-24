package com.skimry.skimry.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skimry.skimry.entity.Material;
import com.skimry.skimry.entity.User;

import java.util.List;


public interface MaterialRepository extends JpaRepository<Material, UUID> {

    List<Material> findByUser(User user);
}
