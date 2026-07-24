package com.skimry.skimry.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.skimry.skimry.dto.MaterialDto;
import com.skimry.skimry.dto.MaterialRequest;
import com.skimry.skimry.entity.Material;
import com.skimry.skimry.entity.User;
import com.skimry.skimry.repository.MaterialRepository;
import com.skimry.skimry.repository.UserRepository;

@Service
public class MaterialService {

    private MaterialRepository materialRepository;
    private UserRepository userRepository;

    public MaterialService(MaterialRepository materialRepository, UserRepository userRepository) {
        this.materialRepository = materialRepository;
        this.userRepository = userRepository;
    }



    public MaterialDto saveMaterial(MaterialRequest materialRequest){

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User currentUser = userRepository.findByEmail(email).
                            orElseThrow(()-> new UsernameNotFoundException("User does not exist"));

        Material savedMaterial = new Material();

        savedMaterial.setUser(currentUser);
        savedMaterial.setOriginalUrl(materialRequest.getOriginalUrl());
        savedMaterial.setRawText(materialRequest.getRawText());
        savedMaterial.setAiSummary(materialRequest.getAiSummary());

        materialRepository.save(savedMaterial);

        return toDto(savedMaterial);

    }

    public List<MaterialDto> viewMaterials(){

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email == null){
            throw new Error("User not authenticated");
        }

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User does not exist"));

        List<Material> materials = materialRepository.findByUser(user);
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

}
