import { existsSync } from "node:fs";
import { delimiter, join } from "node:path";
import { CopilotClient } from "@github/copilot-sdk";
import { z } from "zod";

const vehicle = z.enum([
  "tank",
  "artillery",
  "missileTank",
  "nitroCar",
  "mineCar",
  "ufo",
  "mech",
  "terminator",
  "jetpack",
  "rocketeer",
  "heli",
  "jeep",
  "bomber",
  "jet",
]);
const playerId = z.number().int().min(0).max(3);
export const snapshotSchema = z
  .object({
    time: z.number().min(0).max(181),
    map: z.enum(["yard", "river", "downtown", "islands"]),
    players: z
      .array(
        z
          .object({
            id: playerId,
            ai: z.boolean(),
            alive: z.boolean(),
            vehicle,
            x: z.number().min(0).max(2000),
            y: z.number().min(0).max(2000),
            hp: z.number().min(0).max(200),
            maxHp: z.number().min(1).max(200),
            score: z.number().int().min(-100).max(100),
            ammo: z.number().int().min(0).max(100).nullable(),
            specialAmmo: z.number().int().min(0).max(100),
            range: z.number().min(0).max(1000),
          })
          .strict(),
      )
      .min(2)
      .max(4),
  })
  .strict()
  .superRefine((snapshot, ctx) => {
    if (
      new Set(snapshot.players.map((p) => p.id)).size !==
        snapshot.players.length ||
      !snapshot.players.some((p) => p.ai && p.alive)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Expected unique players and a living AI opponent",
      });
    }
  });

export const plansSchema = z
  .object({
    plans: z
      .array(
        z
          .object({
            id: playerId,
            targetId: playerId,
            tactic: z.enum(["attack", "flank-left", "flank-right", "retreat"]),
            range: z.number().min(60).max(600),
            useSpecial: z.boolean(),
          })
          .strict(),
      )
      .min(1)
      .max(3),
  })
  .strict();

export function parsePlans(text, snapshot) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const result = plansSchema.parse(JSON.parse(cleaned));
  const ai = snapshot.players.filter((p) => p.ai && p.alive);
  if (
    result.plans.length !== ai.length ||
    new Set(result.plans.map((p) => p.id)).size !== ai.length ||
    result.plans.some(
      (p) =>
        !ai.some((a) => a.id === p.id) ||
        !snapshot.players.some(
          (target) =>
            target.id === p.targetId && target.id !== p.id && target.alive,
        ),
    )
  ) {
    throw new Error(
      "Model must return one plan per living AI with a living enemy target",
    );
  }
  return result.plans;
}

export function fastCandidates(models) {
  const enabled = models.filter(
    (model) => model.id !== "auto" && model.policy?.state !== "disabled",
  );
  const decision = enabled.find((model) =>
    /decision/i.test(`${model.id} ${model.name}`),
  );
  if (decision) return { decision: true, models: [decision] };
  const shortlist = enabled.filter((model) =>
    /flash|haiku|mini|fast/i.test(`${model.id} ${model.name}`),
  );
  // Model discovery has no latency field; measure up to three speed-oriented models.
  const preferred = [
    "mai-code-1.1-flash",
    "claude-haiku-4.5",
    "gpt-5.6-sol-fast",
  ];
  shortlist.sort((a, b) => {
    const rank = (id) =>
      preferred.includes(id) ? preferred.indexOf(id) : preferred.length;
    return rank(a.id) - rank(b.id);
  });
  return {
    decision: false,
    models: (shortlist.length ? shortlist : enabled).slice(0, 3),
  };
}

function cliPath() {
  if (process.env.COPILOT_CLI_PATH) return process.env.COPILOT_CLI_PATH;
  const executable = process.platform === "win32" ? "copilot.exe" : "copilot";
  const path = (process.env.PATH || "")
    .split(delimiter)
    .map((directory) => join(directory, executable))
    .find(existsSync);
  if (!path)
    throw new Error(
      "Copilot CLI not found. Install it, sign in with copilot login, or set COPILOT_CLI_PATH.",
    );
  return path;
}

const instructions = `You are a tactical controller for a local arcade vehicle game.
Return ONLY compact JSON: {"plans":[{"id":1,"targetId":0,"tactic":"attack","range":180,"useSpecial":true}]}.
Provide exactly one plan for every living player with ai=true. Target a different living player.
Tactic must be attack, flank-left, flank-right, or retreat. Range must be 60 to 600 world units.
Choose targets, combat distance, flanking and retreat based on health, weapon range and ammo.
Self-destruct (UFO) risks a score penalty. Planes keep moving. Real-time code handles steering,
obstacle avoidance and safe weapon timing. Do not use tools, ask questions, or explain.`;

