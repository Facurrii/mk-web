"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
import { InstagramIcon, SafetyPinIcon } from "@/components/ui/icons";
import { useCartStore } from "@/store/cart-store";
import { STORE_INFO } from "@/lib/constants";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { getTotalItems, setIsOpen } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Costura", href: "/productos?categoria=costura" },
    { name: "Trabajo", href: "/productos?categoria=trabajo" },
    { name: "Cotidiano", href: "/productos?categoria=cotidiano" },
    { name: "Catálogo Completo", href: "/productos" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#631E2E]/10 bg-[#FBF4E8]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#631E2E] hover:text-[#47131F]"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Brand / Logo con Ícono de Alfiler de Gancho */}
        <div className="flex items-center">
          <Link href="/" className="group flex items-center gap-2.5 sm:gap-3.5">
            {/* Ganchito / Safety Pin Icon */}
            <div className="shrink-0 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105">
              <SafetyPinIcon className="h-10 w-10 sm:h-11 sm:w-11 drop-shadow-2xs" withHalo={true} />
            </div>

            {/* Tipografía Mer Kilmurray Design */}
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-serif tracking-wider text-[#631E2E] uppercase transition-colors group-hover:text-[#47131F] leading-tight">
                Mer Kilmurray
              </span>
              <div className="flex items-center gap-1.5 -mt-0.5">
                <span className="text-[10px] tracking-widest text-[#631E2E]/80 uppercase font-sans font-semibold">
                  DESIGN
                </span>
                <span className="text-[#B4AF3B] text-xs leading-none">•</span>
                <span className="font-script text-base sm:text-lg text-[#631E2E] lowercase leading-none">
                  textil & organización
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#631E2E]/80">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-[#631E2E] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#E2A6BA] after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action icons */}
        <div className="flex items-center space-x-4">
          <a
            href={STORE_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex text-[#631E2E]/80 hover:text-[#631E2E] transition-colors"
            title="Instagram"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>

          {/* Cart Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative p-2 text-[#631E2E] hover:text-[#47131F] transition-colors"
            aria-label="Ver carrito"
          >
            <ShoppingBag className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#631E2E] text-[11px] font-semibold text-[#FBF4E8] ring-2 ring-[#FBF4E8]">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#631E2E]/10 bg-[#FBF4E8] px-4 py-6 space-y-4 shadow-lg">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#631E2E] hover:text-[#47131F] py-1"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-[#631E2E]/10 flex items-center justify-between text-sm text-[#631E2E]/80">
            <a
              href={STORE_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#631E2E] hover:text-[#47131F]"
            >
              <InstagramIcon className="h-4 w-4" />
              <span>{STORE_INFO.instagramHandle}</span>
            </a>
            <Link
              href="/admin/login"
              className="text-xs text-[#631E2E]/60 hover:text-[#631E2E] underline"
            >
              Acceso Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
