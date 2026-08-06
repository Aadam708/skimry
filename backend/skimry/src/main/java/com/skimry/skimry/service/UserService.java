package com.skimry.skimry.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skimry.skimry.dto.AuthRequest;
import com.skimry.skimry.dto.StripeUserDto;
import com.skimry.skimry.dto.UserDto;
import com.skimry.skimry.entity.User;
import com.skimry.skimry.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDto register(AuthRequest req) {
        String email = req.getEmail();
        String password = req.getPassword();

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));

        User savedUser = userRepository.save(user);
        return toDto(savedUser);
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
}
