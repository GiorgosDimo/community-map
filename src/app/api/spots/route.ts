import { supabase } from "@/lib/supabase";
import { userFromToken, requireToken, sanitize } from "@/lib/db";

function toSpot(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    coordinates: [row.lng, row.lat] as [number, number],
  };
}

export async function GET() {
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json((data ?? []).map(toSpot));
}

export async function POST(req: Request) {
  const user = await userFromToken(requireToken(req));
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const name = sanitize(body.name, 200);
  const description = sanitize(body.description, 1000);
  const coordinates: [number, number] = body.coordinates;
  if (!name) return Response.json({ error: "Name is required" }, { status: 400 });
  const { data, error } = await supabase
    .from("spots")
    .insert({ user_id: user.id, name, description, lng: coordinates[0], lat: coordinates[1] })
    .select("*")
    .single();

  if (error || !data) return Response.json({ error: error?.message ?? "Failed" }, { status: 500 });
  return Response.json(toSpot(data), { status: 201 });
}
