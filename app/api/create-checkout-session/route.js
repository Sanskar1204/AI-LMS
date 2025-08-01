// For app/api/create-checkout-session/route.js (Next.js App Router)
// Import the Razorpay Node.js SDK
import Razorpay from "razorpay";

// Initialize Razorpay with your Key ID and Key Secret
// Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in your .env.local file
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID_PRIVATE, // Changed from RAZORPAY_KEY_ID_PRIVATE to RAZORPAY_KEY_ID
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Handles POST requests to create a Razorpay order for a checkout session.
 * This endpoint will return an order ID that the frontend will use to open the Razorpay payment modal.
 * @param {Request} req The incoming Next.js request object.
 * @returns {Response} A JSON response containing the Razorpay order ID or an error.
 */
export async function POST(req) {
  try {
    // You might receive data from the frontend, e.g., amount, product details
    // For simplicity, we'll hardcode the amount as in your original Stripe example.
    // In a real application, you'd calculate this based on user's selection.
    const amountInPaise = 100 * 100; // 100 USD = 10000 paise (Razorpay expects amount in smallest currency unit)
    const currency = "USD"; // Or "INR" if you're primarily using Indian Rupees

    // Create an order with Razorpay
    const options = {
      amount: amountInPaise, // amount in smallest currency unit (e.g., paise for INR, cents for USD)
      currency: currency,
      receipt: `receipt_order_${Date.now()}`, // Unique receipt ID for your records
      payment_capture: 1, // 1 to auto-capture payment after successful transaction
      notes: {
        // Optional notes that can be passed to Razorpay
        product: "AI-LMS Premium",
        userId: "user_id_from_auth_or_db", // Replace with actual user ID if available
      },
    };

    const order = await razorpay.orders.create(options);

    // Return the order ID to the frontend
    return Response.json({ orderId: order.id });
  } catch (err) {
    console.error("Razorpay Order Creation Error:", err);
    // Provide a more specific error message if possible
    let errorMessage = "Failed to create Razorpay order.";
    if (err.statusCode === 400) {
      errorMessage =
        "Invalid request for Razorpay order. Check amount or currency.";
    } else if (err.statusCode === 401) {
      errorMessage = "Razorpay authentication failed. Check your API keys.";
    }
    return Response.json(
      { error: errorMessage, details: err.message },
      { status: 500 }
    );
  }
}
