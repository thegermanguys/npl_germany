import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { SITE_ORIGIN } from "@/lib/brand";

const description = "Nepal Premier League, Germany Chapter. Season 1 is deuce ball.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "NPL Germany",
    template: "%s — NPL Germany",
  },
  description,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "NPL Germany",
    description,
    url: SITE_ORIGIN,
    siteName: "NPL Germany",
    locale: "en",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "NPL Germany" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NPL Germany",
    description,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/css/style.css" />
      </head>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
