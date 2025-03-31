import Stripe from "stripe";

// Veilige Stripe initialisatie functie
let stripe: Stripe | null = null;

// Functie om Stripe te initialiseren met foutafhandeling
const initializeStripe = () => {
  // Alleen initialiseren als het nog niet is gedaan en we een API key hebben
  if (stripe !== null || typeof process.env.STRIPE_SECRET_KEY !== "string") {
    return stripe;
  }

  try {
    // Probeer met de nieuwste API versie
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia" as any,
    });
  } catch (error) {
    console.error("Failed to initialize Stripe:", error);
    stripe = null;
  }

  return stripe;
};

// Exporteer een functie die Stripe veilig initialiseert en teruggeeft
export const getStripe = () => {
  return initializeStripe();
};
