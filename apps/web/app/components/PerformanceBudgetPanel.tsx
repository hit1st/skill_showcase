"use client";

import { StatusBadge } from "@showcase/design-system";
import { DELIVERY_ROUTES, type BudgetSnapshot } from "@showcase/delivery-routes";
import { useEffect, useState } from "react";

type BudgetResponse = {
  readonly snapshot: BudgetSnapshot;
  readonly evaluation: {
    readonly ok: boolean;
    readonly failures: readonly string[];
  };
  readonly bundleAnalysisPath: string;
  readonly source: string;
};

export const PerformanceBudgetPanel = () => {
  const [payload, setPayload] = useState<BudgetResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const response = await fetch(DELIVERY_ROUTES.budget);

        if (!response.ok) {
          throw new Error(`budget request failed: ${response.status}`);
        }

        setPayload((await response.json()) as BudgetResponse);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "failed to load budget");
      }
    };

    void load();
  }, []);

  if (error) {
    return <p className="demonstrator-error">{error}</p>;
  }

  if (!payload) {
    return <p className="demonstrator-copy">Loading Lighthouse CI artifact…</p>;
  }

  const { snapshot, evaluation } = payload;

  return (
    <div className="demonstrator">
      <p className="demonstrator-copy">
        Metrics from checked-in Lighthouse CI summary ({payload.source}). Targets: performance ≥
        90, accessibility ≥ 95, LCP &lt; 2.5s, CLS ≤ 0.1.
      </p>
      <div className="budget-grid">
        <div>
          <strong>Performance</strong>
          <p>{snapshot.performanceScore}</p>
        </div>
        <div>
          <strong>Accessibility</strong>
          <p>{snapshot.accessibilityScore}</p>
        </div>
        <div>
          <strong>LCP</strong>
          <p>{snapshot.lcpMs}ms</p>
        </div>
        <div>
          <strong>INP</strong>
          <p>{snapshot.inpMs}ms</p>
        </div>
        <div>
          <strong>CLS</strong>
          <p>{snapshot.cls}</p>
        </div>
      </div>
      <StatusBadge
        label={evaluation.ok ? "budget ok" : evaluation.failures.join(", ")}
        tone={evaluation.ok ? "success" : "danger"}
      />
      <p className="demonstrator-copy">
        <a className="docs-link" href={payload.bundleAnalysisPath}>
          Bundle budget details
        </a>
      </p>
    </div>
  );
};
