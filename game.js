import { CopilotOpponent, CopilotUsage, formatUsage } from "./copilot-game.js";

const costs = new CopilotUsage({
  render: (usage, error) => {
    const element = document.getElementById("ai-costs");
    element.textContent = formatUsage(usage, error);
    element.classList.remove("hidden");
  },
});
addEventListener("pagehide", () => costs.stop());
addEventListener("pageshow", () => {
  if (costs.started) costs.start();
});

const copilot = new CopilotOpponent({
  status: (text) => {
    const element = document.getElementById("ai-status");
    element.textContent = text;
    element.classList.toggle("hidden", !text);
  },
});

(function () {
  const n = document.createElement("link").relList;
  if (n && n.supports && n.supports("modulepreload")) return;
  for (const o of document.querySelectorAll('link[rel="modulepreload"]')) t(o);
  new MutationObserver((o) => {
    for (const s of o)
      if (s.type === "childList")
        for (const l of s.addedNodes)
          l.tagName === "LINK" && l.rel === "modulepreload" && t(l);
  }).observe(document, { childList: !0, subtree: !0 });
  function i(o) {
    const s = {};
    return (
      o.integrity && (s.integrity = o.integrity),
      o.referrerPolicy && (s.referrerPolicy = o.referrerPolicy),
      o.crossOrigin === "use-credentials"
        ? (s.credentials = "include")
        : o.crossOrigin === "anonymous"
          ? (s.credentials = "omit")
          : (s.credentials = "same-origin"),
      s
    );
  }
  function t(o) {
    if (o.ep) return;
    o.ep = !0;
    const s = i(o);
    fetch(o.href, s);
  }
})();
const m = 40;
function ue(e = Date.now()) {
  let n = e >>> 0 || 1;
  return () => (
    (n ^= n << 13),
    (n >>>= 0),
    (n ^= n >> 17),
    (n ^= n << 5),
    (n >>>= 0),
    n / 4294967296
  );
}
const w = {
    tank: {
      name: "Tank",
      move: "tank",
      layer: "ground",
      speed: 70,
      turn: 2.6,
      hp: 120,
      r: 14,
      weight: 1,
      primary: { type: "bullet", dmg: 30, speed: 320, cd: 0.6, range: 420 },
      special: null,
    },
    artillery: {
      name: "Artillery",
      move: "tank",
      layer: "ground",
      speed: 70,
      turn: 1.8,
      hp: 150,
      r: 15,
      weight: 1,
      primary: {
        type: "lob",
        dmg: 75,
        splash: 85,
        speed: 300,
        cd: 1,
        range: 380,
      },
      special: null,
    },
    missileTank: {
      name: "Missile Carrier",
      move: "tank",
      layer: "ground",
      speed: 90,
      turn: 2.8,
      hp: 100,
      r: 14,
      weight: 1,
      primary: {
        type: "homing",
        dmg: 35,
        speed: 220,
        cd: 0.8,
        range: 600,
        ammo: 12,
      },
      special: null,
    },
    nitroCar: {
      name: "Nitro Car",
      move: "tank",
      layer: "ground",
      speed: 130,
      turn: 3.4,
      hp: 95,
      r: 11,
      weight: 1,
      primary: { type: "bullet", dmg: 10, speed: 460, cd: 0.1, range: 300 },
      special: { type: "nitro", ammo: 3, cd: 0.5, dur: 1.2 },
    },
    mineCar: {
      name: "Mine Car",
      move: "tank",
      layer: "ground",
      speed: 125,
      turn: 3.4,
      hp: 95,
      r: 11,
      weight: 1,
      primary: { type: "bullet", dmg: 10, speed: 460, cd: 0.1, range: 300 },
      special: { type: "mine", ammo: 5, cd: 0.6, dmg: 80, splash: 45 },
    },
    ufo: {
      name: "UFO",
      move: "strafe",
      layer: "hover",
      speed: 100,
      turn: 9,
      hp: 70,
      r: 13,
      weight: 1,
      primary: {
        type: "bullet",
        dmg: 10,
        speed: 380,
        cd: 0.25,
        range: 340,
        autoAim: !0,
      },
      special: { type: "selfdestruct", ammo: 1, cd: 0, dmg: 200, splash: 110 },
    },
    mech: {
      name: "Mech",
      move: "strafe",
      layer: "ground",
      speed: 60,
      turn: 4,
      hp: 90,
      r: 14,
      weight: 1,
      primary: { type: "bullet", dmg: 6, speed: 420, cd: 0.15, range: 320 },
      special: { type: "laser", ammo: 6, cd: 0.8, dmg: 30, range: 450 },
    },
    terminator: {
      name: "Terminator",
      move: "strafe",
      layer: "ground",
      speed: 35,
      turn: 2,
      hp: 160,
      r: 18,
      weight: 0.2,
      primary: { type: "bullet", dmg: 30, speed: 330, cd: 1.2, range: 450 },
      special: {
        type: "salvo",
        ammo: 2,
        cd: 2,
        count: 15,
        dmg: 15,
        speed: 200,
      },
    },
    jetpack: {
      name: "Jetpack Trooper",
      move: "strafe",
      layer: "air",
      speed: 140,
      turn: 9,
      hp: 70,
      r: 7,
      weight: 1,
      primary: { type: "bullet", dmg: 14, speed: 420, cd: 0.15, range: 300 },
      special: null,
    },
    rocketeer: {
      name: "Rocket Trooper",
      move: "strafe",
      layer: "ground",
      speed: 55,
      turn: 9,
      hp: 70,
      r: 7,
      weight: 1,
      primary: {
        type: "bullet",
        dmg: 50,
        speed: 260,
        cd: 1,
        range: 450,
        ammo: 5,
        splash: 30,
      },
      special: null,
    },
    heli: {
      name: "Helicopter",
      move: "strafe",
      layer: "air",
      speed: 110,
      turn: 3,
      hp: 70,
      r: 15,
      weight: 1,
      primary: { type: "bullet", dmg: 7, speed: 440, cd: 0.12, range: 320 },
      special: { type: "homingShot", ammo: 4, cd: 1, dmg: 35, speed: 230 },
    },
    jeep: {
      name: "Jeep",
      move: "tank",
      layer: "ground",
      speed: 120,
      turn: 3.2,
      hp: 70,
      r: 12,
      weight: 1,
      primary: {
        type: "bullet",
        dmg: 7,
        speed: 440,
        cd: 0.14,
        range: 300,
        autoAim: !0,
      },
      special: null,
    },
    bomber: {
      name: "Bomber",
      move: "plane",
      layer: "air",
      speed: 150,
      turn: 2.2,
      hp: 70,
      r: 16,
      weight: 1,
      primary: { type: "carpet", dmg: 40, splash: 40, cd: 2.5, count: 6 },
      special: null,
    },
    jet: {
      name: "Jet",
      move: "plane",
      layer: "air",
      speed: 190,
      turn: 2.6,
      hp: 55,
      r: 13,
      weight: 1,
      primary: {
        type: "bullet",
        dmg: 25,
        speed: 480,
        cd: 0.4,
        range: 450,
        splash: 20,
      },
      special: null,
    },
  },
  xe = Object.keys(w),
  q = [
    {
      id: "yard",
      name: "Training Yard",
      rows: [
        "##############################",
        "#............................#",
        "#............................#",
        "#....##..............##......#",
        "#....##..............##......#",
        "#............................#",
        "#............................#",
        "#............................#",
        "#............................#",
        "#.........1........2.........#",
        "#............................#",
        "#............................#",
        "#............................#",
        "#............................#",
        "#....##..............##......#",
        "#....##.......3......##......#",
        "#............................#",
        "#............................#",
        "#............................#",
        "##############################",
      ],
    },
    {
      id: "river",
      name: "Riverside",
      rows: [
        "##############################",
        "#.............~~.............#",
        "#..1..........~~..........2..#",
        "#.............~~.............#",
        "#....###......~~.....###.....#",
        "#....###......~~.....###.....#",
        "#.............~~.............#",
        "#.............................",
        "#.............................",
        "#.............~~.............#",
        "#.............~~.............#",
        "#....###......~~.....###.....#",
        "#....###......~~.....###.....#",
        "#.............~~.............#",
        "#.............~~.............#",
        "#...........................3#",
        "#...........................##",
        "#.............~~.............#",
        "#.............~~.............#",
        "##############################",
      ],
    },
    {
      id: "downtown",
      name: "Downtown",
      rows: [
        "##############################",
        "#1...........................#",
        "#..###..###..###..###..###...#",
        "#..###..###..###..###..###...#",
        "#............................#",
        "#............................#",
        "#..###..###..###..###..###...#",
        "#..###..###..###..###..###...#",
        "#............................#",
        "#.............3..............#",
        "#............................#",
        "#..###..###..###..###..###...#",
        "#..###..###..###..###..###...#",
        "#............................#",
        "#............................#",
        "#..###..###..###..###..###...#",
        "#..###..###..###..###..###...#",
        "#............................#",
        "#...........................2#",
        "##############################",
      ],
    },
    {
      id: "islands",
      name: "Islands",
      rows: [
        "##############################",
        "#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#",
        "#~......~~~~~~~~~~~~~......~~#",
        "#~..1...~~~~~~~~~~~~~...2..~~#",
        "#~......................#..~~#",
        "#~..#...~~~~~~~~~~~~~......~~#",
        "#~~~~.~~~~~~~~~~~~~~~~~~.~~~~#",
        "#~~~~.~~~~~~......~~~~~~.~~~~#",
        "#~~~~.~~~~~~..##..~~~~~~.~~~~#",
        "#~~~~...........3........~~~~#",
        "#~~~~.~~~~~~..##..~~~~~~.~~~~#",
        "#~~~~.~~~~~~......~~~~~~.~~~~#",
        "#~~~~.~~~~~~~~~~~~~~~~~~.~~~~#",
        "#~......~~~~~~~~~~~~~......~~#",
        "#~..4.......................~#",
        "#~......~~~~~~~~~~~~~...#..~~#",
        "#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#",
        "#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#",
        "#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#",
        "##############################",
      ],
    },
  ];
