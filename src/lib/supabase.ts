import { createClient } from "@supabase/supabase-js";

// Server-only: used exclusively in API route handlers, never imported by client components.
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);
