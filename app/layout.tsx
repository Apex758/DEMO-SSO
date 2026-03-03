import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSO Demo",
  description: "Auth0 + Multi Supabase Projects Demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}