#!/usr/bin/env node
// Build and verify 500 packed levels for 环球电工.
import { createRequire } from "module";
import { deflateRawSync } from "zlib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const C = require("./core.js");
const W = require("./world.js");
const LM = require("./landmarks.js");
const G = require("./gen.js");

const TOTAL = 500;
const CHECK = path.join(__dirname, "docs", "levels-500-checkpoint.json");
const META_OUT = path.join(__dirname, "docs", "curve-1-500.json");
const BANK_JS = path.join(__dirname, "levels-bank.js");
const BIN_OUT = path.join(__dirname, "docs", "levels-500.bin");

function bytesOf(lv) {
  return Uint8Array.from(C.packLevel(lv));
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
    path: ev.sol ? ev.sol.path : lv.solPath || [],
  };
}

function loadCheckpoint() {
  if (!fs.existsSync(CHECK)) return { byN: {} };
  try { return JSON.parse(fs.readFileSync(CHECK, "utf8")); } catch (e) { return { byN: {} }; }
}

let cp = loadCheckpoint();
if (!cp.byN) cp.byN = {};

function saveCheckpoint() {
  fs.mkdirSync(path.dirname(CHECK), { recursive: true });
  // don't store packed bytes in checkpoint json (too big); only rebuild from scratch packs at the end
  // actually we need packs to resume. Store packs as base64 per level.
  fs.writeFileSync(CHECK, JSON.stringify(cp));
}

async function buildOne(n) {
  if (cp.byN[n] && cp.byN[n].packB64 && cp.byN[n].meta) return cp.byN[n];
  const t0 = Date.now();
  let lv, ev;
  if (n <= 5) {
    lv = G.enrich(C.LEVELS[n - 1], n);
    ev = G.evaluate(lv, { keepGoing: true, maxVisits: 400000, countVisits: 80000, randTrials: 200, maxSol: 16 });
    if (!ev.ok) throw new Error("hand level " + n + " unsolvable");
  } else {
    lv = G.generate(n, { maxTry: G.isBoss(G.roleOf(n)) ? 80 : 55 });
    ev = G.evaluate(lv, {
      keepGoing: true,
      maxVisits: 120000,
      countVisits: 80000,
      randTrials: n % 10 === 0 ? 200 : 160,
      maxSol: 16,
    });
    if (!ev.ok) throw new Error("generated unsolvable " + n);
    if (!G.passesHard(n, ev)) {
      // try more
      delete G.cache[n];
      lv = G.generate(n, { maxTry: 90 });
      ev = G.evaluate(lv, { keepGoing: true, maxVisits: 120000, countVisits: 80000, randTrials: 200, maxSol: 16 });
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
  const rec = { packB64: Buffer.from(pack).toString("base64"), meta: metaOf(lv, ev, n), ms: Date.now() - t0 };
  cp.byN[n] = rec;
  return rec;
}

const startArg = Number(process.argv[2] || 1);
const endArg = Number(process.argv[3] || TOTAL);
console.log("Building levels", startArg, "..", endArg);

let fail = 0;
for (let n = startArg; n <= endArg; n++) {
  try {
    const rec = await buildOne(n);
    const m = rec.meta;
    console.log(
      `${m.greedyOk && n > 5 ? "WARN" : "OK "} ${String(n).padStart(3)} ${String(m.cityName).padEnd(6)} ${String(m.name).padEnd(10)} ${m.role.padEnd(12)} sc=${m.score} g=${m.greedyOk ? "Y" : "N"} r=${(m.rand * 100).toFixed(1)}% sols=${m.sols} keyC=${m.keyCount} keyU=${m.keyUnique} ${rec.ms}ms`
    );
    if (n % 5 === 0) saveCheckpoint();
  } catch (e) {
    fail++;
    console.error("FAIL", n, e.message);
    saveCheckpoint();
    // keep going to see more, but count fail
    if (fail >= 8 && n < 30) { console.error("too many early fails, abort"); process.exit(1); }
  }
}
saveCheckpoint();

if (startArg === 1 && endArg === TOTAL) {
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
  const raw = Buffer.concat(chunks);
  const deflated = deflateRawSync(raw, { level: 9 });
  fs.writeFileSync(BIN_OUT, deflated);
  const curve = {
    v: 4,
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
  const b64 = deflated.toString("base64");
  const js = `/* packed 500-level bank, deflate-raw + base64. Generated, do not edit. */\nwindow.NIGHT_BANK_B64 = "${b64}";\nwindow.NIGHT_BANK_META = ${JSON.stringify(metas)};\n`;
  fs.writeFileSync(BANK_JS, js);
  console.log("\nwrote", BANK_JS, js.length, "chars; deflated", deflated.length, "raw", raw.length);
  // summary
  const after = metas.filter((m) => m.n > 5);
  const gPass = after.filter((m) => m.greedyOk).length;
  const rVals = after.map((m) => m.rand);
  const bosses = metas.filter((m) => m.n % 10 === 0 && m.n > 5);
  const uniq = bosses.filter((m) => m.unique || m.keyUnique).length;
  rVals.sort((a, b) => a - b);
  const pct = (p) => rVals[Math.min(rVals.length - 1, Math.floor(p * rVals.length))];
  console.log("SUMMARY after tutorial:", after.length,
    "greedyPass", gPass,
    "rand p50", (pct(0.5) * 100).toFixed(1) + "%",
    "p90", (pct(0.9) * 100).toFixed(1) + "%",
    "max", (rVals[rVals.length - 1] * 100).toFixed(1) + "%",
    "bosses", bosses.length, "keyUnique", uniq,
    "fail", fail);
}

if (fail) { console.error(fail + " failed"); process.exit(1); }
console.log("done");
