import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartSheet } from "@/components/shop/cart-sheet";
import { WhatsAppFloatingButton } from "@/components/shop/whatsapp-floating-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mer Kilmurray Design | Accesorios Textiles y Organización",
  description:
    "Diseño funcional de autor: bolsos para máquina de coser, fundas para notebook, organizadores y complementos textiles creados por Mercedes Kilmurray.",
  keywords: [
    "accesorios textiles",
    "bolso maquina de coser",
    "porta notebook",
    "neceser organizador",
    "costurero",
    "diseño textil",
    "Mer Kilmurray",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-stone-50 text-stone-900 selection:bg-stone-200"
      >
        <Navbar />
        <CartSheet />
        <WhatsAppFloatingButton />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
