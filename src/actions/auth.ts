"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAllowedAdminEmail, safeAdminRedirect } from "@/lib/admin-emails";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = safeAdminRedirect(formData.get("redirectTo") as string);

  if (!email || !password) {
    return { error: "Por favor completá correo y contraseña." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Credenciales inválidas. Verificá tu correo y contraseña." };
  }

  // Usuario válido en Supabase pero sin permiso para el panel
  if (!isAllowedAdminEmail(email)) {
    await supabase.auth.signOut();
    return { error: "Esta cuenta no tiene acceso al panel de administración." };
  }

  redirect(redirectTo);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/**
 * Cambia la contraseña del admin logueado. Pide la actual para confirmar que es la persona.
 */
export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<{ success: true; message: string } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isAllowedAdminEmail(user.email)) {
    return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." };
  }
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "La contraseña nueva tiene que tener al menos 8 caracteres." };
  }
  if (newPassword === currentPassword) {
    return { success: false, error: "La contraseña nueva tiene que ser distinta de la actual." };
  }

  // Confirmar la contraseña actual
  const { error: checkError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (checkError) {
    return { success: false, error: "La contraseña actual no es correcta." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { success: false, error: "No se pudo cambiar la contraseña. Probá de nuevo." };
  }

  return { success: true, message: "Contraseña actualizada. La próxima vez entrá con la nueva." };
}
