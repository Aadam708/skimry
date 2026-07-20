package com.skimry.skimry.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.Data;


@Data
public class MaterialDto {


    private UUID materialId;

    private UUID userId;

    private String originalUrl;

    private List<String> aiSummary;

    private LocalDateTime createdAt;

    public MaterialDto(UUID materialId, UUID userId, String originalUrl, List<String> aiSummary, LocalDateTime createdAt) {
        this.materialId = materialId;
        this.userId = userId;
        this.originalUrl = originalUrl;
        this.aiSummary = aiSummary;
        this.createdAt = createdAt;
    }

}
