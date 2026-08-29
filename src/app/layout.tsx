import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const SITE_URL = "https://nizarrahme.com";
const ICON_URL = "https://z-cdn.chatglm.cn/z-ai/static/logo.svg";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "NIZAR RAHME | Brandable Domain Names",
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
    "NIZAR RAHME",
    "domain marketplace",
  ],
  category: "business",
  authors: [{ name: "NIZAR RAHME" }],
  icons: {
    icon: ICON_URL,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NIZAR RAHME | Brandable Domain Names",
    description:
      "Curated domain names for AI, SaaS, fintech, and technology businesses.",
    type: "website",
    url: "/",
    locale: "en_US",
    siteName: "NIZAR RAHME",
    images: [
      {
        url: ICON_URL,
        width: 512,
        height: 512,
        alt: "NIZAR RAHME | Brandable Domain Names",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NIZAR RAHME | Brandable Domain Names",
    description:
      "Curated domain names for AI, SaaS, fintech, and technology businesses.",
    image: ICON_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "your-google-verification-code-here",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "NIZAR RAHME",
      url: SITE_URL,
      jobTitle: "Domain Investor & Digital Strategist",
      description:
        "Curates brandable domain names for AI, SaaS, fintech, and technology businesses.",
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "NIZAR RAHME | Brandable Domain Names",
      description:
        "Curated domain names for AI, SaaS, fintech, and technology businesses. Brandable, memorable, and available for acquisition.",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "NIZAR RAHME",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: ICON_URL,
      },
      founder: {
        "@id": `${SITE_URL}/#person`,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var t='ontouchstart' in window||navigator.maxTouchPoints>0;if(t){d.classList.add('touch-device')}else{d.classList.add('hover-device')}}catch(e){}})();`,
          }}
        />
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
