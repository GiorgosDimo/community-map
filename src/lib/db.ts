import { supabase } from "./supabase";
import type { HomeLocation } from "./store";

export type DbUser = {
  id: string;
  username: string;
  home: HomeLocation | null;
};

export async function userFromToken(token: string): Promise<DbUser | null> {
  const { data: session } = await supabase
    .from("sessions")
    .select("user_id")
    .eq("token", token)
    .single();
  if (!session) return null;

  const { data: user } = await supabase
    .from("users")
    .select("id, username, home_type, home_lng, home_lat")
    .eq("id", session.user_id)
    .single();
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    home: user.home_type && user.home_lng != null && user.home_lat != null
      ? { type: user.home_type, coordinates: [user.home_lng, user.home_lat] }
      : null,
  };
}

export function requireToken(req: Request) {
  return req.headers.get("x-session-token") ?? "";
}

/** Strip control chars, trim, enforce max length. Safe for any text field. */
export function sanitize(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "") // remove control chars, keep \t \n \r
    .trim()
    .slice(0, maxLen);
}

/** Validate a username: non-empty, max 30 chars, printable only. */
export function validateUsername(raw: unknown): { value: string } | { error: string } {
  const v = sanitize(raw, 30);
  if (!v) return { error: "Username must not be empty." };
  if (/[<>"'`]/.test(v)) return { error: "Username contains invalid characters." };
  return { value: v };
}
