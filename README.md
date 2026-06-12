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

## Shut down

```bash
# Stop the dev server: Ctrl+C in the terminal running npm run dev
docker compose -f infra/docker/docker-compose.yml down
```

Confirm Jaeger is stopped: `docker compose -f infra/docker/docker-compose.yml ps` (no running containers).

## How to view traces locally

### In the Observability panel (recommended)

1. Start Jaeger and the app (see Quick start)
2. Open http://localhost:3000 and scroll to **Observability**
3. Confirm RED metrics load (rate, errors, duration) and readiness badges show `otlp_exporter reachable`
4. Click **Probe /api/health** — counters should increment
5. Copy `trace_id` or click **Open in Jaeger** — expect span tree: `edge.request` → `api.handler`
6. Stop Jaeger (`docker compose ... down`) and refresh — readiness should flip to `degraded`; probe still returns a trace ID

### Via curl + Jaeger UI

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
4. **Trace** — follow the Observability panel walkthrough above (RED metrics, probe, Jaeger link, degraded readiness when Jaeger is down)
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
- **Phase 4 (in progress):** OTel span export, in-app observability panel, Lighthouse CI + bundle budget enforcement; Cloudflare deploy remains

## Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all package tests |
| `npm run build` | Production build |
| `npm run dev` | Local development server |
| `npm run budget:check -- build-output.txt` | Enforce homepage First Load JS budget from build output |
| `npm run lighthouse:ci` | Run Lighthouse against production server and enforce budgets |
| `docker compose -f infra/docker/docker-compose.yml down` | Stop Jaeger |
