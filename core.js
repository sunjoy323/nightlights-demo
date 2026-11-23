// Shared puzzle core for 夜灯将眠 — used by verify.mjs and inlined into index.html
(function (root) {
  const COLORS = [
    { id: "amber", fill: "#ffd56a", glow: "#ffbe3a", ink: "#3a2208", name: "暖黄", pat: "solid" },
    { id: "pink", fill: "#ff8ab8", glow: "#ff5e9a", ink: "#4a1028", name: "粉", pat: "dots" },
    { id: "cyan", fill: "#7ee7ff", glow: "#3ad4ff", ink: "#073044", name: "青", pat: "ring" },
    { id: "orange", fill: "#ff9a4a", glow: "#ff7a1a", ink: "#3a1a00", name: "橙", pat: "slash" },
    { id: "mint", fill: "#8dffc1", glow: "#3dff9a", ink: "#06301c", name: "薄荷", pat: "plus" },
    { id: "lavender", fill: "#c9a6ff", glow: "#a87cff", ink: "#2a1050", name: "紫", pat: "diamond" },
    { id: "crimson", fill: "#ff5d6c", glow: "#ff3348", ink: "#3a0a12", name: "玫", pat: "triangle" },
    { id: "azure", fill: "#5b8cff", glow: "#3a6aff", ink: "#0a1638", name: "蓝", pat: "bars" },
  ];

  // Small, high-contrast marks so colors stay distinguishable for color-blind players.
  function drawColorPattern(ctx, x, y, w, h, pat, ink, alpha) {
    if (!pat || pat === "solid" || w < 4 || h < 4) return;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.globalAlpha = (alpha == null ? 0.5 : alpha);
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    ctx.lineWidth = Math.max(1, Math.min(w, h) * 0.12);
    const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h);
    if (pat === "dots") {
      const spots = r < 8 ? [[0.5, 0.5]] : [[0.3, 0.3], [0.7, 0.3], [0.5, 0.72]];
      for (const [u, v] of spots) {
        ctx.beginPath(); ctx.arc(x + w * u, y + h * v, Math.max(0.8, r * 0.1), 0, Math.PI * 2); ctx.fill();
      }
    } else if (pat === "ring") {
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2); ctx.stroke();
    } else if (pat === "slash") {
      ctx.beginPath(); ctx.moveTo(x + 1, y + h - 1); ctx.lineTo(x + w - 1, y + 1); ctx.stroke();
      if (r >= 8) { ctx.beginPath(); ctx.moveTo(x + w * 0.2, y + h); ctx.lineTo(x + w, y + h * 0.2); ctx.stroke(); }
    } else if (pat === "plus") {
      ctx.beginPath();
      ctx.moveTo(cx, y + h * 0.2); ctx.lineTo(cx, y + h * 0.8);
      ctx.moveTo(x + w * 0.2, cy); ctx.lineTo(x + w * 0.8, cy);
      ctx.stroke();
    } else if (pat === "diamond") {
      ctx.beginPath();
      ctx.moveTo(cx, y + h * 0.2); ctx.lineTo(x + w * 0.8, cy);
      ctx.lineTo(cx, y + h * 0.8); ctx.lineTo(x + w * 0.2, cy);
      ctx.closePath(); ctx.stroke();
    } else if (pat === "triangle") {
      ctx.beginPath();
      ctx.moveTo(cx, y + h * 0.2); ctx.lineTo(x + w * 0.8, y + h * 0.8); ctx.lineTo(x + w * 0.2, y + h * 0.8);
      ctx.closePath(); ctx.stroke();
    } else if (pat === "bars") {
      const bw = Math.max(1, w * 0.16);
      ctx.fillRect(x + w * 0.22, y + h * 0.2, bw, h * 0.6);
      ctx.fillRect(x + w * 0.62, y + h * 0.2, bw, h * 0.6);
    }
    ctx.restore();
  }

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
        if (opt.kind) cell.kind = opt.kind;
        if (keyAt && keyAt[0] === x && keyAt[1] === y && key) cell.key = key;
        g[y][x] = cell;
      }
    }
    if (key && keyAt == null) {
      const kx = x0 + (w >> 1);
      const ky = y0;
      if (g[ky][kx]) {
        g[ky][kx].key = key;
        g[ky][kx].c = opt.keyColor != null ? opt.keyColor : g[ky][kx].c;
        if (opt.keyKind) g[ky][kx].kind = opt.keyKind;
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

  function countNeed(grid) {
    const n = {};
    let total = 0;
    for (const row of grid) {
      for (const c of row) {
        if (c && (c.on || c.dormant)) {
          n[c.c] = (n[c.c] || 0) + 1;
          total++;
        }
      }
    }
    return { n, total };
  }

  function isOpen(grid, x, y) {
    const H = grid.length, W = grid[0].length;
    if (x < 0 || y < 0 || x >= W || y >= H) return true;
    const c = grid[y][x];
    if (!c) return true;
    if (c.on) return false;
    return true;
  }

  function blinkOpen(cell, takes) {
    if (!cell || !cell.blink) return true;
    return (takes || 0) % 2 === 1;
  }

  function isReachable(grid, x, y, unlocked, takes) {
    const cell = grid[y][x];
    if (!cell || !cell.on) return false;
    if (cell.lock && !(unlocked && unlocked[cell.lock])) return false;
    if (!blinkOpen(cell, takes)) return false;
    for (const [dx, dy] of DIRS) {
      if (isOpen(grid, x + dx, y + dy)) return true;
    }
    return false;
  }

  function findTarget(grid, color, unlocked, takes) {
    const H = grid.length, W = grid[0].length;
    let best = null;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const cell = grid[y][x];
        if (!cell || !cell.on || cell.c !== color) continue;
        if (!isReachable(grid, x, y, unlocked, takes)) continue;
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
    cell.dormant = false;
    if (cell.key) unlocked[cell.key] = true;
    if (cell.awaken) {
      for (const [x, y] of cell.awaken) {
        const d = grid[y] && grid[y][x];
        if (d && d.dormant) {
          d.dormant = false;
          d.on = true;
        }
      }
    }
  }

  function saturate(grid, slots, unlocked, takes) {
    let guard = 0;
    while (guard++ < 4000) {
      let did = false;
      for (let i = 0; i < slots.length; i++) {
        const s = slots[i];
        if (!s || s.n <= 0 || s.hold) continue;
        const t = findTarget(grid, s.c, unlocked, takes);
        if (!t) continue;
        turnOff(grid, t, unlocked);
        s.n--;
        did = true;
      }
      if (!did) break;
    }
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      if (s && s.n <= 0 && !s.hold) {
        if (s.duo && s.pair != null) slots[s.pair] = null;
        slots[i] = null;
      }
    }
  }

  function leftCount(grid) {
    let n = 0;
    for (const row of grid) for (const c of row) if (c && (c.on || c.dormant)) n++;
    return n;
  }

  function canTake(cols, ci) {
    return cols[ci] && cols[ci].length > 0;
  }

  function hasPair(slots, slotCount) {
    for (let i = 0; i < slotCount - 1; i++) if (!slots[i] && !slots[i + 1]) return true;
    return false;
  }

  function canPlaceTicket(slots, slotCount, t) {
    if (!t) return false;
    if (t.duo) return hasPair(slots, slotCount);
    for (let i = 0; i < slotCount; i++) if (!slots[i]) return true;
    return false;
  }

  function place(cols, slots, ci, slotCount) {
    if (!canTake(cols, ci)) return false;
    const t = cols[ci][0];
    if (t.duo) {
      let si = -1;
      for (let i = 0; i < slotCount - 1; i++) {
        if (!slots[i] && !slots[i + 1]) { si = i; break; }
      }
      if (si < 0) return false;
      cols[ci].shift();
      slots[si] = { c: t.c, n: t.n, hidden: !!t.hidden, id: t.id, duo: true, pair: si + 1 };
      slots[si + 1] = { c: t.c, n: 0, hidden: !!t.hidden, id: t.id, duo: true, hold: true, pair: si };
      return true;
    }
    let si = -1;
    for (let i = 0; i < slotCount; i++) if (!slots[i]) { si = i; break; }
    if (si < 0) return false;
    cols[ci].shift();
    slots[si] = { c: t.c, n: t.n, hidden: !!t.hidden, id: t.id };
    return true;
  }

  function frontsUseful(grid, cols, unlocked, takes) {
    const out = [];
    for (let i = 0; i < cols.length; i++) {
      const t = cols[i][0];
      if (t && findTarget(grid, t.c, unlocked, takes)) out.push(i);
    }
    return out;
  }

  function isWon(grid) { return leftCount(grid) === 0; }

  function canPlaceAny(cols, slots, slotCount) {
    for (let i = 0; i < cols.length; i++) {
      if (cols[i].length && canPlaceTicket(slots, slotCount, cols[i][0])) return true;
    }
    return false;
  }

  function isLost(grid, cols, slots, slotCount, unlocked, takes) {
    if (isWon(grid)) return false;
    if (slots.some((s) => s && s.n > 0 && !s.hold && findTarget(grid, s.c, unlocked, takes))) return false;
    return !canPlaceAny(cols, slots, slotCount);
  }

  function stateKey(grid, cols, slots, unlocked, takes) {
    let lights = "";
    for (const row of grid) for (const c of row) lights += c && c.on ? "1" : c && c.dormant ? "d" : "0";
    const cs = cols.map((col) => col.map((t) => t.c + ":" + t.n + (t.duo ? "D" : "")).join(",")).join("|");
    const ss = slots.map((s) => (s ? (s.hold ? "H" : s.c + ":" + s.n + (s.duo ? "D" : "")) : "-")).join(",");
    const uk = Object.keys(unlocked).filter((k) => unlocked[k]).sort().join(",");
    return lights + "#" + cs + "#" + ss + "#" + uk + "#" + ((takes || 0) % 2);
  }

  function solve(level, slotCount, opts) {
    const grid0 = cloneGrid(level.grid);
    const cols0 = cloneCols(level.cols);
    const slots0 = Array(slotCount).fill(null);
    const unlocked0 = { ...(level.unlocked || {}) };
    const seen = new Set();
    let found = null;
    const maxVisits = (opts && opts.maxVisits) || 400000;
    let visits = 0;

    function dfs(grid, cols, slots, unlocked, takes, path) {
      if (found) return;
      if (++visits > maxVisits) return;
      saturate(grid, slots, unlocked, takes);
      if (isWon(grid)) { found = path.slice(); return; }
      if (isLost(grid, cols, slots, slotCount, unlocked, takes)) return;
      const key = stateKey(grid, cols, slots, unlocked, takes);
      if (seen.has(key)) return;
      seen.add(key);

      const order = [];
      for (let i = 0; i < cols.length; i++) if (cols[i].length) order.push(i);
      order.sort((a, b) => {
        const ua = findTarget(grid, cols[a][0].c, unlocked, takes) ? 0 : 1;
        const ub = findTarget(grid, cols[b][0].c, unlocked, takes) ? 0 : 1;
        if (ua !== ub) return ua - ub;
        const da = cols[a][0].duo ? 1 : 0;
        const db = cols[b][0].duo ? 1 : 0;
        return da - db;
      });
      for (const i of order) {
        const g2 = cloneGrid(grid);
        const c2 = cloneCols(cols);
        const s2 = cloneSlots(slots);
        const u2 = { ...unlocked };
        if (!place(c2, s2, i, slotCount)) continue;
        dfs(g2, c2, s2, u2, takes + 1, path.concat(i));
        if (found) return;
      }
    }

    dfs(grid0, cols0, slots0, unlocked0, 0, []);
    return { ok: !!found, path: found || [], visits, left: leftCount(grid0) };
  }

  function greedySolve(level, slotCount) {
    let grid = cloneGrid(level.grid);
    let cols = cloneCols(level.cols);
    let slots = Array(slotCount).fill(null);
    let unlocked = { ...(level.unlocked || {}) };
    let takes = 0;
    const path = [];
    for (let guard = 0; guard < 250; guard++) {
      saturate(grid, slots, unlocked, takes);
      if (isWon(grid)) return { ok: true, path };
      if (isLost(grid, cols, slots, slotCount, unlocked, takes)) return { ok: false, path, reason: "lost" };
      let choice = -1;
      for (let i = 0; i < cols.length; i++) {
        const t = cols[i][0];
        if (!t || !canPlaceTicket(slots, slotCount, t)) continue;
        if (findTarget(grid, t.c, unlocked, takes)) { choice = i; break; }
      }
      if (choice < 0) {
        for (let i = 0; i < cols.length; i++) {
          if (cols[i][0] && canPlaceTicket(slots, slotCount, cols[i][0])) { choice = i; break; }
        }
      }
      if (choice < 0) return { ok: false, path, reason: "stuck" };
      place(cols, slots, choice, slotCount);
      takes++;
      path.push(choice);
    }
    return { ok: false, path, reason: "timeout" };
  }


  function leftmostSolve(level, slotCount) {
    let grid = cloneGrid(level.grid);
    let cols = cloneCols(level.cols);
    let slots = Array(slotCount).fill(null);
    let unlocked = { ...(level.unlocked || {}) };
    let takes = 0;
    const path = [];
    for (let guard = 0; guard < 250; guard++) {
      saturate(grid, slots, unlocked, takes);
      if (isWon(grid)) return { ok: true, path };
      if (isLost(grid, cols, slots, slotCount, unlocked, takes)) return { ok: false, path, reason: "lost" };
      let choice = -1;
      for (let i = 0; i < cols.length; i++) {
        if (cols[i][0] && canPlaceTicket(slots, slotCount, cols[i][0])) { choice = i; break; }
      }
      if (choice < 0) return { ok: false, path, reason: "stuck" };
      place(cols, slots, choice, slotCount);
      takes++;
      path.push(choice);
    }
    return { ok: false, path, reason: "timeout" };
  }

  function ticketSumsOk(level) {
    const { n } = countNeed(level.grid);
    const got = {};
    for (const col of level.cols) for (const t of col) got[t.c] = (got[t.c] || 0) + t.n;
    const keys = new Set([...Object.keys(n), ...Object.keys(got)]);
    for (const k of keys) if ((n[k] || 0) !== (got[k] || 0)) return { ok: false, n, got };
    return { ok: true, n, got };
  }

  let _tid = 1;
  function T(c, n, extra) { return { c, n, id: _tid++, ...(extra || {}) }; }

  function level(def) {
    const g = emptyGrid(def.W, def.H);
    for (const b of def.buildings) stampBuilding(g, b.x, b.y, b.w, b.h, b);
    if (def.decorate) def.decorate(g);
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
      theme: def.theme || def.id,
      water: !!def.water,
      quote: def.quote || "城市已入睡。",
    };
  }

  function recItem(item) {
    return typeof item === "number" ? { c: item } : item;
  }

  function assign(level, recipe, hiddenSet) {
    hiddenSet = hiddenSet || new Set();
    const { n } = countNeed(level.grid);
    const need = {};
    const parsed = recipe.map((col) => col.map(recItem));
    for (const col of parsed) for (const it of col) need[it.c] = (need[it.c] || 0) + 1;
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
    level.cols = parsed.map((col, ci) =>
      col.map((it, ri) => {
        const n1 = piles[it.c].shift();
        const hidden = !!(it.hidden || hiddenSet.has(ci + ":" + ri) || hiddenSet.has("c" + it.c));
        const extra = {};
        if (hidden) extra.hidden = true;
        if (it.duo) extra.duo = true;
        return T(it.c, n1, extra);
      })
    );
  }

  const LEVELS = [];

  // L1 江岸初夜 — yellow shell, cyan core. Teach edges-in.
  LEVELS.push(level({
    id: "river",
    name: "江岸初夜",
    theme: "river",
    water: true,
    tier: "入门",
    hint: "电闸只有 5 个槽。从外层的暖黄开始关，里面的青灯才会露出来。",
    quote: "江风把最后一盏灯也吹暗了。",
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

  // L2 霓虹街
  LEVELS.push(level({
    id: "neon",
    name: "霓虹街",
    theme: "neon",
    tier: "普通",
    hint: "颜色更多了，先看哪些灯已经贴着夜空。",
    quote: "招牌一盏盏暗下去，街也安静了。",
    W: 18, H: 11,
    buildings: [
      { x: 0, y: 6, w: 3, h: 5, border: 0, fill: 1 },
      { x: 4, y: 4, w: 3, h: 7, border: 0, fill: 3 },
      { x: 8, y: 1, w: 4, h: 10, border: 0, fill: 2 },
      { x: 13, y: 5, w: 3, h: 6, border: 1, fill: 3 },
      { x: 17, y: 7, w: 1, h: 4, border: 0, fill: 0 },
    ],
    cols: null,
  }));

  // L3 双子塔
  LEVELS.push(level({
    id: "twins",
    name: "双子塔",
    theme: "twins",
    tier: "普通",
    hint: "最前排有暂时关不到的颜色，先看清后排再点。",
    quote: "两座塔一起睡了。",
    W: 16, H: 12,
    buildings: [
      { x: 1, y: 3, w: 6, h: 9, border: 0, fill: 2 },
      { x: 9, y: 3, w: 6, h: 9, border: 1, fill: 3 },
      { x: 7, y: 8, w: 2, h: 4, border: 4, fill: 4 },
    ],
    cols: null,
  }));

  // L4 迷雾橱窗
  LEVELS.push(level({
    id: "mist",
    name: "迷雾橱窗",
    theme: "mist",
    tier: "困难",
    hint: "问号工单要到点下去才会现形，先数一数画上还剩什么颜色。",
    quote: "橱窗里的光，先于雾散去。",
    mechanic: "hidden",
    W: 17, H: 11,
    buildings: [
      { x: 1, y: 5, w: 4, h: 6, border: 0, fill: 5 },
      { x: 6, y: 2, w: 5, h: 9, border: 2, fill: 1 },
      { x: 12, y: 4, w: 4, h: 7, border: 0, fill: 3 },
    ],
    cols: null,
  }));

  // L5 锁上的顶楼
  LEVELS.push(level({
    id: "lock",
    name: "锁上的顶楼",
    theme: "lock",
    tier: "困难",
    hint: "右边顶楼还锁着。先把左边楼顶的钥匙灯关掉。",
    quote: "钥匙一转，顶楼也歇了。",
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

  // L6 老街夜市 — practice hidden
  LEVELS.push(level({
    id: "nightmarket",
    name: "老街夜市",
    theme: "nightmarket",
    tier: "普通",
    hint: "巷子里问号工单更多了，先数灯再下手。",
    quote: "油烟散了，灯笼也歇了。",
    mechanic: "hidden",
    W: 18, H: 11,
    buildings: [
      { x: 0, y: 6, w: 3, h: 5, border: 3, fill: 0 },
      { x: 4, y: 4, w: 3, h: 7, border: 0, fill: 1 },
      { x: 8, y: 2, w: 4, h: 9, border: 3, fill: 5 },
      { x: 13, y: 5, w: 3, h: 6, border: 0, fill: 3 },
      { x: 17, y: 7, w: 1, h: 4, border: 1, fill: 1 },
    ],
    cols: null,
  }));

  // L7 港口夜航 — practice lock, water
  LEVELS.push(level({
    id: "port",
    name: "港口夜航",
    theme: "port",
    water: true,
    tier: "普通",
    hint: "右边货仓还锁着，先关掉码头的航标灯。",
    quote: "航标灭了，货轮也靠岸睡了。",
    mechanic: "lock",
    W: 18, H: 11,
    buildings: [
      { x: 0, y: 5, w: 4, h: 6, border: 0, fill: 2, key: "dock", keyColor: 3, keyKind: "beacon" },
      { x: 5, y: 7, w: 3, h: 4, border: 4, fill: 4 },
      { x: 9, y: 3, w: 8, h: 8, border: 3, fill: 2, lock: "dock" },
    ],
    cols: null,
    unlocked: {},
  }));

  // L8 雨后天桥 — shutter mid-band
  LEVELS.push(level({
    id: "overpass",
    name: "雨后天桥",
    theme: "overpass",
    tier: "困难",
    hint: "中间几层被电梯门挡住了。天台上和街边的灯可以先关，按钮在左侧岗亭。",
    quote: "雨停了，天桥也暗了。",
    mechanic: "shutter",
    W: 16, H: 12,
    buildings: [
      { x: 0, y: 8, w: 3, h: 4, border: 0, fill: 0, key: "lift", keyAt: [1, 9], keyKind: "button" },
      { x: 4, y: 1, w: 7, h: 11, border: 2, fill: 1 },
      { x: 12, y: 6, w: 3, h: 6, border: 3, fill: 3 },
    ],
    decorate(g) {
      for (let y = 5; y <= 8; y++) {
        for (let x = 4; x <= 10; x++) {
          if (g[y][x]) { g[y][x].lock = "lift"; g[y][x].kind = "shutter"; }
        }
      }
      if (g[9][1]) g[9][1].kind = "button";
    },
    cols: null,
    unlocked: {},
  }));

  // L9 大学城 — shutter + hidden
  LEVELS.push(level({
    id: "campus",
    name: "大学城",
    theme: "campus",
    tier: "困难",
    hint: "左边宿舍的中间楼层还关着。问号工单先别乱点。",
    quote: "自习室的灯，最后也熄了。",
    mechanic: "shutter+hidden",
    W: 17, H: 12,
    buildings: [
      { x: 0, y: 2, w: 5, h: 10, border: 4, fill: 2 },
      { x: 6, y: 8, w: 3, h: 4, border: 0, fill: 0, key: "dorm", keyAt: [7, 8], keyKind: "button" },
      { x: 10, y: 3, w: 6, h: 9, border: 1, fill: 5 },
    ],
    decorate(g) {
      for (let y = 5; y <= 8; y++) {
        for (let x = 0; x <= 4; x++) {
          if (g[y][x]) { g[y][x].lock = "dorm"; g[y][x].kind = "shutter"; }
        }
      }
      if (g[8][7]) g[8][7].kind = "button";
    },
    cols: null,
    unlocked: {},
  }));

  // L10 渔灯码头 — breaker zone (whole pier locked, including edges)
  LEVELS.push(level({
    id: "fishery",
    name: "渔灯码头",
    theme: "fishery",
    water: true,
    tier: "困难",
    hint: "整片码头都没电。先拉开岸边的总闸，渔灯才会让你关。",
    quote: "潮水拍岸，渔灯一盏盏睡了。",
    mechanic: "breaker",
    W: 18, H: 11,
    buildings: [
      { x: 0, y: 5, w: 4, h: 6, border: 0, fill: 0, key: "pier", keyAt: [1, 5], keyKind: "breaker" },
      { x: 5, y: 4, w: 12, h: 7, border: 3, fill: 2, lock: "pier", kind: "zone" },
    ],
    decorate(g) {
      if (g[5][1]) g[5][1].kind = "breaker";
    },
    cols: null,
    unlocked: {},
  }));

  // L11 便利商圈 — lock + shutter
  LEVELS.push(level({
    id: "mall",
    name: "便利商圈",
    theme: "mall",
    tier: "困难",
    hint: "百货中层被卷帘挡住，屋顶广告牌还锁着。两把钥匙，别急着填满槽。",
    quote: "商圈打烊，连广告牌也歇了。",
    mechanic: "lock+shutter",
    W: 18, H: 12,
    buildings: [
      { x: 0, y: 6, w: 4, h: 6, border: 0, fill: 0, key: "roof", keyAt: [2, 6], keyKind: "button" },
      { x: 5, y: 2, w: 7, h: 10, border: 2, fill: 1 },
      { x: 13, y: 1, w: 4, h: 11, border: 3, fill: 5, lock: "roof" },
    ],
    decorate(g) {
      for (let y = 5; y <= 8; y++) {
        for (let x = 5; x <= 11; x++) {
          if (g[y][x]) { g[y][x].lock = "shutterA"; g[y][x].kind = "shutter"; }
        }
      }
      // button for shutter on left building lower floor
      if (g[9][1]) { g[9][1].key = "shutterA"; g[9][1].kind = "button"; }
      if (g[6][2]) g[6][2].kind = "button";
    },
    cols: null,
    unlocked: {},
  }));

  // L12 电影院线 — awaken
  LEVELS.push(level({
    id: "cinema",
    name: "电影院线",
    theme: "cinema",
    tier: "困难",
    hint: "银幕还是黑的。关掉门口的放映开关，银幕会一下子亮起来——先留个槽给它。",
    quote: "散场了，银幕也睡了。",
    mechanic: "awaken",
    W: 17, H: 12,
    buildings: [
      { x: 1, y: 6, w: 4, h: 6, border: 0, fill: 0 },
      { x: 6, y: 2, w: 6, h: 10, border: 3, fill: 5 },
      { x: 13, y: 5, w: 3, h: 7, border: 1, fill: 1 },
    ],
    decorate(g) {
      const cells = [];
      for (let y = 4; y <= 9; y++) {
        for (let x = 7; x <= 10; x++) {
          if (g[y][x]) {
            g[y][x].on = false;
            g[y][x].dormant = true;
            g[y][x].c = 5;
            g[y][x].kind = "screen";
            cells.push([x, y]);
          }
        }
      }
      // doorway switch on left building top
      if (g[6][2]) {
        g[6][2].awaken = cells;
        g[6][2].kind = "switch";
        g[6][2].c = 0;
      }
    },
    cols: null,
  }));

  // L13 温泉旅馆 — awaken + hidden
  LEVELS.push(level({
    id: "onsen",
    name: "温泉旅馆",
    theme: "onsen",
    water: true,
    tier: "困难",
    hint: "后院还没亮灯。关掉门口灯笼，隐匿的工单也要小心。",
    quote: "雾气散尽，旅馆也歇了客。",
    mechanic: "awaken+hidden",
    W: 17, H: 11,
    buildings: [
      { x: 0, y: 5, w: 5, h: 6, border: 0, fill: 3 },
      { x: 6, y: 3, w: 5, h: 8, border: 1, fill: 1 },
      { x: 12, y: 4, w: 5, h: 7, border: 5, fill: 5 },
    ],
    decorate(g) {
      const cells = [];
      for (let y = 5; y <= 9; y++) {
        for (let x = 13; x <= 15; x++) {
          if (g[y][x]) {
            g[y][x].on = false;
            g[y][x].dormant = true;
            g[y][x].kind = "wing";
            cells.push([x, y]);
          }
        }
      }
      if (g[5][2]) {
        g[5][2].awaken = cells;
        g[5][2].kind = "switch";
      }
    },
    cols: null,
  }));

  // L14 游乐园 — duo neon
  LEVELS.push(level({
    id: "park",
    name: "游乐园",
    theme: "park",
    tier: "困难",
    hint: "大霓虹招牌要两个挨着的电闸槽才能接下。别把空位拆散了。",
    quote: "摩天轮停了，公园也晚安了。",
    mechanic: "duo",
    W: 18, H: 12,
    buildings: [
      { x: 0, y: 6, w: 4, h: 6, border: 0, fill: 1 },
      { x: 5, y: 2, w: 8, h: 10, border: 3, fill: 2 },
      { x: 14, y: 5, w: 4, h: 7, border: 1, fill: 5 },
    ],
    decorate(g) {
      // big sign band across the mid tower — visual kind only
      for (let x = 6; x <= 11; x++) {
        if (g[3][x]) { g[3][x].kind = "sign"; g[3][x].c = 3; }
        if (g[4][x]) { g[4][x].kind = "sign"; g[4][x].c = 3; }
      }
    },
    cols: null,
  }));

  // L15 电厂围墙 — duo + lock
  LEVELS.push(level({
    id: "plant",
    name: "电厂围墙",
    theme: "plant",
    tier: "超难",
    hint: "先拉冷却塔旁的钥匙灯，电厂才能进。巨幅警示招牌要两个槽。",
    quote: "汽笛停了，围墙里也暗了。",
    mechanic: "duo+lock",
    W: 18, H: 12,
    buildings: [
      { x: 0, y: 4, w: 4, h: 8, border: 0, fill: 4, key: "plant", keyAt: [2, 4], keyKind: "breaker" },
      { x: 5, y: 2, w: 8, h: 10, border: 2, fill: 3, lock: "plant" },
      { x: 14, y: 6, w: 3, h: 6, border: 4, fill: 4 },
    ],
    decorate(g) {
      if (g[4][2]) g[4][2].kind = "breaker";
      for (let x = 6; x <= 11; x++) {
        if (g[3][x]) { g[3][x].kind = "sign"; }
      }
    },
    cols: null,
    unlocked: {},
  }));

  // L16 跨江大桥 — duo + shutter, water
  LEVELS.push(level({
    id: "bridge",
    name: "跨江大桥",
    theme: "bridge",
    water: true,
    tier: "超难",
    hint: "桥身中段被桥塔电梯挡住。大字霓虹要两个挨着的槽。",
    quote: "桥灯灭尽，江面只剩下星。",
    mechanic: "duo+shutter",
    W: 19, H: 11,
    buildings: [
      { x: 0, y: 6, w: 3, h: 5, border: 0, fill: 0, key: "span", keyAt: [1, 6], keyKind: "button" },
      { x: 4, y: 3, w: 11, h: 8, border: 2, fill: 4 },
      { x: 16, y: 5, w: 3, h: 6, border: 3, fill: 3 },
    ],
    decorate(g) {
      for (let y = 5; y <= 8; y++) {
        for (let x = 7; x <= 11; x++) {
          if (g[y][x]) { g[y][x].lock = "span"; g[y][x].kind = "shutter"; }
        }
      }
      if (g[6][1]) g[6][1].kind = "button";
      for (let x = 16; x <= 18; x++) {
        for (let y = 5; y <= 6; y++) {
          if (g[y][x]) { g[y][x].kind = "sign"; g[y][x].c = 3; }
        }
      }
    },
    cols: null,
    unlocked: {},
  }));

  // L17 庙会灯会 — blink
  LEVELS.push(level({
    id: "festival",
    name: "庙会灯会",
    theme: "festival",
    tier: "超难",
    hint: "灯笼在闪。只有在它暗下去的那一拍，工单才能把它们关掉。单数次派工会碰上暗拍。",
    quote: "烟火散了，庙会也散了。",
    mechanic: "blink",
    W: 18, H: 11,
    buildings: [
      { x: 0, y: 5, w: 4, h: 6, border: 0, fill: 3 },
      { x: 5, y: 2, w: 8, h: 9, border: 1, fill: 5 },
      { x: 14, y: 4, w: 4, h: 7, border: 0, fill: 3 },
    ],
    decorate(g) {
      // lantern row on the top of mid and sides — blink purple / amber mix
      for (let x = 5; x <= 12; x++) {
        if (g[2][x]) { g[2][x].blink = true; g[2][x].kind = "lantern"; g[2][x].c = 5; }
        if (g[3][x]) { g[3][x].blink = true; g[3][x].kind = "lantern"; g[3][x].c = 5; }
      }
      for (let x = 0; x <= 3; x++) {
        if (g[5][x]) { g[5][x].blink = true; g[5][x].kind = "lantern"; }
      }
      for (let x = 14; x <= 17; x++) {
        if (g[4][x]) { g[4][x].blink = true; g[5] && g[5][x] && (g[5][x].blink = true); if (g[4][x]) g[4][x].kind = "lantern"; }
      }
    },
    cols: null,
  }));

  // L18 机场过夜 — blink + lock
  LEVELS.push(level({
    id: "airport",
    name: "机场过夜",
    theme: "airport",
    tier: "超难",
    hint: "塔台锁着候机楼顶层。跑道边的闪灯只在暗拍能关。",
    quote: "最后一班也落地了，机场睡着了。",
    mechanic: "blink+lock",
    W: 19, H: 12,
    buildings: [
      { x: 0, y: 3, w: 4, h: 9, border: 2, fill: 2, key: "tower", keyAt: [2, 3], keyKind: "beacon" },
      { x: 5, y: 2, w: 9, h: 10, border: 0, fill: 4, lock: "tower" },
      { x: 15, y: 7, w: 4, h: 5, border: 2, fill: 2 },
    ],
    decorate(g) {
      if (g[3][2]) g[3][2].kind = "beacon";
      // runway strip along the bottom of the right low building + mid bottom
      for (let x = 15; x <= 18; x++) {
        if (g[7][x]) { g[7][x].blink = true; g[7][x].kind = "lantern"; g[7][x].c = 2; }
      }
      for (let x = 5; x <= 13; x++) {
        if (g[11][x]) { g[11][x].blink = true; g[11][x].kind = "lantern"; }
      }
    },
    cols: null,
    unlocked: {},
  }));

  // L19 卫星城 — awaken + duo
  LEVELS.push(level({
    id: "satellite",
    name: "卫星城",
    theme: "satellite",
    tier: "超难",
    hint: "变电站一关，暗楼会整栋亮起。城标霓虹要两个挨着的槽，先留位置。",
    quote: "卫星城也把灯交给了夜。",
    mechanic: "awaken+duo",
    W: 18, H: 12,
    buildings: [
      { x: 0, y: 5, w: 4, h: 7, border: 0, fill: 0 },
      { x: 5, y: 1, w: 6, h: 11, border: 2, fill: 2 },
      { x: 12, y: 3, w: 6, h: 9, border: 5, fill: 5 },
    ],
    decorate(g) {
      const cells = [];
      for (let y = 4; y <= 10; y++) {
        for (let x = 13; x <= 16; x++) {
          if (g[y][x]) {
            g[y][x].on = false;
            g[y][x].dormant = true;
            g[y][x].kind = "wing";
            cells.push([x, y]);
          }
        }
      }
      if (g[5][1]) { g[5][1].awaken = cells; g[5][1].kind = "switch"; }
      for (let x = 6; x <= 9; x++) {
        if (g[2][x]) { g[2][x].kind = "sign"; g[2][x].c = 1; }
        if (g[3][x]) { g[3][x].kind = "sign"; g[3][x].c = 1; }
      }
    },
    cols: null,
  }));

  // L20 跨年夜 — lock + hidden + duo + awaken
  LEVELS.push(level({
    id: "newyear",
    name: "跨年夜",
    theme: "newyear",
    tier: "超难",
    hint: "倒计时塔还锁着，广场招牌要双槽，问号工单别乱点。开关一拉，倒计时屏会再亮一次。",
    quote: "零点过后，整座城把灯还给了星空。",
    mechanic: "combo",
    W: 19, H: 13,
    buildings: [
      { x: 0, y: 6, w: 4, h: 7, border: 0, fill: 0, key: "ball", keyAt: [2, 6], keyKind: "switch" },
      { x: 5, y: 3, w: 5, h: 10, border: 1, fill: 3 },
      { x: 11, y: 1, w: 7, h: 12, border: 5, fill: 2, lock: "ball" },
    ],
    decorate(g) {
      if (g[6][2]) g[6][2].kind = "switch";
      const cells = [];
      for (let y = 3; y <= 6; y++) {
        for (let x = 13; x <= 16; x++) {
          if (g[y][x]) {
            g[y][x].on = false;
            g[y][x].dormant = true;
            g[y][x].c = 5;
            g[y][x].kind = "screen";
            cells.push([x, y]);
          }
        }
      }
      // switch also awakens the countdown screen (same key cell)
      if (g[6][2]) g[6][2].awaken = cells;
      for (let x = 6; x <= 8; x++) {
        if (g[4][x]) { g[4][x].kind = "sign"; g[4][x].c = 3; }
        if (g[5][x]) { g[5][x].kind = "sign"; g[5][x].c = 3; }
      }
    },
    cols: null,
    unlocked: {},
  }));

  function applyPlans() {
    assign(LEVELS[1], [
      [0, 1],
      [3, 2],
      [0, 2],
      [1, 3],
    ]);

    assign(LEVELS[2], [
      [2, 0, 0],
      [3, 1, 1],
      [4, 0],
      [2, 3, 4],
    ]);

    assign(LEVELS[3], [
      [0, 5],
      [2, 1],
      [0, 3],
      [1, 3],
    ], new Set(["0:1", "1:1", "3:0"]));

    assign(LEVELS[4], [
      [0, 2],
      [4, 3],
      [1, 3],
      [2, 1, 4],
    ]);

    // L6 hidden practice — more ? than L4, slightly denser backs
    assign(LEVELS[5], [
      [3, 0, 5],
      [1, 3],
      [0, 1, 5],
      [3, 1],
    ], new Set(["0:1", "0:2", "2:1", "3:0"]));

    // L7 port lock
    assign(LEVELS[6], [
      [0, 3],
      [2, 4],
      [0, 2, 4],
      [3, 2],
    ]);

    // L8 shutter intro — button (0) visible but not the only front; mild
    assign(LEVELS[7], [
      [2, 1],
      [1, 3, 0],
      [2, 1],
      [3, 0],
    ]);

    // L9 shutter + hidden — bury button (0) behind waiting fills so greedy stuffs slots
    assign(LEVELS[8], [
      [4, 2, 4],
      [1, 5, 1],
      [2, 5],
      [4, 1, 0],
    ], new Set(["0:2", "1:1", "3:2"]));

    // L10 breaker — bury shore switch (0) behind pier colors
    assign(LEVELS[9], [
      [2, 3, 2],
      [3, 2],
      [3, 2, 3],
      [2, 3, 0],
    ]);

    // L11 lock + shutter — bury both keys (0) deep in the rightmost column
    assign(LEVELS[10], [
      [2, 1, 5],
      [3, 5, 1],
      [5, 2, 3],
      [1, 3, 0, 0],
    ]);

    // L12 awaken — front 5s wait until switch; greedy fills and never digs for 0
    assign(LEVELS[11], [
      [1, 5, 5],
      [3, 5, 5],
      [1, 3, 5],
      [5, 3, 0],
    ]);

    // L13 awaken + hidden — bury switch (0)
    assign(LEVELS[12], [
      [5, 1, 3],
      [1, 5],
      [3, 1, 5],
      [5, 3, 0],
    ], new Set(["0:0", "1:1", "2:1", "3:2"]));

    // L14 duo — casual leftmost jams before the double-slot sign
    assign(LEVELS[13], [
      [1, 1, 1, 2],
      [2, 2, 5],
      [0, 5, 2],
      [{ c: 3, duo: true }, 0, { c: 3, duo: true }],
    ]);

    // L15 duo + lock — bury breaker (0); plant fill (3) is duo and waiting
    assign(LEVELS[14], [
      [4, 2, 3],
      [{ c: 3, duo: true }, 4, 2],
      [2, 4],
      [{ c: 3, duo: true }, 2, 0],
    ]);

    // L16 duo + shutter — casual leftmost jams; button (0) buried after the sign
    assign(LEVELS[15], [
      [4, 4, 4, 4, 2],
      [2, 2, 2],
      [4, 2],
      [{ c: 3, duo: true }, 0],
    ]);

    // L17 blink — bury some 5s and interleave; taking 5 on even leaves it waiting
    assign(LEVELS[16], [
      [3, 1, 0],
      [1, 5, 3],
      [0, 1, 3],
      [5, 0, 5],
    ]);

    // L18 blink + lock — bury tower key (2) deep; mint (4) waiting
    assign(LEVELS[17], [
      [4, 0, 4],
      [0, 4, 0],
      [4, 0],
      [4, 0, 2],
    ]);

    // L19 awaken + duo — casual leftmost jams; switch (0) buried after the city sign
    assign(LEVELS[18], [
      [5, 5, 2, 5],
      [5, 2, 5],
      [2, 5, 2],
      [{ c: 1, duo: true }, 2, 0],
    ]);

    // L20 combo — bury key/switch (0) deep, duo orange, hidden, awaken purple
    assign(LEVELS[19], [
      [1, 3, 5, 2],
      [{ c: 3, duo: true }, 1, 5],
      [2, 1, 5],
      [5, 2, { c: 3, duo: true }, 0],
    ], new Set(["0:2", "1:1", "2:2", "3:1"]));
  }

  applyPlans();

  const KIND_CODE = { shutter:1, zone:2, button:3, breaker:4, key:5, switch:6, screen:7, lantern:7 };
  const KIND_NAME = ["", "shutter", "zone", "button", "breaker", "key", "switch", "screen"];

  function ticketSig(t) {
    if (!t) return "";
    return t.c + (t.duo ? "D" : "") + (t.hidden ? "H" : "");
  }

  function legalMoves(cols, slots, slotCount) {
    const out = [];
    for (let i = 0; i < cols.length; i++) {
      if (cols[i][0] && canPlaceTicket(slots, slotCount, cols[i][0])) out.push(i);
    }
    return out;
  }

  function gateColorSet(grid) {
    const s = new Set();
    if (!grid) return s;
    for (const row of grid) for (const c of row) {
      if (c && (c.key || (c.awaken && c.awaken.length))) s.add(c.c);
    }
    return s;
  }

  function decisionSig(cols, slots, slotCount, chosen, gateSet) {
    const legal = legalMoves(cols, slots, slotCount);
    const sig = (t) => {
      if (!t) return "";
      if (gateSet && gateSet.has(t.c)) return "K" + t.c + (t.duo ? "D" : "");
      return "W";
    };
    const groups = new Set(legal.map((i) => sig(cols[i][0])));
    if (groups.size <= 1) return null;
    return sig(cols[chosen][0]);
  }

  function keyPathOf(level, path, slotCount) {
    const gateSet = gateColorSet(level.grid);
    let grid = cloneGrid(level.grid);
    let cols = cloneCols(level.cols);
    let slots = Array(slotCount).fill(null);
    let unlocked = { ...(level.unlocked || {}) };
    let takes = 0;
    const keys = [];
    for (const ci of path) {
      saturate(grid, slots, unlocked, takes);
      const d = decisionSig(cols, slots, slotCount, ci, gateSet);
      if (d) keys.push(d);
      if (!place(cols, slots, ci, slotCount)) break;
      takes++;
    }
    return keys.join(">");
  }

  function countSolutions(level, slotCount, opts) {
    const maxVisits = (opts && opts.maxVisits) || 80000;
    const maxSol = (opts && opts.maxSol) || 16;
    const grid0 = cloneGrid(level.grid);
    const cols0 = cloneCols(level.cols);
    const slots0 = Array(slotCount).fill(null);
    const unlocked0 = { ...(level.unlocked || {}) };
    const seen = new Set();
    const paths = [];
    const keySet = new Set();
    let visits = 0;
    let truncated = false;

    function dfs(grid, cols, slots, unlocked, takes, path) {
      if (paths.length >= maxSol) { truncated = true; return; }
      if (++visits > maxVisits) { truncated = true; return; }
      saturate(grid, slots, unlocked, takes);
      if (isWon(grid)) {
        const p = path.slice();
        paths.push(p);
        keySet.add(keyPathOf(level, p, slotCount));
        return;
      }
      if (isLost(grid, cols, slots, slotCount, unlocked, takes)) return;
      const key = stateKey(grid, cols, slots, unlocked, takes);
      if (seen.has(key)) return;
      seen.add(key);
      for (let i = 0; i < cols.length; i++) {
        if (!cols[i].length) continue;
        const g2 = cloneGrid(grid);
        const c2 = cloneCols(cols);
        const s2 = cloneSlots(slots);
        const u2 = { ...unlocked };
        if (!place(c2, s2, i, slotCount)) continue;
        dfs(g2, c2, s2, u2, takes + 1, path.concat(i));
        if (truncated && paths.length >= maxSol) return;
      }
    }

    dfs(grid0, cols0, slots0, unlocked0, 0, []);
    return {
      count: paths.length,
      truncated,
      visits,
      paths,
      keyCount: keySet.size,
      keys: [...keySet],
      unique: paths.length === 1,
      keyUnique: keySet.size === 1 && paths.length >= 1,
    };
  }

  function randomPlayouts(level, slotCount, trials, seed) {
    let rng = (seed == null ? 1 : seed) >>> 0;
    const rnd = () => { rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0; return rng / 4294967296; };
    let wins = 0;
    for (let t = 0; t < trials; t++) {
      let grid = cloneGrid(level.grid);
      let cols = cloneCols(level.cols);
      let slots = Array(slotCount).fill(null);
      let unlocked = { ...(level.unlocked || {}) };
      let takes = 0, ok = false;
      for (let g = 0; g < 250; g++) {
        saturate(grid, slots, unlocked, takes);
        if (isWon(grid)) { ok = true; break; }
        if (isLost(grid, cols, slots, slotCount, unlocked, takes)) break;
        const legal = legalMoves(cols, slots, slotCount);
        if (!legal.length) break;
        place(cols, slots, legal[(rnd() * legal.length) | 0], slotCount);
        takes++;
      }
      if (ok) wins++;
    }
    return { wins, trials, rate: trials ? wins / trials : 0 };
  }

  function stampMask(g, x0, y0, mask, opt) {
    opt = opt || {};
    const H = g.length, W = g[0].length;
    const rows = mask.map((r) => (typeof r === "string" ? r : r.join("")));
    const mh = rows.length, mw = rows.reduce((m, r) => Math.max(m, r.length), 0);
    const colors = opt.colors || [opt.border || 0, opt.fill == null ? (opt.border || 0) : opt.fill];
    const cells = [];
    for (let y = 0; y < mh; y++) {
      for (let x = 0; x < mw; x++) {
        const ch = rows[y][x];
        if (!ch || ch === "." || ch === " " || ch === "0") continue;
        const gx = x0 + x, gy = y0 + y;
        if (gx < 0 || gy < 0 || gx >= W || gy >= H) continue;
        let c = colors[0];
        if (ch >= "1" && ch <= "9") c = colors[(ch.charCodeAt(0) - 49) % colors.length];
        else {
          const edge = x === 0 || y === 0 || x === mw - 1 || y === mh - 1
            || !rows[y][x - 1] || rows[y][x - 1] === " " || rows[y][x - 1] === "."
            || !rows[y][x + 1] || rows[y][x + 1] === " " || rows[y][x + 1] === "."
            || !rows[y - 1] || !rows[y - 1][x] || rows[y - 1][x] === " " || rows[y - 1][x] === "."
            || !rows[y + 1] || !rows[y + 1][x] || rows[y + 1][x] === " " || rows[y + 1][x] === ".";
          c = edge ? colors[0] : (colors[1] != null ? colors[1] : colors[0]);
          if (opt.band && colors[2] != null) {
            const band = (y / mh);
            if (band < (opt.band[0] || 0.25)) c = colors[2];
          }
        }
        const cell = { c, on: true };
        if (opt.lock) cell.lock = opt.lock;
        if (opt.kind) cell.kind = opt.kind;
        g[gy][gx] = cell;
        cells.push([gx, gy]);
      }
    }
    return { w: mw, h: mh, cells };
  }

  function packLevel(lv) {
    const W = lv.W, H = lv.H;
    const lockIds = [];
    const idxOf = (id) => {
      if (!id) return 0;
      let i = lockIds.indexOf(id);
      if (i < 0) { if (lockIds.length >= 7) return 0; lockIds.push(id); i = lockIds.length; }
      else i = i + 1;
      return i;
    };
    const bytes = [W & 255, H & 255];
    const awakens = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const c = lv.grid[y][x];
        if (!c) { bytes.push(0, 0); continue; }
        const kind = KIND_CODE[c.kind] || 0;
        let u = 1;
        u |= (c.c & 7) << 1;
        if (c.blink) u |= 16;
        if (c.dormant) u |= 32;
        if (c.on) u |= 64;
        u |= (idxOf(c.lock) & 7) << 7;
        u |= (idxOf(c.key) & 7) << 10;
        u |= (kind & 7) << 13;
        bytes.push(u & 255, (u >> 8) & 255);
        if (c.awaken && c.awaken.length) awakens.push({ x, y, cells: c.awaken });
      }
    }
    const cols = lv.cols || [];
    bytes.push(cols.length & 255);
    for (const col of cols) {
      bytes.push(col.length & 255);
      for (const t of col) {
        let f = (t.c & 7);
        if (t.duo) f |= 8;
        if (t.hidden) f |= 16;
        bytes.push(f, t.n & 255);
      }
    }
    bytes.push(awakens.length & 255);
    for (const a of awakens) {
      bytes.push(a.x & 255, a.y & 255, a.cells.length & 255);
      for (const [x, y] of a.cells) bytes.push(x & 255, y & 255);
    }
    return bytes;
  }

  function unpackLevel(bytes, meta) {
    let i = 0;
    const W = bytes[i++], H = bytes[i++];
    const g = emptyGrid(W, H);
    const lockName = (k) => (k ? "K" + k : null);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const u = bytes[i] | (bytes[i + 1] << 8); i += 2;
        if (!(u & 1)) continue;
        const cell = {
          c: (u >> 1) & 7,
          blink: !!(u & 16),
          dormant: !!(u & 32),
          on: !!(u & 64),
        };
        const lock = (u >> 7) & 7;
        const key = (u >> 10) & 7;
        const kind = (u >> 13) & 7;
        if (lock) cell.lock = lockName(lock);
        if (key) cell.key = lockName(key);
        if (kind) cell.kind = KIND_NAME[kind] || null;
        g[y][x] = cell;
      }
    }
    const nCol = bytes[i++];
    const cols = [];
    let tid = 1;
    for (let c = 0; c < nCol; c++) {
      const nT = bytes[i++];
      const col = [];
      for (let t = 0; t < nT; t++) {
        const f = bytes[i++], n = bytes[i++];
        const tk = { c: f & 7, n, id: tid++ };
        if (f & 8) tk.duo = true;
        if (f & 16) tk.hidden = true;
        col.push(tk);
      }
      cols.push(col);
    }
    const nAw = bytes[i++];
    for (let a = 0; a < nAw; a++) {
      const sx = bytes[i++], sy = bytes[i++], n = bytes[i++];
      const cells = [];
      for (let k = 0; k < n; k++) cells.push([bytes[i++], bytes[i++]]);
      if (g[sy] && g[sy][sx]) g[sy][sx].awaken = cells;
    }
    meta = meta || {};
    return {
      id: meta.id || ("lv-" + (meta.n || 0)),
      name: meta.name || "",
      hint: meta.hint || "",
      tier: meta.tier || "",
      W, H, grid: g, cols, unlocked: {},
      coach: !!meta.coach,
      mechanic: meta.mechanic || null,
      mechs: meta.mechs || [],
      theme: meta.theme || "",
      water: !!meta.water,
      quote: meta.quote || "",
      n: meta.n || 0,
      ...meta,
    };
  }

  const api = {
    COLORS, drawColorPattern, LEVELS, emptyGrid, cloneGrid, cloneCols, cloneSlots,
    stampBuilding, stampMask, countOn, countNeed, isOpen, isReachable, findTarget, turnOff,
    saturate, leftCount, canTake, canPlaceTicket, place, frontsUseful, isWon, isLost,
    solve, greedySolve, leftmostSolve, ticketSumsOk, T,
    countSolutions, randomPlayouts, keyPathOf, ticketSig, legalMoves,
    packLevel, unpackLevel,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.NightCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
