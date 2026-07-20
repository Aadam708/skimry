package com.skimry.skimry.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skimry.skimry.dto.MaterialDto;
import com.skimry.skimry.dto.MaterialRequest;
import com.skimry.skimry.service.MaterialService;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RequestMapping("api/materials")
@RestController
public class MaterialController {


    private MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveMaterial(@RequestBody MaterialRequest req) {

        try{
            MaterialDto dto = materialService.saveMaterial(req);
            return ResponseEntity.status(201).body(dto);
        }catch(UsernameNotFoundException e){

            return ResponseEntity.status(401).body(Map.of("Error","User not authenticated"));

        } catch(Exception e){
            return ResponseEntity.status(500).body(Map.of("Error", "Internal server error"));
        }


    }


}
