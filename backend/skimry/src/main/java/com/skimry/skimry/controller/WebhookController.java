package com.skimry.skimry.controller;

import com.skimry.skimry.service.UserService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    private static final Logger log = LoggerFactory.getLogger(WebhookController.class);

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
            log.error("Invalid signature: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        // 2. Handle specific event types
        switch (event.getType()) {

            // User completed payment/checkout
            case "checkout.session.completed": {
                EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();

                if (dataObjectDeserializer.getObject().isPresent()) {
                    StripeObject stripeObject = dataObjectDeserializer.getObject().get();
                    Session session = (Session) stripeObject;

                    String stripeCustomerId = session.getCustomer();
                    String subscriptionId = session.getSubscription();
                    String userEmail = session.getCustomerDetails() != null
                            ? session.getCustomerDetails().getEmail()
                            : session.getCustomerEmail();

                    log.info("Payment Succeeded for Email: {}", userEmail);
                    log.info("Stripe Customer ID: {}", stripeCustomerId);
                    log.info("Stripe Subscription ID: {}", subscriptionId);

                    if (userEmail != null) {
                        userService.updateUserAfterCheckout(userEmail, stripeCustomerId, subscriptionId);
                    } else {
                        log.error("Could not process webhook: User email is null in Checkout Session {}", session.getId());
                    }
                }
                break;
            }

            // User canceled subscription (or period ended)
            case "customer.subscription.deleted": {
                EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();

                if (dataObjectDeserializer.getObject().isPresent()) {
                    StripeObject stripeObject = dataObjectDeserializer.getObject().get();
                    Subscription subscription = (Subscription) stripeObject;

                    String stripeCustomerId = subscription.getCustomer();

                    log.info("Subscription Canceled for Stripe Customer ID: {}", stripeCustomerId);

                    if (stripeCustomerId != null) {
                        userService.handleSubscriptionCanceled(stripeCustomerId);
                    } else {
                        log.error("Could not process cancellation webhook: Stripe Customer ID is null");
                    }
                }
                break;
            }

            default:
                // Unhandled event types - acknowledge receipt silently
                log.debug("Unhandled event type: {}", event.getType());
                break;
        }

        // 3. Return 200 OK to acknowledge receipt to Stripe
        return ResponseEntity.ok("Success");
    }
}
