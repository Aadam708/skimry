package com.skimry.skimry.service;

import org.springframework.stereotype.Service;

import com.skimry.skimry.dto.StripeUserDto;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;

@Service
public class StripeService {

    @Value("${stripe.api-key}")
    private String stripeApiKey;

    @Value("${stripe.pro.price.id}")
    private String proPriceId;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // This runs once when Spring starts up to authenticate with Stripe
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    /**
     * Creates a unique URL for the user to complete their £4.99 purchase on Stripe
     */
    public String createCheckoutSession(StripeUserDto stripeUser) throws StripeException {
        SessionCreateParams.Builder builder = SessionCreateParams.builder()
            // 1. Subscription mode for monthly payments
            .setMode(SessionCreateParams.Mode.SUBSCRIPTION)

            // 2. Where Stripe redirects after payment success or cancellation
            .setSuccessUrl(frontendUrl + "/dashboard?payment=success")
            .setCancelUrl(frontendUrl + "/pricing")

            // 3. The exact product/price they are purchasing
            .addLineItem(
                SessionCreateParams.LineItem.builder()
                    .setPrice(proPriceId)
                    .setQuantity(1L)
                    .build()
            );

        // 4. Attach existing customer ID if they bought before, or pass email
        if (stripeUser.getStripeCustomerId() != null) {
            builder.setCustomer(stripeUser.getStripeCustomerId());
        } else {
            builder.setCustomerEmail(stripeUser.getEmail());
        }

        // Create the session with Stripe's servers
        Session session = Session.create(builder.build());

        // Return the checkout page URL (e.g. https://checkout.stripe.com/c/pay/cs_test_...)
        return session.getUrl();
    }

    public String createPortalSession(String stripeCustomerId) throws StripeException {
        com.stripe.param.billingportal.SessionCreateParams params =
            com.stripe.param.billingportal.SessionCreateParams.builder()
                .setCustomer(stripeCustomerId)
                .setReturnUrl(frontendUrl+ "/dashboard?payment=cancelled")
                .build();

        com.stripe.model.billingportal.Session portalSession =
            com.stripe.model.billingportal.Session.create(params);

        return portalSession.getUrl();
    }
}
