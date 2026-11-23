import { createRequire } from "module";
const require = createRequire(import.meta.url);
const C = require("./core.js");
const G = require("./gen.js");

const EXPECT = {
  river: "0123",
  neon: "00112233",
  twins: "22000311133",
  mist: "00112233",
  lock: "001212333",
};

let fail = 0;
const upto = Number(process.argv[2] || 30);
console.log("Verifying levels 1.." + upto);
for (let n = 1; n <= upto; n++) {
  const lv = G.getLevel(n - 1);
  const sums = C.ticketSumsOk(lv);
  const t0 = Date.now();
  const r = C.solve(lv, 5);
  const ok = sums.ok && r.ok;
  if (!ok) fail++;
  const exp = EXPECT[lv.id];
  const pathStr = (r.path || []).join("");
  if (exp && pathStr !== exp) { fail++; console.log("PATH CHANGED", lv.id, pathStr, "expected", exp); }
  console.log(
    `${ok ? "OK " : "FAIL"} ${String(n).padStart(3)} ${String(lv.id).padEnd(14)} ${lv.name}  lights=${C.countNeed(lv.grid).total}  visits=${r.visits}  ${Date.now() - t0}ms` +
      (sums.ok ? "" : "  SUM_MISMATCH")
  );
}
if (fail) {
  console.error("\n" + fail + " failed");
  process.exit(1);
}
console.log("\nAll " + upto + " levels solvable with 5 slots.");
