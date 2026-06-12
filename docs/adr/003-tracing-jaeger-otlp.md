# ADR-003: Tracing Backend — OTLP → Jaeger (Local)

## Status

Accepted

## Context

Reviewers must view traces without vendor accounts.

## Decision

OpenTelemetry-compatible trace context in middleware; export path OTLP HTTP → Jaeger via `docker compose` for local dev.

## Alternatives

- **In-app-only trace store:** rejected — not production-pattern
- **Datadog-only:** rejected — reviewer friction

## Consequences

- `infra/docker/docker-compose.yml` required for local traces
- Jaeger UI at http://localhost:16686
- Production OTLP export TBD; same instrumentation boundary
