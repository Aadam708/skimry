package com.skimry.skimry.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StripeUserDto {
    private String email;
    private String stripeCustomerId;
}
