import { describe, expect, it } from "vitest";
import { getCarryoverMetrics } from "../src/lib/carryover";

describe("carryover metrics", () => {
  it("caps carryover and computes forfeited", () => {
    const metrics = getCarryoverMetrics(20, 11);
    expect(metrics.carryEstimate).toBe(11);
    expect(metrics.forfeited).toBe(9);
    expect(metrics.daysToTakeToAvoidForfeit).toBe(9);
  });

  it("does not carry negative remaining", () => {
    const metrics = getCarryoverMetrics(-2, 11);
    expect(metrics.carryEstimate).toBe(0);
    expect(metrics.forfeited).toBe(0);
  });
});
