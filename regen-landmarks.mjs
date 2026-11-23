#!/usr/bin/env node
// Drop baked landmark levels from the checkpoint so build-levels.mjs will remake them with current MASKS.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHECK = path.join(__dirname, "docs", "levels-500-checkpoint.json");
const cp = JSON.parse(fs.readFileSync(CHECK, "utf8"));
if (!cp.byN) cp.byN = {};
let dropped = 0;
for (let n = 10; n <= 500; n += 10) {
  if (cp.byN[n]) { delete cp.byN[n]; dropped++; }
}
fs.writeFileSync(CHECK, JSON.stringify(cp));
const left = Object.keys(cp.byN).length;
console.log("dropped", dropped, "landmark levels; checkpoint now has", left, "levels");
