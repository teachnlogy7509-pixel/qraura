import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: { name?: unknown; password?: unknown };
  try { body = await req.json(); } catch { return json({ error: "Invalid request" }, 400); }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (name.length < 1 || name.length > 40) return json({ error: "Naam 1 se 40 akshar ka hona chahiye" }, 400);
  if (password.length < 6 || password.length > 72) return json({ error: "Password kam se kam 6 akshar ka rakho" }, 400);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let base = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "").slice(0, 12);
  if (!base) base = "user";

  for (let i = 0; i < 10; i++) {
    const suffix = String(Math.floor(1000 + Math.random() * 9000));
    const username = base + suffix;
    const { error } = await admin.auth.admin.createUser({
      email: `${username}@qraura.app`,
      password,
      email_confirm: true,
      user_metadata: { name, username },
    });
    if (!error) return json({ username });
    const msg = (error.message || "").toLowerCase();
    if (!(msg.includes("already") || msg.includes("exists") || msg.includes("registered"))) {
      return json({ error: "Account nahi ban paaya: " + error.message }, 400);
    }
  }
  return json({ error: "Username nahi ban paaya, dobara try karo" }, 500);
});
