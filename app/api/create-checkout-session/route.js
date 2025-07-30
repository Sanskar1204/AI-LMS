// For app/api/create-checkout-session/route.js (Next.js App Router)
import Stripe from "razorpay-node-sdk";

const stripe = new Stripe(process.env.RAZORPAY_KEY_SECRET);

export async function POST(req) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "AI-LMS Premium",
            },
            unit_amount: 100, //
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get("origin")}/success`,
      cancel_url: `${req.headers.get("origin")}/cancel`,
    });

    return Response.json({ id: session.id });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
