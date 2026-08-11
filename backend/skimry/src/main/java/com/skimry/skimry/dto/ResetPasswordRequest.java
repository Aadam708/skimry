package com.skimry.skimry.dto;

public record ResetPasswordRequest(
    String email,
    String otp,
    String newPassword
) {}
