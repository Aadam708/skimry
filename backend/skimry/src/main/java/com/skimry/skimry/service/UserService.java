package com.skimry.skimry.service;


import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import java.util.Optional;


import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.skimry.skimry.dto.StripeUserDto;
import com.skimry.skimry.dto.UserDto;
import com.skimry.skimry.entity.User;
import com.skimry.skimry.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ClerkClient clerkClient;
    private final JwtDecoder clerkJwtDecoder;

    public UserService(
            UserRepository userRepository,
            EmailService emailService,
            ClerkClient clerkClient,
            JwtDecoder clerkJwtDecoder) {

        this.userRepository = userRepository;
        this.clerkClient = clerkClient;
        this.clerkJwtDecoder = clerkJwtDecoder;
    }


    public UserDto toDto(User user) {
        UserDto dto = new UserDto();
        dto.setEmail(user.getEmail());
        dto.setIsLoggedIn(false);
        dto.setTier(user.getTier());
        return dto;
    }

    public Optional<UserDto> findByEmail(String email) {
        return userRepository.findByEmail(email).map(entity -> toDto(entity));
    }

    public StripeUserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found for email: " + email));

        return new StripeUserDto(user.getEmail(), user.getStripeCustomerId());
    }

    @Transactional
    public void updateUserAfterCheckout(String email, String stripeCustomerId, String subscriptionId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));

        user.setStripeCustomerId(stripeCustomerId);
        user.setStripeSubscriptionId(subscriptionId);
        user.setTier("pro");

        userRepository.save(user);
    }

    @Transactional
    public void handleSubscriptionCanceled(String stripeCustomerId) {

        User user = userRepository.findByStripeCustomerIdAndStripeCustomerIdIsNotNull(stripeCustomerId)
                .orElseThrow(() -> new EntityNotFoundException("No record of customer with this stripe id "));

        user.setTier("free");
        user.setStripeSubscriptionId(null);

        userRepository.save(user);

    }

    @Transactional
    public User syncClerkUser(String clerkToken) {
        Jwt clerkJwt;

        try {
            clerkJwt = clerkJwtDecoder.decode(clerkToken);
        } catch (JwtException exception) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid Clerk session token"
            );
        }

        String clerkUserId = clerkJwt.getSubject();

        if (clerkUserId == null || clerkUserId.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Clerk token does not contain a user ID"
            );
        }

        ClerkClient.ClerkProfile clerkProfile =
                clerkClient.getUser(clerkUserId);

        String email = clerkProfile.email().trim().toLowerCase();

        User user = userRepository.findByClerkUserId(clerkUserId)
                .orElseGet(() -> userRepository.findByEmail(email)
                        .orElse(null));

        if (user == null) {
            user = new User();
            user.setEmail(email);

            
        } else {
            user.setEmail(email);
        }

        user.setClerkUserId(clerkUserId);

        return userRepository.save(user);
    }
}
