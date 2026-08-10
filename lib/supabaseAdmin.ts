import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente com privilégios de admin — usar SOMENTE em rotas de API do
// servidor (app/api/admin/...). NUNCA importar isso em um componente
// "use client", porque a chave service_role tem que ficar só no servidor.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
