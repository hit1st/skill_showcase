"use client";

import { Button, StatusBadge } from "@showcase/design-system";
import { useState } from "react";
import { extractTraceHeaders, jaegerTraceUrl } from "@/lib/trace-headers";

type ProbeState = {
  readonly traceId: string;
  readonly requestId: string;
  readonly jaegerUrl: string;
};

export const TraceProbe = () => {
  const [probe, setProbe] = useState<ProbeState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runProbe = async (): Promise<void> => {
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
      });
    } catch (cause) {
      setProbe(null);
      setError(cause instanceof Error ? cause.message : "probe failed");
    }
  };

  return (
    <div className="demonstrator">
      <p className="demonstrator-copy">
        Trace IDs come from <strong>this app</strong> at{" "}
        <code>localhost:3000/api/*</code> — not from Jaeger UI at{" "}
        <code>localhost:16686</code>. Click probe, then inspect the API request in
        DevTools or open Jaeger (Phase 4 will export spans there).
      </p>
      <div className="demonstrator-actions">
        <Button onClick={runProbe}>Probe /api/health</Button>
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
        </ul>
      ) : null}
    </div>
  );
};
