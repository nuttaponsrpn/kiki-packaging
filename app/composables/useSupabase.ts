/**
 * Supabase Client Composable
 * Provides a configured Supabase client for database operations
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database";

export const useSupabase = () => {
  const config = useRuntimeConfig();

  const supabase = createClient<Database>(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  );

  return supabase;
};
