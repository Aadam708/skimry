package com.skimry.skimry.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skimry.skimry.dto.MaterialDto;
import com.skimry.skimry.dto.MaterialRequest;
import com.skimry.skimry.service.GeminiService;
import com.skimry.skimry.service.MaterialService;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RequestMapping("api/materials")
@RestController
public class MaterialController {


    private MaterialService materialService;
    private GeminiService geminiService;
    private ObjectMapper objectMapper;



    public MaterialController(MaterialService materialService, GeminiService geminiService, ObjectMapper objectMapper) {
        this.materialService = materialService;
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
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
     @PostMapping("/upload")
    public ResponseEntity<?> uploadMaterial(@RequestBody MaterialRequest req) {

        try{
            CompletableFuture<String> future = geminiService.generateSummary(req.getRawText());
            String jsonRes = future.get();
            List<String> summaryList = objectMapper.readValue(jsonRes, new TypeReference<List<String>>() {});
            req.setAiSummary(summaryList);
            MaterialDto dto = materialService.saveMaterial(req);
            return ResponseEntity.status(201).body(dto);
        }catch(UsernameNotFoundException e){

            return ResponseEntity.status(401).body(Map.of("Error","User not authenticated"));

        } catch(Exception e){
            return ResponseEntity.status(500).body(Map.of("Error", "Internal server error"));
        }


    }


}
