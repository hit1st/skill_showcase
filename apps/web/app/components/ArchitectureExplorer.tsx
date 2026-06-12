"use client";

import { Button, StatusBadge } from "@showcase/design-system";
import { DELIVERY_ROUTES } from "@showcase/delivery-routes";
import { useState } from "react";

type ProbeResult = {
  readonly label: string;
  readonly path: string;
  readonly status: number;
  readonly latencyMs: number;
  readonly cacheStatus: string;
  readonly traceId: string;
};

const readHeader = (response: Response, name: string): string =>
  response.headers.get(name) ?? "n/a";

const probe = async (label: string, path: string): Promise<ProbeResult> => {
  const startedAt = performance.now();
  const response = await fetch(path, { cache: "no-store" });

  return {
    label,
    path,
    status: response.status,
    latencyMs: Math.round(performance.now() - startedAt),
    cacheStatus: readHeader(response, "x-showcase-cache-status"),
    traceId: readHeader(response, "x-trace-id"),
  };
};

export const ArchitectureExplorer = () => {
  const [results, setResults] = useState<readonly ProbeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runScenario = async (runner: () => Promise<readonly ProbeResult[]>) => {
    setLoading(true);
    setError(null);

    try {
      setResults(await runner());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "request failed");
    } finally {
      setLoading(false);
    }
  };

  const runCacheScenario = () =>
    runScenario(async () => [
      await probe("Cached request #1", DELIVERY_ROUTES.cachedAsset),
      await probe("Cached request #2", DELIVERY_ROUTES.cachedAsset),
    ]);

  const runDynamicScenario = () =>
    runScenario(async () => [await probe("Dynamic origin", DELIVERY_ROUTES.dynamicAsset)]);

  const runFailoverScenario = () =>
    runScenario(async () => {
      const primary = await probe(
        "Primary origin (simulated 503)",
        `${DELIVERY_ROUTES.originPrimary}?simulateFailure=1`,
      );

      if (primary.status < 500) {
        return [primary];
      }

      return [primary, await probe("Fallback origin", DELIVERY_ROUTES.originFallback)];
    });

  return (
    <div className="demonstrator">
      <p className="demonstrator-copy">
        Teaching model: real HTTP routes. Production on Cloudflare exposes{" "}
        <code>cf-cache-status</code>; local dev uses <code>x-showcase-cache-status</code>.
      </p>
      <div className="demonstrator-actions">
        <Button disabled={loading} onClick={runCacheScenario}>
          Cache path
        </Button>
        <Button disabled={loading} onClick={runDynamicScenario}>
          Dynamic path
        </Button>
        <Button disabled={loading} onClick={runFailoverScenario}>
          Failover path
        </Button>
      </div>
      {error ? <p className="demonstrator-error">{error}</p> : null}
      <ul className="probe-results" aria-live="polite">
        {results.map((result) => (
          <li key={`${result.label}-${result.traceId}`}>
            <strong>{result.label}</strong>
            <span>
              {result.status} · {result.latencyMs}ms · cache {result.cacheStatus}
            </span>
            <code>{result.path}</code>
            <StatusBadge label={`trace ${result.traceId.slice(0, 8)}`} tone="neutral" />
          </li>
        ))}
      </ul>
    </div>
  );
};
