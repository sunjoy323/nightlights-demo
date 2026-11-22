// Shared puzzle core for 夜灯将眠 — used by verify.mjs and inlined into index.html
(function (root) {
  const COLORS = [
    { id: "amber", fill: "#ffd56a", glow: "#ffbe3a", ink: "#3a2208", name: "暖黄" },
    { id: "pink", fill: "#ff8ab8", glow: "#ff5e9a", ink: "#4a1028", name: "粉" },
    { id: "cyan", fill: "#7ee7ff", glow: "#3ad4ff", ink: "#073044", name: "青" },
    { id: "orange", fill: "#ff9a4a", glow: "#ff7a1a", ink: "#3a1a00", name: "橙" },
    { id: "mint", fill: "#8dffc1", glow: "#3dff9a", ink: "#06301c", name: "薄荷" },
    { id: "lavender", fill: "#c9a6ff", glow: "#a87cff", ink: "#2a1050", name: "紫" },
  ];

  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function emptyGrid(W, H) {
    return Array.from({ length: H }, () => Array.from({ length: W }, () => null));
  }

  function cloneGrid(g) {
    return g.map((row) => row.map((c) => (c ? { ...c } : null)));
  }

  function cloneCols(cols) {
    return cols.map((col) => col.map((t) => ({ ...t })));
  }

  function cloneSlots(slots) {
    return slots.map((s) => (s ? { ...s } : null));
  }

  // Windows sit in a rectangle. y0 is the top row, x0 left.
  // border/fill are color indices; fill may be null for solid border color.
  // lock: building id string. key: this window unlocks that id when turned off.
  function stampBuilding(g, x0, y0, w, h, opt) {
    const border = opt.border;
    const fill = opt.fill == null ? border : opt.fill;
    const lock = opt.lock || null;
    const key = opt.key || null;
    const keyAt = opt.keyAt || null;
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        const edge = x === x0 || x === x0 + w - 1 || y === y0 || y === y0 + h - 1;
        let c = edge ? border : fill;
        if (opt.pattern && opt.pattern[y - y0] && opt.pattern[y - y0][x - x0] != null) {
          c = opt.pattern[y - y0][x - x0];
        }
        const cell = { c, on: true };
        if (lock) cell.lock = lock;
        if (keyAt && keyAt[0] === x && keyAt[1] === y && key) cell.key = key;
        g[y][x] = cell;
      }
    }
    if (key && keyAt == null) {
      // default: a border cell that is not a corner, mid-top if possible
      const kx = x0 + (w >> 1);
      const ky = y0;
      if (g[ky][kx]) {
        g[ky][kx].key = key;
        g[ky][kx].c = opt.keyColor != null ? opt.keyColor : g[ky][kx].c;
      }
    }
  }

  function countOn(grid) {
    const n = {};
    let total = 0;
    for (const row of grid) {
      for (const c of row) {
        if (c && c.on) {
          n[c.c] = (n[c.c] || 0) + 1;
          total++;
        }
      }
    }
    return { n, total };
  }

  function isOpen(grid, x, y) {
    const H = grid.length, W = grid[0].length;
    if (x < 0 || y < 0 || x >= W || y >= H) return true; // outside = sky
    const c = grid[y][x];
    if (!c) return true; // sky
    if (c.on) return false;
    return true; // already off window, path opens
  }

  function isReachable(grid, x, y, unlocked) {
    const cell = grid[y][x];
    if (!cell || !cell.on) return false;
    if (cell.lock && !(unlocked && unlocked[cell.lock])) return false;
    for (const [dx, dy] of DIRS) {
      if (isOpen(grid, x + dx, y + dy)) return true;
    }
    return false;
  }

  function findTarget(grid, color, unlocked) {
    const H = grid.length, W = grid[0].length;
    let best = null;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const cell = grid[y][x];
        if (!cell || !cell.on || cell.c !== color) continue;
        if (!isReachable(grid, x, y, unlocked)) continue;
        const isKey = !!cell.key;
        if (
          !best ||
          (isKey && !best.key) ||
          (isKey === !!best.key && (y < best.y || (y === best.y && x < best.x)))
        ) {
          best = { x, y, key: isKey };
        }
      }
    }
    return best;
  }

  function turnOff(grid, t, unlocked) {
    const cell = grid[t.y][t.x];
    cell.on = false;
    if (cell.key) unlocked[cell.key] = true;
  }

  // Process all slots until none can work. Deterministic.
  function saturate(grid, slots, unlocked) {
    let guard = 0;
    while (guard++ < 4000) {
      let did = false;
      for (let i = 0; i < slots.length; i++) {
        const s = slots[i];
        if (!s || s.n <= 0) continue;
        const t = findTarget(grid, s.c, unlocked);
        if (!t) continue;
        turnOff(grid, t, unlocked);
        s.n--;
        did = true;
      }
      if (!did) break;
    }
    for (let i = 0; i < slots.length; i++) {
      if (slots[i] && slots[i].n <= 0) slots[i] = null;
    }
  }

  function leftCount(grid) {
    let n = 0;
    for (const row of grid) for (const c of row) if (c && c.on) n++;
    return n;
  }

  function canTake(cols, ci) {
    return cols[ci] && cols[ci].length > 0;
  }

  function place(cols, slots, ci, slotCount) {
    if (!canTake(cols, ci)) return false;
    let si = -1;
    for (let i = 0; i < slotCount; i++) if (!slots[i]) { si = i; break; }
    if (si < 0) return false;
    const t = cols[ci].shift();
    slots[si] = { c: t.c, n: t.n, hidden: !!t.hidden, id: t.id };
    return true;
  }

  function frontsUseful(grid, cols, unlocked) {
    const out = [];
    for (let i = 0; i < cols.length; i++) {
      const t = cols[i][0];
      if (t && findTarget(grid, t.c, unlocked)) out.push(i);
    }
    return out;
  }

  function isWon(grid) { return leftCount(grid) === 0; }

  function isLost(grid, cols, slots, slotCount, unlocked) {
    if (isWon(grid)) return false;
    if (slots.some((s) => s && s.n > 0 && findTarget(grid, s.c, unlocked))) return false;
    const free = slots.slice(0, slotCount).filter((s) => !s).length;
    if (free === 0) return true;
    // free slot but no front ticket? also lost
    const anyFront = cols.some((c) => c.length);
    return !anyFront;
  }

  function stateKey(grid, cols, slots, unlocked) {
    let lights = "";
    for (const row of grid) for (const c of row) lights += c && c.on ? "1" : "0";
    const cs = cols.map((col) => col.map((t) => t.c + ":" + t.n).join(",")).join("|");
    const ss = slots.map((s) => (s ? s.c + ":" + s.n : "-")).join(",");
    const uk = Object.keys(unlocked).filter((k) => unlocked[k]).sort().join(",");
    return lights + "#" + cs + "#" + ss + "#" + uk;
  }

  // Returns {ok, path: column indices} or {ok:false}
  function solve(level, slotCount) {
    const grid0 = cloneGrid(level.grid);
    const cols0 = cloneCols(level.cols);
    const slots0 = Array(slotCount).fill(null);
    const unlocked0 = { ...(level.unlocked || {}) };
    const seen = new Set();
    let found = null;
    const maxVisits = 200000;
    let visits = 0;

    function dfs(grid, cols, slots, unlocked, path) {
      if (found) return;
      if (++visits > maxVisits) return;
      saturate(grid, slots, unlocked);
      if (isWon(grid)) { found = path.slice(); return; }
      if (isLost(grid, cols, slots, slotCount, unlocked)) return;
      const key = stateKey(grid, cols, slots, unlocked);
      if (seen.has(key)) return;
      seen.add(key);

      // Prefer useful fronts first, then others (for faster win)
      const order = [];
      for (let i = 0; i < cols.length; i++) if (cols[i].length) order.push(i);
      order.sort((a, b) => {
        const ua = findTarget(grid, cols[a][0].c, unlocked) ? 0 : 1;
        const ub = findTarget(grid, cols[b][0].c, unlocked) ? 0 : 1;
        return ua - ub;
      });
      for (const i of order) {
        const g2 = cloneGrid(grid);
        const c2 = cloneCols(cols);
        const s2 = cloneSlots(slots);
        const u2 = { ...unlocked };
        if (!place(c2, s2, i, slotCount)) continue;
        dfs(g2, c2, s2, u2, path.concat(i));
        if (found) return;
      }
    }

    dfs(grid0, cols0, slots0, unlocked0, []);
    return { ok: !!found, path: found || [], visits, left: leftCount(grid0) };
  }

  function ticketSumsOk(level) {
    const { n } = countOn(level.grid);
    const got = {};
    for (const col of level.cols) for (const t of col) got[t.c] = (got[t.c] || 0) + t.n;
    const keys = new Set([...Object.keys(n), ...Object.keys(got)]);
    for (const k of keys) if ((n[k] || 0) !== (got[k] || 0)) return { ok: false, n, got };
    return { ok: true, n, got };
  }

  // ----- level builders -----
  let _tid = 1;
  function T(c, n, extra) { return { c, n, id: _tid++, ...(extra || {}) }; }

  function level(def) {
    const g = emptyGrid(def.W, def.H);
    for (const b of def.buildings) stampBuilding(g, b.x, b.y, b.w, b.h, b);
    return {
      id: def.id,
      name: def.name,
      hint: def.hint,
      tier: def.tier,
      W: def.W,
      H: def.H,
      grid: g,
      cols: def.cols,
      unlocked: def.unlocked || {},
      coach: def.coach || false,
      mechanic: def.mechanic || null,
    };
  }

  const LEVELS = [];

  // L1 江岸初夜 — yellow shell, cyan core. Teach edges-in.
  LEVELS.push(level({
    id: "river",
    name: "江岸初夜",
    tier: "入门",
    hint: "从外层的暖黄开始关，里面的青灯才会露出来。",
    coach: true,
    W: 15, H: 10,
    buildings: [
      { x: 1, y: 6, w: 3, h: 4, border: 0, fill: 0 },
      { x: 5, y: 2, w: 5, h: 8, border: 0, fill: 2 },
      { x: 11, y: 6, w: 3, h: 4, border: 0, fill: 0 },
    ],
    cols: [
      [T(0, 16)],
      [T(2, 18)],
      [T(0, 16)],
      [T(0, 14)],
    ],
  }));

  // L2 霓虹街 — 4 colors, 5 buildings, mid layer
  LEVELS.push(level({
    id: "neon",
    name: "霓虹街",
    tier: "普通",
    hint: "颜色更多了，先看哪些灯已经贴着夜空。",
    W: 18, H: 11,
    buildings: [
      { x: 0, y: 6, w: 3, h: 5, border: 0, fill: 1 },
      { x: 4, y: 4, w: 3, h: 7, border: 0, fill: 3 },
      { x: 8, y: 1, w: 4, h: 10, border: 0, fill: 2 },
      { x: 13, y: 5, w: 3, h: 6, border: 1, fill: 3 },
      { x: 17, y: 7, w: 1, h: 4, border: 0, fill: 0 }, // slim tower 1 col
    ],
    // will fill cols after counting — placeholder, replaced below if needed
    cols: null,
  }));

  // L3 双子塔 — 5 colors, tighter, useful tickets often behind
  LEVELS.push(level({
    id: "twins",
    name: "双子塔",
    tier: "普通",
    hint: "最前排有暂时关不到的颜色，先看清后排再点。",
    W: 16, H: 12,
    buildings: [
      { x: 1, y: 3, w: 6, h: 9, border: 0, fill: 2 },
      { x: 9, y: 3, w: 6, h: 9, border: 1, fill: 3 },
      { x: 7, y: 8, w: 2, h: 4, border: 4, fill: 4 }, // low connector mint
    ],
    cols: null,
  }));

  // L4 迷雾橱窗 — hidden tickets
  LEVELS.push(level({
    id: "mist",
    name: "迷雾橱窗",
    tier: "困难",
    hint: "问号工单要到点下去才会现形，先数一数画上还剩什么颜色。",
    mechanic: "hidden",
    W: 17, H: 11,
    buildings: [
      { x: 1, y: 5, w: 4, h: 6, border: 0, fill: 5 },
      { x: 6, y: 2, w: 5, h: 9, border: 2, fill: 1 },
      { x: 12, y: 4, w: 4, h: 7, border: 0, fill: 3 },
    ],
    cols: null,
  }));

  // L5 锁上的顶楼 — locked penthouse, key on left
  LEVELS.push(level({
    id: "lock",
    name: "锁上的顶楼",
    tier: "困难",
    hint: "右边顶楼还锁着。先把左边楼顶的钥匙灯关掉。",
    mechanic: "lock",
    W: 17, H: 12,
    buildings: [
      { x: 1, y: 4, w: 5, h: 8, border: 0, fill: 2, key: "penthouse", keyColor: 0 },
      { x: 7, y: 7, w: 3, h: 5, border: 4, fill: 4 },
      { x: 11, y: 2, w: 5, h: 10, border: 1, fill: 3, lock: "penthouse" },
    ],
    cols: null,
    unlocked: {},
  }));

  function autoCols(level, plan) {
    // plan: array of 4 columns, each a list of {c, n, hidden?}
    level.cols = plan.map((col) => col.map((t) => T(t.c, t.n, t.hidden ? { hidden: true } : {})));
  }

  // Fill trays to match counts. Hand-authored after we print counts if needed.
  // We'll compute and assign below in initPlans().

  function splitCounts(counts, layout) {
    // layout: [[c,c,...], ...] meaning column color sequence; sizes computed by taking from remaining
    // Better: explicit. This is just helper.
  }

  function makeEvenTickets(color, total, parts) {
    const arr = [];
    let left = total;
    for (let i = 0; i < parts.length; i++) {
      const n = i === parts.length - 1 ? left : parts[i];
      arr.push({ c: color, n });
      left -= n;
    }
    return arr;
  }

  function applyPlans() {
    // L1 is already set; verify sums.
    // L2 counts — assign after looking at countOn. We'll set in a second pass from this function
    // that uses countOn of each built grid.

    // Helper: take color totals and a recipe of tickets per column (list of color ids).
    // Distribute each color's total across tickets of that color in order, almost evenly.
    function assign(level, recipe, hiddenSet) {
      hiddenSet = hiddenSet || new Set();
      const { n } = countOn(level.grid);
      const need = {};
      for (const col of recipe) for (const c of col) need[c] = (need[c] || 0) + 1;
      const piles = {};
      for (const [cs, total] of Object.entries(n)) {
        const c = +cs;
        const k = need[c] || 0;
        piles[c] = [];
        if (k === 0 && total > 0) throw new Error(level.id + " color " + c + " has " + total + " lights but no tickets");
        if (k === 0) continue;
        const base = Math.floor(total / k);
        let rem = total - base * k;
        for (let i = 0; i < k; i++) {
          const v = base + (rem > 0 ? 1 : 0);
          if (rem > 0) rem--;
          piles[c].push(v);
        }
      }
      for (const c of Object.keys(need)) {
        if (!n[+c]) throw new Error(level.id + " ticket color " + c + " has no lights");
      }
      level.cols = recipe.map((col, ci) =>
        col.map((c, ri) => {
          const n1 = piles[c].shift();
          const hidden = hiddenSet.has(ci + ":" + ri) || hiddenSet.has("c" + c);
          return T(c, n1, hidden ? { hidden: true } : {});
        })
      );
    }

    // L2 recipe: fronts mostly outer amber, some inner in back
    assign(LEVELS[1], [
      [0, 1],
      [3, 2],
      [0, 2],
      [1, 3],
    ]);

    // L3: fronts include buried colors (cyan, orange insides) — pressure
    assign(LEVELS[2], [
      [2, 0, 0],
      [3, 1, 1],
      [4, 0],
      [2, 3, 4],
    ]);

    // L4 hidden some tickets
    assign(LEVELS[3], [
      [0, 5],
      [2, 1],
      [0, 3],
      [1, 3],
    ], new Set(["0:1", "1:1", "3:0"])); // back-ish and one front hidden

    // L5
    assign(LEVELS[4], [
      [0, 2],
      [4, 3],
      [1, 3],
      [2, 1, 4],
    ]);
  }

  applyPlans();

  const api = {
    COLORS, LEVELS, emptyGrid, cloneGrid, cloneCols, cloneSlots,
    stampBuilding, countOn, isOpen, isReachable, findTarget, turnOff,
    saturate, leftCount, canTake, place, frontsUseful, isWon, isLost, solve,
    ticketSumsOk, T,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.NightCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
