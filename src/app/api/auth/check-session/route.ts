import { userFromToken } from "@/lib/db";

export async function POST(req: Request) {
  const { token } = await req.json();
  if (!token) return Response.json({ error: "Missing token" }, { status: 400 });
  const user = await userFromToken(token);
  if (!user) return Response.json({ error: "Unknown session" }, { status: 404 });
  return Response.json({ user });
}
