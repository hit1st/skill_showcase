# ADR-001: Next.js App Router

## Status

Accepted

## Context

The showcase needs edge middleware for trace propagation, API routes for real delivery paths, and interactive React demonstrators.

## Decision

Use Next.js 15 App Router with TypeScript strict mode.

## Alternatives

- **Astro:** weaker middleware/API story for trace propagation
- **Remix:** viable but smaller Cloudflare adapter ecosystem

## Consequences

- Bundle budget enforcement required (Workers Free 3 MB limit)
- Lazy-load demonstrator panels in later phases
