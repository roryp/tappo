import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import {
  AiDirector,
  fastCandidates,
  parsePlans,
  snapshotSchema,
} from "./copilot-ai.js";
import {
  CopilotOpponent,
  CopilotUsage,
  formatUsage,
  snapshotFor,
} from "./copilot-game.js";
import { createGameServer } from "./server.js";

const snapshot = {
  time: 0,
  map: "yard",
  players: [
    {
      id: 0,
      ai: false,
      alive: true,
      vehicle: "tank",
      x: 400,
      y: 400,
      hp: 120,
      maxHp: 120,
      score: 0,
      ammo: null,
      specialAmmo: 0,
      range: 420,
    },
    {
      id: 1,
      ai: true,
      alive: true,
      vehicle: "jeep",
      x: 700,
      y: 400,
      hp: 70,
      maxHp: 70,
      score: 0,
      ammo: null,
      specialAmmo: 0,
      range: 300,
    },
  ],
};
const plans = [
  { id: 1, targetId: 0, tactic: "attack", range: 180, useSpecial: true },
];
const result = { model: "test-fast", plans };
const turn = () => new Promise((resolve) => setImmediate(resolve));
const quiet = { error() {}, info() {} };
const response = (data) =>
  new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
  });

test("decision models take precedence; disabled models and auto are excluded", () => {
  const models = [
    { id: "auto" },
    { id: "decision", policy: { state: "disabled" } },
    { id: "test-mini" },
    { id: "decision-v2" },
  ];
  assert.deepEqual(fastCandidates(models), {
    decision: true,
    models: [models[3]],
  });
  assert.deepEqual(fastCandidates(models.slice(0, 3)).models, [models[2]]);
});

test("snapshots and model output are strictly validated", () => {
  assert.equal(snapshotSchema.safeParse(snapshot).success, true);
  assert.equal(
    snapshotSchema.safeParse({ ...snapshot, prompt: "arbitrary prompt" })
      .success,
    false,
  );
  assert.equal(
    snapshotSchema.safeParse({
      ...snapshot,
      players: [snapshot.players[0], snapshot.players[0]],
    }).success,
    false,
  );
  assert.deepEqual(
    parsePlans("```json\n" + JSON.stringify({ plans }) + "\n```", snapshot),
    plans,
  );
  for (const bad of [
    [{ ...plans[0], targetId: 1 }],
    [{ ...plans[0], id: 0 }],
    [{ ...plans[0], range: 9999 }],
    [{ ...plans[0], tactic: "execute-shell" }],
    [plans[0], plans[0]],
  ])
    assert.throws(() => parsePlans(JSON.stringify({ plans: bad }), snapshot));
});

test("SDK uses no tools, cleans sessions, and selects the measured fastest valid model", async () => {
  const configs = [];
  const deleted = [];
  let number = 0;
  const client = {
    async start() {},
    async listModels() {
      return [{ id: "slow-mini" }, { id: "quick-flash" }];
    },
    async createSession(config) {
      configs.push(config);
      const sessionId = String(++number);
      let usage;
      return {
        sessionId,
        on(type, callback) {
          assert.equal(type, "assistant.usage");
          usage = callback;
        },
        async sendAndWait() {
          if (config.model === "slow-mini")
            await new Promise((resolve) => setTimeout(resolve, 30));
          usage({
            id: sessionId,
            data: {
              apiCallId: sessionId,
              inputTokens: 54,
              outputTokens: 9,
              cacheReadTokens: 0,
              cacheWriteTokens: 0,
              cost: 0.5,
              copilotUsage: { totalNanoAiu: 79200000 },
            },
          });
          return { data: { content: JSON.stringify({ plans }) } };
        },
        async abort() {},
        async disconnect() {},
      };
    },
    async deleteSession(id) {
      deleted.push(id);
    },
    async stop() {
      return [];
    },
  };
  const director = new AiDirector({ client, log: quiet });
  assert.equal((await director.prepare()).model, "quick-flash");
  assert.deepEqual((await director.decide(snapshot)).plans, plans);
  assert.equal(deleted.length, 3);
  assert.equal(director.active.size, 0);
  assert.deepEqual(configs[0].availableTools, []);
  assert.equal(configs[0].enableConfigDiscovery, false);
  assert.equal(configs[0].onPermissionRequest().kind, "reject");
  const usage = director.usageSnapshot();
  assert.equal(usage.requests, 3);
  assert.equal(usage.probes, 2);
  assert.equal(usage.active, 0);
  assert.equal(usage.reportedCalls, 3);
  assert.equal(usage.inputTokens, 162);
  assert.equal(usage.outputTokens, 27);
  assert.equal(usage.totalNanoAiu, 237600000);
  assert.equal(usage.premiumRequests, 1.5);
  assert.equal(usage.unreportedRequests, 0);
  await director.stop();
});

