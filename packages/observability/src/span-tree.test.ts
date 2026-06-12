import { describe, expect, it } from "vitest";
import { formatSpanTree, probeSpanTree } from "./span-tree";

describe("probeSpanTree", () => {
  it("returns the health probe span hierarchy", () => {
    expect(probeSpanTree("/api/health")).toEqual([
      { name: "edge.request", children: [{ name: "api.handler" }] },
    ]);
  });

  it("returns null for unknown routes", () => {
    expect(probeSpanTree("/api/unknown")).toBeNull();
  });
});

describe("formatSpanTree", () => {
  it("renders nested spans as indented lines", () => {
    const lines = formatSpanTree([
      {
        name: "edge.request",
        children: [{ name: "api.handler", children: [{ name: "origin.asset" }] }],
      },
    ]);

    expect(lines).toEqual(["edge.request", "└── api.handler", "    └── origin.asset"]);
  });
});
