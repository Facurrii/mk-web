import { createClient } from "@/lib/supabase/server";
import { ChangePasswordForm } from "./change-password-form";

export default async function AdminAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900">Mi cuenta</h1>
        <p className="text-xs text-stone-500 mt-1">
          Sesión iniciada como <span className="font-medium text-stone-700">{user?.email}</span>
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
