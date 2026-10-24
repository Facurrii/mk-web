"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
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
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-stone-50/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-stone-700 hover:text-stone-900"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Brand / Logo */}
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className="group flex flex-col">
            <span className="text-xl sm:text-2xl font-serif tracking-wider text-stone-900 uppercase">
              Mer Kilmurray
            </span>
            <span className="text-[10px] tracking-widest text-stone-500 uppercase -mt-1 group-hover:text-stone-700 transition">
              Design • Textil & Organización
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-stone-600">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-stone-950 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-stone-900 after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
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
            className="hidden sm:flex text-stone-600 hover:text-pink-700 transition-colors"
            title="Instagram"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>

          {/* Cart Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative p-2 text-stone-800 hover:text-stone-950 transition-colors"
            aria-label="Ver carrito"
          >
            <ShoppingBag className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[11px] font-semibold text-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-stone-50 px-4 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-stone-700 hover:text-stone-950 py-1"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-sm text-stone-600">
            <a
              href={STORE_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-stone-700 hover:text-pink-700"
            >
              <InstagramIcon className="h-4 w-4" />
              <span>{STORE_INFO.instagramHandle}</span>
            </a>
            <Link
              href="/admin/login"
              className="text-xs text-stone-400 hover:text-stone-600 underline"
            >
              Acceso Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
