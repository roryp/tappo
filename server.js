import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { randomBytes } from "node:crypto";
import { AiDirector, snapshotSchema } from "./copilot-ai.js";

const root = dirname(fileURLToPath(import.meta.url));
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
};

function json(response, status, value) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(value));
}

export function createGameServer({
  director = new AiDirector(),
  log = console,
} = {}) {
  const token = randomBytes(32).toString("hex");
  let busy = false;
  let nextDecision = 0;
  const server = createServer(async (request, response) => {
    response.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
    response.setHeader("X-Frame-Options", "DENY");
    try {
      const allowedHosts = [
        `127.0.0.1:${server.address().port}`,
        `localhost:${server.address().port}`,
      ];
      if (!allowedHosts.includes(request.headers.host))
        return json(response, 403, { error: "Localhost only" });
      const path = new URL(request.url, `http://${request.headers.host}`)
        .pathname;
      if (path.startsWith("/api/")) {
        if (
          request.headers["x-tap-tactics"] !== "1" ||
          (request.headers.origin &&
            request.headers.origin !== `http://${request.headers.host}`)
        ) {
          return json(response, 403, {
            error: "Same-origin game requests only",
          });
        }
        if (path === "/api/ai/usage" && request.method === "GET") {
          return json(response, 200, director.usageSnapshot());
        }
        if (path === "/api/ai/status" && request.method === "GET") {
          return json(response, 200, { ...(await director.prepare()), token });
        }
        if (path !== "/api/ai/decision" || request.method !== "POST")
          return json(response, 404, { error: "Unknown API route" });
        if (request.headers["x-game-token"] !== token)
          return json(response, 403, { error: "Invalid game token" });
        if (!request.headers["content-type"]?.startsWith("application/json"))
          return json(response, 415, { error: "Expected application/json" });
        if (busy || Date.now() < nextDecision)
          return json(response, 429, {
            error: "AI decision already running or requested too soon",
          });
        busy = true;
        try {
          let body = "";
          let bytes = 0;
          for await (const chunk of request) {
            bytes += chunk.length;
            if (bytes > 16384)
              return json(response, 413, { error: "Arena snapshot too large" });
            body += chunk.toString("utf8");
          }
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch {
            return json(response, 400, { error: "Invalid JSON" });
          }
          const snapshot = snapshotSchema.safeParse(parsed);
          if (!snapshot.success)
            return json(response, 400, { error: "Invalid arena snapshot" });
          nextDecision = Date.now() + 3000;
          return json(response, 200, await director.decide(snapshot.data));
        } finally {
          busy = false;
        }
      }
      if (request.method !== "GET" && request.method !== "HEAD")
        return json(response, 405, { error: "Method not allowed" });
      const file = path === "/" ? "index.html" : path.slice(1);
      if (
        !/^(index\.html|game\.js|copilot-game\.js|copilot\.css|sw\.js|manifest\.webmanifest|assets\/[\w.-]+\.(js|css)|icons\/[\w.-]+\.png)$/.test(
          file,
        )
      ) {
        return json(response, 404, { error: "Not found" });
      }
      let contents;
      try {
        contents = await readFile(join(root, ...file.split("/")));
      } catch (error) {
        if (error.code === "ENOENT")
          return json(response, 404, { error: "Not found" });
        throw error;
      }
      const extension = file.slice(file.lastIndexOf("."));
      response.writeHead(200, {
        "Content-Type": `${types[extension]}${extension === ".png" ? "" : "; charset=utf-8"}`,
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      });
      response.end(request.method === "HEAD" ? undefined : contents);
    } catch (error) {
      log.error("Game server:", error.message);
      if (!response.headersSent) json(response, 503, { error: error.message });
      else response.destroy(error);
    }
  });
  return { server, director };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const port = Number(process.env.PORT || 8000);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("PORT must be between 1 and 65535");
  const { server, director } = createGameServer();
  server.on("error", (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  server.listen(port, "127.0.0.1", () =>
    console.log(`Tap Tactics: http://127.0.0.1:${port}`),
  );
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, async () => {
      server.close();
      try {
        await director.stop();
      } catch (error) {
        console.error("Copilot shutdown:", error.message);
        process.exitCode = 1;
      }
    });
  }
}
