"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";
import { loginAction } from "@/actions/auth";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-800 mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a la tienda</span>
        </Link>

        <div className="h-12 w-12 rounded-full bg-stone-900 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
          <Lock className="h-6 w-6" />
        </div>

        <h1 className="font-serif text-2xl font-medium text-stone-900">
          Panel de Administración
        </h1>
        <p className="mt-1 text-xs text-stone-500">
          Acceso exclusivo para gestión de catálogo y pedidos
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-md rounded-xl sm:px-10 border border-stone-200">
          {error && (
            <div className="mb-4 rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-stone-700 mb-1"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="mercedes@ejemplo.com"
                className="w-full rounded-md border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-stone-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full rounded-md border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 rounded-md bg-stone-900 py-3 px-4 text-sm font-medium text-white shadow-xs hover:bg-stone-800 focus:outline-none transition disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{loading ? "Iniciando sesión..." : "Ingresar al Panel"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
