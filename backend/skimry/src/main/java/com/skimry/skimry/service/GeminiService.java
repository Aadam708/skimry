package com.skimry.skimry.service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;


@Service
public class GeminiService {

    @Value("${gemini.api-key}")
    private String apiKey;

    private RestTemplate restTemplate = new RestTemplate();
    private ObjectMapper objectMapper= new ObjectMapper();
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";


   @Async
public CompletableFuture<String> generateSummary(String content) {
    try {
        // Safe character limit to prevent token overflows
        String safeContent = content.substring(0, Math.min(content.length(), 4000));

        // Prompt template enforcing 3-bullet JSON array output
        String prompt = String.format("""
            You are an expert technical editor and content summarizer. Your task is to extract exactly 3 key bullet points from the provided raw text.

            CRITICAL OUTPUT FORMATTING INSTRUCTIONS:
            1. Output MUST be a valid, raw JSON array containing exactly 3 strings: ["Point 1", "Point 2", "Point 3"].
            2. DO NOT wrap the output in Markdown code fences (e.g. do NOT use ```json).
            3. DO NOT include any introductory text, titles, or conversational filler before or after the JSON.
            4. Each bullet point must be concise, impactful (15-25 words), self-contained, and highlight the core insights of the material.

            Raw Text:
            %s""", safeContent);

        // constructing the req body and the part as maps matching Gemini API schema
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);

        // making the content obj to have parts mapped to an array with corresponding parts
        Map<String, Object> contentObj = new HashMap<>();
        contentObj.put("parts", new Object[]{part});

        // placing all the contents into the req body
        requestBody.put("contents", new Object[]{contentObj});

        // set headers to application/json
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        // POST request to Gemini API
        ResponseEntity<String> response = restTemplate.postForEntity(GEMINI_URL + apiKey, entity, String.class);

        // extracting generated text from Gemini response payload
        JsonNode root = objectMapper.readTree(response.getBody());
        String generatedText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        // Safety fallback: strip code block wrappers if the model includes them
        generatedText = generatedText.replace("```json", "").replace("```", "").trim();

        // Return completed future containing the JSON array string: ["Point 1", "Point 2", "Point 3"]
        return CompletableFuture.completedFuture(generatedText);

    } catch (Exception e) {
        System.err.println("Gemini Summary API Error details:");
        e.printStackTrace();
        return CompletableFuture.failedFuture(e);
    }
}

}
