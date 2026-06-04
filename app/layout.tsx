import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "KTS Server 1118 Resource Kit",
  description: "All your Top Girl calculators in one place",
  icons: { icon: "/favicon.png" },
  openGraph: {
    title: "KTS Server 1118 Resource Kit",
    description: "Top Girl calculators, artist rankings, team builder & shops — all in one place.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "KTS Server 1118 Resource Kit",
    description: "Top Girl calculators, artist rankings, team builder & shops.",
  },
  other: {
    "theme-color": "#0a0a0a",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
