package com.skimry.skimry.controller;

import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;

import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;


import com.skimry.skimry.entity.User;
import com.skimry.skimry.security.JwtUtil;
import com.skimry.skimry.service.UserService;


@RequestMapping("/api/auth")
@RestController
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService,
         JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(false) // Must match login
                .path("/")
                .maxAge(0)
                .sameSite("Lax") // Must match login
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("message", "logged out successfully"));
    }

    @PostMapping("/clerk-sync")
    public ResponseEntity<?> clerkSync(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false)
            String authorizationHeader) {

        if (authorizationHeader == null
                || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Missing Clerk session token"));
        }

        String clerkToken = authorizationHeader.substring("Bearer ".length());

        try {
            User user = userService.syncClerkUser(clerkToken);
            String token = jwtUtil.generateToken(
                    user.getEmail(),
                    user.getUserId()
            );

            ResponseCookie cookie = ResponseCookie.from("token", token)
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(3600)
                    .sameSite("Lax")
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(Map.of(
                            "message", "Clerk authentication synchronized",
                            "email", user.getEmail()
                    ));

        } catch (ResponseStatusException exception) {
            return ResponseEntity.status(exception.getStatusCode())
                    .body(Map.of("message", exception.getReason()));
        }
    }


}
