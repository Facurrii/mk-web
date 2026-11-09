/**
 * Lista de mails autorizados a entrar al panel (variable de entorno ADMIN_EMAILS,
 * separados por coma). Aunque alguien consiguiera un usuario en Supabase, si su mail
 * no está acá no puede usar el admin.
 *
 * Si la variable no está configurada, se permite a cualquier usuario logueado
 * (comportamiento anterior) para no dejar a nadie afuera por error.
 */
export function getAdminEmails(): string[] | null {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw?.trim()) return null;
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  const list = getAdminEmails();
  if (list === null) return true;
  return !!email && list.includes(email.trim().toLowerCase());
}

/** Solo permite volver a rutas internas del admin (evita redirecciones a otros sitios). */
export function safeAdminRedirect(target: string | null | undefined): string {
  if (target && target.startsWith("/admin") && !target.startsWith("//")) return target;
  return "/admin";
}
