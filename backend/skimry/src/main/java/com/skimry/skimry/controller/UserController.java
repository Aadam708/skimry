package com.skimry.skimry.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skimry.skimry.security.AuthenticatedUser;
import com.skimry.skimry.service.UserService;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping()
public class UserController {

    private UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/api/users/me")
    public ResponseEntity<?> getCurrentUser(
        @AuthenticationPrincipal AuthenticatedUser principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("isLoggedIn", false));
        }

        // Prefer service method that returns Optional<UserDto> or UserDto by email
        var opt = userService.findById(principal.getUserId());
        return opt.map(currentUser -> ResponseEntity.ok(Map.of(
                "email", currentUser.getEmail(),
                "tier", currentUser.getTier(),
                "isLoggedIn", true
            )))
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found")));
    }

    @DeleteMapping("/api/account")
    public ResponseEntity<?> deleteAccount() {
        try {
            userService.deleteAuthenticatedUser();

            return ResponseEntity.ok(Map.of(
                    "message", "Account deleted successfully"
            ));

        } catch (ResponseStatusException exception) {
            return ResponseEntity
                    .status(exception.getStatusCode())
                    .body(Map.of(
                            "error",
                            exception.getReason() == null
                                    ? "Account deletion failed"
                                    : exception.getReason()
                    ));

        } catch (Exception exception) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error",
                            "Unable to delete account"
                    ));
        }
    }

}
