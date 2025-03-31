// Vereenvoudigde mock versie van Stripe
const mockStripe = {
  checkout: {
    sessions: {
      create: async () => ({
        url: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/dashboard/payment-success?session_id=mock_session_id`,
      }),
    },
  },
  webhooks: {
    constructEvent: () => ({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: {
            userId: "",
            credits: "0",
          },
          id: "mock_session_id",
        },
      },
    }),
  },
};

// Exporteer alleen de mock versie
export const stripe = mockStripe;