function ge(e) {
  const n = e.rows,
    i = n.length,
    t = Math.max(...n.map((l) => l.length)),
    o = [],
    s = [];
  for (let l = 0; l < i; l++)
    for (let a = 0; a < t; a++) {
      const r = n[l][a] ?? "#";
      r >= "1" && r <= "9"
        ? (s.push({ x: (a + 0.5) * m, y: (l + 0.5) * m, n: +r }), o.push(0))
        : o.push(r === "#" ? 1 : r === "~" ? 2 : 0);
    }
  for (s.sort((l, a) => l.n - a.n); s.length < 4;) {
    let l = null,
      a = -1;
    for (let r = 1; r < i - 1; r++)
      for (let c = 1; c < t - 1; c++) {
        let h = !0;
        for (let x = -1; x <= 1; x++)
          for (let k = -1; k <= 1; k++)
            o[(r + x) * t + c + k] !== 0 && (h = !1);
        if (!h) continue;
        const p = (c + 0.5) * m,
          d = (r + 0.5) * m,
          g = Math.min(...s.map((x) => Math.hypot(x.x - p, x.y - d)));
        g > a && ((a = g), (l = { x: p, y: d, n: s.length + 1 }));
      }
    if (!l) break;
    s.push(l);
  }
  return {
    id: e.id,
    name: e.name,
    w: t,
    h: i,
    tiles: o,
    spawns: s,
    pxW: t * m,
    pxH: i * m,
  };
}
function D(e, n, i) {
  const t =
      Math.sin(n * 0.011) * Math.cos(i * 0.013) * 18 +
      Math.sin((n + i) * 0.006) * 14 +
      Math.cos(n * 0.023 - i * 0.017) * 6,
    o = Math.floor(n / m),
    s = Math.floor(i / m);
  let l = 0;
  for (let a = -1; a <= 1; a++)
    for (let r = -1; r <= 1; r++)
      e.tiles[(s + a) * e.w + o + r] === 2 && (l += r === 0 && a === 0 ? 3 : 1);
  return t - l * 6;
}
function ve(e, n, i, t, o) {
  const s = D(e, n + t * 12, i + o * 12) - D(e, n - t * 12, i - o * 12);
  return Math.max(0.6, Math.min(1.15, 1 - s * 0.025));
}
function ie(e, n, i) {
  const t = Math.floor(n / m),
    o = Math.floor(i / m);
  return t < 0 || o < 0 || t >= e.w || o >= e.h ? 1 : e.tiles[o * e.w + t];
}
function J(e, n, i, t, o) {
  for (const [s, l] of [
    [-o, -o],
    [o, -o],
    [-o, o],
    [o, o],
    [0, 0],
  ]) {
    const a = ie(e, i + s, t + l);
    if (n === "air") {
      if (i + s < 0 || t + l < 0 || i + s >= e.pxW || t + l >= e.pxH) return !0;
      continue;
    }
    if (a === 1 || (a === 2 && n === "ground")) return !0;
  }
  return !1;
}
function Me(e, n) {
  const i = xe.filter((s) => s !== n),
    t = i.reduce((s, l) => s + w[l].weight, 0);
  let o = e() * t;
  for (const s of i) if (((o -= w[s].weight), o <= 0)) return s;
  return i[i.length - 1];
}
const be = ["#4aa3ff", "#ff5a4a", "#ffd23f", "#5ee07a"];
function ke(e = {}) {
  var r, c;
  const n = e.mapIndex ?? 0,
    i = ge(q[n]),
    t = ue(e.seed ?? 12345),
    o = Math.min(
      ((r = e.players) == null ? void 0 : r.length) ?? 2,
      i.spawns.length,
    ),
    s = i.pxW / 2,
    l = i.pxH / 2,
    a = [];
  for (let h = 0; h < o; h++) {
    const p = ((c = e.players) == null ? void 0 : c[h]) ?? { kind: "human" },
      d = i.spawns[h],
      g = {
        id: h,
        kind: p.kind,
        color: be[h],
        kills: 0,
        deaths: 0,
        score: 0,
        alive: !1,
        respawn: 0,
        forced: p.vehicle,
      };
    (oe({ rng: t }, g, d, Math.atan2(l - d.y, s - d.x)),
      (d.y === l || Math.abs(d.y - l) < m) && (g.angle = d.x < s ? 0 : Math.PI),
      a.push(g));
  }
  return {
    map: i,
    mapIndex: n,
    rng: t,
    players: a,
    projectiles: [],
    mines: [],
    effects: [],
    time: 0,
    killLimit: e.killLimit ?? 5,
    timeLimit: e.timeLimit ?? 180,
    over: !1,
    winner: null,
    events: [],
  };
}
function oe(e, n, i, t) {
  var l;
  const o = n.forced && w[n.forced] ? n.forced : Me(e.rng, n.vehicle),
    s = w[o];
  Object.assign(n, {
    vehicle: o,
    x: i.x,
    y: i.y,
    angle: t ?? 0,
    hp: s.hp,
    maxHp: s.hp,
    alive: !0,
    cd: 0.4,
    scd: 0,
    ammo: s.primary.ammo ?? 1 / 0,
    sammo: ((l = s.special) == null ? void 0 : l.ammo) ?? 0,
    boost: 0,
    respawn: 0,
    spawnShield: 1,
  });
}
function we(e, n) {
  let i = e.map.spawns[0],
    t = -1;
  for (const o of e.map.spawns) {
    let s = 1 / 0;
    for (const l of e.players)
      l !== n && l.alive && (s = Math.min(s, Math.hypot(l.x - o.x, l.y - o.y)));
    s > t && ((t = s), (i = o));
  }
  return i;
}
const A = (e, n) => {
  let i = n - e;
  for (; i > Math.PI;) i -= 2 * Math.PI;
  for (; i < -Math.PI;) i += 2 * Math.PI;
  return i;
};
function W(e, n) {
  let i = null,
    t = 1 / 0;
  for (const o of e.players)
    if (o !== n && o.alive) {
      const s = Math.hypot(o.x - n.x, o.y - n.y);
      s < t && ((t = s), (i = o));
    }
  return i;
}
function se(e, n, i, t) {
  const o = n.x + Math.cos(t) * (n.r ?? 12),
    s = n.y + Math.sin(t) * 12;
  if (i.type === "bullet")
    e.projectiles.push({
      kind: "bullet",
      owner: n.id,
      x: o,
      y: s,
      vx: Math.cos(t) * i.speed,
      vy: Math.sin(t) * i.speed,
      dmg: i.dmg,
      life: i.range / i.speed,
      splash: i.splash ?? 0,
      air: w[n.vehicle].layer === "air",
    });
  else if (i.type === "lob") {
    const l = W(e, n);
    let a = i.range;
    (l &&
      Math.abs(A(t, Math.atan2(l.y - n.y, l.x - n.x))) < 0.5 &&
      (a = Math.min(i.range, Math.hypot(l.x - n.x, l.y - n.y))),
      e.projectiles.push({
        kind: "lob",
        owner: n.id,
        x: o,
        y: s,
        vx: Math.cos(t) * i.speed,
        vy: Math.sin(t) * i.speed,
        dmg: i.dmg,
        life: a / i.speed,
        total: a / i.speed,
        splash: i.splash,
        air: !0,
      }));
  } else if (i.type === "homing" || i.type === "homingShot")
    e.projectiles.push({
      kind: "homing",
      owner: n.id,
      x: o,
      y: s,
      angle: t,
      speed: i.speed,
      dmg: i.dmg,
      life: 3.5,
      splash: 15,
      air: !0,
    });
  else if (i.type === "carpet")
    for (let l = 0; l < i.count; l++)
      e.projectiles.push({
        kind: "lob",
        owner: n.id,
        x: n.x,
        y: n.y,
        vx: Math.cos(t) * 150,
        vy: Math.sin(t) * 150,
        dmg: i.dmg,
        life: 0.3 + l * 0.18,
        total: 0.3 + l * 0.18,
        splash: i.splash,
        air: !0,
      });
  e.events.push({ type: "shot", owner: n.id, weapon: i.type });
}
function Se(e, n) {
  const i = w[n.vehicle].special;
  if (!(!i || n.sammo <= 0 || n.scd > 0)) {
    if ((n.sammo--, (n.scd = i.cd), i.type === "nitro")) n.boost = i.dur;
    else if (i.type === "mine")
      e.mines.push({
        owner: n.id,
        x: n.x - Math.cos(n.angle) * 22,
        y: n.y - Math.sin(n.angle) * 22,
        dmg: i.dmg,
        splash: i.splash,
        arm: 0.6,
      });
    else if (i.type === "selfdestruct")
      (O(e, n.x, n.y, i.splash, i.dmg, n.id, !0),
        n.alive && _(e, n, 9999, n.id));
    else if (i.type === "laser") {
      W(e, n);
      const t = n.x + Math.cos(n.angle) * i.range,
        o = n.y + Math.sin(n.angle) * i.range;
      e.effects.push({
        kind: "laser",
        x: n.x,
        y: n.y,
        x2: t,
        y2: o,
        t: 0.25,
        color: n.color,
      });
      for (const s of e.players)
        s !== n &&
          s.alive &&
          Ie(s.x, s.y, n.x, n.y, t, o) < w[s.vehicle].r + 4 &&
          _(e, s, i.dmg, n.id);
    } else if (i.type === "salvo")
      for (let t = 0; t < i.count; t++) {
        const o = n.angle + (t - i.count / 2) * 0.12;
        e.projectiles.push({
          kind: "homing",
          owner: n.id,
          x: n.x,
          y: n.y,
          angle: o,
          speed: i.speed,
          dmg: i.dmg,
          life: 3,
          splash: 10,
          air: !0,
          delay: t * 0.05,
        });
      }
    else i.type === "homingShot" && se(e, n, i, n.angle);
    e.events.push({ type: "special", owner: n.id, special: i.type });
  }
}
function Ie(e, n, i, t, o, s) {
  const l = o - i,
    a = s - t,
    r = l * l + a * a || 1,
    c = Math.max(0, Math.min(1, ((e - i) * l + (n - t) * a) / r));
  return Math.hypot(e - i - c * l, n - t - c * a);
}
function _(e, n, i, t) {
  !n.alive ||
    e.over ||
    (n.spawnShield > 0 && t !== n.id) ||
    ((n.hp -= i), n.hp <= 0 && Le(e, n, t));
}
function Le(e, n, i) {
  if (
    ((n.alive = !1),
    (n.hp = 0),
    n.deaths++,
    (n.respawn = 2),
    e.effects.push({ kind: "boom", x: n.x, y: n.y, r: 40, t: 0.6 }),
    i === n.id || i == null)
  )
    n.score--;
  else {
    const t = e.players[i];
    (t.kills++, t.score++);
  }
  (e.events.push({ type: "kill", victim: n.id, killer: i }), re(e));
}
function re(e) {
  var i;
  if (e.over) return;
  const n = [...e.players].sort((t, o) => o.score - t.score);
  (n[0].score >= e.killLimit
    ? ((e.over = !0), (e.winner = n[0].id))
    : e.time >= e.timeLimit &&
      ((e.over = !0),
      (e.winner =
        n[0].score > (((i = n[1]) == null ? void 0 : i.score) ?? -1 / 0)
          ? n[0].id
          : null)),
    e.over && e.events.push({ type: "over", winner: e.winner }));
}
function O(e, n, i, t, o, s, l = !1) {
  (e.effects.push({ kind: "boom", x: n, y: i, r: t, t: 0.5 }),
    e.events.push({ type: "explode" }));
  for (const a of e.players) {
    if (!a.alive || (!l && a.id === s)) continue;
    const r = Math.hypot(a.x - n, a.y - i);
    r < t + w[a.vehicle].r && _(e, a, o * (1 - 0.5 * Math.min(1, r / t)), s);
  }
}
function Te(e, n, i) {
  if (!i || n.vx === void 0) return Math.atan2(n.y - e.y, n.x - e.x);
  const t = Math.hypot(n.x - e.x, n.y - e.y),
    o = Math.min(1.2, t / i);
  return Math.atan2(n.y + n.vy * o - e.y, n.x + n.vx * o - e.x);
}
const Ce = (e, n, i, t) => !J(e.map, n.layer, i, t, n.r);
function $e(e, n, i, t = 45) {
  const o = w[n.vehicle];
  for (const s of [0, 0.5, -0.5, 1, -1, 1.6, -1.6, 2.4, -2.4, Math.PI]) {
    const l = i + s;
    if (Ce(e, o, n.x + Math.cos(l) * t, n.y + Math.sin(l) * t)) return l;
  }
  return i;
}
function Pe(e, n, plan) {
  const i = { mx: 0, my: 0, fire: !1, special: !1 };
  if (n.kind === "dummy") return i;
  const t =
      e.players.find(
        (player) => player.id === plan?.targetId && player.alive,
      ) || W(e, n),
    o = w[n.vehicle];
  if (!t) return i;
  const s = o.primary,
    l = o.special,
    a = Math.hypot(t.x - n.x, t.y - n.y),
    r = Te(n, t, s.speed),
    c = s.range ?? 300,
    h =
      plan?.range ??
      (s.type === "lob"
        ? c * 0.75
        : s.type === "carpet" ||
            ((l == null ? void 0 : l.type) === "selfdestruct" && n.sammo > 0)
          ? 0
          : c * 0.5),
    p =
      (plan?.tactic === "retreat" || n.hp < n.maxHp * 0.3) &&
      o.move !== "plane";
  let d;
  o.move === "plane"
    ? (d = s.type === "carpet" ? Math.atan2(t.y - n.y, t.x - n.x) : r)
    : p && a < c
      ? (d = Math.atan2(n.y - t.y, n.x - t.x) + 0.5)
      : a > h + 40
        ? (d = r)
        : a < h - 60
          ? (d = Math.atan2(n.y - t.y, n.x - t.x))
          : (d = r + (n.id % 2 ? 1.5 : -1.5));
  if (plan?.tactic === "flank-left") d = r - 1.2;
  if (plan?.tactic === "flank-right") d = r + 1.2;
  if (plan?.tactic === "retreat") d = Math.atan2(n.y - t.y, n.x - t.x) + 0.5;
  let g = 1;
  (o.move === "tank" &&
    Math.abs(a - h) < 60 &&
    !p &&
    (!plan || plan.tactic === "attack") &&
    ((d = r), (g = 0.05)),
    o.move !== "plane" && (d = $e(e, n, d)),
    n.stuck > 0.4 && (d += Math.PI / 2));
  const x = Math.abs(A(n.angle, r));
  let R =
    (x < 0.2 || s.autoAim || (o.move === "strafe" && x < 0.6)) && a < c * 1.05;
  (s.type === "carpet" && (R = a < 110),
    s.type === "lob" && (R = x < 0.3 && a < c && a > 60));
  let I = !1;
  return (
    l &&
      n.sammo > 0 &&
      n.scd <= 0 &&
      (l.type === "nitro"
        ? (I = a > 250 || p)
        : l.type === "mine"
          ? (I = a < 160 && Math.abs(A(n.angle, r)) > 2)
          : l.type === "selfdestruct"
            ? (I = a < l.splash * 0.7 && t.hp > 30)
            : l.type === "laser"
              ? (I = x < 0.12 && a < l.range)
              : l.type === "salvo"
                ? (I = a < 380)
                : l.type === "homingShot" && (I = a < 400 && x < 0.8)),
    {
      mx: Math.cos(d) * g,
      my: Math.sin(d) * g,
      fire: R,
      special: I && (plan?.useSpecial ?? true),
      aim: r,
    }
  );
}
function Ae(e, n, i) {
  if (e.over) return e;
  ((e.time += i), (e.events = []));
  for (const t of e.players) {
    if (!t.alive) {
      if (((t.respawn -= i), t.respawn <= 0)) {
        const x = we(e, t);
        oe(e, t, x, Math.atan2(e.map.pxH / 2 - x.y, e.map.pxW / 2 - x.x));
      }
      continue;
    }
    const o = w[t.vehicle],
      s = (t.kind === "human"
        ? n[t.id]
        : Pe(e, t, t.kind === "copilot" ? copilot.plan(t) : undefined)) || {
        mx: 0,
        my: 0,
      };
    ((t.cd -= i), (t.scd -= i), (t.boost -= i), (t.spawnShield -= i));
    const l = Math.min(1, Math.hypot(s.mx, s.my)),
      a = o.speed * (t.boost > 0 ? 2 : 1);
    let r = 0,
      c = 0;
    if (l > 0.15) {
      const x = Math.atan2(s.my, s.mx),
        k = A(t.angle, x);
      t.angle += Math.sign(k) * Math.min(Math.abs(k), o.turn * i);
    }
    if (o.move === "strafe")
      ((r = s.mx * a), (c = s.my * a), l < 0.15 && (r = c = 0));
    else if (o.move === "tank") {
      const x =
        l > 0.15
          ? l * Math.max(0, Math.cos(A(t.angle, Math.atan2(s.my, s.mx))))
          : 0;
      ((r = Math.cos(t.angle) * a * x), (c = Math.sin(t.angle) * a * x));
    } else ((r = Math.cos(t.angle) * a), (c = Math.sin(t.angle) * a));
    if (o.layer === "ground" && (r || c)) {
      const x = Math.hypot(r, c),
        k = ve(e.map, t.x, t.y, r / x, c / x);
      ((r *= k), (c *= k));
    }
    ((t.vx = r), (t.vy = c));
    const h = t.x + r * i,
      p = t.y + c * i,
      d = t.x,
      g = t.y;
    if (
      (J(e.map, o.layer, h, t.y, o.r) || (t.x = h),
      J(e.map, o.layer, t.x, p, o.r) || (t.y = p),
      o.move === "plane" &&
        t.x === d &&
        t.y === g &&
        (t.angle += Math.PI * 0.75),
      (t.stuck =
        l > 0.15 && Math.hypot(t.x - d, t.y - g) < 0.1 * a * i
          ? (t.stuck || 0) + i
          : 0),
      s.fire && t.cd <= 0 && t.ammo > 0)
    ) {
      let x = t.angle;
      if (
        (s.aim !== void 0 && o.move === "strafe" && (x = s.aim),
        o.primary.autoAim)
      ) {
        const k = W(e, t);
        k && (x = Math.atan2(k.y - t.y, k.x - t.x));
      }
      (se(e, t, o.primary, x),
        (t.cd = o.primary.cd),
        t.ammo !== 1 / 0 && t.ammo--);
    }
    s.special && Se(e, t);
  }
  for (const t of e.projectiles) {
    if (t.delay > 0) {
      t.delay -= i;
      continue;
    }
    if (((t.life -= i), t.kind === "homing")) {
      const o = e.players[t.owner],
        s = W(e, o);
      if (s) {
        const l = A(t.angle, Math.atan2(s.y - t.y, s.x - t.x));
        t.angle += Math.sign(l) * Math.min(Math.abs(l), 3 * i);
      }
      ((t.vx = Math.cos(t.angle) * t.speed),
        (t.vy = Math.sin(t.angle) * t.speed));
    }
    if (((t.x += t.vx * i), (t.y += t.vy * i), t.kind === "lob")) {
      t.life <= 0 && (O(e, t.x, t.y, t.splash, t.dmg, t.owner), (t.dead = !0));
      continue;
    }
    if (ie(e.map, t.x, t.y) === 1) {
      ((t.dead = !0),
        t.splash
          ? O(e, t.x, t.y, t.splash, t.dmg * 0.5, t.owner)
          : e.effects.push({ kind: "spark", x: t.x, y: t.y, t: 0.15 }));
      continue;
    }
    for (const o of e.players)
      if (
        !(!o.alive || o.id === t.owner) &&
        Math.hypot(o.x - t.x, o.y - t.y) < w[o.vehicle].r + 3
      ) {
        ((t.dead = !0),
          t.splash
            ? O(e, t.x, t.y, t.splash, t.dmg, t.owner)
            : (_(e, o, t.dmg, t.owner),
              e.effects.push({ kind: "spark", x: t.x, y: t.y, t: 0.15 })));
        break;
      }
    t.life <= 0 && (t.dead = !0);
  }
  e.projectiles = e.projectiles.filter((t) => !t.dead);
  for (const t of e.mines)
    if (((t.arm -= i), !(t.arm > 0))) {
      for (const o of e.players)
        if (
          o.alive &&
          w[o.vehicle].layer !== "air" &&
          Math.hypot(o.x - t.x, o.y - t.y) < 18 + w[o.vehicle].r
        ) {
          ((t.dead = !0), O(e, t.x, t.y, t.splash, t.dmg, t.owner, !0));
          break;
        }
    }
  e.mines = e.mines.filter((t) => !t.dead);
  for (const t of e.effects) t.t -= i;
  return ((e.effects = e.effects.filter((t) => t.t > 0)), re(e), e);
}
function ae(e) {
  try {
    const n = JSON.parse(e.getItem("tapTactics.progress") || "null");
    if (n) return { unlocked: 1, wins: 0, matches: 0, bestKills: 0, ...n };
  } catch {}
  return { unlocked: 1, wins: 0, matches: 0, bestKills: 0 };
}
function He(e, n) {
  const i = ae(e);
  i.matches++;
  const t = n.players[0];
  return (
    (i.bestKills = Math.max(i.bestKills, t.kills)),
    n.winner === 0 &&
      (i.wins++,
      (i.unlocked = Math.max(i.unlocked, Math.min(q.length, n.mapIndex + 2)))),
    e.setItem("tapTactics.progress", JSON.stringify(i)),
    i
  );
}
let ee = null;
const le = () => {
  try {
    ee || (ee = new (window.AudioContext || window.webkitAudioContext)());
  } catch {
    return null;
  }
  return ee;
};
function P(e, n, i = "square", t = 0.05, o = 0) {
  const s = le();
  if (!s) return;
  const l = s.createOscillator(),
    a = s.createGain();
  ((l.type = i),
    (l.frequency.value = e),
    o &&
      l.frequency.exponentialRampToValueAtTime(
        Math.max(20, e + o),
        s.currentTime + n,
      ),
    (a.gain.value = t),
    a.gain.exponentialRampToValueAtTime(1e-4, s.currentTime + n),
    l.connect(a).connect(s.destination),
    l.start(),
    l.stop(s.currentTime + n));
}
function Ee(e, n = 0.15) {
  const i = le();
  if (!i) return;
  const t = i.createBuffer(1, i.sampleRate * e, i.sampleRate),
    o = t.getChannelData(0);
  for (let a = 0; a < o.length; a++)
    o[a] = (Math.random() * 2 - 1) * (1 - a / o.length) ** 2;
  const s = i.createBufferSource(),
    l = i.createGain();
  ((l.gain.value = n),
    (s.buffer = t),
    s.connect(l).connect(i.destination),
    s.start());
}
let te = 0;
const z = {
  click: () => P(660, 0.08, "square", 0.04),
  win: () => {
    (P(523, 0.15),
      setTimeout(() => P(659, 0.15), 150),
      setTimeout(() => P(784, 0.3), 300));
  },
  event(e) {
    if (e.type === "shot") {
      const n = performance.now();
      if (n - te < 60) return;
      ((te = n),
        P(e.weapon === "bullet" ? 900 : 300, 0.06, "sawtooth", 0.03, -400));
    } else
      e.type === "explode" || e.type === "kill"
        ? Ee(e.type === "kill" ? 0.6 : 0.3)
        : e.type === "special" && P(200, 0.2, "triangle", 0.06, 400);
  },
};
function je(e, n = 0.2) {
  const i = e.axes || [],
    t = e.buttons || [],
    o = (a) => !!(t[a] && (t[a].pressed || t[a].value > 0.5));
  let s = i[0] || 0,
    l = i[1] || 0;
  return (
    Math.hypot(s, l) < n && ((s = 0), (l = 0)),
    o(14) && (s = -1),
    o(15) && (s = 1),
    o(12) && (l = -1),
    o(13) && (l = 1),
    { mx: s, my: l, fire: o(0) || o(7), special: o(1) || o(2) || o(6) }
  );
}
function Re() {
  return { x: 0, y: 0, yaw: 0, dist: 900, pitch: 0.95, fov: 1, w: 800, h: 600 };
}
function Oe(e, n, i, t) {
  let o = 1 / 0,
    s = 1 / 0,
    l = -1 / 0,
    a = -1 / 0;
  for (const p of n)
    ((o = Math.min(o, p.x)),
      (s = Math.min(s, p.y)),
      (l = Math.max(l, p.x)),
      (a = Math.max(a, p.y)));
  const r = Math.max(l - o, a - s, 160),
    c = Math.min(1, i * 2);
  ((e.x += ((o + l) / 2 - e.x) * c), (e.y += ((s + a) / 2 - e.y) * c));
  const h = Math.max(380, r * 1.2 + 260) * Math.max(1, e.h / e.w);
  return ((e.dist += (h - e.dist) * c), (e.yaw = We(t)), e);
}
function M(e, n, i, t) {
  const o = n - e.x,
    s = i - e.y,
    l = Math.cos(e.yaw),
    a = Math.sin(e.yaw),
    r = o * l - s * a,
    c = o * a + s * l,
    h = Math.cos(e.pitch),
    p = Math.sin(e.pitch),
    d = e.dist - c * h - t * p;
  if (d < 20) return null;
  const g = -c * p + t * h,
    x = (e.h * 0.9) / e.fov;
  return {
    sx: e.w / 2 + (r * x) / d,
    sy: e.h / 2 - (g * x) / d,
    depth: d,
    scale: x / d,
  };
}
function We(e) {
  return Math.sin(e * 0.09) * 0.45;
}
function qe(e, n, i = { l: 60, r: 60, t: 90, b: 60 }) {
  let t;
  for (let o = 0; o < 30; o++) {
    t = { x0: 1 / 0, y0: 1 / 0, x1: -1 / 0, y1: -1 / 0 };
    let s = !1;
    for (const g of n)
      for (const x of [g.z ?? 0, (g.z ?? 0) + 40]) {
        const k = M(e, g.x, g.y, x);
        if (!k) {
          s = !0;
          continue;
        }
        ((t.x0 = Math.min(t.x0, k.sx)),
          (t.x1 = Math.max(t.x1, k.sx)),
          (t.y0 = Math.min(t.y0, k.sy)),
          (t.y1 = Math.max(t.y1, k.sy)));
      }
    if (s) {
      e.dist *= 1.3;
      continue;
    }
    if (t.x0 >= i.l && t.x1 <= e.w - i.r && t.y0 >= i.t && t.y1 <= e.h - i.b)
      break;
    const a = M(e, e.x, e.y, 0),
      r = (t.x0 + t.x1) / 2 - (i.l + e.w - i.r) / 2,
      c = (t.y0 + t.y1) / 2 - (i.t + e.h - i.b) / 2,
      h = (1 / (a ? a.scale : 1)) * 0.5,
      p = Math.cos(e.yaw),
      d = Math.sin(e.yaw);
    ((e.x += (r * p + (c * d) / Math.sin(e.pitch)) * h),
      (e.y += (-r * d + (c * p) / Math.sin(e.pitch)) * h),
      (e.dist *= 1.08));
  }
  return t;
}
const v = (e) => document.getElementById(e),
  $ = v("c"),
  f = $.getContext("2d"),
  V = new URLSearchParams(location.search),
  b = { map: 0, p2: "cpu", p3: "off", p4: "off", kills: 5 },
  X = ["cpu", "copilot", "human", "dummy", "off"],
  Y = {
    cpu: "CPU",
    copilot: "Copilot AI",
    human: "Human",
    dummy: "Dummy CPU",
    off: "Off",
  },
  De = [1, 3, 5, 10];
