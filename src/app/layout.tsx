import type { Metadata } from "next";
import React from "react";
import { Manrope, Inter, Newsreader } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import Script from "next/script";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Legal Mouse — All-in-One Legal Learning Platform",
  description:
    "Master the law with AI-powered study tools, curated case law analysis, and structured learning paths.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} ${newsreader.variable} h-full`}
      suppressHydrationWarning
    >
      <Script
        id="theme-initializer"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `try{if(localStorage.getItem('legal-mouse-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
        }}
      />
      <body className="min-h-full font-body antialiased bg-surface-container-lowest text-on-surface">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
