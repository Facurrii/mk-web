// Cambia la contraseña de un usuario admin de Supabase.
// Uso (desde la carpeta del proyecto):  node scripts/reset-admin-password.mjs
// Lee las claves de .env.local. La contraseña se escribe en la terminal y no se guarda en ningún lado.
import fs from "node:fs";
import readline from "node:readline";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const AUTH = `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => rl.output.write(s.includes(question) ? s : "*");
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

const res = await fetch(`${AUTH}?per_page=50`, { headers });
const { users = [] } = await res.json();

if (users.length === 0) {
  console.log("No hay usuarios en Supabase Auth.");
  process.exit(1);
}

console.log("\nUsuarios admin:");
users.forEach((u, i) => console.log(`  ${i + 1}) ${u.email}`));

const pick = users.length === 1 ? 1 : Number(await ask("\nNúmero de usuario: "));
const user = users[pick - 1];
if (!user) {
  console.log("Opción inválida.");
  process.exit(1);
}

const pass = await ask(`Nueva contraseña para ${user.email} (mín. 8 caracteres): `, true);
const pass2 = await ask("Repetila: ", true);

if (pass.length < 8) {
  console.log("La contraseña tiene que tener al menos 8 caracteres.");
  process.exit(1);
}
if (pass !== pass2) {
  console.log("Las contraseñas no coinciden.");
  process.exit(1);
}

const upd = await fetch(`${AUTH}/${user.id}`, {
  method: "PUT",
  headers,
  body: JSON.stringify({ password: pass }),
});

console.log(upd.ok ? `\n✓ Contraseña actualizada para ${user.email}` : `\n✗ Error: ${await upd.text()}`);
