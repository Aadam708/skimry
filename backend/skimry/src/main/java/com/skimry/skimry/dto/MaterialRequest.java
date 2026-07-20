package com.skimry.skimry.dto;

import java.util.List;

import lombok.Getter;

@Getter
public class MaterialRequest {

    private String originalUrl;
    private String rawText;
    private List<String> aiSummary;

}
