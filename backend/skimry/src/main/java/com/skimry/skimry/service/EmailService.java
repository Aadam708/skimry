package com.skimry.skimry.service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.resend.*;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;


@Service
public class EmailService {

    @Value("${resend.api-key}")
    private String resendApiKey;

    @Value("${sender.reciever}")
    private String reciever;

    public void sendOtpEmail(String toEmail, String otpCode) {
        Resend resend = new Resend(resendApiKey);


        //TODO: Change from and to email to correct emails once ready for deployment
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("onboarding@resend.dev")
                .to(reciever)
                .subject("Your Skimry Password Reset Code")
                .html("<h3>Your password reset code is: <strong>" + otpCode + "</strong></h3>" +
                      "<p>This code will expire in 10 minutes.</p>")
                .build();

        try {
            resend.emails().send(params);
        } catch (ResendException e) {
            throw new RuntimeException("Failed to send OTP email via Resend: " + e.getMessage());
        }
    }

}
