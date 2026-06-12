import { describe, expect, it } from "vitest";
import { checkHealth, checkReady, type ReadinessInput } from "./health";

const readyInput = (): ReadinessInput => ({
  otlpReachable: true,
  routesRegistered: true,
});

describe("checkHealth", () => {
  it("returns ok when the process is alive", () => {
    expect(checkHealth()).toEqual({ status: "ok" });
  });
});

describe("checkReady", () => {
  it("returns ready when all checks pass", () => {
    const result = checkReady(readyInput());

    expect(result.status).toBe("ready");
    expect(result.httpStatus).toBe(200);
    expect(result.checks.every((check) => check.ok)).toBe(true);
  });

  it("returns degraded when OTLP exporter is unreachable", () => {
    const result = checkReady({ ...readyInput(), otlpReachable: false });

    expect(result.status).toBe("degraded");
    expect(result.httpStatus).toBe(503);
    expect(result.checks.find((check) => check.name === "otlp_exporter")?.ok).toBe(
      false,
    );
  });

  it("returns degraded when origin routes are not registered", () => {
    const result = checkReady({ ...readyInput(), routesRegistered: false });

    expect(result.status).toBe("degraded");
    expect(result.httpStatus).toBe(503);
    expect(result.checks.find((check) => check.name === "origin_routes")?.ok).toBe(
      false,
    );
  });
});
