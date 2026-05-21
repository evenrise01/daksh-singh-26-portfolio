import type { Metadata } from "next";
import {  Manrope, Syne, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import Navbar from "./components/layout/navbar";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
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
      <html lang="en" className={`${manrope.variable} ${syne.variable} ${cormorantGaramond.variable} antialiased`}>
        <body>
          <Navbar />
          {children}
        </body>
      </html>
    </ViewTransitions>
  );
}
