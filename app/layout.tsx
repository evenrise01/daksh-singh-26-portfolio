import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { Lenis } from "lenis/react";
import { ViewTransitions } from "next-view-transitions";
import Navbar from "./components/layout/navbar";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "Daksh Singh | Design Director and Developer - Web and Brand Design Specialist",
  description:
    "I combine strong intuition with data to create brand-first digital products that balance aesthetics with performance and creative storytelling.",
  openGraph: {
    title:
      "Daksh Singh | Design Director and Developer - Web and Brand Design Specialist",
    description:
      "I combine strong intuition with data to create brand-first digital products that balance aesthetics with performance and creative storytelling.",
    images: ["/"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" className={`${manrope.variable} antialiased`}>
        <body>
          <Navbar />
          {children}
        </body>
      </html>
    </ViewTransitions>
  );
}
