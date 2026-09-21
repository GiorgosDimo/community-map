export type Spot = {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number]; // [lng, lat]
  sessionToken: string;
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
  sessionToken: string;
};

const genId = () =>
  crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

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


function load<T>(key: string): T[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

export const spotsStore = {
  getAll(): Spot[] { return load("spots"); },
  add(spot: Omit<Spot, "id">): Spot {
    const home = getStartingLocation();
    if (home && !withinBbox(spot.coordinates[0], spot.coordinates[1], home)) {
      throw new Error("Spot coordinates outside allowed area");
    }
    const entry: Spot = { ...spot, id: genId() };
    const all = this.getAll();
    all.push(entry);
    save("spots", all);
    return entry;
  },
  update(id: string, patch: Partial<Pick<Spot, "name" | "description">>, token: string): Spot {
    const all = this.getAll();
    const idx = all.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Spot not found");
    if (all[idx].sessionToken !== token) throw new Error("Not authorized");
    all[idx] = { ...all[idx], ...patch };
    save("spots", all);
    return all[idx];
  },
  remove(id: string, token: string): void {
    const all = this.getAll();
    const spot = all.find((s) => s.id === id);
    if (!spot) throw new Error("Spot not found");
    if (spot.sessionToken !== token) throw new Error("Not authorized");
    save("spots", all.filter((s) => s.id !== id));
  },
};

export const routesStore = {
  getAll(): Route[] { return load("routes"); },
  add(route: Omit<Route, "id">): Route {
    const entry: Route = { ...route, id: genId() };
    const all = this.getAll();
    all.push(entry);
    save("routes", all);
    return entry;
  },
  update(id: string, patch: Partial<Pick<Route, "name" | "description">>, token: string): Route {
    const all = this.getAll();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Route not found");
    if (all[idx].sessionToken !== token) throw new Error("Not authorized");
    all[idx] = { ...all[idx], ...patch };
    save("routes", all);
    return all[idx];
  },
  remove(id: string, token: string): void {
    const all = this.getAll();
    const route = all.find((r) => r.id === id);
    if (!route) throw new Error("Route not found");
    if (route.sessionToken !== token) throw new Error("Not authorized");
    save("routes", all.filter((r) => r.id !== id));
  },
};
