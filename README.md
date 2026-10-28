# Tap Tactics

A shared-screen vehicle deathmatch game for 1-4 players, paying tribute to
Shatterstorm's *Tappo Tactics* (1998-99). Play solo against the CPU or with
friends on the same device, using a keyboard, gamepads, or touch controls.

## Run locally

### With Copilot AI opponents

Use Node.js 22.12+ (or 20.19+) and an installed
[GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli).
Sign in to the CLI with an account that has Copilot model access:

```powershell
copilot login
npm install
npm start
```

Open <http://127.0.0.1:8000>, choose **PLAY**, and click a player type button
until it reads **Copilot AI**. Players 2-4 can each use it.
The server binds only to your machine's loopback interface.

If needed, set `COPILOT_CLI_PATH` to the absolute path of your CLI executable.
To use another port in PowerShell:

```powershell
$env:PORT = "8001"
npm start
```

The SDK is pinned to a CLI-backed release. No browser credentials or API keys
are required: authentication stays in your local Copilot CLI.

### Offline CPU / local multiplayer only

The game itself remains a static site: no build step or account is needed for
ordinary CPU, human, or dummy players.

With Python 3 installed, run this from the project folder:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open <http://localhost:8000>. Stop the server with `Ctrl+C`.
If port 8000 is occupied, choose another port and update the URL.
Any static HTTP server can serve the offline modes, but Copilot AI requires
`npm start`. Use HTTP rather than opening
the HTML file directly so browser modules and the service worker work correctly.

## Start a match

1. Select **PLAY**.
2. Click the setup buttons to cycle through maps, player types, and kill limits.
3. Select **START**.

Player 1 is always human. Players 2-4 can be **CPU**, **Copilot AI**, **Human**, **Dummy CPU**
(a non-attacking practice opponent), or **Off**. Player 2 must be enabled to start.
The default match is Player 1 against one CPU, with a limit of 5.
Available limits are **1, 3, 5, and 10**; try 1 for a quick practice round.

All players share one arena and an automatically tracking camera.
This is local multiplayer, not online multiplayer.

## Copilot AI

Copilot makes tactical decisions rather than trying to control every frame.
It chooses an enemy, attack/flank/retreat behavior, preferred combat distance,
and whether to allow specials. The existing game code still handles movement,
collision avoidance, aiming, cooldowns, and safe special timing.

- **Model selection:** discover the models available to your account. Prefer an
  enabled model whose ID or display name contains `decision`. Otherwise benchmark
  up to three available speed-oriented models (Flash, Haiku, Mini, or Fast) using
  a small tactical request and select the fastest valid response. If none have
  those labels, benchmark up to three other available models. The SDK has no
  authoritative latency ranking: this is the fastest measured candidate, not a
  guarantee across every model. Selection is reused until the server restarts.
- **Updates:** at most one request at a time, no more often than every four
  seconds. All living Copilot opponents share one request. Decisions can take
  longer than four seconds; gameplay never waits for the network.
- **Fallback:** ordinary CPU logic takes over while connecting, before the first
  plan, after a respawn invalidates a plan, or when a plan is older than twelve
  seconds. The on-screen status reports active tactics and fallback. A busy
  backend is retried; authentication, timeout, or invalid-response failures
  disable AI for that match. Start another match to retry.
- **Privacy and usage:** opting into Copilot AI sends only a bounded arena
  snapshot (map ID, match time, player positions, vehicles, health, scores, and
  ammunition) to Copilot. It consumes your account's model quota, including up
  to three model-selection probes at first use. Normal CPU mode makes no model
  calls. Offline play cannot use Copilot.
- **Permissions:** the AI has no game tools, shell/file tools, MCP servers, or
  discovered workspace configuration. Permission requests are rejected and model
  output is validated before use. Short-lived SDK sessions are disconnected and
  deleted after each decision.

No chat interface, generated maps, or online multiplayer is added.

### Live costs

Copilot matches show a cost panel that refreshes once per second as the SDK
reports usage. It shows AI-unit cost, premium-request units, input/output and
cache tokens, requests in flight, failed requests, and model-selection probes.
Totals include every game tab and match since this server started, including
usage reported by calls that failed to produce a valid tactical plan.
The panel stays available on the results screen and carries over to rematches.

These are **SDK-reported billing units, not a USD estimate or invoice**.
AI units come from `copilotUsage.totalNanoAiu / 1,000,000,000`; premium-request
units come from the SDK's `cost` field. They are separate usage metrics, not
two charges to add together. Your actual bill depends on your Copilot plan.
Missing billing fields display **not reported**, and incomplete totals are
marked **partial**, never assumed free. Charges may arrive after a request
completes; offline readings are explicitly marked as stale.

