# ADR-004: Sampling Strategy

## Status

Accepted

## Context

Tracing must be useful in dev and bounded in prod.

## Decision

- **Dev:** 100% head sampling
- **Prod:** 10% head sampling + always sample errors + always sample `/api/*` routes

## Alternatives

- **Tail sampling:** deferred — requires collector pipeline

## Consequences

- Custom sampler in Phase 3/4 when export is wired
- Demonstrator routes remain fully observable for evaluators
