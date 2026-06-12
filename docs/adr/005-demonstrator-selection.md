# ADR-005: Demonstrator Selection

## Status

Accepted

## Context

Target domains: streaming + cloud. Observability surface required.

## Decision

Ship four demonstrators:

1. Observability surface (required)
2. Architecture explorer — real Cloudflare routes
3. SSE delivery metrics stream
4. Performance budget panel

## Deferred

- Auth/CMS
- Geo-redundant multi-region origin
- WebSocket bidirectional chat
- RAG/AI slice

## Consequences

Each demonstrator: OTel spans, happy-path test, one failure-path test, doc update
