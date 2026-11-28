package com.skimry.skimry.service;

import java.nio.charset.StandardCharsets;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailHashService {

    private final byte[] pepperBytes;

    public EmailHashService(
            @Value("${deleted-account.guard-pepper}")
            String guardPepper) {

        if (guardPepper == null || guardPepper.isBlank()) {
            throw new IllegalStateException(
                    "DELETED_ACCOUNT_GUARD_PEPPER must be configured"
            );
        }

        this.pepperBytes =
                guardPepper.getBytes(StandardCharsets.UTF_8);
    }

    public String normalizeEmail(String email) {
        if (email == null) {
            throw new IllegalArgumentException("Email cannot be null");
        }

        return email.trim().toLowerCase();
    }

    public String hashEmail(String email) {
        String normalizedEmail = normalizeEmail(email);

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec key =
                    new SecretKeySpec(
                            pepperBytes,
                            "HmacSHA256"
                    );

            mac.init(key);

            byte[] digest =
                    mac.doFinal(
                            normalizedEmail.getBytes(StandardCharsets.UTF_8)
                    );

            StringBuilder result =
                    new StringBuilder(digest.length * 2);

            for (byte value : digest) {
                result.append(String.format("%02x", value & 0xff));
            }

            return result.toString();

        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Could not hash email address",
                    exception
            );
        }
    }
}
