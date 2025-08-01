// app/dashboard/profile/[[...rest]]/page.jsx
"use client"; // This component needs to be a Client Component

import { UserProfile } from "@clerk/nextjs";
import React from "react";

/**
 * This page component renders the Clerk UserProfile component.
 * It is set up as a catch-all route ([[...rest]]/page.jsx)
 * to allow Clerk's UserProfile to handle its internal routing
 * for sections like "security", "account", etc.
 *
 * The middleware.ts file should be configured to make this route public
 * (e.g., publicRoutes: ["/dashboard/profile(.*)"]) to avoid conflicts
 * with Clerk's internal routing mechanism.
 */
const UserProfilePage = () => {
  return (
    <div className="flex justify-center py-8">
      {/* The <UserProfile /> component provides a complete UI for user profile management.
        It handles its own internal routing for different sections.
        
        Ensure your Next.js route is a catch-all (e.g., [[...rest]]/page.jsx)
        and your Clerk middleware is configured to allow public access to this route
        (e.g., publicRoutes: ["/dashboard/profile(.*)"]) for proper functionality.
      */}
      <UserProfile routing="path" path="/dashboard/profile" />
    </div>
  );
};

export default UserProfilePage;
