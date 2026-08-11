package com.skimry.skimry.security.util;
import java.security.SecureRandom;

public class OtpUtil {
    private static final SecureRandom random = new SecureRandom();

    public static String generateOtp() {
        int code = 100000 + random.nextInt(900000); 
        return String.valueOf(code);
    }
}
