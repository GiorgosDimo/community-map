"use client";
import { useState } from "react";
import { getStartingLocation, setStartingLocation, deleteStartingLocation, type HomeLocation } from "@/lib/store";
import { getSessionToken } from "@/lib/session";

function authHeader() {
  return { "x-session-token": getSessionToken(), "Content-Type": "application/json" };
}

export function useHomeLocation() {
  const [homeLocation, setHome] = useState<HomeLocation | null>(() =>
    typeof window !== "undefined" ? getStartingLocation() : null
  );

  const save = (data: HomeLocation) => {
    setStartingLocation(data);
    setHome(data);
    // Persist to DB so other devices get it on next login
    fetch("/api/auth/home", {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({ type: data.type, coordinates: data.coordinates }),
    }).catch(() => {});
  };

  const deleteHome = () => {
    deleteStartingLocation();
    setHome(null);
    fetch("/api/auth/home", { method: "DELETE", headers: authHeader() }).catch(() => {});
  };

  return { homeLocation, hasLocation: !!homeLocation, save, deleteHome };
}
