import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nizar Rahme — Brandable Domain Names",
  description:
    "Curated domain names for AI, SaaS, fintech, and technology businesses. Brandable, memorable, and available for acquisition.",
  keywords: [
    "domain names",
    "brandable domains",
    "domain investing",
    "AI domains",
    "SaaS domains",
    "fintech domains",
    "technology domains",
    "Nizar Rahme",
    "domain marketplace",
  ],
  authors: [{ name: "Nizar Rahme" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Nizar Rahme — Brandable Domain Names",
    description:
      "Curated domain names for AI, SaaS, fintech, and technology businesses.",
    type: "website",
    siteName: "Nizar Rahme",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nizar Rahme — Brandable Domain Names",
    description:
      "Curated domain names for AI, SaaS, fintech, and technology businesses.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSerif.variable} antialiased bg-background text-foreground`}
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
