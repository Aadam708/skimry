package com.skimry.skimry.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skimry.skimry.dto.StripeUserDto;
import com.skimry.skimry.service.StripeService;
import com.skimry.skimry.service.UserService;
import com.stripe.exception.StripeException;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final StripeService stripeService;
    private final UserService userService;

    public PaymentController(StripeService stripeService, UserService userService) {
        this.stripeService = stripeService;
        this.userService = userService;
    }

    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@AuthenticationPrincipal UserDetails principal)
            throws StripeException {

        if (principal == null ) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        StripeUserDto userDto = userService.getUserByEmail(principal.getUsername());


        String checkoutUrl = stripeService.createCheckoutSession(userDto);
        return ResponseEntity.ok(Map.of("url", checkoutUrl));
    }
    @PostMapping("/create-portal-session")
    public ResponseEntity<Map<String, String>> createPortalSession(@AuthenticationPrincipal UserDetails principal)
            throws StripeException {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        StripeUserDto userDto = userService.getUserByEmail(principal.getUsername());

        // Prevent passing null customer ID to Stripe
        if (userDto.getStripeCustomerId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "User has no active Stripe customer account"));
        }

        String portalUrl = stripeService.createPortalSession(userDto.getStripeCustomerId());
        return ResponseEntity.ok(Map.of("url", portalUrl));
    }
}
