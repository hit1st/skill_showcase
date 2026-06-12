"use client";

import { Button, StatusBadge } from "@showcase/design-system";
import type { MetricsSnapshot } from "@showcase/observability/metrics";
import { deriveRedSummary } from "@showcase/observability/red-summary";
import { formatSpanTree, probeSpanTree } from "@showcase/observability/span-tree";
import { useCallback, useEffect, useState } from "react";
import { extractTraceHeaders, jaegerTraceUrl } from "@/lib/trace-headers";

type ReadinessResult = {
  readonly status: "ready" | "degraded";
  readonly httpStatus: 200 | 503;
  readonly checks: readonly {
    readonly name: string;
    readonly ok: boolean;
    readonly detail: string;
  }[];
};

type ProbeState = {
  readonly traceId: string;
  readonly requestId: string;
  readonly jaegerUrl: string;
  readonly route: string;
};

const formatRate = (value: number): string => `${(value * 100).toFixed(1)}%`;

const fetchMetrics = async (): Promise<MetricsSnapshot> => {
  const response = await fetch("/api/metrics", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`metrics request failed: ${response.status}`);
  }

  return (await response.json()) as MetricsSnapshot;
};

const fetchReadiness = async (): Promise<ReadinessResult> => {
  const response = await fetch("/api/ready", { cache: "no-store" });

  if (!response.ok && response.status !== 503) {
    throw new Error(`readiness request failed: ${response.status}`);
  }

  return (await response.json()) as ReadinessResult;
};

export const ObservabilityPanel = () => {
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null);
  const [probe, setProbe] = useState<ProbeState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshSurface = useCallback(async (): Promise<void> => {
    const [nextMetrics, nextReadiness] = await Promise.all([
      fetchMetrics(),
      fetchReadiness(),
    ]);

    setMetrics(nextMetrics);
    setReadiness(nextReadiness);
  }, []);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        await refreshSurface();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "failed to load observability data");
      }
    };

    void load();
  }, [refreshSurface]);

  const runProbe = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      const { traceId, requestId } = extractTraceHeaders(response.headers);

      if (!traceId || !requestId) {
        throw new Error("missing x-trace-id or x-request-id on /api/health response");
      }

      setProbe({
        traceId,
        requestId,
        jaegerUrl: jaegerTraceUrl(traceId),
        route: "/api/health",
      });

      await refreshSurface();
    } catch (cause) {
      setProbe(null);
      setError(cause instanceof Error ? cause.message : "probe failed");
    } finally {
      setLoading(false);
    }
  };

  const red = metrics ? deriveRedSummary(metrics) : null;
  const spanTree = probe ? probeSpanTree(probe.route) : null;
  const spanLines = spanTree ? formatSpanTree(spanTree) : [];

  return (
    <div className="demonstrator">
      <p className="demonstrator-copy">
        RED metrics from <code>/api/metrics</code>, readiness from <code>/api/ready</code>, and
        trace export to Jaeger via OTLP. Start the collector with{" "}
        <code>docker compose -f infra/docker/docker-compose.yml up -d</code>, probe, then open the
        trace in Jaeger at <code>localhost:16686</code>.
      </p>

      {red ? (
        <div className="budget-grid" aria-label="RED metrics snapshot">
          <div>
            <strong>Rate</strong>
            <p>{red.requestTotal} req</p>
          </div>
          <div>
            <strong>Errors</strong>
            <p>
              {red.errorTotal} ({formatRate(red.errorRate)})
            </p>
          </div>
          <div>
            <strong>Duration</strong>
            <p>{red.averageLatencyMs.toFixed(1)}ms avg</p>
          </div>
        </div>
      ) : (
        <p className="demonstrator-copy">Loading metrics snapshot…</p>
      )}

      {readiness ? (
        <div className="stream-meta" aria-label="Readiness checks">
          <StatusBadge
            label={`readiness ${readiness.status}`}
            tone={readiness.status === "ready" ? "success" : "danger"}
          />
          {readiness.checks.map((check) => (
            <StatusBadge
              key={check.name}
              label={`${check.name} ${check.detail}`}
              tone={check.ok ? "success" : "danger"}
            />
          ))}
        </div>
      ) : null}

      <div className="demonstrator-actions">
        <Button disabled={loading} onClick={runProbe}>
          Probe /api/health
        </Button>
      </div>

      {error ? <p className="demonstrator-error">{error}</p> : null}

      {probe ? (
        <ul className="probe-results">
          <li>
            <strong>trace_id</strong>
            <code>{probe.traceId}</code>
            <StatusBadge label={`request ${probe.requestId.slice(0, 8)}`} tone="neutral" />
            <a className="docs-link" href={probe.jaegerUrl} target="_blank" rel="noreferrer">
              Open in Jaeger
            </a>
          </li>
          {spanLines.length > 0 ? (
            <li>
              <strong>span tree</strong>
              <pre className="span-tree">{spanLines.join("\n")}</pre>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
};
