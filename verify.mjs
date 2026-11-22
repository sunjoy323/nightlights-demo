import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
const require = createRequire(import.meta.url);
const C = require("./core.js");

let fail = 0;
for (const lv of C.LEVELS) {
  const sums = C.ticketSumsOk(lv);
  const r = C.solve(lv, 5);
  const ok = sums.ok && r.ok;
  if (!ok) fail++;
  console.log(
    `${ok ? "OK " : "FAIL"} ${lv.id.padEnd(8)} ${lv.name}  lights=${C.countOn(lv.grid).total}  path=${(r.path || []).join("")}  visits=${r.visits}` +
      (sums.ok ? "" : "  SUM_MISMATCH")
  );
}
if (fail) {
  console.error(`\n${fail} level(s) failed`);
  process.exit(1);
}
console.log("\nAll 5 levels solvable with 5 slots.");
