import { supabase } from "@/lib/supabase";
import { validateUsername } from "@/lib/db";
import type { HomeLocation } from "@/lib/store";

export async function POST(req: Request) {
  const { token, username } = await req.json();
  if (!token) return Response.json({ error: "Missing token" }, { status: 400 });

  const validated = validateUsername(username);
  if ("error" in validated) return Response.json({ error: validated.error }, { status: 400 });

  const { data: user } = await supabase
    .from("users")
    .select("id, username, home_type, home_lng, home_lat")
    .eq("username", validated.value)
    .single();

  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  await supabase.from("sessions").upsert({ token, user_id: user.id });

  const home: HomeLocation | null =
    user.home_type && user.home_lng != null && user.home_lat != null
      ? { type: user.home_type, coordinates: [user.home_lng, user.home_lat] }
      : null;

  return Response.json({ user: { id: user.id, username: user.username, home } });
}
