"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSessionToken } from "@/lib/session";
import type { Spot } from "@/lib/store";

function token() { return getSessionToken(); }
function authHeaders() { return { "x-session-token": token(), "Content-Type": "application/json" }; }

export function useSpots() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["spots"] });

  const query = useQuery<Spot[]>({
    queryKey: ["spots"],
    queryFn: () => fetch("/api/spots").then(r => r.json()),
  });

  const add = useMutation({
    mutationFn: (s: Omit<Spot, "id" | "userId">) =>
      fetch("/api/spots", { method: "POST", headers: authHeaders(), body: JSON.stringify(s) })
        .then(r => { if (!r.ok) throw new Error("Failed to add spot"); return r.json(); }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Pick<Spot, "name" | "description">> }) =>
      fetch(`/api/spots/${id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(patch) })
        .then(r => { if (!r.ok) throw new Error("Failed to update spot"); return r.json(); }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/spots/${id}`, { method: "DELETE", headers: { "x-session-token": token() } })
        .then(r => { if (!r.ok) throw new Error("Failed to delete spot"); }),
    onSuccess: invalidate,
  });

  return { spots: query.data ?? [], add, update, remove };
}
