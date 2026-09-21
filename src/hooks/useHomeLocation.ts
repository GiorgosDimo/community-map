"use client";
import { useState } from "react";
import { getStartingLocation, setStartingLocation, deleteStartingLocation, type HomeLocation } from "@/lib/store";

export function useHomeLocation() {
  // Lazy init reads localStorage synchronously on first render (client only)
  const [homeLocation, setHome] = useState<HomeLocation | null>(() =>
    typeof window !== "undefined" ? getStartingLocation() : null
  );

  const save = (data: HomeLocation) => {
    setStartingLocation(data);
    setHome(data);
  };

  const deleteHome = () => {
    deleteStartingLocation();
    setHome(null);
  };

  return { homeLocation, hasLocation: !!homeLocation, save, deleteHome };
}
