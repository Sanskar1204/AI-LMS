"use client";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("your_stripe_publishable_key");

export default function CheckoutButton() {
  const handleClick = async () => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
    });
    const data = await res.json();
    const stripe = await stripePromise;
    stripe.redirectToCheckout({ sessionId: data.id });
  };

  return <button onClick={handleClick}>Buy Premium for Rs.100</button>;
}