let u = null,
  ne = 0;
const Q = () => ae(localStorage);
function E(e) {
  document.body.dataset.screen = e ?? "game";
  if (e !== null) copilot.stop();
  for (const n of ["title", "setup", "result"])
    v(n).classList.toggle("hidden", n !== e);
  v("touch").classList.toggle("hidden", e !== null);
}
function j() {
  const e = Q();
  ((v("opt-map").textContent =
    q[b.map].name + (b.map + 1 > e.unlocked ? " 🔒" : "")),
    (v("opt-p2").textContent = Y[b.p2]),
    (v("opt-p3").textContent = Y[b.p3]),
    (v("opt-p4").textContent = Y[b.p4]),
    (v("opt-kills").textContent = b.kills),
    (v("btn-start").disabled = b.map + 1 > e.unlocked || b.p2 === "off"));
}
function Z() {
  const e = Q();
  v("stats").textContent =
    `Matches ${e.matches} · Wins ${e.wins} · Best kills ${e.bestKills} · Maps unlocked ${e.unlocked}/${q.length}`;
}
const B = (e, n) => e[(e.indexOf(n) + 1) % e.length];
v("btn-play").onclick = () => {
  (z.click(), j(), E("setup"));
};
v("btn-back").onclick = () => {
  (Z(), E("title"));
};
v("opt-map").onclick = () => {
  ((b.map = (b.map + 1) % q.length), j());
};
v("opt-p2").onclick = () => {
  ((b.p2 = B(X, b.p2)), j());
};
v("opt-p3").onclick = () => {
  ((b.p3 = B(X, b.p3)), j());
};
v("opt-p4").onclick = () => {
  ((b.p4 = B(X, b.p4)), j());
};
v("opt-kills").onclick = () => {
  ((b.kills = B(De, b.kills)), j());
};
v("btn-start").onclick = ce;
v("btn-again").onclick = ce;
v("btn-menu").onclick = () => {
  ((u = null), Z(), E("title"));
};
function ce() {
  z.click();
  const e = [
    { kind: "human", vehicle: V.get("p1vehicle") || void 0 },
    { kind: b.p2, vehicle: V.get("p2vehicle") || void 0 },
  ];
  for (const n of [b.p3, b.p4]) n !== "off" && e.push({ kind: n });
  ((u = ke({
    mapIndex: b.map,
    players: e,
    killLimit: b.kills,
    seed: +(V.get("seed") || Date.now()),
  })),
    (window.__tt.state = u),
    (window.__tt.recorded = !1),
    u.players.map((n) => n.x),
    (y.x = u.map.pxW / 2),
    (y.y = u.map.pxH / 2),
    (y.dist = 900),
    E(null));
  copilot.start(u, w);
  if (u.players.some((player) => player.kind === "copilot")) costs.start();
}
const L = new Set();
addEventListener("keydown", (e) => {
  (L.add(e.key.toLowerCase()),
    (e.key.startsWith("Arrow") || e.key === " ") && e.preventDefault());
});
addEventListener("keyup", (e) => L.delete(e.key.toLowerCase()));
const S = { mx: 0, my: 0, fire: !1, special: !1 },
  H = v("stick"),
  fe = v("knob");