test("failed SDK requests abort and delete their sessions", async () => {
  const calls = [];
  const director = new AiDirector({
    client: {
      async createSession() {
        return {
          sessionId: "failed",
          on() {},
          async sendAndWait() {
            throw new Error("timeout");
          },
          async abort() {
            calls.push("abort");
          },
          async disconnect() {
            calls.push("disconnect");
          },
        };
      },
      async deleteSession() {
        calls.push("delete");
      },
    },
    log: quiet,
  });
  await assert.rejects(director.request({ id: "test" }, snapshot), /timeout/);
  assert.deepEqual(calls, ["abort", "disconnect", "delete"]);
  assert.equal(director.active.size, 0);
  assert.equal(director.usageSnapshot().failed, 1);
  assert.equal(director.usageSnapshot().unreportedRequests, 1);
  assert.equal(director.usageSnapshot().totalNanoAiu, null);
});

test("usage reports deduplicate API calls and merge late billing fields without double counting", () => {
  const director = new AiDirector({ log: quiet });
  const reports = new Map();
  const event = {
    id: "event1",
    data: { apiCallId: "call1", inputTokens: 54, outputTokens: 9 },
  };
  director.recordUsage(event, reports);
  director.recordUsage(event, reports);
  assert.equal(director.usageSnapshot().reportedCalls, 1);
  assert.equal(director.usageSnapshot().inputTokens, 54);
  assert.equal(director.usageSnapshot().totalNanoAiu, null);
  assert.equal(director.usageSnapshot().missing.totalNanoAiu, 1);
  director.recordUsage(
    {
      ...event,
      data: {
        ...event.data,
        cost: 0,
        copilotUsage: { totalNanoAiu: 79200000 },
      },
    },
    reports,
  );
  assert.equal(director.usageSnapshot().totalNanoAiu, 79200000);
  assert.equal(director.usageSnapshot().premiumRequests, 0);
  assert.equal(director.usageSnapshot().missing.totalNanoAiu, 0);
  assert.equal(director.usageSnapshot().missing.premiumRequests, 0);
  director.recordUsage(
    {
      id: "event2",
      data: { apiCallId: "call2", inputTokens: 2 },
    },
    reports,
  );
  const snapshot = director.usageSnapshot();
  assert.equal(snapshot.reportedCalls, 2);
  assert.equal(snapshot.inputTokens, 56);
  assert.equal(snapshot.missing.totalNanoAiu, 1);
  snapshot.missing.totalNanoAiu = 99;
  assert.equal(director.usageSnapshot().missing.totalNanoAiu, 1);
});

test("billed calls are counted even if model output is invalid or session creation fails", async () => {
  let handler;
  const director = new AiDirector({
    log: quiet,
    client: {
      async createSession() {
        return {
          sessionId: "invalid",
          on(type, callback) {
            handler = callback;
          },
          async sendAndWait() {
            handler({
              id: "billed",
              data: { cost: 1, copilotUsage: { totalNanoAiu: 100 } },
            });
            return { data: { content: "invalid JSON" } };
          },
          async abort() {},
          async disconnect() {},
        };
      },
      async deleteSession() {},
    },
  });
  await assert.rejects(director.request({ id: "test" }, snapshot), SyntaxError);
  assert.equal(director.usageSnapshot().totalNanoAiu, 100);
  assert.equal(director.usageSnapshot().premiumRequests, 1);
  assert.equal(director.usageSnapshot().failed, 1);
  assert.equal(director.usageSnapshot().active, 0);
  assert.equal(director.usageSnapshot().unreportedRequests, 0);
  director.client.createSession = async () => {
    throw new Error("not authenticated");
  };
  await assert.rejects(
    director.request({ id: "test" }, snapshot),
    /not authenticated/,
  );
  assert.equal(director.usageSnapshot().failed, 2);
  assert.equal(director.usageSnapshot().active, 0);
  assert.equal(director.usageSnapshot().unreportedRequests, 1);
});

test("invalid SDK cost values are surfaced and never presented as zero", () => {
  const errors = [];
  const director = new AiDirector({
    log: { error: (message) => errors.push(message) },
  });
  director.recordUsage(
    {
      id: "bad",
      data: {
        cost: -1,
        inputTokens: NaN,
        copilotUsage: { totalNanoAiu: Infinity },
      },
    },
    new Map(),
  );
  assert.equal(errors.length, 3);
  assert.equal(director.usageSnapshot().totalNanoAiu, null);
  assert.equal(director.usageSnapshot().premiumRequests, null);
});

