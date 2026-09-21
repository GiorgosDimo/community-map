import { supabase } from "@/lib/supabase";
import { userFromToken, requireToken } from "@/lib/db";

function toRoute(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    colour: row.colour,
    description: row.description,
    waypoints: row.waypoints,
    geometry: row.geometry,
    distance: row.distance,
    duration: row.duration,
  };
}

export async function GET() {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json((data ?? []).map(toRoute));
}

export async function POST(req: Request) {
  const user = await userFromToken(requireToken(req));
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabase
    .from("routes")
    .insert({
      user_id: user.id,
      name: body.name,
      type: body.type ?? "",
      colour: body.colour ?? "#3b82f6",
      description: body.description ?? "",
      waypoints: body.waypoints ?? [],
      geometry: body.geometry ?? [],
      distance: body.distance ?? null,
      duration: body.duration ?? null,
    })
    .select("*")
    .single();

  if (error || !data) return Response.json({ error: error?.message ?? "Failed" }, { status: 500 });
  return Response.json(toRoute(data), { status: 201 });
}
