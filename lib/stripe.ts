// Vereenvoudigde mock versie van Stripe
const mockStripe = {
  checkout: {
    sessions: {
      // @ts-ignore
      create: async () => ({
        url: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/dashboard/payment-success?session_id=mock_session_id`,
      }),
    },
  },
};

// Exporteer alleen de mock versie
export const stripe = mockStripe;
