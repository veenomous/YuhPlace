import type { Metadata, Viewport } from "next";
import { Poppins, Inter, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import ServiceWorkerRegister from "./sw-register";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yuhplace.vercel.app";
const TITLE = "YuhPlace — Home, from wherever yuh deh";
const DESCRIPTION =
  "For the Guyanese diaspora. Send somebody to tour a property, drop off supplies, or fix what needs fixing in Guyana. Vetted partners. Proof at every step.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · YuhPlace",
  },
  description: DESCRIPTION,
  keywords: [
    "Guyana property from abroad",
    "Guyana diaspora services",
    "property viewing Guyana",
    "send groceries Guyana",
    "handyman Guyana",
    "YuhPlace",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "YuhPlace",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YuhPlace",
  },
};

export const viewport: Viewport = {
  themeColor: "#196a24",
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${inter.variable} ${geistMono.variable} ${plusJakarta.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
