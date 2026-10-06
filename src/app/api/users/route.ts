import { supabase } from "@/lib/supabase";
import type { HomeLocation } from "@/lib/store";

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u");
  if (!u) return Response.json({ error: "Missing u" }, { status: 400 });
  const { data } = await supabase
    .from("users")
    .select("home_type, home_lng, home_lat")
    .eq("username", u)
    .single();
  const home: HomeLocation | null =
    data?.home_type && data.home_lng != null && data.home_lat != null
      ? { type: data.home_type, coordinates: [data.home_lng, data.home_lat] }
      : null;
  return Response.json({ home });
}
