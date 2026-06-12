# Skill Showcase

Personal homepage where **the system itself** demonstrates platform engineering for streaming/cloud evaluators.

## Profile

**Godofredo C. Gatus II** · Platform engineer  
[GitHub](https://github.com/hit1st) · [Email](mailto:theimposterdeveloper@gmail.com) · [LinkedIn](https://www.linkedin.com/in/theimposterdeveloper/)

## Quick start

```bash
docker compose -f infra/docker/docker-compose.yml up -d
npm install
npm test
npm run dev
```

Open http://localhost:3000

## How to view traces locally

1. Start Jaeger: `docker compose -f infra/docker/docker-compose.yml up -d`
2. Run the app: `npm run dev`
3. Request any route, e.g. `curl -i http://localhost:3000/api/health`
4. Copy `x-trace-id` from response headers
5. Open Jaeger UI: http://localhost:16686 and search by trace ID

Readiness reflects OTLP availability: `/api/ready` returns 503 when the collector is down.

```bash
curl -s http://localhost:3000/api/ready | jq
curl -s http://localhost:3000/api/metrics | jq
```

## How to evaluate this project

1. **Clone & run** — commands above
2. **Read** — `docs/architecture.md` and `docs/adr/`
3. **Explore** — Architecture Explorer (cache / dynamic / failover toggles); Live Delivery Stream (SSE reconnect)
4. **Trace** — use the Observability panel (RED metrics, probe, Jaeger link) or follow `x-trace-id` in Jaeger
5. **Inspect** — CI workflow, tests, `/api/metrics`, degraded `/api/ready`
6. **Judge** — tradeoffs documented in ADRs vs hidden complexity

## Project structure

```text
apps/web/              Next.js app
packages/observability OTel helpers, logger, metrics, health
packages/delivery-routes Route constants and policies
packages/design-system UI tokens and primitives
infra/docker/          Jaeger for local traces
docs/                  Architecture and ADRs
```

## Phase status

- **Phase 2:** Foundation — observability, design system, homepage shell, CI
- **Phase 3:** Demonstrators — architecture explorer, SSE stream, performance budget panel
- **Phase 4 (in progress):** OTel span export + in-app observability panel; Cloudflare deploy, Lighthouse CI enforcement remain

## Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all package tests |
| `npm run build` | Production build |
| `npm run dev` | Local development server |
