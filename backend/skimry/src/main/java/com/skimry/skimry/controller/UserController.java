package com.skimry.skimry.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skimry.skimry.service.UserService;

@RestController
@RequestMapping()
public class UserController {

    private UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/api/users/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("isLoggedIn", false));
        }

        // Prefer service method that returns Optional<UserDto> or UserDto by email
        var opt = userService.findByEmail(principal.getUsername());
        return opt.map(currentUser -> ResponseEntity.ok(Map.of(
                "email", currentUser.getEmail(),
                "tier", currentUser.getTier(),
                "isLoggedIn", true
            )))
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found")));
    }

}
