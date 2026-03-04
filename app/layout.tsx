import type { Metadata } from "next";
import "./globals.css";
import { NavbarClient } from "@/components/NavbarClient";
import { auth0 } from "@/lib/auth0";

export const metadata: Metadata = {
  title: "SSO Demo",
  description: "Auth0 + Multi Supabase Projects Demo",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0.getSession();
  const isAuthenticated = !!session?.user;
  const user = session?.user || null;

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <NavbarClient isAuthenticated={isAuthenticated} user={user} />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}