import { describe, expect, it, vi, afterEach } from "vitest";
import { evaluateReadiness, probeOtlpReachable } from "./observability";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("probeOtlpReachable", () => {
  it("returns false when OTLP endpoint is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connection refused")));

    await expect(probeOtlpReachable("http://127.0.0.1:4318")).resolves.toBe(false);
  });

  it("returns true when OTLP endpoint responds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ status: 200 } as Response),
    );

    await expect(probeOtlpReachable("http://127.0.0.1:4318")).resolves.toBe(true);
  });
});

describe("evaluateReadiness", () => {
  it("returns degraded when OTLP probe fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));

    const result = await evaluateReadiness();

    expect(result.status).toBe("degraded");
    expect(result.httpStatus).toBe(503);
  });
});
