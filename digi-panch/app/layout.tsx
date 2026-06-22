import type { Metadata } from "next";
import { DynaPuff, Supermercado_One, Inter, Noto_Serif } from "next/font/google";
import "./globals.css";

import Navbar from "./components/landing-page/navbar/navbar";
import { Toaster } from "@/components/ui/sonner";

import { ClerkProvider } from "@clerk/nextjs";

const dynaPuff = DynaPuff({
  variable: "--font-next-dynapuff",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const supermercadoOne = Supermercado_One({
  variable: "--font-next-supermercado",
  subsets: ["latin"],
  weight: ["400"],
});

const inter = Inter({
  variable: "--font-next-inter",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Digi Panch",
  description: "Modern Village Administration System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} ${notoSerif.variable} h-full antialiased`}
      >
        <body
          className={`min-h-full flex flex-col ${inter.className}`}
        >
          <Navbar />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}