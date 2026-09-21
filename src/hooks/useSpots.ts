"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { spotsStore, type Spot } from "@/lib/store";
import { getSessionToken } from "@/lib/session";

export function useSpots() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["spots"] });

  const query = useQuery<Spot[]>({ queryKey: ["spots"], queryFn: () => spotsStore.getAll() });

  const add = useMutation({
    mutationFn: (s: Omit<Spot, "id" | "sessionToken">) =>
      Promise.resolve(spotsStore.add({ ...s, sessionToken: getSessionToken() })),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Pick<Spot, "name" | "description">> }) =>
      Promise.resolve(spotsStore.update(id, patch, getSessionToken())),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      Promise.resolve(spotsStore.remove(id, getSessionToken())),
    onSuccess: invalidate,
  });

  return { spots: query.data ?? [], add, update, remove };
}
