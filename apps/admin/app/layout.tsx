import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "../components/convex-provider";
import { ConvexClerkSync } from "../components/convex-clerk-sync";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kazicloud Admin",
  description: "Admin dashboard for Kazicloud Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      appearance={{
        variables: {
          colorPrimary: "#DC842C",
        },
      }}
    >
      <html lang="en">
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
