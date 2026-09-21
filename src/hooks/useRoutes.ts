"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSessionToken } from "@/lib/session";
import type { Route } from "@/lib/store";

function token() { return getSessionToken(); }
function authHeaders() { return { "x-session-token": token(), "Content-Type": "application/json" }; }

export function useRoutes() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["routes"] });

  const query = useQuery<Route[]>({
    queryKey: ["routes"],
    queryFn: () => fetch("/api/routes").then(r => r.json()),
  });

  const add = useMutation({
    mutationFn: (r: Omit<Route, "id" | "userId">) =>
      fetch("/api/routes", { method: "POST", headers: authHeaders(), body: JSON.stringify(r) })
        .then(res => { if (!res.ok) throw new Error("Failed to add route"); return res.json(); }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Pick<Route, "name" | "description">> }) =>
      fetch(`/api/routes/${id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(patch) })
        .then(r => { if (!r.ok) throw new Error("Failed to update route"); return r.json(); }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/routes/${id}`, { method: "DELETE", headers: { "x-session-token": token() } })
        .then(r => { if (!r.ok) throw new Error("Failed to delete route"); }),
    onSuccess: invalidate,
  });

  return { routes: query.data ?? [], add, update, remove };
}
