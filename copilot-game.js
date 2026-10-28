export function snapshotFor(state, vehicles) {
  return {
    time: Math.round(state.time),
    map: state.map.id,
    players: state.players.map((player) => ({
      id: player.id,
      ai: player.kind === "copilot",
      alive: player.alive,
      vehicle: player.vehicle,
      x: Math.round(player.x),
      y: Math.round(player.y),
      hp: Math.max(0, Math.round(player.hp)),
      maxHp: player.maxHp,
      score: player.score,
      ammo: Number.isFinite(player.ammo) ? player.ammo : null,
      specialAmmo: player.sammo,
      range: vehicles[player.vehicle].primary.range ?? 110,
    })),
  };
}

export function formatUsage(usage, error) {
  if (!usage) {
    return error
      ? `Copilot costs unavailable: ${error}. No billing data received.`
      : "Copilot costs: waiting for SDK usage reports...";
  }
  const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 9 });
  const metric = (field, divisor = 1) => {
    if (usage[field] === null) return "not reported";
    const value = number.format(usage[field] / divisor);
    return usage.missing[field] > 0 || usage.unreportedRequests > 0
      ? `${value} (partial)`
      : value;
  };
  const heading = error
    ? `Costs offline: ${error}. Last reported totals:\n`
    : "";
  return (
    heading +
    `AI cost: ${metric("totalNanoAiu", 1e9)} AI units | Premium usage: ${metric("premiumRequests")} request units\n` +
    `${number.format(usage.requests)} requests (${number.format(usage.probes)} probes, ${number.format(usage.active)} in flight, ${number.format(usage.failed)} failed) | Tokens: ${metric("inputTokens")} in / ${metric("outputTokens")} out\n` +
    `Cache tokens: ${metric("cacheReadTokens")} read / ${metric("cacheWriteTokens")} written | ${number.format(usage.reportedCalls)} reported model calls\n` +
    "Server-run totals, all game tabs including probes. SDK units, not USD. Pending charges may arrive later."
  );
}

export class CopilotUsage {
  constructor({ render, fetcher = (...args) => globalThis.fetch(...args) }) {
    this.render = render;
    this.fetcher = fetcher;
    this.generation = 0;
    this.latest = null;
    this.error = null;
    this.started = false;
  }

  start() {
    if (this.controller) return;
    this.started = true;
    this.controller = new AbortController();
    this.render(this.latest, this.error);
    void this.poll(this.generation);
  }

  stop() {
    this.generation++;
    clearTimeout(this.timer);
    this.controller?.abort();
    this.controller = null;
  }

  async poll(generation) {
    try {
      const response = await this.fetcher("/api/ai/usage", {
        headers: { "X-Tap-Tactics": "1" },
        signal: AbortSignal.any([
          this.controller.signal,
          AbortSignal.timeout(3000),
        ]),
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error(`Usage endpoint returned HTTP ${response.status}`);
      const usage = await response.json();
      if (generation !== this.generation) return;
      this.latest = usage;
      this.error = null;
      this.render(this.latest, null);
    } catch (error) {
      if (generation !== this.generation) return;
      if (!this.error) console.error("Copilot usage unavailable:", error);
      this.error = error.message;
      this.render(this.latest, this.error);
    } finally {
      if (generation === this.generation && this.controller) {
        this.timer = setTimeout(() => void this.poll(generation), 1000);
      }
    }
  }
}

export class CopilotOpponent {
  constructor({
    status,
    fetcher = (...args) => globalThis.fetch(...args),
    now = () => performance.now(),
  }) {
    this.status = status;
    this.fetcher = fetcher;
    this.now = now;
    this.plans = new Map();
    this.generation = 0;
  }

  stop() {
    this.generation++;
    this.controller?.abort();
    this.state = null;
    this.ready = false;
    this.pending = false;
    this.expiredReported = false;
    this.plans.clear();
    this.status("");
  }

  start(state, vehicles) {
    this.stop();
    if (!state.players.some((player) => player.kind === "copilot")) return;
    this.state = state;
    this.vehicles = vehicles;
    this.nextRequest = 0;
    this.status(
      "Copilot: connecting and selecting model; CPU controls opponents meanwhile.",
    );
    const generation = this.generation;
    this.controller = new AbortController();
    void this.connect(generation);
  }

  async connect(generation) {
    try {
      const result = await this.json(
        "/api/ai/status",
        { method: "GET" },
        60000,
      );
      if (generation !== this.generation) return;
      this.token = result.token;
      this.model = result.model;
      this.ready = true;
      this.status(
        `Copilot: ${this.model} — ${result.selection}; CPU control while awaiting tactics.`,
      );
    } catch (error) {
      this.fail(error, generation);
    }
  }

  async json(url, options, timeout) {
    const response = await this.fetcher(url, {
      ...options,
      signal: AbortSignal.any([
        this.controller.signal,
        AbortSignal.timeout(timeout),
      ]),
      headers: { "X-Tap-Tactics": "1", ...options.headers },
      cache: "no-store",
    });
    if (!response.ok) {
      const detail = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? (await response.json()).error
        : "Run npm start to enable the Copilot backend.";
      const error = new Error(detail || `HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  fail(error, generation) {
    if (generation !== this.generation) return;
    this.ready = false;
    this.plans.clear();
    console.error("Copilot opponent unavailable:", error);
    this.status(
      `Copilot unavailable — CPU fallback. ${error.message} Start a new match to retry.`,
    );
  }

  tick() {
    if (
      !this.state ||
      this.state.over ||
      !this.ready ||
      this.pending ||
      this.now() < this.nextRequest
    )
      return;
    if (
      !this.state.players.some(
        (player) => player.kind === "copilot" && player.alive,
      ) ||
      this.state.players.filter((player) => player.alive).length < 2
    )
      return;
    this.pending = true;
    this.nextRequest = this.now() + 4000;
    void this.update(this.generation, snapshotFor(this.state, this.vehicles));
  }

  async update(generation, snapshot) {
    try {
      const result = await this.json(
        "/api/ai/decision",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Game-Token": this.token,
          },
          body: JSON.stringify(snapshot),
        },
        25000,
      );
      if (generation !== this.generation || this.state.over) return;
      this.plans.clear();
      this.expiredReported = false;
      for (const plan of result.plans) {
        const source = snapshot.players.find((player) => player.id === plan.id);
        this.plans.set(plan.id, {
          ...plan,
          vehicle: source.vehicle,
          expires: this.now() + 12000,
        });
      }
      this.status(
        `Copilot: ${result.model} — ${result.plans.map((p) => `P${p.id + 1}: ${p.tactic} → P${p.targetId + 1}`).join(" · ")}`,
      );
    } catch (error) {
      if (generation === this.generation && error.status === 429) {
        this.nextRequest = this.now() + 4000;
        this.status(
          `Copilot: ${this.model} — backend busy; CPU fallback while waiting to retry.`,
        );
        return;
      }
      this.fail(error, generation);
    } finally {
      if (generation === this.generation) this.pending = false;
    }
  }

  plan(player) {
    const plan = this.plans.get(player.id);
    if (
      plan &&
      (plan.expires <= this.now() || plan.vehicle !== player.vehicle) &&
      !this.expiredReported
    ) {
      this.expiredReported = true;
      this.status(
        `Copilot: ${this.model} — stale tactics; CPU fallback while awaiting an update.`,
      );
    }
    return plan && plan.expires > this.now() && plan.vehicle === player.vehicle
      ? plan
      : undefined;
  }
}