let K = null;
function he(e) {
  const n = H.getBoundingClientRect();
  let i = e.clientX - (n.left + n.width / 2),
    t = e.clientY - (n.top + n.height / 2);
  const o = Math.hypot(i, t),
    s = n.width / 2;
  (o > s && ((i *= s / o), (t *= s / o)),
    (S.mx = i / s),
    (S.my = t / s),
    (fe.style.transform = `translate(${i}px,${t}px)`));
}
H.addEventListener("pointerdown", (e) => {
  ((K = e.pointerId), H.setPointerCapture(e.pointerId), he(e));
});
H.addEventListener("pointermove", (e) => {
  e.pointerId === K && he(e);
});
const de = (e) => {
  e.pointerId === K &&
    ((K = null), (S.mx = S.my = 0), (fe.style.transform = ""));
};
H.addEventListener("pointerup", de);
H.addEventListener("pointercancel", de);
for (const [e, n] of [
  ["t-fire", "fire"],
  ["t-special", "special"],
]) {
  const i = v(e);
  i.addEventListener("pointerdown", (t) => {
    ((S[n] = !0), i.setPointerCapture(t.pointerId), t.preventDefault());
  });
  for (const t of ["pointerup", "pointercancel"])
    i.addEventListener(t, () => (S[n] = !1));
}
const _e = [
  ["w", "s", "a", "d", "f", "g"],
  ["arrowup", "arrowdown", "arrowleft", "arrowright", ".", "/"],
  ["i", "k", "j", "l", "u", "o"],
  ["8", "5", "4", "6", "7", "9"],
];
function Ke() {
  return _e.map(([e, n, i, t, o, s], l) => {
    var p;
    const a = {
      mx: (L.has(t) ? 1 : 0) - (L.has(i) ? 1 : 0),
      my: (L.has(n) ? 1 : 0) - (L.has(e) ? 1 : 0),
      fire: L.has(o),
      special: L.has(s),
    };
    l === 0 &&
      (Math.hypot(S.mx, S.my) > 0.2 && ((a.mx = S.mx), (a.my = S.my)),
      a.fire || (a.fire = S.fire),
      a.special || (a.special = S.special));
    const r = (
      ((p = navigator.getGamepads) == null ? void 0 : p.call(navigator)) || []
    ).filter(Boolean)[l];
    if (r) {
      const d = je(r);
      (Math.hypot(d.mx, d.my) > 0 && ((a.mx = d.mx), (a.my = d.my)),
        a.fire || (a.fire = d.fire),
        a.special || (a.special = d.special));
    }
    const c = Math.cos(-y.yaw),
      h = Math.sin(-y.yaw);
    return (([a.mx, a.my] = [a.mx * c - a.my * h, a.mx * h + a.my * c]), a);
  });
}
function pe() {
  (($.width = innerWidth * devicePixelRatio),
    ($.height = innerHeight * devicePixelRatio));
}
addEventListener("resize", pe);
pe();
const y = Re();
let C = null;
function Ne(e) {
  const n = [];
  for (let i = 0; i <= e.h; i++)
    for (let t = 0; t <= e.w; t++) n.push(D(e, t * m, i * m));
  return { m: e, pts: n, H: (i, t) => n[t * (e.w + 1) + i] };
}
const T = (e, n) => D(u.map, e, n);
function ze(e) {
  const n = u.players.filter((t) => t.alive);
  ((y.w = $.width), (y.h = $.height));
  const i = n.length ? n : u.players;
  (Oe(y, i, e, u.time),
    qe(
      y,
      i.map((t) => ({
        x: t.x,
        y: t.y,
        z: T(t.x, t.y) + (w[t.vehicle].layer === "air" ? 70 : 0),
      })),
      { l: 50, r: 50, t: 90 * devicePixelRatio, b: 50 },
    ));
}
function U(e, n) {
  return `rgb(${Math.round(e[0] * n)},${Math.round(e[1] * n)},${Math.round(e[2] * n)})`;
}
function N(e, n, i) {
  if (!e.some((t) => !t)) {
    (f.beginPath(), f.moveTo(e[0].sx, e[0].sy));
    for (let t = 1; t < e.length; t++) f.lineTo(e[t].sx, e[t].sy);
    (f.closePath(),
      (f.fillStyle = n),
      f.fill(),
      i && ((f.strokeStyle = i), (f.lineWidth = 1), f.stroke()));
  }
}
function Be(e, n) {
  const i = w[e.vehicle],
    t = i.layer === "air",
    o = T(e.x, e.y);
  if (t) {
    const h = M(y, e.x, e.y, o);
    h &&
      ((f.fillStyle = "rgba(0,0,0,.45)"),
      f.beginPath(),
      f.ellipse(
        h.sx,
        h.sy,
        i.r * h.scale,
        i.r * h.scale * Math.sin(y.pitch) * 0.7,
        0,
        0,
        7,
      ),
      f.fill());
  }
  {
    const h = t ? n : M(y, e.x, e.y, o + 1);
    h &&
      ((f.strokeStyle = e.color),
      (f.lineWidth = 2.5),
      f.beginPath(),
      f.ellipse(
        h.sx,
        h.sy,
        (i.r + 10) * h.scale * 1.4,
        (i.r + 10) * h.scale * 1.4 * Math.sin(y.pitch) * 0.75,
        0,
        0,
        7,
      ),
      f.stroke());
  }
  (f.save(),
    f.translate(n.sx, n.sy),
    f.scale(n.scale * 1.6, n.scale * 1.6 * Math.cos(y.pitch - 0.35)),
    f.rotate(e.angle + y.yaw));
  const s = "#8f9a8c",
    l = "#4c5450";
  ((f.lineWidth = 1.5), (f.strokeStyle = e.color));
  const a = (h, p, d, g, x) => {
      ((f.fillStyle = x), f.fillRect(h, p, d, g), f.strokeRect(h, p, d, g));
    },
    r = (h, p, d, g) => {
      ((f.fillStyle = g),
        f.beginPath(),
        f.arc(h, p, d, 0, 7),
        f.fill(),
        f.stroke());
    };
  switch (e.vehicle) {
    case "tank":
      (a(-14, -11, 28, 22, s), r(0, 0, 7, l), a(0, -2, 16, 4, l));
      break;
    case "artillery":
      (a(-15, -12, 30, 24, s), a(-4, -3, 22, 6, l));
      break;
    case "missileTank":
      (a(-14, -10, 28, 20, s),
        a(-6, -8, 12, 5, "#a33"),
        a(-6, 3, 12, 5, "#a33"));
      break;
    case "nitroCar":
    case "mineCar":
    case "jeep":
      (a(-12, -7, 24, 14, e.vehicle === "jeep" ? "#6b7a4a" : s),
        a(2, -6, 6, 12, l),
        e.boost > 0 && ((f.fillStyle = "#f80"), f.fillRect(-20, -3, 8, 6)));
      break;
    case "ufo":
      (r(0, 0, 13, "#99a"), r(0, 0, 6, "#6ef"));
      break;
    case "mech":
      (a(-9, -12, 18, 24, s), a(-3, -14, 14, 4, l), a(-3, 10, 14, 4, l));
      break;
    case "terminator":
      (a(-14, -18, 28, 36, "#666"), r(0, 0, 9, "#900"), a(4, -3, 18, 6, l));
      break;
    case "jetpack":
    case "rocketeer":
      (r(0, 0, 6, e.vehicle === "jetpack" ? "#cb8" : "#9a7"),
        a(2, -1.5, 8, 3, l));
      break;
    case "heli": {
      (r(0, 0, 9, s),
        a(-22, -2, 14, 4, s),
        (f.strokeStyle = "rgba(200,200,200,.6)"),
        f.beginPath());
      const h = performance.now() / 40;
      (f.moveTo(Math.cos(h) * 18, Math.sin(h) * 18),
        f.lineTo(-Math.cos(h) * 18, -Math.sin(h) * 18),
        f.stroke());
      break;
    }
    case "bomber":
    case "jet":
      ((f.fillStyle = s),
        f.beginPath(),
        f.moveTo(16, 0),
        f.lineTo(-10, e.vehicle === "bomber" ? -16 : -11),
        f.lineTo(-6, 0),
        f.lineTo(-10, e.vehicle === "bomber" ? 16 : 11),
        f.closePath(),
        f.fill(),
        f.stroke(),
        (f.globalCompositeOperation = "lighter"),
        (f.fillStyle = "rgba(255,120,40,.8)"),
        f.beginPath(),
        f.arc(-9, 0, 5, 0, 7),
        f.fill(),
        (f.globalCompositeOperation = "source-over"));
      break;
  }
  (f.restore(),
    e.spawnShield > 0 &&
      ((f.strokeStyle = "rgba(255,255,255,.5)"),
      f.beginPath(),
      f.ellipse(
        n.sx,
        n.sy,
        (i.r + 6) * n.scale,
        (i.r + 6) * n.scale * 0.6,
        0,
        0,
        7,
      ),
      f.stroke()),
    (f.fillStyle = e.color),
    (f.font = `bold ${Math.max(12, 16 * n.scale) | 0}px Verdana`),
    (f.textAlign = "center"),
    f.fillText("P" + (e.id + 1), n.sx, n.sy - (i.r + 22) * n.scale * 1.6));
  const c = 34 * Math.max(0.7, n.scale);
  ((f.fillStyle = "#300"),
    f.fillRect(n.sx - c / 2, n.sy - (i.r + 20) * n.scale * 1.6, c, 4),
    (f.fillStyle = "#4f4"),
    f.fillRect(
      n.sx - c / 2,
      n.sy - (i.r + 20) * n.scale * 1.6,
      (c * Math.max(0, e.hp)) / e.maxHp,
      4,
    ));
}
function G(e, n, i, t, o) {
  const s = f.createRadialGradient(e, n, 0, e, n, i);
  (s.addColorStop(0, t),
    s.addColorStop(1, o),
    (f.fillStyle = s),
    f.beginPath(),
    f.arc(e, n, i, 0, 7),
    f.fill());
}
function Fe() {
  const e = $.width,
    n = $.height;
  if (
    (f.setTransform(1, 0, 0, 1, 0, 0),
    (f.fillStyle = "#000"),
    f.fillRect(0, 0, e, n),
    !u)
  )
    return;
  ((y.w = e), (y.h = n));
  const i = u.map;
  (!C || C.m !== i) && (C = Ne(i));
  const t = C,
    o = [];
  for (let r = 0; r < i.h; r++)
    for (let c = 0; c < i.w; c++) {
      const h = M(y, (c + 0.5) * m, (r + 0.5) * m, 0);
      h && o.push([h.depth, c, r]);
    }
  o.sort((r, c) => c[0] - r[0]);
  const s = u.map.pxW * 0.3,
    l = u.map.pxH * 0.75;
  for (const [, r, c] of o) {
    const h = t.H(r, c),
      p = t.H(r + 1, c),
      d = t.H(r, c + 1),
      g = t.H(r + 1, c + 1),
      x = [
        M(y, r * m, c * m, h),
        M(y, (r + 1) * m, c * m, p),
        M(y, (r + 1) * m, (c + 1) * m, g),
        M(y, r * m, (c + 1) * m, d),
      ],
      k = (p - h + (g - d)) * 0.5 + (d - h + (g - p)) * 0.5,
      R = Math.max(0.35, Math.min(1.25, 0.85 - k * 0.03)),
      I = Math.hypot((r + 0.5) * m - s, (c + 0.5) * m - l),
      F = Math.max(0, 1 - I / (u.map.pxW * 0.45)),
      me = [62 + 110 * F, 92 - 30 * F, 86 - 30 * F];
    N(x, U(me, R), "rgba(0,0,0,.08)");
  }
  f.globalAlpha = 0.75;
  for (const [, r, c] of o)
    if (i.tiles[c * i.w + r] === 2) {
      const h = -14 + Math.sin(u.time * 2 + r + c) * 1.2,
        p = [
          M(y, r * m, c * m, h),
          M(y, (r + 1) * m, c * m, h),
          M(y, (r + 1) * m, (c + 1) * m, h),
          M(y, r * m, (c + 1) * m, h),
        ];
      N(p, (r * 7 + c * 3) % 5 ? "#4f86b8" : "#79aedb");
    }
  f.globalAlpha = 1;
  const a = [];
  for (let r = 0; r < i.h; r++)
    for (let c = 0; c < i.w; c++)
      if (i.tiles[r * i.w + c] === 1) {
        const h = M(y, (c + 0.5) * m, (r + 0.5) * m, 0);
        h && a.push({ d: h.depth, f: () => Ve(c, r) });
      }
  for (const r of u.players)
    if (r.alive) {
      const c = w[r.vehicle].layer === "air",
        h = M(y, r.x, r.y, T(r.x, r.y) + (c ? 70 : 6));
      h && a.push({ d: h.depth - (c ? 1e3 : 0), f: () => Be(r, h) });
    }
  a.sort((r, c) => c.d - r.d);
  for (const r of a) r.f();
  for (const r of u.mines) {
    const c = M(y, r.x, r.y, T(r.x, r.y) + 2);
    c &&
      ((f.fillStyle = r.arm > 0 ? "#aa0" : "#e33"),
      f.beginPath(),
      f.arc(c.sx, c.sy, 4 * c.scale, 0, 7),
      f.fill());
  }
  f.globalCompositeOperation = "lighter";
  for (const r of u.projectiles) {
    if (r.delay > 0) continue;
    let c = T(r.x, r.y) + 12;
    if (r.kind === "lob") {
      const d = 1 - r.life / r.total;
      c += Math.sin(d * Math.PI) * 90;
    }
    const h = M(y, r.x, r.y, c);
    if (!h) continue;
    const p = r.kind === "homing" || r.kind === "lob";
    G(
      h.sx,
      h.sy,
      (p ? 14 : 8) * h.scale,
      p ? "rgba(255,170,90,1)" : "rgba(255,240,150,1)",
      "rgba(255,60,0,0)",
    );
  }
  for (const r of u.effects) {
    const c = M(y, r.x, r.y, T(r.x, r.y) + 10);
    if (c)
      if (r.kind === "boom")
        G(
          c.sx,
          c.sy,
          r.r * (1.4 - r.t) * c.scale,
          `rgba(255,230,140,${Math.min(1, r.t * 1.8)})`,
          "rgba(200,30,0,0)",
        );
      else if (r.kind === "laser") {
        const h = M(y, r.x2, r.y2, T(r.x2, r.y2) + 10);
        h &&
          ((f.strokeStyle = r.color),
          (f.lineWidth = 4 * c.scale),
          (f.globalAlpha = Math.min(1, r.t * 4)),
          f.beginPath(),
          f.moveTo(c.sx, c.sy),
          f.lineTo(h.sx, h.sy),
          f.stroke(),
          (f.globalAlpha = 1));
      } else
        G(
          c.sx,
          c.sy,
          6 * c.scale,
          "rgba(255,255,255,1)",
          "rgba(255,255,255,0)",
        );
  }
  f.globalCompositeOperation = "source-over";
}
function Ve(e, n) {
  const i =
      Math.min(C.H(e, n), C.H(e + 1, n), C.H(e, n + 1), C.H(e + 1, n + 1)) - 4,
    t = i + 34,
    o = [
      [e, n],
      [e + 1, n],
      [e + 1, n + 1],
      [e, n + 1],
    ].map(([a, r]) => [a * m, r * m]),
    s = [];
  for (let a = 0; a < 4; a++) {
    const [r, c] = o[a],
      [h, p] = o[(a + 1) % 4],
      d = M(y, (r + h) / 2, (c + p) / 2, (i + t) / 2);
    if (!d) return;
    s.push({
      d: d.depth,
      l: [1, 0.75, 0.55, 0.8][a],
      q: [M(y, r, c, i), M(y, h, p, i), M(y, h, p, t), M(y, r, c, t)],
    });
  }
  s.sort((a, r) => r.d - a.d);
  const l = M(y, (e + 0.5) * m, (n + 0.5) * m, 0);
  f.globalAlpha = l && l.depth < y.dist * 0.85 ? 0.45 : 1;
  for (const a of s) N(a.q, U([150, 140, 125], a.l), "#2a2622");
  (N(
    o.map(([a, r]) => M(y, a, r, t)),
    U([175, 165, 150], 1),
    "#3a3530",
  ),
    (f.globalAlpha = 1));
}
function Ye() {
  if (!u) {
    v("hud").innerHTML = "";
    return;
  }
  v("hud").innerHTML =
    u.players
      .map((e) => {
        const n = w[e.vehicle],
          i = n.special ? ` · ${n.special.type} ×${e.sammo}` : "",
          t = e.ammo === 1 / 0 ? "" : ` · ammo ${e.ammo}`;
        return `<div class="pl" style="border-color:${e.color}" data-p="${e.id}"><b style="color:${e.color}">P${e.id + 1}</b> ${e.alive ? n.name : "respawning…"} — <b>${e.score}</b>/${u.killLimit}<div class="bar"><i style="width:${(100 * Math.max(0, e.hp)) / e.maxHp}%"></i></div><small>${t}${i}</small></div>`;
      })
      .join("") +
    `<div class="pl" style="border-color:#666">⏱ ${Math.max(0, Math.ceil(u.timeLimit - u.time))}s</div>`;
}
function Ge() {
  window.__tt.recorded ||
    ((window.__tt.recorded = !0),
    He(localStorage, u),
    z.win(),
    (v("result-title").textContent =
      u.winner == null ? "DRAW" : `PLAYER ${u.winner + 1} WINS!`),
    (v("result-title").style.color =
      u.winner == null ? "#ffb300" : u.players[u.winner].color),
    (v("result-table").innerHTML =
      "<tr><th>Player</th><th>Score</th><th>Kills</th><th>Deaths</th></tr>" +
      u.players
        .map(
          (e) =>
            `<tr style="color:${e.color}"><td>P${e.id + 1} (${e.kind})</td><td>${e.score}</td><td>${e.kills}</td><td>${e.deaths}</td></tr>`,
        )
        .join("")),
    E("result"));
}
function ye(e) {
  const n = Math.min(0.05, (e - ne) / 1e3 || 0);
  if (((ne = e), u && !u.over)) {
    copilot.tick();
    const i = Ke();
    for (let t = 0; t < 2; t++) {
      Ae(u, i, n / 2);
      for (const o of u.events) z.event(o);
    }
    (ze(n), u.over && setTimeout(Ge, 900));
  }
  (Fe(), Ye(), requestAnimationFrame(ye));
}
window.__tt = {
  state: null,
  opts: b,
  progress: Q,
  offscreen: () =>
    u
      ? u.players
          .filter((e) => e.alive)
          .map((e) => ({ id: e.id, q: M(y, e.x, e.y, T(e.x, e.y)) }))
          .filter(
            ({ q: e }) =>
              !e || e.sx < 0 || e.sy < 0 || e.sx > y.w || e.sy > y.h,
          )
          .map((e) => e.id)
      : [],
};
Z();
E("title");
requestAnimationFrame(ye);
"serviceWorker" in navigator &&
  navigator.serviceWorker.register("./sw.js").catch(() => {});
addEventListener(
  "pointerdown",
  () => {
    matchMedia("(pointer: coarse)").matches &&
      !document.fullscreenElement &&
      document.documentElement.requestFullscreen &&
      document.documentElement
        .requestFullscreen()
        .then(() => {
          var e, n;
          return (n = (e = screen.orientation) == null ? void 0 : e.lock) ==
            null
            ? void 0
            : n.call(e, "landscape");
        })
        .catch(() => {});
  },
  { once: !0 },
);
