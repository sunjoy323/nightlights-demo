#!/usr/bin/env node
// Parallel build + verify 1000 packed levels for 环球电工 v5.
import { createRequire } from "module";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { deflateRawSync } from "zlib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!isMainThread) {
  const C = require("./core.js");
  const W = require("./world.js");
  require("./landmarks.js");
  const G = require("./gen.js");

  function bytesOf(lv) { return Uint8Array.from(C.packLevel(lv)); }
  function nColorsOf(lv) {
    const set = new Set();
    for (const row of lv.grid) for (const c of row) if (c && (c.on || c.dormant)) set.add(c.c);
    return set.size;
  }
  function metaOf(lv, ev, n) {
    const city = W.cityOf(n);
    const role = G.roleOf(n);
    return {
      n,
      id: lv.id,
      name: lv.name,
      city: city.id,
      cityName: city.name,
      region: city.region,
      landmark: !!lv.landmark,
      landmarkType: city.landmark,
      landmarkName: city.landmarkName,
      role,
      tier: lv.tier,
      mechanic: lv.mechanic || null,
      mechs: lv.mechs || [],
      hint: lv.hint,
      quote: lv.quote,
      water: !!lv.water,
      theme: city.id,
      score: ev.diff ? ev.diff.score : (lv.diff && lv.diff.score) || 0,
      think: ev.diff ? ev.diff.think : 0,
      peak: ev.diff ? ev.diff.peak : 0,
      greedyOk: !!(ev.greedy && ev.greedy.ok),
      leftOk: !!(ev.left && ev.left.ok),
      rand: ev.rand ? ev.rand.rate : null,
      randWins: ev.rand ? ev.rand.wins : null,
      randTrials: ev.rand ? ev.rand.trials : null,
      sols: ev.cnt ? ev.cnt.count : null,
      keyCount: ev.cnt ? ev.cnt.keyCount : null,
      unique: ev.cnt ? ev.cnt.unique : null,
      keyUnique: ev.cnt ? ev.cnt.keyUnique : null,
      truncated: ev.cnt ? ev.cnt.truncated : null,
      W: lv.W,
      H: lv.H,
      lights: C.countNeed(lv.grid).total,
      nColors: nColorsOf(lv),
      path: ev.sol ? ev.sol.path : lv.solPath || [],
    };
  }

  function buildOne(n) {
    const t0 = Date.now();
    let lv, ev;
    if (n <= 5) {
      lv = G.enrich(require("./core.js").LEVELS[n - 1], n);
      ev = G.evaluate(lv, { keepGoing: true, maxVisits: 40000, countVisits: 20000, randTrials: 80, maxSol: 16 });
      if (!ev.ok) throw new Error("L" + n + " unsolvable");
    } else {
      lv = G.generate(n, { maxTry: 90 });
      ev = {
        ok: true,
        sol: { ok: true, path: lv.solPath || [] },
        greedy: { ok: !!lv.greedyOk },
        left: { ok: !!(lv.diff && lv.diff.leftOk) },
        rand: typeof lv.rand === "object" ? lv.rand : { rate: lv.rand, wins: lv.randWins, trials: lv.randTrials },
        cnt: { count: lv.sols, unique: !!lv.unique, keyUnique: !!lv.keyUnique, keyCount: lv.keyCount, truncated: !!lv.truncated },
        diff: lv.diff || { score: 0, think: 0, peak: 0 },
      };
      if (!ev.ok || !G.passesHard(n, ev)) {
        delete G.cache[n];
        lv = G.generate(n, { maxTry: 120 });
        ev = {
          ok: true,
          sol: { ok: true, path: lv.solPath || [] },
          greedy: { ok: !!lv.greedyOk },
          left: { ok: !!(lv.diff && lv.diff.leftOk) },
          rand: typeof lv.rand === "object" ? lv.rand : { rate: lv.rand, wins: lv.randWins, trials: lv.randTrials },
          cnt: { count: lv.sols, unique: !!lv.unique, keyUnique: !!lv.keyUnique, keyCount: lv.keyCount, truncated: !!lv.truncated },
          diff: lv.diff || { score: 0, think: 0, peak: 0 },
        };
        if (!ev.ok || !G.passesHard(n, ev)) {
          throw new Error("hard filter failed " + n +
            " greedy=" + ev.greedy.ok +
            " rand=" + (ev.rand && ev.rand.rate) +
            " keyU=" + (ev.cnt && ev.cnt.keyUnique) +
            " keyC=" + (ev.cnt && ev.cnt.keyCount));
        }
      }
    }
    const pack = bytesOf(lv);
    return { packB64: Buffer.from(pack).toString("base64"), meta: metaOf(lv, ev, n), ms: Date.now() - t0 };
  }

  (async () => {
    for (const n of workerData.ns) {
      try {
        const rec = buildOne(n);
        parentPort.postMessage({ ok: true, n, rec });
      } catch (e) {
        parentPort.postMessage({ ok: false, n, error: e && e.message ? e.message : String(e) });
      }
    }
  })();
} else {
  const C = require("./core.js");
  const W = require("./world.js");
  require("./landmarks.js");
  const G = require("./gen.js");

  const TOTAL = W.TOTAL || 1000;
  const CHECK = path.join(__dirname, "docs", "levels-1000-checkpoint.json");
  const META_OUT = path.join(__dirname, "docs", "curve-1-1000.json");
  const BANK_JS = path.join(__dirname, "levels-bank.js");
  const BIN_OUT = path.join(__dirname, "docs", "levels-1000.bin");
  const WORKERS = Math.max(1, Math.min(8, os.cpus().length));

  function loadCheckpoint() {
    if (!fs.existsSync(CHECK)) return { byN: {} };
    try { return JSON.parse(fs.readFileSync(CHECK, "utf8")); } catch (e) { return { byN: {} }; }
  }
  let cp = loadCheckpoint();
  if (!cp.byN) cp.byN = {};
  let savePending = false;
  function saveCheckpoint() {
    fs.mkdirSync(path.dirname(CHECK), { recursive: true });
    fs.writeFileSync(CHECK, JSON.stringify(cp));
    savePending = false;
  }

  const startArg = Number(process.argv[2] || 1);
  const endArg = Number(process.argv[3] || TOTAL);
  const todo = [];
  for (let n = startArg; n <= endArg; n++) if (!cp.byN[n]) todo.push(n);
  console.log("Building levels", startArg, "..", endArg, "todo", todo.length, "cached", endArg - startArg + 1 - todo.length, "workers", WORKERS);

  const tStart = Date.now();
  let fail = 0, done = 0, doneInRun = 0;

  function finishBank() {
    const metas = [];
    const chunks = [];
    for (let n = 1; n <= TOTAL; n++) {
      const rec = cp.byN[n];
      if (!rec) { console.error("missing", n); fail++; continue; }
      metas.push(rec.meta);
      const buf = Buffer.from(rec.packB64, "base64");
      const hdr = Buffer.alloc(2);
      hdr.writeUInt16LE(buf.length);
      chunks.push(hdr, buf);
    }
    if (fail) return;
    const raw = Buffer.concat(chunks);
    const deflated = deflateRawSync(raw, { level: 9 });
    fs.writeFileSync(BIN_OUT, deflated);
    const curve = {
      v: 5,
      total: TOTAL,
      builtAt: new Date().toISOString(),
      intros: G.INTROS,
      cities: W.CITIES.map((c) => ({ id: c.id, name: c.name, landmark: c.landmarkName, region: c.region })),
      tutorial: G.TUTORIAL,
      rules: {
        afterTutorial: "greedy must fail; random legal win rate < 10% (bosses < 2%)",
        unique: "大关以关键决策序列唯一：钥匙/开关工单相对「等待工单」的点下顺序相同。同色等待工单互换不算不同的解。",
      },
      levels: metas,
    };
    fs.writeFileSync(META_OUT, JSON.stringify(curve));
    // Runtime only needs what attachWorld() cannot re-derive; keep the bank small.
    const slim = metas.map((m) => {
      const o = { n: m.n, id: m.id, tier: m.tier, role: m.role, score: m.score };
      if (m.mechanic) o.mechanic = m.mechanic;
      if (m.mechs && m.mechs.length) o.mechs = m.mechs;
      if (m.keyUnique) o.keyUnique = true;
      if (m.rand != null) o.rand = m.rand;
      return o;
    });
    const b64 = deflated.toString("base64");
    const js = `/* packed 1000-level bank, deflate-raw + base64. Generated, do not edit. */\nwindow.NIGHT_BANK_B64 = "${b64}";\nwindow.NIGHT_BANK_META = ${JSON.stringify(slim)};\n`;
    fs.writeFileSync(BANK_JS, js);
    console.log("\nwrote", BANK_JS, js.length, "chars; deflated", deflated.length, "raw", raw.length);
    const after = metas.filter((m) => m.n > 5);
    const gPass = after.filter((m) => m.greedyOk).length;
    const rVals = after.map((m) => m.rand).sort((a, b) => a - b);
    const bosses = metas.filter((m) => m.n % 10 === 0 && m.n > 5);
    const uniq = bosses.filter((m) => m.unique || m.keyUnique).length;
    const lights = after.map((m) => m.lights);
    const cols = after.map((m) => m.nColors || 0);
    const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    const pct = (arr, p) => arr[Math.min(arr.length - 1, Math.floor(p * arr.length))];
    console.log("SUMMARY after tutorial:", after.length,
      "greedyPass", gPass,
      "rand p50", (pct(rVals, 0.5) * 100).toFixed(1) + "%",
      "p90", (pct(rVals, 0.9) * 100).toFixed(1) + "%",
      "max", (rVals[rVals.length - 1] * 100).toFixed(1) + "%",
      "bosses", bosses.length, "keyUnique", uniq,
      "lights avg", avg(lights).toFixed(0), "min", Math.min(...lights), "max", Math.max(...lights),
      "colors avg", avg(cols).toFixed(1), "min", Math.min(...cols), "max", Math.max(...cols),
      "fail", fail);
  }

  if (!todo.length) {
    console.log("all cached");
    if (startArg === 1 && endArg === TOTAL) finishBank();
    if (fail) { console.error(fail + " failed"); process.exit(1); }
    console.log("done");
    process.exit(0);
  }

  for (const sig of ["SIGTERM", "SIGINT", "SIGHUP"]) process.on(sig, () => { saveCheckpoint(); console.log("saved on", sig); process.exit(130); });
  const queues = Array.from({ length: WORKERS }, () => []);
  todo.forEach((n, i) => queues[i % WORKERS].push(n));
  const workers = [];
  let remainingWorkers = 0;

  function onDone() {
    remainingWorkers--;
    if (remainingWorkers > 0) return;
    saveCheckpoint();
    const elapsed = ((Date.now() - tStart) / 1000).toFixed(1);
    console.log("run finished in", elapsed, "s, new", doneInRun, "fail", fail);
    if (startArg === 1 && endArg === TOTAL) finishBank();
    if (fail) { console.error(fail + " failed"); process.exit(1); }
    console.log("done");
  }

  for (let i = 0; i < WORKERS; i++) {
    if (!queues[i].length) continue;
    remainingWorkers++;
    const w = new Worker(fileURLToPath(import.meta.url), { workerData: { ns: queues[i] } });
    w.on("message", (msg) => {
      done++; doneInRun++;
      if (msg.ok) {
        cp.byN[msg.n] = msg.rec;
        const m = msg.rec.meta;
        console.log(
          `${m.greedyOk && m.n > 5 ? "WARN" : "OK "} ${String(m.n).padStart(4)} ${String(m.cityName).padEnd(8)} ${String(m.name).padEnd(10)} ${String(m.role).padEnd(12)} sc=${m.score} L=${m.lights} C=${m.nColors} g=${m.greedyOk ? "Y" : "N"} r=${(m.rand * 100).toFixed(1)}% sols=${m.sols} keyC=${m.keyCount} keyU=${m.keyUnique} ${msg.rec.ms}ms`
        );
        saveCheckpoint();
      } else {
        fail++;
        console.error("FAIL", msg.n, msg.error);
        saveCheckpoint();
      }
    });
    w.on("error", (e) => { fail++; console.error("WORKER", e); });
    w.on("exit", (code) => {
      if (code !== 0) { fail++; console.error("worker exit", code); }
      onDone();
    });
    workers.push(w);
  }
}
