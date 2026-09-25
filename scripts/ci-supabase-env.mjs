import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

if (!process.env.GITHUB_ENV) throw new Error("This script is for GitHub Actions only.");
const status = JSON.parse(execFileSync("supabase", ["status", "-o", "json"], { encoding: "utf8" }));
for (const key of ["API_URL", "ANON_KEY", "SERVICE_ROLE_KEY"]) {
  if (typeof status[key] !== "string") throw new Error(`Missing Supabase status field: ${key}`);
}
// These are local disposable test keys, never production credentials.
appendFileSync(
  process.env.GITHUB_ENV,
  [
    `NEXT_PUBLIC_SUPABASE_URL=${status.API_URL}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${status.ANON_KEY}`,
    `TEST_SUPABASE_SERVICE_ROLE_KEY=${status.SERVICE_ROLE_KEY}`,
    "",
  ].join("\n"),
);
