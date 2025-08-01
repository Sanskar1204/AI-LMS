/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this 'images' configuration block to allow external image domains
  images: {
    domains: [
      // Add 'placehold.co' to the list of allowed domains
      "placehold.co",
      // Add any other domains your application uses for images here
    ],
  },
};

// Use ES module syntax for the export
export default nextConfig;
