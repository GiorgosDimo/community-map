import { describe, it, expect, beforeEach } from "vitest";
import { spotsStore, routesStore, withinBbox } from "./store";

// Mock localStorage for Node environment
const storage: Record<string, string> = {};
global.localStorage = {
  getItem: (k: string) => storage[k] ?? null,
  setItem: (k: string, v: string) => { storage[k] = v; },
  removeItem: (k: string) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
  length: 0,
  key: () => null,
} as Storage;

// Utrecht coords (inside bbox)
const INSIDE: [number, number] = [5.12, 52.09];
// Rotterdam coords (outside bbox)
const OUTSIDE: [number, number] = [4.48, 51.92];

beforeEach(() => localStorage.clear());

describe("withinBbox", () => {
  const home = { type: "Work", coordinates: [5.12, 52.09] as [number, number] };
  it("accepts coords inside bbox", () => {
    expect(withinBbox(5.12, 52.09, home)).toBe(true);
  });
  it("rejects coords outside bbox", () => {
    expect(withinBbox(4.48, 51.92, home)).toBe(false);
  });
  it("accepts coords near the edge", () => {
    expect(withinBbox(5.12 + 0.07, 52.09, home)).toBe(true);
    expect(withinBbox(5.12 + 0.08, 52.09, home)).toBe(false);
  });
});

describe("spotsStore", () => {
  const token = "tok-1";

  it("starts empty", () => {
    expect(spotsStore.getAll()).toEqual([]);
  });

  it("adds a spot and returns it with an id", () => {
    const spot = spotsStore.add({ name: "Coffee corner", description: "Nice espresso", coordinates: INSIDE, sessionToken: token });
    expect(spot.id).toBeTruthy();
    expect(spotsStore.getAll()).toHaveLength(1);
  });

  it("rejects a spot outside the bounding box", () => {
    expect(() => spotsStore.add({ name: "Rotterdam cafe", description: "nope", coordinates: OUTSIDE, sessionToken: token }))
      .toThrow("outside allowed area");
  });

  it("updates name/description for the right token", () => {
    const spot = spotsStore.add({ name: "Old name", description: "Old desc", coordinates: INSIDE, sessionToken: token });
    const updated = spotsStore.update(spot.id, { name: "New name" }, token);
    expect(updated.name).toBe("New name");
    expect(updated.description).toBe("Old desc");
  });

  it("blocks update from a different token", () => {
    const spot = spotsStore.add({ name: "Mine", description: "", coordinates: INSIDE, sessionToken: token });
    expect(() => spotsStore.update(spot.id, { name: "Hacked" }, "other-token")).toThrow("Not authorized");
  });

  it("removes a spot with the correct token", () => {
    const spot = spotsStore.add({ name: "Temp", description: "", coordinates: INSIDE, sessionToken: token });
    spotsStore.remove(spot.id, token);
    expect(spotsStore.getAll()).toHaveLength(0);
  });

  it("blocks remove from a different token", () => {
    const spot = spotsStore.add({ name: "Temp", description: "", coordinates: INSIDE, sessionToken: token });
    expect(() => spotsStore.remove(spot.id, "other-token")).toThrow("Not authorized");
  });

  it("persists multiple spots", () => {
    spotsStore.add({ name: "A", description: "", coordinates: INSIDE, sessionToken: token });
    spotsStore.add({ name: "B", description: "", coordinates: [5.13, 52.10], sessionToken: token });
    expect(spotsStore.getAll()).toHaveLength(2);
  });
});

describe("routesStore", () => {
  const token = "tok-1";
  const base = { name: "Coffee loop", type: "walk", colour: "#e63946", description: "Nice walk", waypoints: [] as [number, number][], geometry: [] as [number, number][], sessionToken: token };

  it("adds a route and returns it with an id", () => {
    const r = routesStore.add(base);
    expect(r.id).toBeTruthy();
    expect(routesStore.getAll()).toHaveLength(1);
  });

  it("updates with correct token", () => {
    const r = routesStore.add(base);
    const updated = routesStore.update(r.id, { name: "Updated loop" }, token);
    expect(updated.name).toBe("Updated loop");
  });

  it("blocks update from wrong token", () => {
    const r = routesStore.add(base);
    expect(() => routesStore.update(r.id, { name: "X" }, "bad")).toThrow("Not authorized");
  });

  it("removes with correct token", () => {
    const r = routesStore.add(base);
    routesStore.remove(r.id, token);
    expect(routesStore.getAll()).toHaveLength(0);
  });

  it("throws when removing non-existent route", () => {
    expect(() => routesStore.remove("ghost-id", token)).toThrow("not found");
  });
});
