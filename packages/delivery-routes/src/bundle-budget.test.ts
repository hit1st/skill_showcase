import { describe, expect, it } from "vitest";
import {
  evaluateBundleBudget,
  HOME_ROUTE_FIRST_LOAD_JS_BUDGET_KB,
  parseHomeFirstLoadJsKb,
} from "./bundle-budget";

describe("parseHomeFirstLoadJsKb", () => {
  it("extracts homepage First Load JS from next build output", () => {
    const output = `
Route (app)                                 Size  First Load JS
┌ ○ /                                    3.92 kB         106 kB
├ ○ /_not-found                            986 B         103 kB
`;

    expect(parseHomeFirstLoadJsKb(output)).toBe(106);
  });

  it("returns null when homepage route line is missing", () => {
    expect(parseHomeFirstLoadJsKb("no routes here")).toBeNull();
  });
});

describe("evaluateBundleBudget", () => {
  it("passes when First Load JS is within budget", () => {
    expect(evaluateBundleBudget(106)).toEqual({ ok: true, failures: [] });
  });

  it("fails when First Load JS exceeds the documented limit", () => {
    const result = evaluateBundleBudget(HOME_ROUTE_FIRST_LOAD_JS_BUDGET_KB + 1);

    expect(result.ok).toBe(false);
    expect(result.failures[0]).toMatch(/exceeds 150 kB/i);
  });
});
