// This component would typically be located in app/dashboard/upgrade/page.jsx
// or a component imported by it.
"use client";

import React from "react";
import axios from "axios";
import { Button } from "@/components/ui/button"; // Assuming you use shadcn/ui Button
import { useUser } from "@clerk/nextjs"; // Assuming you need user info for prefill/notes

const UpgradeButton = () => {
  const { user } = useUser(); // Get user info if needed for prefill or notes

  // Function to dynamically load the Razorpay checkout.js script
  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error("Razorpay SDK failed to load.");
        reject(
          new Error(
            "Razorpay SDK failed to load. Please check your internet connection."
          )
        );
      };
      document.body.appendChild(script);
    });
  };

  // Handler for the upgrade button click
  const handleUpgradeClick = async () => {
    try {
      // Ensure Razorpay script is loaded before proceeding
      await loadRazorpayScript();

      // 1. Call your backend to create a Razorpay Order
      // The amount and currency should ideally be determined by your backend
      // based on the plan selected, but for this example, we'll pass a fixed value.
      // Make sure the amount matches what your backend expects (e.g., in cents/paise).
      const response = await axios.post("/api/create-checkout-session", {
        // You can send plan details here if your backend needs them
        planName: "AI-LMS Premium",
        amount: 100, // Example: send 100 USD, backend converts to paise
      });

      const { orderId, error: backendError } = response.data;

      if (backendError) {
        throw new Error(backendError);
      }
      if (!orderId) {
        throw new Error(
          "Failed to get order ID from backend. Response was missing orderId."
        );
      }

      // 2. Prepare Razorpay options for the checkout modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Your Razorpay Key ID (client-side)
        amount: 100 * 100, // Amount in smallest currency unit (e.g., paise for INR, cents for USD)
        // This should ideally come from the backend response,
        // but hardcoding for consistency with your backend example.
        currency: "USD", // Must match backend order currency
        name: "Learnify", // Your platform name
        description: "Premium Subscription for Learnify",
        order_id: orderId, // The order ID obtained from your backend
        handler: function (razorpayResponse) {
          // This function is called when the payment is successful
          console.log("Payment Successful!", razorpayResponse);
          alert(
            "Payment Successful! Payment ID: " +
              razorpayResponse.razorpay_payment_id
          );
          // IMPORTANT: Verify the payment on your backend immediately after this.
          // This prevents fraud and ensures the payment is legitimate.
          // Example:
          // axios.post('/api/verify-razorpay-payment', {
          //   razorpay_order_id: razorpayResponse.razorpay_order_id,
          //   razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          //   razorpay_signature: razorpayResponse.razorpay_signature,
          //   userId: user?.id // Pass user ID for verification
          // }).then(verificationRes => {
          //   if (verificationRes.data.success) {
          //     // Update user's subscription status in your database
          //     console.log("Payment verified successfully on backend.");
          //     // Redirect or update UI
          //   } else {
          //     console.error("Backend verification failed:", verificationRes.data.error);
          //     alert("Payment verification failed. Please contact support.");
          //   }
          // }).catch(verificationErr => {
          //   console.error("Error during backend verification:", verificationErr);
          //   alert("An error occurred during payment verification. Please contact support.");
          // });
        },
        prefill: {
          // Optional: Pre-fill user details if you have them from Clerk
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
          contact: user?.phoneNumbers?.[0]?.phoneNumber || "", // If you collect phone numbers
        },
        notes: {
          userId: user?.id, // Pass Clerk user ID to Razorpay notes
          // Add any other relevant notes
        },
        theme: {
          color: "#686CFD", // Your primary brand color
        },
      };

      // 3. Open the Razorpay checkout modal
      // 'window.Razorpay' is available after the script loads
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        console.error("Payment Failed:", response.error);
        alert("Payment Failed: " + response.error.description);
        // You might want to log this failure on your backend as well
      });
      rzp.open();
    } catch (error) {
      console.error("Error during Razorpay process:", error);
      // Display a user-friendly error message
      alert(
        error.response?.data?.error ||
          error.message ||
          "An unexpected error occurred during payment. Please try again."
      );
    }
  };

  return (
    <Button onClick={handleUpgradeClick}>Get started for Rs.100 plan</Button>
  );
};

export default UpgradeButton;
