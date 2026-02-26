import type { Metadata, Viewport } from "next";
import { Poppins, Inter, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "YuhPlace — Your place for Guyana",
  description:
    "Discover local updates, buy and sell nearby, and find rentals, homes, and services in Guyana.",
  openGraph: {
    title: "YuhPlace — Your place for Guyana",
    description:
      "Discover local updates, buy and sell nearby, and find rentals, homes, and services in Guyana.",
    url: "https://yuhplace.vercel.app",
    siteName: "YuhPlace",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "YuhPlace — Your place for Guyana",
    description:
      "Discover local updates, buy and sell nearby, and find rentals, homes, and services in Guyana.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YuhPlace",
  },
};

export const viewport: Viewport = {
  themeColor: "#1667B7",
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
        className={`${poppins.variable} ${inter.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
