package com.skimry.skimry.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skimry.skimry.dto.AuthRequest;
import com.skimry.skimry.dto.StripeUserDto;
import com.skimry.skimry.dto.UserDto;
import com.skimry.skimry.entity.User;
import com.skimry.skimry.repository.UserRepository;
import com.skimry.skimry.security.util.OtpUtil;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
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

    public void processForgotPassword(String email) {

        userRepository.findByEmail(email).ifPresent(user -> {
        String otpCode = OtpUtil.generateOtp();

        // 1. Set the OTP
        user.setResetOtp(otpCode);

        // 2. Set expiration to 10 minutes from now
        user.setResetOtpExpiry(LocalDateTime.now().plusMinutes(10));

        // 3. Persist to DB
        userRepository.save(user);

        // 4. Dispatch reset email
        emailService.sendOtpEmail(user.getEmail(), otpCode);
    });

    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid request"));

        // 1. Verify OTP exists and matches
        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp)) {
            throw new IllegalArgumentException("Invalid or expired code");
        }

        // 2. Check Expiry
        if (user.getResetOtpExpiry() == null || LocalDateTime.now().isAfter(user.getResetOtpExpiry())) {
            throw new IllegalArgumentException("Invalid or expired code");
        }

        // 3. Encode & Update Password using PasswordEncoder
        user.setPassword(passwordEncoder.encode(newPassword));

        // 4. Clear the OTP fields so it cannot be re-used!
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);

        userRepository.save(user);
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
