import { createClient } from "@supabase/supabase-js";

// Client com a service role — IGNORA o RLS. Uso EXCLUSIVO no servidor
// (Route Handlers / Server Actions). Nunca importar em código de client.
// Serve o fluxo público em que não há sessão: a validação de quem pode fazer
// o quê é feita no próprio handler (ex.: validar o token da participação).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
