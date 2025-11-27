import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: 'swap', // Ensures text remains visible during webfont load
  preload: true, // Preload the font for better performance
});

export const metadata: Metadata = {
  title: "AI Course Generator",
  description:
    "Generate personalized AI learning courses tailored to your goals, level, and preferences",
  openGraph: {
    title: "AI Course Generator",
    description:
      "Generate personalized AI learning courses tailored to your goals, level, and preferences",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6366f1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
