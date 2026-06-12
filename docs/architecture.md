# Showcase Site Architecture

This homepage is a technical artifact: streaming/cloud delivery patterns, observability, and engineering discipline are demonstrated in code — not marketing copy.

## System context

```text
Browser → Cloudflare Edge (CDN + Worker) → Next.js route handlers → packages/*
                                      ↘ OTLP → Jaeger (local dev)
```

## Module boundaries

| Module | Responsibility |
|--------|----------------|
| `apps/web` | HTTP surface, middleware trace injection, API routes, demonstrator UI |
| `packages/observability` | Logger, RED metrics, health/readiness, trace context helpers |
| `packages/delivery-routes` | Cache policies, route constants, stream events, budget parsing |
| `packages/design-system` | Tokens and UI primitives |

## Demonstrators (Phase 3)

### Architecture explorer

Real HTTP routes — no simulated state machine:

| Route | Behavior |
|-------|----------|
| `GET /api/asset/cached` | `Cache-Control: public, max-age=3600, stale-while-revalidate=60`; 2nd request → `x-showcase-cache-status: HIT` |
| `GET /api/asset/dynamic` | `Cache-Control: no-store`; `x-showcase-cache-status: BYPASS` |
| `GET /api/origin/primary?simulateFailure=1` | Returns 503 |
| `GET /api/origin/fallback` | Returns 200 after failover |

Production on Cloudflare exposes `cf-cache-status`; local dev uses `x-showcase-cache-status`.

### SSE delivery stream

`GET /api/stream` emits segment latency and buffer health events. First connection can fail (`?failOnce=1`); client reconnects with exponential backoff and pauses when buffer health drops.

### Performance budget panel

`GET /api/budget` reads checked-in Lighthouse CI summary from `apps/web/data/lighthouse-summary.json` and evaluates against showcase thresholds (performance ≥ 90, accessibility ≥ 95, LCP < 2.5s, CLS ≤ 0.1).

## Observability

- **Tracing:** W3C `traceparent` in middleware; OTLP export to Jaeger; spans at `edge.request`, `api.handler`, origin routes, and `sse.stream`
- **Logging:** Structured JSON via `@showcase/observability` logger
- **Metrics:** RED snapshot at `/api/metrics`; in-app panel derives rate, errors, and latency
- **Health:** Liveness `/api/health`; readiness `/api/ready` (503 when OTLP unreachable)

### Local trace viewing

```bash
docker compose -f infra/docker/docker-compose.yml up -d
npm install && npm run dev
```

Jaeger UI: http://localhost:16686

Trigger a demonstrator, copy `x-trace-id`, search in Jaeger. Expect nested spans: `edge.request` → `api.handler` → route-specific child (e.g. `origin.asset`, `sse.stream`).

## Bundle budget

<a id="bundle-budget"></a>

First Load JS target: homepage ≤ **150 kB** (current ~106 kB). CI enforces via `npm run budget:check` after `next build`.

Lighthouse thresholds enforced in CI (`npm run lighthouse:ci`): performance ≥ 90, accessibility ≥ 95, LCP < 2.5s, CLS ≤ 0.1. Results are written to `apps/web/data/lighthouse-summary.json` for the Performance Budget panel.

## Deferred

- Geo-redundant multi-region origin
- Auth/CMS

See `docs/adr/` for decisions and tradeoffs.