test("cost formatting preserves nano-AIU precision, missing fields, and stale-data warnings", () => {
  const director = new AiDirector({ log: quiet });
  assert.match(formatUsage(director.usageSnapshot()), /AI cost: not reported/);
  director.recordUsage(
    {
      id: "usage",
      data: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        cost: 0,
        copilotUsage: { totalNanoAiu: 1 },
      },
    },
    new Map(),
  );
  const formatted = formatUsage(director.usageSnapshot());
  assert.match(formatted, /AI cost: 0\.000000001 AI units/);
  assert.match(formatted, /Premium usage: 0 request units/);
  assert.match(formatted, /Tokens: 0 in \/ 0 out/);
  assert.match(formatted, /not USD/);
  director.recordUsage({ id: "partial", data: { inputTokens: 1 } }, new Map());
  assert.match(
    formatUsage(director.usageSnapshot()),
    /0\.000000001 \(partial\)/,
  );
  assert.match(
    formatUsage(director.usageSnapshot(), "offline"),
    /Last reported totals/,
  );
  assert.match(formatUsage(null, "offline"), /No billing data received/);
});

test("usage monitor refreshes without model calls, retries visibly, and cancels polling on exit", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  t.mock.method(console, "error", () => {});
  const snapshots = [];
  let calls = 0;
  const totals = new AiDirector({ log: quiet }).usageSnapshot();
  const monitor = new CopilotUsage({
    render: (usage, error) => snapshots.push({ usage, error }),
    fetcher: async (url, options) => {
      assert.equal(url, "/api/ai/usage");
      assert.equal(options.cache, "no-store");
      if (++calls === 2) throw new Error("offline");
      return response({ ...totals, requests: calls });
    },
  });
  t.after(() => monitor.stop());
  monitor.start();
  monitor.start();
  await turn();
  assert.equal(calls, 1);
  t.mock.timers.tick(1000);
  await turn();
  assert.equal(calls, 2);
  assert.equal(snapshots.at(-1).error, "offline");
  assert.equal(snapshots.at(-1).usage.requests, 1);
  t.mock.timers.tick(1000);
  await turn();
  assert.equal(snapshots.at(-1).error, null);
  assert.equal(snapshots.at(-1).usage.requests, 3);
  monitor.stop();
  t.mock.timers.tick(5000);
  await turn();
  assert.equal(calls, 3);
});

test("stopped usage monitors discard late responses and do not overlap requests", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let resolve;
  let calls = 0;
  const rendered = [];
  const monitor = new CopilotUsage({
    render: (usage) => rendered.push(usage),
    fetcher: () => {
      calls++;
      return new Promise((done) => {
        resolve = done;
      });
    },
  });
  t.after(() => monitor.stop());
  monitor.start();
  t.mock.timers.tick(10000);
  await turn();
  assert.equal(calls, 1);
  monitor.stop();
  resolve(response({ requests: 999 }));
  await turn();
  assert.equal(monitor.latest, null);
  assert.deepEqual(rendered, [null]);
});

function gameState() {
  return {
    time: 0,
    map: { id: "yard" },
    over: false,
    players: snapshot.players.map((p) => ({
      ...p,
      kind: p.ai ? "copilot" : "human",
      ammo: Infinity,
      sammo: 0,
    })),
  };
}
const vehicles = {
  tank: { primary: { range: 420 } },
  jeep: { primary: { range: 300 } },
};

test("frontend polls once at a time, expires tactics and ignores stale match responses", async () => {
  let now = 0;
  let resolveDecision;
  let calls = 0;
  const ai = new CopilotOpponent({
    now: () => now,
    status() {},
    fetcher: async (url) => {
      calls++;
      return url.endsWith("status")
        ? response({ model: "test", token: "secret" })
        : new Promise((resolve) => {
            resolveDecision = resolve;
          });
    },
  });
  const state = gameState();
  ai.start(state, vehicles);
  await turn();
  ai.tick();
  ai.tick();
  assert.equal(calls, 2);
  resolveDecision(response(result));
  await turn();
  assert.equal(ai.plan(state.players[1]).tactic, "attack");
  state.players[1].vehicle = "tank";
  assert.equal(ai.plan(state.players[1]), undefined);
  state.players[1].vehicle = "jeep";
  now = 12001;
  assert.equal(ai.plan(state.players[1]), undefined);
  ai.tick();
  ai.stop();
  resolveDecision(response(result));
  await turn();
  assert.equal(ai.plans.size, 0);
  assert.equal(ai.ready, false);
});

test("CPU-only matches never call the backend; snapshots contain no credentials", () => {
  const state = gameState();
  state.players[1].kind = "cpu";
  const ai = new CopilotOpponent({
    status() {},
    fetcher() {
      assert.fail("Unexpected network request");
    },
  });
  ai.start(state, vehicles);
  ai.tick();
  assert.equal(ai.state, null);
  assert.equal(snapshotFor(state, vehicles).players[0].ammo, null);
  assert.deepEqual(Object.keys(snapshotFor(state, vehicles)), [
    "time",
    "map",
    "players",
  ]);
});

