import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import test from "node:test";

for (const missing of [null, "question_feed", "search_questions"] as const) {
  test(
    `deployment gate: ${missing ? `rejects missing ${missing}` : "accepts empty accessible schema"}`,
    { timeout: 15000 },
    async () => {
      const requests: string[] = [];
      const server = createServer((request, response) => {
        requests.push(request.url ?? "");
        response.setHeader("Content-Type", "application/json");
        if (missing && request.url?.includes(missing)) {
          response.statusCode = 404;
          response.end(JSON.stringify({ code: "PGRST205", message: `Missing ${missing}` }));
        } else {
          response.end("[]");
        }
      });
      await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
      const address = server.address();
      assert.ok(address && typeof address !== "string");
      try {
        const child = spawn(process.execPath, ["--import", "tsx", "scripts/check-deployment.mts"], {
          cwd: new URL("../../", import.meta.url),
          env: {
            ...process.env,
            NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${address.port}`,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-public-key",
          },
          timeout: 10000,
        });
        let output = "";
        child.stdout.on("data", (chunk) => {
          output += chunk;
        });
        child.stderr.on("data", (chunk) => {
          output += chunk;
        });
        const exit = await new Promise<number | null>((resolve, reject) => {
          child.on("error", reject);
          child.on("close", resolve);
        });
        assert.equal(exit, missing ? 1 : 0, output);
        assert.equal(requests.length, 2);
        assert.ok(requests.some((path) => path.startsWith("/rest/v1/question_feed")));
        assert.ok(requests.some((path) => path.startsWith("/rest/v1/rpc/search_questions")));
        assert.ok(!output.includes("test-public-key"));
      } finally {
        server.closeAllConnections();
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    },
  );
}
