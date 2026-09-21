import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { token, username } = await req.json();
  if (!token || !username?.trim()) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }
  const name = username.trim();

  // Check if username already exists
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
  return Response.json({ user }, { status: 201 });
}
