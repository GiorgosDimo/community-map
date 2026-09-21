"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { routesStore, type Route } from "@/lib/store";
import { getSessionToken } from "@/lib/session";

export function useRoutes() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["routes"] });

  const query = useQuery<Route[]>({ queryKey: ["routes"], queryFn: () => routesStore.getAll() });

  const add = useMutation({
    mutationFn: (r: Omit<Route, "id" | "sessionToken">) =>
      Promise.resolve(routesStore.add({ ...r, sessionToken: getSessionToken() })),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Pick<Route, "name" | "description">> }) =>
      Promise.resolve(routesStore.update(id, patch, getSessionToken())),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      Promise.resolve(routesStore.remove(id, getSessionToken())),
    onSuccess: invalidate,
  });

  return { routes: query.data ?? [], add, update, remove };
}