const probeSnapshot = {
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

const usageFields = [
  "inputTokens",
  "outputTokens",
  "cacheReadTokens",
  "cacheWriteTokens",
  "premiumRequests",
  "totalNanoAiu",
];

export class AiDirector {
  constructor({ client, log = console } = {}) {
    this.client = client;
    this.log = log;
    this.initializing = null;
    this.model = null;
    this.selection = null;
    this.active = new Set();
    this.usage = {
      since: new Date().toISOString(),
      requests: 0,
      probes: 0,
      active: 0,
      failed: 0,
      reportedCalls: 0,
      unreportedRequests: 0,
      ...Object.fromEntries(usageFields.map((field) => [field, null])),
      missing: Object.fromEntries(usageFields.map((field) => [field, 0])),
    };
  }

  usageSnapshot() {
    return { ...this.usage, missing: { ...this.usage.missing } };
  }

  recordUsage(event, reports) {
    const key = event.data.apiCallId || event.id;
    const previous = reports.get(key);
    const values = {
      ...event.data,
      premiumRequests: event.data.cost,
      totalNanoAiu: event.data.copilotUsage?.totalNanoAiu,
    };
    const report = { ...previous };
    if (!previous) this.usage.reportedCalls++;
    for (const field of usageFields) {
      const value = values[field];
      if (value !== undefined && (!Number.isFinite(value) || value < 0)) {
        this.log.error(`Copilot reported invalid ${field} usage`);
      } else if (value !== undefined) {
        report[field] = value;
      }
      if (report[field] !== undefined) {
        this.usage[field] =
          (this.usage[field] ?? 0) + report[field] - (previous?.[field] ?? 0);
        if (previous && previous[field] === undefined)
          this.usage.missing[field]--;
      } else if (!previous) {
        this.usage.missing[field]++;
      }
    }
    reports.set(key, report);
  }

  async prepare() {
    if (!this.initializing) {
      this.initializing = this.initialize().catch((error) => {
        this.initializing = null;
        throw error;
      });
    }
    await this.initializing;
    return { model: this.model.id, selection: this.selection };
  }

  async initialize() {
    this.client ||= new CopilotClient({ cliPath: cliPath() });
    await this.client.start();
    const candidates = fastCandidates(await this.client.listModels());
    if (!candidates.models.length)
      throw new Error("No permitted Copilot models are available");
    if (candidates.decision) {
      this.model = candidates.models[0];
      this.selection = "decision model";
    } else {
      const results = await Promise.all(
        candidates.models.map(async (model) => {
          const start = performance.now();
          try {
            await this.request(model, probeSnapshot, { probe: true });
            return { model, latency: performance.now() - start };
          } catch (error) {
            this.log.error(
              `Copilot latency probe failed for ${model.id}: ${error.message}`,
            );
            return null;
          }
        }),
      );
      const fastest = results
        .filter(Boolean)
        .sort((a, b) => a.latency - b.latency)[0];
      if (!fastest)
        throw new Error(
          "No model returned a valid tactical plan. Check Copilot authentication and quota.",
        );
      this.model = fastest.model;
      this.selection = `fastest successful probe (${Math.round(fastest.latency)} ms, ${candidates.models.length} candidates)`;
    }
    this.log.info(`Copilot opponent: ${this.model.id} — ${this.selection}`);
  }

  async request(model, snapshot, { probe = false } = {}) {
    this.usage.requests++;
    this.usage.active++;
    if (probe) this.usage.probes++;
    const reports = new Map();
    try {
      return await this.runRequest(model, snapshot, reports);
    } catch (error) {
      this.usage.failed++;
      throw error;
    } finally {
      this.usage.active--;
      if (!reports.size) this.usage.unreportedRequests++;
    }
  }

  async runRequest(model, snapshot, reports) {
    const efforts = model.supportedReasoningEfforts || [];
    const reasoningEffort = ["minimal", "low"].find((effort) =>
      efforts.includes(effort),
    );
    const session = await this.client.createSession({
      model: model.id,
      ...(reasoningEffort ? { reasoningEffort } : {}),
      availableTools: [],
      tools: [],
      mcpServers: {},
      skillDirectories: [],
      enableConfigDiscovery: false,
      onPermissionRequest: () => ({ kind: "reject" }),
      systemMessage: { mode: "replace", content: instructions },
      infiniteSessions: { enabled: false },
    });
    this.active.add(session);
    try {
      session.on("assistant.usage", (event) =>
        this.recordUsage(event, reports),
      );
      const response = await session.sendAndWait(
        { prompt: JSON.stringify(snapshot) },
        20000,
      );
      if (!response?.data?.content)
        throw new Error("Copilot returned no tactical plan");
      return parsePlans(response.data.content, snapshot);
    } catch (error) {
      await session.abort();
      throw error;
    } finally {
      try {
        await session.disconnect();
      } finally {
        try {
          await this.client.deleteSession(session.sessionId);
        } finally {
          this.active.delete(session);
        }
      }
    }
  }

  async decide(snapshot) {
    await this.prepare();
    const plans = await this.request(this.model, snapshot);
    return { model: this.model.id, plans };
  }

  async stop() {
    if (!this.client) return;
    const aborted = await Promise.allSettled(
      [...this.active].map((session) => session.abort()),
    );
    for (const result of aborted) {
      if (result.status === "rejected")
        this.log.error("Copilot abort:", result.reason);
    }
    const errors = await this.client.stop();
    for (const error of errors || [])
      this.log.error("Copilot shutdown:", error);
  }
}
