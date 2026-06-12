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
| `GET /api/asset/cached` | `Cache-Control: public, max-age=3600, s-maxage=3600, stale-while-revalidate=60`; local 2nd request → `x-showcase-cache-status: HIT` |
| `GET /api/asset/dynamic` | `Cache-Control: no-store`; `x-showcase-cache-status: BYPASS` |
| `GET /api/origin/primary?simulateFailure=1` | Returns 503 |
| `GET /api/origin/fallback` | Returns 200 after failover |

Production on Cloudflare exposes `cf-cache-status` on static edge assets (`/edge-cache/demo.json`); API cache probes use `x-showcase-cache-status`. The Architecture Explorer prefers `cf-cache-status` when present.

### SSE delivery stream

`GET /api/stream` emits segment latency and buffer health events. First connection can fail (`?failOnce=1`); client reconnects with exponential backoff and pauses when buffer health drops.

### Performance budget panel

`GET /api/budget` reads checked-in Lighthouse CI summary from `apps/web/data/lighthouse-summary.json` and evaluates against showcase thresholds (performance ≥ 90, accessibility ≥ 95, LCP < 2.5s, CLS ≤ 0.1).

## Deploy (Cloudflare Workers)

Built with `@opennextjs/cloudflare` per ADR-002. Wrangler config: `apps/web/wrangler.jsonc`.

```bash
npm run build:cloudflare          # verify Worker bundle (also runs in CI)
npm run deploy:cloudflare         # requires wrangler login + Cloudflare account
```

Production cache probes: run **Cache path** — API cache (`/api/asset/cached`) shows isolate-level `x-showcase-cache-status`; edge static (`/edge-cache/demo.json`) shows CDN `cf-cache-status: MISS` → `HIT`.

**Tradeoffs:** Workers Free limits (3 MB bundle, 100k req/day). OTLP span export is disabled on Workers (`SHOWCASE_TRACING_PLATFORM=cloudflare-workers`); middleware still propagates `x-trace-id`. Production `/api/ready` skips OTLP reachability on Workers.

**CI deploy:** `.github/workflows/deploy.yml` runs after CI passes when `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets are configured.

## Security headers

Middleware applies baseline headers from `buildSecurityHeaders()` (CSP, `X-Frame-Options`, `Referrer-Policy`, COOP/CORP). See ADR-006. Static assets inherit additional headers from `apps/web/public/_headers`.

## Observability

- **Tracing:** W3C `traceparent` in middleware; OTLP export to Jaeger; spans at `edge.request`, `api.handler`, origin routes, and `sse.stream`
- **Logging:** Structured JSON via `@showcase/observability` logger
- **Metrics:** RED snapshot at `/api/metrics`; in-app panel derives rate, errors, and latency
- **Health:** Liveness `/api/health`; readiness `/api/ready` (503 when OTLP unreachable in local Node runtime)

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
