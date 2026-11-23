import { createRequire } from "module";
import fs from "fs";
import path from "path";
const require = createRequire(import.meta.url);
const C = require("./core.js");
const G = require("./gen.js");

const N = Number(process.argv[2] || 1000);
const outDir = path.join(path.dirname(new URL(import.meta.url).pathname), "docs");
fs.mkdirSync(outDir, { recursive: true });

const rows = [];
let fail = 0;
const tAll = Date.now();
for (let n = 1; n <= N; n++) {
  const t0 = Date.now();
  try {
    const lv = G.getLevel(n - 1);
    const sol = lv.solPath ? { ok: true, path: lv.solPath, visits: lv.diff && lv.diff.visits } : C.solve(lv, 5);
    if (!sol.ok) { fail++; throw new Error("unsolvable"); }
    const greedy = C.greedySolve(lv, 5);
    const left = C.leftmostSolve(lv, 5);
    const sc = lv.diff && n > 20 ? lv.diff : G.scoreDifficulty(lv, sol, greedy, left);
    const p = G.pacingOf(n);
    rows.push({
      n, name: lv.name, role: p.role, target: +p.target.toFixed(1),
      score: sc.score, greedyOk: !!sc.greedyOk || !!greedy.ok, leftOk: !!sc.leftOk || !!left.ok,
      think: sc.think || 0, visits: sc.visits || sol.visits || 0, peak: sc.peak || 0,
      mechs: lv.mechs || [], generated: !!lv.generated, ms: Date.now() - t0,
    });
  } catch (e) {
    fail++;
    console.error("FAIL", n, e.message);
    rows.push({ n, name: "FAIL", role: G.pacingOf(n).role, target: G.pacingOf(n).target, score: 0, error: e.message });
  }
  if (n % 50 === 0) console.log("...", n, "fail="+fail, "elapsed="+(Date.now()-tAll)+"ms");
}
const jsonPath = path.join(outDir, "curve-1-" + N + ".json");
fs.writeFileSync(jsonPath, JSON.stringify({ N, fail, generatedAt: new Date().toISOString(), intros: G.INTROS, rows }, null, 2));
console.log("wrote", jsonPath, "fail="+fail, "in", Date.now()-tAll, "ms");
if (fail) process.exit(1);
console.log("100% solvable.");
