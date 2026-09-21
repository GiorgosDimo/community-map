import { supabase } from "@/lib/supabase";
import { validateUsername } from "@/lib/db";

export async function POST(req: Request) {
  const { token, username } = await req.json();
  if (!token) return Response.json({ error: "Missing token" }, { status: 400 });

  const validated = validateUsername(username);
  if ("error" in validated) return Response.json({ error: validated.error }, { status: 400 });
  const name = validated.value;

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", name)
    .maybeSingle();

  if (existing) return Response.json({ error: "Username taken" }, { status: 409 });

  const { data: user, error } = await supabase
    .from("users")
    .insert({ username: name })
    .select("id, username")
    .single();

  if (error || !user) return Response.json({ error: "Failed to create user" }, { status: 500 });

  await supabase.from("sessions").insert({ token, user_id: user.id });
  return Response.json({ user: { ...user, home: null } }, { status: 201 });
}
