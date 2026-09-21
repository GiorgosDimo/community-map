import { supabase } from "./supabase";

export type DbUser = { id: string; username: string };

export async function userFromToken(token: string): Promise<DbUser | null> {
  const { data: session } = await supabase
    .from("sessions")
    .select("user_id")
    .eq("token", token)
    .single();
  if (!session) return null;
  const { data: user } = await supabase
    .from("users")
    .select("id, username")
    .eq("id", session.user_id)
    .single();
  return user ?? null;
}

export function requireToken(req: Request) {
  return req.headers.get("x-session-token") ?? "";
}
