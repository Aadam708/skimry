package com.skimry.skimry.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

@Entity(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "stripe_customer_id")
    private String stripeCustomerId;

    @Column(name = "stripe_subscription_id")
    private String stripeSubscriptionId;

    @Column(name = "tier")
    private String tier = "free";

    @Column(name = "posts_summarised_this_month")
    private Integer postsSummarisedThisMonth = 0;

    @Column(name = "subscription_ends_at")
    private LocalDateTime subscriptionEndsAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "last_reset_date")
    private LocalDate lastResetDate = LocalDate.now();

    @Column(name = "reset_otp") 
    private String resetOtp;

    @Column(name = "reset_otp_expiry")
    private LocalDateTime resetOtpExpiry;

}