test("default browser fetch preserves its Window receiver", async (t) => {
  t.mock.method(globalThis, "fetch", function () {
    assert.equal(this, globalThis);
    return Promise.resolve(response({ model: "test", token: "secret" }));
  });
  const ai = new CopilotOpponent({ status() {} });
  ai.start(gameState(), vehicles);
  await turn();
  assert.equal(ai.ready, true);
  ai.stop();
});

test("busy backend retries without permanently disabling AI on rematch", async () => {
  let now = 0;
  const messages = [];
  let decisions = 0;
  const ai = new CopilotOpponent({
    now: () => now,
    status: (text) => messages.push(text),
    fetcher: async (url) => {
      if (url.endsWith("status"))
        return response({ model: "test", token: "secret" });
      if (++decisions === 1)
        return new Response(JSON.stringify({ error: "busy" }), {
          status: 429,
          headers: { "content-type": "application/json" },
        });
      return response(result);
    },
  });
  const state = gameState();
  ai.start(state, vehicles);
  await turn();
  ai.tick();
  await turn();
  assert.equal(ai.ready, true);
  assert.match(messages.at(-1), /backend busy/);
  now = 4001;
  ai.tick();
  await turn();
  assert.equal(ai.plan(state.players[1]).tactic, "attack");
  ai.stop();
});

test("SDK connection errors visibly disable AI and retain CPU fallback", async (t) => {
  t.mock.method(console, "error", () => {});
  const messages = [];
  const ai = new CopilotOpponent({
    status: (text) => messages.push(text),
    fetcher: async () =>
      new Response(JSON.stringify({ error: "Sign in to Copilot" }), {
        status: 503,
        headers: { "content-type": "application/json" },
      }),
  });
  ai.start(gameState(), vehicles);
  await turn();
  assert.equal(ai.ready, false);
  assert.equal(ai.plans.size, 0);
  assert.match(messages.at(-1), /CPU fallback.*Sign in/);
  ai.stop();
});

test("multiple AI slots each need a unique plan", () => {
  const multi = {
    ...snapshot,
    players: [
      ...snapshot.players,
      { ...snapshot.players[1], id: 2 },
      { ...snapshot.players[1], id: 3 },
    ],
  };
  const allPlans = [plans[0], { ...plans[0], id: 2 }, { ...plans[0], id: 3 }];
  assert.deepEqual(
    parsePlans(JSON.stringify({ plans: allPlans }), multi),
    allPlans,
  );
  assert.throws(() => parsePlans(JSON.stringify({ plans }), multi));
});

test("HTTP server protects API calls, validates state and never serves backend files", async (t) => {
  let preparations = 0;
  const usage = new AiDirector({ log: quiet }).usageSnapshot();
  const director = {
    usageSnapshot() {
      return usage;
    },
    async prepare() {
      preparations++;
      return { model: "test", selection: "decision model" };
    },
    async decide() {
      return result;
    },
  };
  const { server } = createGameServer({ director, log: quiet });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  );
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(base + "/server.js")).status, 404);
  assert.equal((await fetch(base + "/copilot-ai.js")).status, 404);
  assert.equal((await fetch(base + "/api/ai/status")).status, 403);
  assert.equal((await fetch(base + "/api/ai/usage")).status, 403);
  const usageResponse = await fetch(base + "/api/ai/usage", {
    headers: { "X-Tap-Tactics": "1" },
  });
  assert.equal(usageResponse.headers.get("cache-control"), "no-store");
  assert.deepEqual(await usageResponse.json(), usage);
  assert.equal(preparations, 0);
  assert.equal(
    (
      await fetch(base + "/api/ai/status", {
        headers: { "X-Tap-Tactics": "1", Origin: "https://example.com" },
      })
    ).status,
    403,
  );
  const status = await (
    await fetch(base + "/api/ai/status", { headers: { "X-Tap-Tactics": "1" } })
  ).json();
  const headers = {
    "X-Tap-Tactics": "1",
    "X-Game-Token": status.token,
    "Content-Type": "application/json",
  };
  assert.equal(
    (
      await fetch(base + "/api/ai/decision", {
        method: "POST",
        headers,
        body: "{}",
      })
    ).status,
    400,
  );
  const valid = await fetch(base + "/api/ai/decision", {
    method: "POST",
    headers,
    body: JSON.stringify(snapshot),
  });
  assert.equal(valid.status, 200);
  assert.deepEqual(await valid.json(), result);
  assert.equal(
    (
      await fetch(base + "/api/ai/decision", {
        method: "POST",
        headers,
        body: JSON.stringify(snapshot),
      })
    ).status,
    429,
  );
  assert.equal((await fetch(base + "/game.js")).status, 200);
});
