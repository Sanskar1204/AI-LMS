"use client"; // This page needs to be a Client Component

import React from "react";
// Import the UpgradeButton component
import UpgradeButton from "./UpgradeButton"; // Adjust path if needed

const plans = [
  {
    name: "Free",
    price: "Rs.0",
    period: "/month",
    features: [
      "5 Course Generate",
      "Limited Support",
      "Email support",
      "Help center access",
    ],
    buttonText: "Current Plan",
    buttonColor: "white",
    current: true,
    // Add a planId for clarity, though not strictly used in this example
    planId: "free",
  },
  {
    name: "Monthly",
    price: "Rs.100",
    period: "/Month",
    features: [
      "Unlimited Course Generate",
      "Unlimited Flashcard, Quiz",
      "Email support",
      "Help center access",
    ],
    buttonText: "Get Started",
    buttonColor: "blue",
    current: false,
    // Add a planId for clarity
    planId: "monthly_premium",
    // You might also pass the actual amount and currency if the UpgradeButton
    // needs to dynamically adjust based on the plan.
    // For now, UpgradeButton hardcodes 100 USD, so ensure your backend matches.
    amount: 100, // Example amount in base unit (e.g., USD)
    currency: "USD", // Example currency
  },
];

const Upgrade = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Plans</h1>
        <p className="text-gray-600">
          Update your plan to generate unlimited courses for your exam
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 flex flex-col"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-medium mb-4">{plan.name}</h3>
              <div className="flex items-center justify-center">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-500 ml-1">{plan.period}</span>
              </div>
            </div>

            <div className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              {/* Conditionally render the UpgradeButton for the "Monthly" plan */}
              {plan.planId === "monthly_premium" ? (
                // Pass plan details to UpgradeButton if it needs them (optional)
                // The UpgradeButton currently hardcodes the amount, so this is for future flexibility.
                <UpgradeButton
                  planAmount={plan.amount}
                  planCurrency={plan.currency}
                  planName={plan.name}
                />
              ) : (
                <button
                  className={`cursor-not-allowed w-full py-3 px-4 rounded text-center font-medium ${
                    plan.buttonColor === "blue"
                      ? "bg-[#3700ce] text-white opacity-50" // Dim for non-clickable
                      : "bg-white text-[#3700ce] border border-[#3700ce] opacity-50"
                  }`}
                  disabled={true} // Disable the button for non-upgradeable plans
                >
                  {plan.buttonText}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Upgrade;
