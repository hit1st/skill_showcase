# ADR-006: Security headers

## Status

Accepted — Phase 4e

## Context

The showcase deploys to a public URL. Evaluators and bots hit HTML, API, and static assets. Baseline headers reduce clickjacking, MIME sniffing, and unintended embeds without adding auth complexity.

## Decision

Apply a shared header map from `buildSecurityHeaders()` in Next.js middleware for all matched routes. Static edge-cache assets inherit overlapping headers from `apps/web/public/_headers`.

Headers:

| Header | Value | Rationale |
|--------|-------|-----------|
| `Content-Security-Policy` | `default-src 'self'`; inline script/style for Next.js hydration; `connect-src` allows local Jaeger OTLP and production origin | Blocks arbitrary third-party loads; documents Jaeger dev exception |
| `X-Frame-Options` | `DENY` | Prevents framing |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME confusion |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage |
| `Permissions-Policy` | camera/mic/geo disabled | No feature need on homepage |

## Alternatives considered

- **Cloudflare Transform Rules only** — headers invisible in repo; rejected for show-don't-tell
- **Strict CSP without `'unsafe-inline'`** — requires nonce pipeline; deferred for bundle complexity
- **HSTS in app** — Cloudflare edge terminates TLS; HSTS managed at zone level when custom domain is added

## Consequences

- CSP must be updated when adding external observability or analytics endpoints
- Middleware does not run for `_next/static` (matcher exclusion); `_headers` covers static assets
- Lighthouse accessibility unaffected; security headers do not replace a11y work (skip link, focus states)
