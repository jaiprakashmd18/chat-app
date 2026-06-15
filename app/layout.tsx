import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/shared/SessionProvider";
import { auth } from "@/lib/auth";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StudentExpress Georgia — Food & Delivery for Students",
    template: "%s | StudentExpress Georgia",
  },
  description:
    "Order food from restaurants, request personal pickups, grocery delivery, and parcel delivery — all in one app built for students in Georgia.",
  keywords: [
    "food delivery Georgia",
    "student delivery Tbilisi",
    "restaurant delivery",
    "grocery delivery Georgia",
    "StudentExpress",
  ],
  authors: [{ name: "StudentExpress Georgia" }],
  creator: "StudentExpress Georgia",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://studentexpress.ge"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "StudentExpress Georgia",
    title: "StudentExpress Georgia — Food & Delivery for Students",
    description:
      "Order food, request pickups, grocery & parcel delivery for students in Georgia.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StudentExpress Georgia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StudentExpress Georgia",
    description: "Food & delivery platform for students in Georgia",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF6B00" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "StudentExpress Georgia",
              description: "Food and delivery platform for students in Georgia",
              applicationCategory: "FoodDelivery",
              operatingSystem: "Any",
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
