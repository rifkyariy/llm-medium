import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

type ClientOptions = {
  serviceRole?: boolean;
};

function getSupabaseKey(serviceRole: boolean) {
  if (serviceRole) {
    return SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY;
  }

  return SUPABASE_ANON_KEY ?? SUPABASE_SERVICE_ROLE_KEY;
}

export function createSupabaseClient({ serviceRole = false }: ClientOptions = {}): SupabaseClient | null {
  if (!SUPABASE_URL) {
    console.error('⚠️ Missing SUPABASE_URL environment variable. Supabase features are disabled.');
    return null;
  }

  const key = getSupabaseKey(serviceRole);

  if (!key) {
    console.error('⚠️ Missing Supabase key environment variables. Supabase features are disabled.');
    return null;
  }

  return createClient(SUPABASE_URL, key, {
    auth: {
      persistSession: false,
    },
  });
}
