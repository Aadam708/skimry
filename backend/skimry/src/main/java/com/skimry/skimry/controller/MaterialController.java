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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.server.ResponseStatusException;
import com.skimry.skimry.dto.MaterialDeletionRequest;
import org.springframework.web.bind.annotation.DeleteMapping;


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


     @PostMapping("/upload")
    public ResponseEntity<?> uploadMaterial(@RequestBody MaterialRequest req) {
        try {
            CompletableFuture<String> future = geminiService.generateSummary(req.getRawText());
            String jsonRes = future.get();
            List<String> summaryList = objectMapper.readValue(jsonRes, new TypeReference<List<String>>() {});
            req.setAiSummary(summaryList);

            MaterialDto dto = materialService.saveMaterial(req);
            return ResponseEntity.status(201).body(dto);

        } catch (ResponseStatusException e) {
            return ResponseEntity
                    .status(e.getStatusCode())
                    .body(Map.of("Error", e.getReason()));

        } catch (IllegalStateException e) {
            return ResponseEntity
                    .status(403)
                    .body(Map.of("Error", e.getMessage()));

        } catch (UsernameNotFoundException e) {
            return ResponseEntity
                    .status(401)
                    .body(Map.of("Error", "User not authenticated"));

        } catch (Exception e) {
            return ResponseEntity
                    .status(500)
                    .body(Map.of("Error", "Internal server error"));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> viewMaterials() {

        try{
            List<MaterialDto> dtos = materialService.viewMaterials();
            return ResponseEntity.ok().body(dtos);
        }
        catch (UsernameNotFoundException e){
            return ResponseEntity.status(401).body(Map.of("Error", "User not authenticated"));
        }
        catch(Exception e){
            return ResponseEntity.status(500).body(Map.of("Error", "Internal server error"));
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteMaterials(
            @RequestBody MaterialDeletionRequest request) {

        try {
            int deletedCount = materialService.deleteMaterials(
                    request.type(),
                    request.amount()
            );

            return ResponseEntity.ok(Map.of(
                    "deletedCount", deletedCount
            ));

        } catch (ResponseStatusException exception) {
            return ResponseEntity
                    .status(exception.getStatusCode())
                    .body(Map.of(
                            "error",
                            exception.getReason() == null
                                    ? "Deletion request failed"
                                    : exception.getReason()
                    ));

        } catch (UsernameNotFoundException exception) {
            return ResponseEntity
                    .status(401)
                    .body(Map.of("error", "User not authenticated"));

        } catch (Exception exception) {
            return ResponseEntity
                    .status(500)
                    .body(Map.of("error", "Unable to delete materials"));
        }
    }
}
