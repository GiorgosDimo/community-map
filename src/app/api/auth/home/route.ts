import { supabase } from "@/lib/supabase";
import { userFromToken, requireToken, sanitize } from "@/lib/db";

export async function POST(req: Request) {
  const user = await userFromToken(requireToken(req));
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { type, coordinates } = await req.json();
  const homeType = sanitize(type, 50);
  const [lng, lat] = Array.isArray(coordinates) ? coordinates : [null, null];

  if (!homeType || typeof lng !== "number" || typeof lat !== "number") {
    return Response.json({ error: "Invalid home location" }, { status: 400 });
  }

  await supabase
    .from("users")
    .update({ home_type: homeType, home_lng: lng, home_lat: lat })
    .eq("id", user.id);

  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await userFromToken(requireToken(req));
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await supabase
    .from("users")
    .update({ home_type: null, home_lng: null, home_lat: null })
    .eq("id", user.id);

  return Response.json({ ok: true });
}
