import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "../components/convex-provider";
import { ConvexClerkSync } from "../components/convex-clerk-sync";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kazicloud - Professional Job Platform",
  description: "Connect with top employers and discover roles that match your skills and ambitions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      appearance={{
        variables: {
          colorPrimary: "#DC842C",
        },
      }}
      signInFallbackRedirectUrl="/sso-callback"
      signUpFallbackRedirectUrl="/sso-callback"
    >
      <html lang="en">
        <head>
          <script src="https://js.paystack.co/v1/inline.js"></script>
        </head>
        <body>
          <ConvexClientProvider>
            <ConvexClerkSync />
            {children}
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
