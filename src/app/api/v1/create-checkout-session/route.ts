import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY || "", {
  apiVersion: "2024-12-18.acacia" as any,
});

export async function POST(req: NextRequest) {
  try {
    const { products, userId } = await req.json();

    const CLIENT_URL = process.env.CLIENT_URL || "https://www.graftonqatar.com";

    const lineItems = products.map((p: any) => ({
      price_data: {
        currency: "qar",
        product_data: {
          name: p.en_name || p.name || "Product",
        },
        unit_amount: Math.round(Number(p.price || 0) * 100),
      },
      quantity: Number(p.quantity || 1),
    }));

    // Delivery Fee
    lineItems.push({
      price_data: {
        currency: "qar",
        product_data: {
          name: "Delivery Fee",
        },
        unit_amount: 200 * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/payment-failed`,
      metadata: {
        userId: String(userId || ""),
      },
    });

    return NextResponse.json({
      id: session.id,
      url: session.url,
    });
  } catch (err: any) {
    console.error("Error in create-checkout-session:", err);
    return NextResponse.json({ error: err.message || "Failed to create Stripe session" }, { status: 500 });
  }
}
