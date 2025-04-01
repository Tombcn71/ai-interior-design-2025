import Stripe from "stripe";

// Controleer of de API key bestaat
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Initialiseer Stripe client met correcte types
let stripeClient: Stripe | null = null;

if (stripeSecretKey) {
  try {
    stripeClient = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16", // Gebruik een specifieke API versie
    });
  } catch (error) {
    console.error("Failed to initialize Stripe:", error);
  }
}

export const stripe = stripeClient;
