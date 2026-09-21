import { supabase } from "@/lib/supabase";
import { userFromToken, requireToken } from "@/lib/db";

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

  const { name, description, coordinates } = await req.json();
  const { data, error } = await supabase
    .from("spots")
    .insert({ user_id: user.id, name, description: description ?? "", lng: coordinates[0], lat: coordinates[1] })
    .select("*")
    .single();

  if (error || !data) return Response.json({ error: error?.message ?? "Failed" }, { status: 500 });
  return Response.json(toSpot(data), { status: 201 });
}
