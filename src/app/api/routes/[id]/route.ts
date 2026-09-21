import { supabase } from "@/lib/supabase";
import { userFromToken, requireToken } from "@/lib/db";

async function getOwner(id: string) {
  const { data } = await supabase.from("routes").select("user_id").eq("id", id).single();
  return data?.user_id ?? null;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await userFromToken(requireToken(req));
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if ((await getOwner(id)) !== user.id) return Response.json({ error: "Forbidden" }, { status: 403 });

  const patch = await req.json();
  const { data, error } = await supabase
    .from("routes")
    .update({ name: patch.name, description: patch.description })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return Response.json({ error: error?.message ?? "Failed" }, { status: 500 });
  return Response.json({ id: data.id, userId: data.user_id, name: data.name, description: data.description, type: data.type, colour: data.colour, waypoints: data.waypoints, geometry: data.geometry, distance: data.distance, duration: data.duration });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await userFromToken(requireToken(req));
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if ((await getOwner(id)) !== user.id) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase.from("routes").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}
