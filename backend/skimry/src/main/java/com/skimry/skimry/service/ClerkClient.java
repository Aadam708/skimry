package com.skimry.skimry.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class ClerkClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String clerkSecretKey;

    public ClerkClient(
            ObjectMapper objectMapper,
            @Value("${clerk.secret-key}") String clerkSecretKey) {
        this.objectMapper = objectMapper;
        this.clerkSecretKey = clerkSecretKey;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.clerk.com/v1")
                .build();
    }

    public ClerkProfile getUser(String clerkUserId) {
        String response = restClient.get()
                .uri("/users/{id}", clerkUserId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + clerkSecretKey)
                .retrieve()
                .body(String.class);

        try {
            JsonNode root = objectMapper.readTree(response);

            String primaryEmailId = root.path("primary_email_address_id").asText();

            for (JsonNode emailAddress : root.path("email_addresses")) {
                if (primaryEmailId.equals(emailAddress.path("id").asText())) {
                    return new ClerkProfile(
                            root.path("id").asText(),
                            emailAddress.path("email_address").asText(),
                            root.path("first_name").asText(null),
                            root.path("last_name").asText(null)
                    );
                }
            }

            throw new IllegalStateException("Clerk user has no primary email address");
        } catch (Exception exception) {
            throw new IllegalStateException("Could not read Clerk user profile", exception);
        }
    }

    public record ClerkProfile(
            String clerkUserId,
            String email,
            String firstName,
            String lastName
    ) {
    }
}
