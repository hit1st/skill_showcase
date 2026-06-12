import { readFileSync } from "node:fs";
import {
  evaluateBundleBudget,
  parseHomeFirstLoadJsKb,
} from "@showcase/delivery-routes";

const buildOutputPath = process.argv[2];

if (!buildOutputPath) {
  console.error("usage: tsx scripts/check-bundle-budget.ts <build-output.txt>");
  process.exit(1);
}

const buildOutput = readFileSync(buildOutputPath, "utf8");
const firstLoadJsKb = parseHomeFirstLoadJsKb(buildOutput);

if (firstLoadJsKb === null) {
  console.error("bundle budget check failed: homepage First Load JS not found in build output");
  process.exit(1);
}

const evaluation = evaluateBundleBudget(firstLoadJsKb);

if (!evaluation.ok) {
  console.error(evaluation.failures.join("; "));
  process.exit(1);
}

console.log(`bundle budget ok: homepage First Load JS ${firstLoadJsKb} kB`);
