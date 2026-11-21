package com.skimry.skimry.service;


import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.skimry.skimry.dto.StripeUserDto;
import com.skimry.skimry.dto.UserDto;
import com.skimry.skimry.entity.User;
import com.skimry.skimry.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.skimry.skimry.entity.DeletedAccountGuard;
import com.skimry.skimry.repository.DeletedAccountGuardRepository;

import jakarta.persistence.EntityNotFoundException;
import com.skimry.skimry.repository.MaterialRepository;
import com.stripe.exception.StripeException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.skimry.skimry.security.AuthenticatedUser;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ClerkClient clerkClient;
    private final JwtDecoder clerkJwtDecoder;
    private final StripeService stripeService;
    private final DeletedAccountGuardRepository deletedAccountGuardRepository;
    private final EmailHashService emailHashService;

    public UserService(
            UserRepository userRepository,
            EmailHashService emailHashService,
            ClerkClient clerkClient,
            JwtDecoder clerkJwtDecoder,
            MaterialRepository materialRepository,
            StripeService stripeService,
            DeletedAccountGuardRepository deletedAccountGuardRepository
        ) {

        this.userRepository = userRepository;
        this.clerkClient = clerkClient;
        this.clerkJwtDecoder = clerkJwtDecoder;
        this.stripeService = stripeService;
        this.deletedAccountGuardRepository =
                deletedAccountGuardRepository;
        this.emailHashService = emailHashService;
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

    public Optional<UserDto> findById(UUID userId) {
        return userRepository.findById(userId)
                .map(this::toDto);
    }

    public StripeUserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found for email: " + email));

        return new StripeUserDto(user.getEmail(), user.getStripeCustomerId());
    }

    public StripeUserDto getUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "User not found: " + userId
                        ));

        return new StripeUserDto(
                user.getEmail(),
                user.getStripeCustomerId()
        );
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

        String normalizedEmail =
                emailHashService.normalizeEmail(clerkProfile.email());

        String emailHash =
                emailHashService.hashEmail(normalizedEmail);

        User user =
                userRepository.findByClerkUserId(clerkUserId)
                        .orElseGet(() ->
                                userRepository.findByEmail(normalizedEmail)
                                        .orElse(null)
                        );

        if (user == null) {
            user = new User();
            user.setEmail(normalizedEmail);
            user.setTier("free");

            DeletedAccountGuard guard =
                    deletedAccountGuardRepository
                            .findByEmailHash(emailHash)
                            .orElse(null);

            if (guard != null) {
                user.setPostsSummarisedThisMonth(
                        guard.getPriorSkimsUsed() == null
                                ? 0
                                : guard.getPriorSkimsUsed()
                );

                if (guard.getLastResetDate() != null) {
                    user.setLastResetDate(guard.getLastResetDate());
                } else {
                    user.setLastResetDate(LocalDate.now());
                }
            }
        } else {
            user.setEmail(normalizedEmail);
        }

        user.setClerkUserId(clerkUserId);

        return userRepository.save(user);
    }

    @Transactional
    public void deleteAuthenticatedUser() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !(authentication.getPrincipal()
                instanceof AuthenticatedUser authenticatedUser)) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User is not authenticated"
            );
        }

        User user = userRepository.findById(authenticatedUser.getUserId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "User does not exist"
                ));
        upsertDeletedAccountGuard(user);

        String clerkUserId = user.getClerkUserId();
        String stripeSubscriptionId = user.getStripeSubscriptionId();

        try {
            if (stripeSubscriptionId != null
                    && !stripeSubscriptionId.isBlank()) {

                stripeService.cancelSubscriptionAtPeriodEnd(
                        stripeSubscriptionId
                );
            }

            if (clerkUserId != null
                    && !clerkUserId.isBlank()) {

                clerkClient.deleteUser(clerkUserId);
            }

            userRepository.delete(user);

        } catch (StripeException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to cancel the Stripe subscription",
                    exception
            );
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to complete account deletion",
                    exception
            );
        }
    }

    private void upsertDeletedAccountGuard(User user) {
        String emailHash =
                emailHashService.hashEmail(user.getEmail());

        LocalDateTime now = LocalDateTime.now();

        DeletedAccountGuard guard =
                deletedAccountGuardRepository
                        .findByEmailHash(emailHash)
                        .orElse(null);

        int currentUsage =
                user.getPostsSummarisedThisMonth() == null
                        ? 0
                        : user.getPostsSummarisedThisMonth();

        if (guard == null) {
            guard = DeletedAccountGuard.builder()
                    .emailHash(emailHash)
                    .priorSkimsUsed(currentUsage)
                    .lastResetDate(
                            user.getLastResetDate()
                    )
                    .deletedAt(now)
                    .build();
        } else {
            int previousUsage =
                    guard.getPriorSkimsUsed() == null
                            ? 0
                            : guard.getPriorSkimsUsed();

            guard.setPriorSkimsUsed(
                    Math.max(previousUsage, currentUsage)
            );
            guard.setLastResetDate(user.getLastResetDate());
            guard.setDeletedAt(now);
        }

        deletedAccountGuardRepository.saveAndFlush(guard);
    }
}
