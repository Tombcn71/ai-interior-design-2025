import Stripe from "stripe";

// Controleer of de API key bestaat, anders gebruik een dummy waarde voor de build
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "dummy_key_for_build";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia",
});
