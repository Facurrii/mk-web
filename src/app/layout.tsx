import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, Dancing_Script } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartSheet } from "@/components/shop/cart-sheet";
import { WhatsAppFloatingButton } from "@/components/shop/whatsapp-floating-button";

// Tipografía para titulares (equivalente web a Black Mango)
const serifFont = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

// Tipografía para textos y navegación
const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Tipografía de acento caligráfico (equivalente web a Backwards Script)
const scriptFont = Dancing_Script({
  variable: "--font-script",
  subsets: ["latin"],
  display: "swap",
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
      className={`${serifFont.variable} ${sansFont.variable} ${scriptFont.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#FBF4E8] text-[#2A1A1E] selection:bg-[#E2A6BA]/40 selection:text-[#631E2E]"
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
