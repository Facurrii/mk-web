"use client";

import { useState, useTransition } from "react";
import { KeyRound, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { changePasswordAction } from "@/actions/auth";

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-base sm:text-sm text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    if (next !== repeat) {
      setResult({ ok: false, text: "Las dos contraseñas nuevas no coinciden." });
      return;
    }
    startTransition(async () => {
      const res = await changePasswordAction(current, next);
      setResult(res.success ? { ok: true, text: res.message } : { ok: false, text: res.error });
      if (res.success) {
        setCurrent("");
        setNext("");
        setRepeat("");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-stone-200 bg-white p-6 space-y-4 shadow-xs">
      <h2 className="flex items-center gap-2 font-serif text-lg text-stone-900">
        <KeyRound className="h-4 w-4 text-stone-500" />
        Cambiar contraseña
      </h2>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
          Contraseña actual
        </label>
        <input type="password" autoComplete="current-password" required value={current}
          onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
          Contraseña nueva
        </label>
        <input type="password" autoComplete="new-password" required minLength={8} value={next}
          onChange={(e) => setNext(e.target.value)} className={inputClass} />
        <p className="text-[11px] text-stone-500">Mínimo 8 caracteres.</p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
          Repetir contraseña nueva
        </label>
        <input type="password" autoComplete="new-password" required minLength={8} value={repeat}
          onChange={(e) => setRepeat(e.target.value)} className={inputClass} />
      </div>

      {result && (
        <div className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
          result.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
          {result.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {result.text}
        </div>
      )}

      <button type="submit" disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50 transition">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Guardar contraseña nueva
      </button>
    </form>
  );
}
