export type Spot = {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number]; // [lng, lat]
  userId: string;
};

export type Route = {
  id: string;
  name: string;
  type: string;
  colour: string;
  description: string;
  waypoints: [number, number][]; // [lng, lat] user-clicked points
  geometry: [number, number][];  // [lng, lat] full path (Valhalla or straight fallback)
  distance?: number;             // km from Valhalla summary
  duration?: number;             // seconds from Valhalla summary
  userId: string;
};

export type HomeLocation = { type: string; coordinates: [number, number] };

const HALF_LNG = 0.075; // ~5 km
const HALF_LAT = 0.05;  // ~5.5 km

export function homeBbox(home: HomeLocation) {
  const [lng, lat] = home.coordinates;
  return { minLng: lng - HALF_LNG, maxLng: lng + HALF_LNG, minLat: lat - HALF_LAT, maxLat: lat + HALF_LAT };
}

export function withinBbox(lng: number, lat: number, home: HomeLocation): boolean {
  const b = homeBbox(home);
  return lng >= b.minLng && lng <= b.maxLng && lat >= b.minLat && lat <= b.maxLat;
}

export function getStartingLocation(): HomeLocation | null {
  if (typeof localStorage === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("starting_location") ?? "null"); }
  catch { return null; }
}

export function setStartingLocation(data: HomeLocation): void {
  localStorage.setItem("starting_location", JSON.stringify(data));
}

export function deleteStartingLocation(): void {
  if (typeof localStorage !== "undefined") localStorage.removeItem("starting_location");
}
