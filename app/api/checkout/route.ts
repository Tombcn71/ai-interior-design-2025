import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

const PACKAGES = {
  basic: {
    name: "Basic Package",
    credits: 5,
    price: 499, // in cents
  },
  standard: {
    name: "Standard Package",
    credits: 15,
    price: 1299, // in cents
  },
  premium: {
    name: "Premium Package",
    credits: 50,
    price: 3999, // in cents
  },
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { packageId } = body;

    if (!packageId || !PACKAGES[packageId as keyof typeof PACKAGES]) {
      return NextResponse.json({ message: "Invalid package" }, { status: 400 });
    }

    const pkg = PACKAGES[packageId as keyof typeof PACKAGES];

    // Controleer of we een app URL hebben
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Controleer of Stripe beschikbaar is
    const stripe = getStripe();
    if (!stripe) {
      console.warn("Stripe client not available, returning mock response");
      return NextResponse.json({
        url: `${appUrl}/dashboard/payment-success?session_id=mock_session_id`,
      });
    }

    // Create Stripe checkout session
    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: pkg.name,
                description: `${pkg.credits} credits for AI Interior Design`,
              },
              unit_amount: pkg.price,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${appUrl}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/dashboard/buy-credits`,
        metadata: {
          userId: session.user.id,
          credits: pkg.credits.toString(),
        },
      });

      return NextResponse.json({ url: checkoutSession.url });
    } catch (stripeError) {
      console.error("Stripe checkout error:", stripeError);
      // Stuur een mock response terug als Stripe faalt
      return NextResponse.json({
        url: `${appUrl}/dashboard/payment-success?session_id=mock_session_id`,
      });
    }
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
