import { supabase } from "@/lib/supabase";
import { userFromToken, requireToken, sanitize } from "@/lib/db";

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
  const name = sanitize(body.name, 200);
  const description = sanitize(body.description, 1000);
  if (!name) return Response.json({ error: "Name is required" }, { status: 400 });
  const { data, error } = await supabase
    .from("routes")
    .insert({
      user_id: user.id,
      name,
      type: sanitize(body.type, 50),
      colour: sanitize(body.colour, 20) || "#3b82f6",
      description,
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
