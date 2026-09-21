import { describe, it, expect } from "vitest";
import { withinBbox } from "./store";

const HOME = { type: "Work", coordinates: [5.12, 52.09] as [number, number] };

describe("withinBbox", () => {
  it("accepts coords inside bbox", () => {
    expect(withinBbox(5.12, 52.09, HOME)).toBe(true);
  });
  it("rejects coords outside bbox", () => {
    expect(withinBbox(4.48, 51.92, HOME)).toBe(false);
  });
  it("accepts coords near the edge", () => {
    expect(withinBbox(5.12 + 0.07, 52.09, HOME)).toBe(true);
    expect(withinBbox(5.12 + 0.08, 52.09, HOME)).toBe(false);
  });
});