The read-only usage endpoint does not start the SDK, call a model, or use quota.
Polling begins only after selecting a Copilot AI match. It continues through
menus and results to capture late reports, and stops when the page is left.
Ordinary CPU-only play still makes no model calls. Counters reset when the
server restarts; other Copilot activity and earlier server runs are not included.

## Controls

Movement keys specify a direction; vehicles turn or strafe according to their
type. Hold the fire key to keep shooting.

| Player | Move | Fire | Special |
| --- | --- | --- | --- |
| P1 | W / A / S / D | F | G |
| P2 | Arrow keys | . | / |
| P3 | I / J / K / L | U | O |
| P4 | Numpad 8 / 4 / 5 / 6 | Numpad 7 | Numpad 9 |

For P4, 8 is up, 4 left, 5 down, and 6 right. Enable Num Lock so the
keys produce numbers.

- **Gamepad:** stick or D-pad to move, A to fire, B for special. Connected
  gamepads are assigned in order to player slots; set those slots to Human.
- **Touch (P1):** drag the on-screen joystick and hold **FIRE** or **SPEC**.
  Use landscape orientation on phones and tablets.

## Rules and vehicles

- Destroy an opponent to earn one point. Self-inflicted or environmental deaths
  subtract one point.
- Reach the selected score limit to win. Despite the setup label "Kill limit",
  the target is your **score**, not your raw kill count.
- Matches also have a **180-second timer**. The highest score wins when time
  expires; a tie for first is a draw.
- After dying, respawn after two seconds in a randomly selected different
  vehicle, with fresh health and ammunition and a brief spawn shield.
- The HUD shows each player's vehicle, score, health, and any limited ammunition
  or special uses, plus the time remaining.
- The results screen lists scores, kills, and deaths. Choose **REMATCH** to play
  again with the same setup, or **Menu** to return to the title screen.

There are 14 vehicle types with different movement and weapons:

| Vehicle | Weapon / special |
| --- | --- |
| Tank | Cannon |
| Artillery | Lobbed explosive shells |
| Missile Carrier | Limited homing missiles |
| Nitro Car | Rapid fire; limited nitro boosts |
| Mine Car | Rapid fire; limited mines |
| UFO | Auto-aim fire; one self-destruct |
| Mech | Rapid fire; limited laser shots |
| Terminator | Heavy shots; limited missile salvos |
| Jetpack Trooper | Fast airborne movement and rapid fire |
| Rocket Trooper | Limited explosive rounds |
| Helicopter | Rapid fire; limited homing shots |
| Jeep | Auto-aim fire |
| Bomber | Carpet bombs; continuous forward flight |
| Jet | Explosive shots; continuous forward flight |

Not every vehicle has a special. Watch the HUD before spending limited ammo,
and keep steering when flying a plane: it does not stop when movement is released.

## Maps and saved progress

The maps unlock in order:

1. **Training Yard** (available immediately)
2. **Riverside**
3. **Downtown**
4. **Islands**

A **Player 1 win** unlocks the map following the one just played. Locked maps
can be selected in setup, but cannot be started.

Completed matches, Player 1 wins, best kill count, and map unlocks are saved in
the browser's local storage. There is no cloud sync. Clearing site data resets
progress; another browser, hostname, or port has a separate save. In particular,
`localhost` and `127.0.0.1` do not share progress.

## Install and offline use

The game includes a web app manifest and service worker. Supporting browsers
can offer **Install app** or **Add to Home Screen**, with a landscape/fullscreen
presentation where supported.

Visit the game online and start a match before relying on offline use: the
service worker caches the page shell and same-origin assets as they are fetched.
Offline availability depends on the browser retaining those cached files.
Service workers require localhost or HTTPS.

## Files

- [index.html](./index.html): game page and menus.
- [game.js](./game.js): readable game code, recovered from the prebuilt bundle,
  with the Copilot opponent hook.
- [copilot-game.js](./copilot-game.js): browser-side asynchronous AI controller.
- [copilot-ai.js](./copilot-ai.js): SDK sessions, model selection, and validation.
- [server.js](./server.js): local static server and restricted AI endpoints.
- [copilot.css](./copilot.css): AI status styling.
- [assets/](./assets/): original compiled CSS.
- [icons/](./icons/): app icons.
- [manifest.webmanifest](./manifest.webmanifest): installation metadata.
- [sw.js](./sw.js): offline caching.

The original unbundled source project is not included. The game runs directly
as browser modules; there is no compilation step.

## Checks

```powershell
npm run check
npm test
```

Tests use a fake SDK and do not consume Copilot quota. They cover model selection,
snapshot/response validation, session cleanup, request throttling, stale responses,
usage accounting, cost formatting, polling lifecycle, and local API restrictions.
To check the live integration, start a Copilot AI
match and wait for the status to show the selected model and an opponent's tactic.
