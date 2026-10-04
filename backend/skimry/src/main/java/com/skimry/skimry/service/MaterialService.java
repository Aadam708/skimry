package com.skimry.skimry.service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.skimry.skimry.dto.MaterialDto;
import com.skimry.skimry.dto.MaterialRequest;
import com.skimry.skimry.entity.Material;
import com.skimry.skimry.entity.User;
import com.skimry.skimry.repository.MaterialRepository;
import com.skimry.skimry.repository.UserRepository;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;

import org.springframework.web.server.ResponseStatusException;

@Service
public class MaterialService {

    private MaterialRepository materialRepository;
    private UserRepository userRepository;

    public MaterialService(MaterialRepository materialRepository, UserRepository userRepository) {
        this.materialRepository = materialRepository;
        this.userRepository = userRepository;
    }

    private final Map<String, Bucket> userSummaryBuckets =
        new ConcurrentHashMap<>();

    public MaterialDto saveMaterial(MaterialRequest materialRequest) {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        enforceUserSummaryRateLimit(email);

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User does not exist"));

        LocalDate now = LocalDate.now();

        if (currentUser.getLastResetDate() == null ||
            now.getMonth() != currentUser.getLastResetDate().getMonth() ||
            now.getYear() != currentUser.getLastResetDate().getYear()) {

            currentUser.setPostsSummarisedThisMonth(0);
            currentUser.setLastResetDate(now);
        }

        if (currentUser.getPostsSummarisedThisMonth() >= 3 && "free".equals(currentUser.getTier())) {
            throw new IllegalStateException("You have exceeded summary generation for this month!");
        }

        if(currentUser.getPostsSummarisedThisMonth() >= 110 && currentUser.getTier().equals("pro")){
            throw new IllegalStateException("You have exceeded summary generation for this month!");
        }

        Material savedMaterial = new Material();
        savedMaterial.setUser(currentUser);
        savedMaterial.setOriginalUrl(materialRequest.getOriginalUrl());
        savedMaterial.setRawText(materialRequest.getRawText());
        savedMaterial.setAiSummary(materialRequest.getAiSummary());

        Material material = materialRepository.save(savedMaterial);

        currentUser.setPostsSummarisedThisMonth(currentUser.getPostsSummarisedThisMonth() + 1);
        userRepository.save(currentUser);

        return toDto(material);

    }

    public List<MaterialDto> viewMaterials(){

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email == null){
            throw new Error("User not authenticated");
        }

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User does not exist"));


        List<Material> materials = materialRepository.findTop100ByUserOrderByCreatedAtDesc(user);
        List<MaterialDto> dtos = new ArrayList<>();

        for(Material m : materials){

            dtos.add(toDto(m));
        }

        return dtos;



    }

    public MaterialDto toDto(Material material){

        MaterialDto materialDto = new MaterialDto(
                    material.getMaterialId(),
                    material.getUser().getUserId(),
                    material.getOriginalUrl(),
                    material.getAiSummary(),
                    material.getCreatedAt()
        );
        return materialDto;
    }

    private Bucket createUserSummaryBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(10)
                .refillGreedy(10, Duration.ofMinutes(1))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private void enforceUserSummaryRateLimit(String email) {
        Bucket bucket = userSummaryBuckets.computeIfAbsent(
                email,
                key -> createUserSummaryBucket()
        );

        if (!bucket.tryConsume(1)) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many summary requests. Please try again later."
            );
        }
    }

}
