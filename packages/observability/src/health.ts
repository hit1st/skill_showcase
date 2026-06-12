export type HealthResult = {
  readonly status: "ok";
};

export const checkHealth = (): HealthResult => ({ status: "ok" });

export type ReadinessCheck = {
  readonly name: string;
  readonly ok: boolean;
  readonly detail: string;
};

export type ReadinessInput = {
  readonly otlpReachable: boolean;
  readonly routesRegistered: boolean;
};

export type ReadinessResult = {
  readonly status: "ready" | "degraded";
  readonly httpStatus: 200 | 503;
  readonly checks: readonly ReadinessCheck[];
};

const buildCheck = (
  name: string,
  ok: boolean,
  detail: string,
): ReadinessCheck => ({ name, ok, detail });

export const checkReady = (input: ReadinessInput): ReadinessResult => {
  const checks: ReadinessCheck[] = [
    buildCheck(
      "otlp_exporter",
      input.otlpReachable,
      input.otlpReachable ? "reachable" : "unreachable",
    ),
    buildCheck(
      "origin_routes",
      input.routesRegistered,
      input.routesRegistered ? "registered" : "missing",
    ),
  ];

  const allOk = checks.every((check) => check.ok);

  return {
    status: allOk ? "ready" : "degraded",
    httpStatus: allOk ? 200 : 503,
    checks,
  };
};
