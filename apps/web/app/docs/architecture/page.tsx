export default function ArchitectureDocsPage() {
  return (
    <main style={{ margin: "0 auto", maxWidth: "56rem", padding: "1.5rem" }}>
      <h1>Architecture</h1>
      <p>
        Canonical documentation lives in{" "}
        <code>docs/architecture.md</code> in the repository.
      </p>
      <p>
        Phase 2 foundation: OpenTelemetry trace context via middleware, structured
        logging, RED metrics at <code>/api/metrics</code>, liveness at{" "}
        <code>/api/health</code>, readiness at <code>/api/ready</code>.
      </p>
      <p>
        See <code>docs/adr/</code> for decision records and README for local trace
        viewing with Jaeger.
      </p>
      <p>
        <a href="/">← Back to homepage</a>
      </p>
    </main>
  );
}
