import { createRequire } from "module";
const require = createRequire(import.meta.url);
const C = require("./core.js");

const EXPECT = {
  river: "0123",
  neon: "00112233",
  twins: "22000311133",
  mist: "00112233",
  lock: "001212333",
};

let fail = 0;
let think = [];
for (const lv of C.LEVELS) {
  const sums = C.ticketSumsOk(lv);
  const t0 = Date.now();
  const r = C.solve(lv, 5);
  const g = C.greedySolve(lv, 5);
  const L = C.leftmostSolve(lv, 5);
  const ms = Date.now() - t0;
  const ok = sums.ok && r.ok;
  if (!ok) fail++;
  const exp = EXPECT[lv.id];
  const pathStr = (r.path || []).join("");
  const pathNote = exp ? (pathStr === exp ? " path=KEEP" : ` path=CHANGED got=${pathStr} expected=${exp}`) : ` path=${pathStr}`;
  if (exp && pathStr !== exp) fail++;
  const thinkMark = (!g.ok || !L.ok) ? " THINK" : "";
  if (!g.ok || !L.ok) think.push(lv.name + (!g.ok && !L.ok ? "(贪心+随手都过不了)" : !g.ok ? "(贪心过不了)" : "(随手点最左过不了)"));
  console.log(
    `${ok ? "OK " : "FAIL"} ${String(C.LEVELS.indexOf(lv) + 1).padStart(2)} ${lv.id.padEnd(12)} ${lv.name}  lights=${C.countNeed(lv.grid).total}  visits=${r.visits}  ${ms}ms  greedy=${g.ok ? "Y" : "N"} left=${L.ok ? "Y" : "N"}` +
      pathNote + thinkMark + (sums.ok ? "" : "  SUM_MISMATCH")
  );
}
console.log(`\n${C.LEVELS.length} levels, ${fail} failed.`);
console.log("Think-points:", think.join("； ") || "(none)");
if (fail) process.exit(1);
if (C.LEVELS.length !== 20) {
  console.error("expected 20 levels, got", C.LEVELS.length);
  process.exit(1);
}
console.log("All 20 levels solvable with 5 slots.");
