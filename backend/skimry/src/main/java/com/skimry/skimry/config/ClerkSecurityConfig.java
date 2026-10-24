package com.skimry.skimry.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;

@Configuration
public class ClerkSecurityConfig {

    @Bean
    public JwtDecoder clerkJwtDecoder(
            @Value("${clerk.issuer}") String clerkIssuer) {
        return JwtDecoders.fromIssuerLocation(clerkIssuer);
    }
}
