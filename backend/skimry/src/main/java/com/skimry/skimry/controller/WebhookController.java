package com.skimry.skimry.controller;

import com.skimry.skimry.service.UserService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    private final UserService userService;

    public WebhookController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;

        // 1. Verify the signature using the webhook secret
        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            System.err.println("Invalid signature: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        // 2. Handle the specific event type
        if ("checkout.session.completed".equals(event.getType())) {
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();

            if (dataObjectDeserializer.getObject().isPresent()) {
                StripeObject stripeObject = dataObjectDeserializer.getObject().get();
                Session session = (Session) stripeObject;

                // Extract customer details & payment info
                String stripeCustomerId = session.getCustomer();
                String subscriptionId = session.getSubscription();
                String userEmail = session.getCustomerDetails() != null
                        ? session.getCustomerDetails().getEmail()
                        : session.getCustomerEmail();

                System.out.println("Payment Succeeded for Email: " + userEmail);
                System.out.println("Stripe Customer ID: " + stripeCustomerId);
                System.out.println("Stripe Subscription ID: " + subscriptionId);

                // Call UserService to sync DB with subscription status
                if (userEmail != null) {
                    userService.updateUserAfterCheckout(userEmail, stripeCustomerId, subscriptionId);
                } else {
                    System.err.println("Could not process webhook: User email is null in Checkout Session " + session.getId());
                }
            }
        }

        // 3. Return 200 OK to acknowledge receipt to Stripe
        return ResponseEntity.ok("Success");
    }
}
