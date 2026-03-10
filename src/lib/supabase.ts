import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase Public Environment Variables");
}

export const supabase = createClient(
  supabaseUrl || 'https://ombtubibbjmrxdlbpaio.supabase.co',
  supabaseAnonKey || 'fake-key'
);

// Use service role for admin tasks (server-side only)
export const getSupabaseAdmin = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey || supabaseServiceRoleKey === 'your-supabase-service-role-key') {
    throw new Error("Chybí konfigurace databáze (SUPABASE_SERVICE_ROLE_KEY). Nastavte ji v prostředí Vercelu.");
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey);
};
