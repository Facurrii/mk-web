import { createClient } from "@/lib/supabase/server";
import { isAllowedAdminEmail } from "@/lib/admin-emails";

/**
 * Verifica que haya un admin logueado.
 * Las Server Actions son endpoints públicos: cualquiera puede invocarlas
 * aunque no vea el botón. El middleware solo protege las páginas /admin,
 * así que toda acción que use la service role key tiene que llamar a esto primero.
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return !!user && isAllowedAdminEmail(user.email);
  } catch {
    return false;
  }
}

export const UNAUTHORIZED = {
  success: false as const,
  error: "Tu sesión expiró. Volvé a iniciar sesión en el panel.",
};
