import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { token, username } = await req.json();
  if (!token || !username?.trim()) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, username")
    .eq("username", username.trim())
    .single();

  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  // upsert so re-adding an existing token is a no-op
  await supabase.from("sessions").upsert({ token, user_id: user.id });
  return Response.json({ user });
}
