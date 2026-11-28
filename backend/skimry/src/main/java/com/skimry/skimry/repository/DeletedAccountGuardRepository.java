package com.skimry.skimry.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skimry.skimry.entity.DeletedAccountGuard;

public interface DeletedAccountGuardRepository
        extends JpaRepository<DeletedAccountGuard, String> {

    Optional<DeletedAccountGuard> findByEmailHash(String emailHash);
}
