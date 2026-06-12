# ADR-002: Cloudflare Workers Deploy

## Status

Accepted

## Context

Option B requires genuine edge cache semantics (`cf-cache-status`) for the architecture explorer.

## Decision

Deploy with `@opennextjs/cloudflare` and Wrangler (Phase 4). Local dev uses `next dev` and `wrangler dev` for parity checks.

## Alternatives

- **Vercel:** easier OTel integration but no genuine `cf-cache-status` narrative

## Consequences

- Workers Free limits: 100k req/day, 10 ms CPU/invocation, 3 MB bundle
- Phase 2 OTel/build spike; fallback documented if limits block shipping
- Local `wrangler dev` may not mirror all production cache headers

## Cost

$0 at expected showcase traffic on Workers Free.
