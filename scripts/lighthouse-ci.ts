import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import {
  evaluateBudget,
  parseLighthouseSummary,
  toLighthouseSummary,
} from "@showcase/delivery-routes";
import { buildLighthouseServerEnv } from "@showcase/observability";

const SERVER_PORT = "3456";
const APP_URL = `http://127.0.0.1:${SERVER_PORT}`;
const SUMMARY_PATH = resolve("apps/web/data/lighthouse-summary.json");

const waitForServer = async (url: string, attempts = 30): Promise<void> => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1_000) });

      if (response.ok) {
        return;
      }
    } catch {
      // Retry until the production server is ready.
    }

    await delay(1_000);
  }

  throw new Error(`server not ready at ${url}`);
};

const startServer = (): ChildProcess => {
  const child = spawn("npm", ["run", "start", "--workspace=@showcase/web"], {
    stdio: "inherit",
    env: buildLighthouseServerEnv(process.env, SERVER_PORT),
  });

  child.on("error", (error) => {
    console.error("failed to start production server", error);
    process.exit(1);
  });

  return child;
};

const stopServer = async (child: ChildProcess): Promise<void> => {
  if (child.pid) {
    child.kill("SIGTERM");
  }

  await delay(500);
};

/**
 * I/O boundary: shells out to Lighthouse CLI to avoid programmatic API quirks across Node versions.
 */
const runLighthouse = (url: string, reportPath: string): void => {
  execFileSync(
    "npx",
    [
      "lighthouse",
      url,
      "--output=json",
      `--output-path=${reportPath}`,
      "--chrome-flags=--headless --no-sandbox",
      "--only-categories=performance,accessibility",
      "--quiet",
    ],
    {
      stdio: "inherit",
      env: process.env,
    },
  );
};

const run = async (): Promise<void> => {
  const reportPath = resolve(tmpdir(), `showcase-lighthouse-${Date.now()}.json`);
  const server = startServer();

  try {
    await waitForServer(`${APP_URL}/api/health`);
    runLighthouse(APP_URL, reportPath);

    const report = JSON.parse(readFileSync(reportPath, "utf8")) as {
      categories: {
        performance: { score: number | null };
        accessibility: { score: number | null };
      };
      audits: Readonly<Record<string, { numericValue?: number }>>;
    };

    const summary = toLighthouseSummary(report);

    writeFileSync(SUMMARY_PATH, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

    const evaluation = evaluateBudget(parseLighthouseSummary(summary));

    if (!evaluation.ok) {
      console.error(evaluation.failures.join("; "));
      process.exit(1);
    }

    console.log(
      `lighthouse budget ok: performance ${Math.round(summary.performanceScore * 100)}, accessibility ${Math.round(summary.accessibilityScore * 100)}`,
    );
  } finally {
    try {
      unlinkSync(reportPath);
    } catch {
      // Best-effort cleanup of the temporary Lighthouse report.
    }

    await stopServer(server);
  }
};

void run();
