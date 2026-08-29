import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";

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
const ICON_URL = "/logo.svg";

const SOCIAL_URLS = {
  x: "https://x.com/nizarx25",
  linkedin: "https://www.linkedin.com/in/nizarrahme",
  instagram: "https://www.instagram.com/nizarrahme",
  facebook: "https://www.facebook.com/nizarrahme",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "NIZAR RAHME | Brandable Domain Names for AI, SaaS & Fintech",
  description:
    "NIZAR RAHME curates premium brandable domain names for AI startups, SaaS platforms, fintech companies, and technology businesses. Browse a hand-picked portfolio of memorable, short, and investment-grade .com domains available for immediate acquisition. Each domain is evaluated for brandability, memorability, and industry fit.",
  keywords: [
    "brandable domain names",
    "premium domains for sale",
    "AI domain names",
    "SaaS domain names",
    "fintech domain names",
    "tech startup domains",
    "domain investor",
    "domain marketplace",
    "buy domain names",
    "NIZAR RAHME",
    "investment-grade domains",
    "memorable domain names",
    "short domain names",
    ".com domains for sale",
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
    title: "NIZAR RAHME | Brandable Domain Names for AI, SaaS & Fintech",
    description:
      "Curated premium domain names for AI startups, SaaS platforms, fintech, and technology businesses. Brandable, memorable, and available for acquisition.",
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
    title: "NIZAR RAHME | Brandable Domain Names for AI, SaaS & Fintech",
    description:
      "Curated premium domain names for AI startups, SaaS platforms, fintech, and technology businesses.",
    image: ICON_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
      jobTitle: "Domain Investor & Digital Brand Builder",
      description:
        "NIZAR RAHME is a domain investor and digital brand builder who curates premium, brandable domain names for AI startups, SaaS platforms, fintech companies, and technology businesses. Each domain in the portfolio is hand-selected for brandability, memorability, pronounceability, and industry fit. NIZAR RAHME has been investing in digital assets since 2023 and operates across major domain marketplaces including Atom, Afternic, and Sedo.",
      knowsAbout: [
        "domain name investing",
        "brandable domain names",
        "AI startup branding",
        "SaaS domain strategy",
        "fintech branding",
        "digital asset valuation",
        "domain name appraisal",
      ],
      sameAs: Object.values(SOCIAL_URLS),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "NIZAR RAHME | Brandable Domain Names",
      description:
        "Premium brandable domain names curated by NIZAR RAHME for AI, SaaS, fintech, and technology businesses. Browse, search, and acquire investment-grade .com domains.",
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
      description:
        "Domain investment and digital brand building company operated by NIZAR RAHME, specializing in premium brandable domain names for technology businesses.",
      logo: {
        "@type": "ImageObject",
        url: ICON_URL,
      },
      founder: {
        "@id": `${SITE_URL}/#person`,
      },
      sameAs: Object.values(SOCIAL_URLS),
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        availableLanguage: ["English", "Arabic"],
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Who is NIZAR RAHME and what does he do?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "NIZAR RAHME is a domain investor and digital brand builder who curates premium, brandable domain names specifically for AI startups, SaaS platforms, fintech companies, and technology businesses. He has been investing in digital assets since 2023 and lists domains on major marketplaces including Atom, Afternic, and Sedo.",
          },
        },
        {
          "@type": "Question",
          name: "How does NIZAR RAHME evaluate domain names?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "NIZAR RAHME evaluates domains based on seven criteria: Brandability (does it sound like a real company?), Length (preferably under 12 characters), Memorability (recall after one hearing), Pronounceability (easy to say aloud), Industry fit (alignment with AI, SaaS, fintech, or digital services), Extension quality (.com preferred), and Practical value (would a real business benefit from this name?).",
          },
        },
        {
          "@type": "Question",
          name: "How can I buy a domain from NIZAR RAHME?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can acquire a domain by browsing the portfolio on nizarrahme.com, clicking on any domain to view its details, and submitting an offer through the Make an Offer form. Alternatively, you can contact NIZAR RAHME directly through the contact form or via the listed social media channels.",
          },
        },
        {
          "@type": "Question",
          name: "What types of domain names does NIZAR RAHME specialize in?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "NIZAR RAHME specializes in brandable .com domain names for the AI, SaaS, fintech, technology, infrastructure, health, marketing, and finance sectors. The portfolio focuses on short, memorable names that could serve as the foundation for a real business brand.",
          },
        },
      ],
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#domain-list`,
      name: "Premium Domain Names by NIZAR RAHME",
      description:
        "A curated portfolio of brandable domain names available for acquisition, covering AI, SaaS, fintech, technology, and other digital sectors.",
      numberOfItems: 150,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "FogEngine.com",
          url: `${SITE_URL}/#domains`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "ContainerImage.com",
          url: `${SITE_URL}/#domains`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "ModelCompress.com",
          url: `${SITE_URL}/#domains`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "AllocEngine.com",
          url: `${SITE_URL}/#domains`,
        },
        {
          "@type": "ListItem",
          position: 5,
          name: "SnapInference.com",
          url: `${SITE_URL}/#domains`,
        },
        {
          "@type": "ListItem",
          position: 6,
          name: "ComfyUx.com",
          url: `${SITE_URL}/#domains`,
        },
        {
          "@type": "ListItem",
          position: 7,
          name: "PriceAutomate.com",
          url: `${SITE_URL}/#domains`,
        },
        {
          "@type": "ListItem",
          position: 8,
          name: "VectorSift.com",
          url: `${SITE_URL}/#domains`,
        },
      ],
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
        <Analytics />
      </body>
    </html>
  );
}
