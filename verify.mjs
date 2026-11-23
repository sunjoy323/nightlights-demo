#!/usr/bin/env node
// Verify baked 1..N levels: L1-5 paths, solvability, hard filters, unique bosses.
import { createRequire } from "module";
import fs from "fs";
import { inflateRawSync } from "zlib";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const C = require("./core.js");
const W = require("./world.js");
const LM = require("./landmarks.js");
const G = require("./gen.js");

const EXPECT = {
  river: "0123",
  neon: "00112233",
  twins: "22000311133",
  mist: "00112233",
  lock: "001212333",
};

const TOTAL = Number(process.argv[2] || 1000);
const BIN = path.join(__dirname, "docs", "levels-1000.bin");
const CURVE = path.join(__dirname, "docs", "curve-1-1000.json");
const BANK_JS = path.join(__dirname, "levels-bank.js");

function loadBank() {
  if (fs.existsSync(BIN) && fs.existsSync(CURVE)) {
    const raw = inflateRawSync(fs.readFileSync(BIN));
    const curve = JSON.parse(fs.readFileSync(CURVE, "utf8"));
    const n = G.installBankFromRaw(raw, curve.levels);
    return { n, metas: curve.levels, source: "bin+json" };
  }
  if (fs.existsSync(BANK_JS)) {
    const txt = fs.readFileSync(BANK_JS, "utf8");
    const m = txt.match(/NIGHT_BANK_B64 = "([^"]+)"/);
    const metaM = txt.match(/NIGHT_BANK_META = (\[[\s\S]*\]);?\s*$/);
    if (!m || !metaM) throw new Error("cannot parse levels-bank.js");
    const raw = inflateRawSync(Buffer.from(m[1], "base64"));
    const metas = JSON.parse(metaM[1]);
    const n = G.installBankFromRaw(raw, metas);
    return { n, metas, source: "levels-bank.js" };
  }
  throw new Error("no bank (docs/levels-500.bin or levels-bank.js)");
}

const bank = loadBank();
console.log("Loaded bank", bank.n, "levels from", bank.source);

let fail = 0;
const notes = [];
const after = [];
const bosses = [];

function replayPath(lv, pathCols, slotsN = 5) {
  let grid = C.cloneGrid(lv.grid);
  let cols = C.cloneCols(lv.cols);
  let slots = Array(slotsN).fill(null);
  let unlocked = { ...(lv.unlocked || {}) };
  let takes = 0;
  C.saturate(grid, slots, unlocked, takes);
  for (const ci of pathCols) {
    if (!C.place(cols, slots, ci, slotsN)) return { ok: false, reason: "place fail @" + takes, left: C.leftCount(grid) };
    takes++;
    C.saturate(grid, slots, unlocked, takes);
  }
  const left = C.leftCount(grid);
  const emptySlots = slots.every((s) => !s || s.hold);
  return { ok: left === 0, left, emptySlots };
}

for (let n = 1; n <= Math.min(TOTAL, bank.n); n++) {
  const lv = G.getLevel(n - 1);
  if (!lv) { fail++; notes.push("MISSING " + n); continue; }
  const sums = C.ticketSumsOk(lv);
  const meta = (bank.metas || []).find((m) => m.n === n) || {};
  const path = meta.path || lv.solPath;
  let ok = sums.ok;
  let how = "sums";
  if (path && path.length) {
    const rp = replayPath(lv, path, 5);
    if (!rp.ok) { ok = false; how = "replay fail left=" + rp.left; }
    else how = "replay";
  } else {
    const r = C.solve(lv, 5);
    if (!r.ok) { ok = false; how = "solve fail"; }
    else how = "solve";
  }
  const exp = EXPECT[lv.id];
  if (exp) {
    const pathStr = (path || []).join("");
    // Prefer EXPECT against baked path; also accept solve path if baked missing
    let got = pathStr;
    if (!path || !path.length) {
      const r = C.solve(lv, 5);
      got = (r.path || []).join("");
    }
    if (got !== exp) {
      // double-check live solve still matches EXPECT (bank path should)
      const r = C.solve(lv, 5);
      const live = (r.path || []).join("");
      if (live !== exp) {
        fail++;
        ok = false;
        notes.push("PATH CHANGED " + lv.id + " " + live + " expected " + exp);
        console.log("PATH CHANGED", lv.id, live, "expected", exp);
      }
    }
  }
  if (!ok) {
    fail++;
    console.log("FAIL", String(n).padStart(3), lv.name, how, sums.ok ? "" : "SUM_MISMATCH");
  } else if (n <= 20 || n % 20 === 0 || n % 50 === 0) {
    console.log("OK ", String(n).padStart(3), (lv.cityName || "").padEnd(6), String(lv.name).padEnd(10), how);
  }

  if (n > 5) {
    after.push(meta);
    if (meta.greedyOk) { fail++; notes.push("greedy pass " + n); }
    if (meta.rand != null && meta.rand >= 0.10) { fail++; notes.push("rand high " + n + " " + meta.rand); }
    if (n % 10 === 0) {
      bosses.push(meta);
      if (!(meta.keyUnique || meta.unique)) { fail++; notes.push("boss not unique " + n); }
      if (meta.rand != null && meta.rand >= 0.02) { fail++; notes.push("boss rand " + n + " " + meta.rand); }
    }
  }
}

const gPass = after.filter((m) => m.greedyOk).length;
const rVals = after.map((m) => m.rand).filter((x) => x != null);
const rHi = rVals.filter((x) => x >= 0.10).length;
const rMid = rVals.filter((x) => x >= 0.05 && x < 0.10).length;
const rLow = rVals.filter((x) => x < 0.05).length;
const bossU = bosses.filter((m) => m.keyUnique || m.unique).length;

console.log("\n--- hard metrics ---");
console.log("after tutorial:", after.length, "greedy-pass:", gPass, "(want 0)");
if (rVals.length) {
  const avg = rVals.reduce((a, b) => a + b, 0) / rVals.length;
  const mx = Math.max(...rVals);
  console.log("random win: avg", (avg * 100).toFixed(2) + "%", "max", (mx * 100).toFixed(2) + "%",
    "<5%:", rLow, "5-10%:", rMid, ">=10%:", rHi);
}
console.log("大关 (n%10===0, n>5):", bosses.length, "keyUnique/unique:", bossU);
if (notes.length) {
  console.log("issues:");
  for (const s of notes.slice(0, 40)) console.log(" -", s);
  if (notes.length > 40) console.log(" ...", notes.length - 40, "more");
}
if (fail) {
  console.error("\n" + fail + " failed");
  process.exit(1);
}
const lights = after.map((x) => x.lights).filter((v) => v != null);
const ncols = after.map((x) => x.nColors).filter((v) => v != null);
if (lights.length) {
  const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  console.log("lights after tutorial: min", Math.min(...lights), "avg", avg(lights).toFixed(0), "max", Math.max(...lights));
}
if (ncols.length) {
  const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  console.log("colors after tutorial: min", Math.min(...ncols), "avg", avg(ncols).toFixed(1), "max", Math.max(...ncols));
}
console.log("\nAll", Math.min(TOTAL, bank.n), "levels ok.");

