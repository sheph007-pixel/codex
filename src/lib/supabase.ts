import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { mockSupabase } from "./mock-supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export const supabase = isSupabaseConfigured()
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : (mockSupabase as unknown as ReturnType<typeof createClient<Database>>);
