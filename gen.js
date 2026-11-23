// Procedural generator + pacing for 环球电工. Depends on NightCore, NightWorld, NightLandmarks.
(function (root) {
  const C = root.NightCore || (typeof require === "function" ? require("./core.js") : null);
  const W = root.NightWorld || (typeof require === "function" ? require("./world.js") : null);
  const LM = root.NightLandmarks || (typeof require === "function" ? require("./landmarks.js") : null);
  if (!C) throw new Error("NightCore required");
  if (!W) throw new Error("NightWorld required");

  const INTROS = [
    { id: "hidden", at: 4, title: "问号工单", line: "点下去才会现形。先数一数城里还剩什么颜色。" },
    { id: "lock", at: 5, title: "钥匙灯", line: "锁着的楼和钥匙灯是同一个标记。先关钥匙，再进楼。" },
    { id: "shutter", at: 8, title: "电梯卷帘", line: "中间几层被卷帘挡住。天台和街边可以先关，按钮在岗亭上。" },
    { id: "breaker", at: 10, title: "总闸", line: "整片区域都没电，靠边是关不到的。先拉开同标记的总闸。" },
    { id: "awaken", at: 12, title: "会亮起来的灯", line: "那面墙现在是黑的。关掉开关后它会一下子亮起来，先留个槽。" },
    { id: "duo", at: 14, title: "双槽招牌", line: "大霓虹要两个挨着的电闸槽才能接下。别把空位拆散了。" },
    { id: "blink", at: 17, title: "闪烁灯笼", line: "灯笼在闪。只有暗下去的那一拍才能关。单数次派工会碰上暗拍。" },
  ];

  const MECH_META = {
    hidden:  { hue: "#c9a6ff", mark: "?",  label: "问号" },
    lock:    { hue: "#ffd56a", mark: "钥", label: "钥匙" },
    shutter: { hue: "#7ee7ff", mark: "梯", label: "电梯" },
    breaker: { hue: "#8dffc1", mark: "闸", label: "总闸" },
    awaken:  { hue: "#c9a6ff", mark: "亮", label: "开关" },
    duo:     { hue: "#ff9a4a", mark: "双", label: "双槽" },
    blink:   { hue: "#ff8ab8", mark: "闪", label: "灯笼" },
  };

  const TUTORIAL = 5;
  const MAX_MENU = W.TOTAL || 500;

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function irand(rng, a, b) { return a + ((rng() * (b - a + 1)) | 0); }
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function chapterOf(n) { return W.chapterOf(n); }
  function chapterName(n) {
    const c = W.cityOf(n);
    return c ? c.name : ("第 " + chapterOf(n) + " 章");
  }

  function roleOf(n) {
    if (n <= TUTORIAL) return "teach";
    if (n % 20 === 0) return "chapterBoss";
    if (n % 10 === 0) return "boss";
    if (n % 10 === 5) return "pit";
    if (INTROS.some((x) => x.at === n) && n > TUTORIAL) return "teachMech";
    return "normal";
  }

  function isBoss(role) { return role === "boss" || role === "chapterBoss"; }

  function unlockedMechs(n) {
    const out = [];
    for (const it of INTROS) if (n >= it.at) out.push(it.id);
    return out;
  }

  function pickMechs(n, role, rng) {
    const unlocked = unlockedMechs(n);
    if (n <= 20 && role !== "chapterBoss" && role !== "boss") {
      // hand levels keep their own baked mechs; generator path unused for 1-20 grids
    }
    if (role === "teach") return [];
    const comboCap = clamp(1 + Math.floor((n - TUTORIAL) / 25), 1, 3);
    let k = 1;
    if (role === "teachMech") k = 1;
    else if (role === "pit") k = Math.min(2, Math.max(1, comboCap));
    else if (isBoss(role)) k = Math.min(unlocked.length, Math.max(2, comboCap));
    else k = (comboCap > 1 && n % 3 === 0) ? Math.min(2, comboCap) : 1;
    if (n < 30 && !isBoss(role) && role !== "pit") k = 1;
    const pool = unlocked.slice();
    const chosen = [];
    if (role === "teachMech") {
      const intro = INTROS.find((x) => x.at === n);
      if (intro) { chosen.push(intro.id); k = Math.max(k, 1); }
    }
    if (pool.length) {
      const primary = pool[(n * 3 + Math.floor(n / 7)) % pool.length];
      chosen.push(primary);
      pool.splice(pool.indexOf(primary), 1);
    }
    while (chosen.length < k && pool.length) {
      const i = (rng() * pool.length) | 0;
      chosen.push(pool.splice(i, 1)[0]);
    }
    // After the tutorial, every level needs a lock-like gate so greedy cannot just follow useful fronts.
    if (n > TUTORIAL) {
      // Shutter only covers a mid-band, so wait-colors on that building stay reachable.
      // After the tutorial, always have a full-building gate (lock or breaker).
      const GATES = ["lock", "breaker"];
      if (!chosen.some((m) => GATES.includes(m))) {
        const g = (unlocked.find((m) => GATES.includes(m))) || "lock";
        if (!chosen.includes(g)) chosen.unshift(g);
        if (role === "teachMech" && INTROS.find((x) => x.at === n)) {
          const id = INTROS.find((x) => x.at === n).id;
          if (!chosen.includes(id)) chosen.push(id);
        }
      }
    }
    return chosen;
  }

  function colorCountOf(n, role) {
    if (n <= TUTORIAL) return 2;
    const chap = Math.floor((n - 1) / 20);
    const pos = ((n - 1) % 20) + 1;
    // palette unlocks slowly; sawtooth inside each chapter
    const base = clamp(4 + Math.floor(chap / 8), 4, 7);
    let bump = 0;
    if (pos === 20) bump = 2;
    else if (pos === 10) bump = 1;
    else if (pos === 5 || pos === 15) bump = 1;
    else if (pos <= 3) bump = -1;
    else if (pos % 4 === 0) bump = 1;
    if (role === "teachMech") bump = Math.min(bump, 0);
    return clamp(base + bump, 4, C.COLORS.length);
  }

  function pacingOf(n) {
    const role = roleOf(n);
    // mid-high band after tutorial; no relax dip
    let target = 42;
    if (n <= TUTORIAL) target = 12 + n * 4;
    else if (role === "teachMech") target = 48;
    else if (role === "normal") target = clamp(50 + Math.sqrt(Math.max(0, n - TUTORIAL)) * 1.1, 50, 70);
    else if (role === "pit") target = clamp(60 + Math.sqrt(n) * 1.0, 60, 80);
    else if (role === "boss") target = clamp(70 + Math.sqrt(n) * 0.9, 70, 86);
    else if (role === "chapterBoss") target = clamp(76 + Math.sqrt(n) * 0.9, 76, 90);
    const colors = colorCountOf(n, role);
    const bury = n <= TUTORIAL ? 0 : (isBoss(role) ? 2 : role === "pit" ? 2 : role === "teachMech" ? 1 : 1);
    const chap = Math.floor((n - 1) / 20);
    const grow = clamp(Math.floor(chap / 5), 0, 4);
    let W = 20 + grow, H = 16 + grow, blds = 4;
    if (role === "pit") { W += 1; H += 1; blds = 4; }
    if (role === "boss") { W = 22 + grow; H = 18 + grow; blds = 2; }
    if (role === "chapterBoss") { W = 23 + grow; H = 19 + grow; blds = 2; }
    if (role === "teachMech") { W = 20 + Math.min(2, grow); H = 16 + Math.min(2, grow); }
    if (n <= TUTORIAL) { W = 16; H = 12; }
    return {
      n, role, target,
      lo: target - (isBoss(role) ? 10 : 14),
      hi: target + 14,
      colors, bury,
      blds,
      W, H,
    };
  }

  function themeFor(n) {
    const city = W.cityOf(n);
    const th = W.themeOfCity(city);
    const name = W.districtName(n);
    const landmark = W.isLandmarkLevel(n);
    return {
      ...th,
      name,
      landmark,
      landmarkType: city.landmark,
      landmarkName: city.landmarkName,
      quote: landmark ? city.quote : city.quote,
      character: city.character,
      open: city.open,
      close: city.close,
      city: city.id,
      cityName: city.name,
      water: !!city.water,
    };
  }

  function replayPeakAndThink(level, path, slotCount) {
    let grid = C.cloneGrid(level.grid);
    let cols = C.cloneCols(level.cols);
    let slots = Array(slotCount).fill(null);
    let unlocked = { ...(level.unlocked || {}) };
    let takes = 0, peak = 0, think = 0;
    for (const ci of path) {
      C.saturate(grid, slots, unlocked, takes);
      const useful = C.frontsUseful(grid, cols, unlocked, takes);
      if (useful.length && useful.indexOf(ci) < 0) think++;
      if (!C.place(cols, slots, ci, slotCount)) break;
      takes++;
      C.saturate(grid, slots, unlocked, takes);
      const used = slots.filter(Boolean).length;
      if (used > peak) peak = used;
    }
    return { peak, think };
  }

  function scoreDifficulty(level, sol, greedy, left, extra) {
    const rt = sol && sol.ok ? replayPeakAndThink(level, sol.path, 5) : { peak: 0, think: 0 };
    const colors = new Set();
    if (level.grid) for (const row of level.grid) for (const c of row) if (c && (c.on || c.dormant)) colors.add(c.c);
    const mechs = (level.mechs && level.mechs.length) ? level.mechs.length : (level.mechanic ? 1 : 0);
    let s = 0;
    if (greedy && !greedy.ok) s += 26;
    if (left && !left.ok) s += 10;
    s += clamp(rt.think * 6, 0, 24);
    s += clamp(Math.log10((sol && sol.visits) || 1) * 8, 0, 16);
    s += clamp((rt.peak - 2) * 5, 0, 14);
    s += (colors.size - 3) * 3;
    s += mechs * 4;
    if (level.pacing && level.pacing.bury) s += level.pacing.bury * 3;
    if (extra && extra.rand != null) s += clamp((0.1 - extra.rand) * 80, 0, 12);
    if (extra && extra.sols != null) s += clamp((6 - extra.sols) * 2, 0, 10);
    return {
      score: clamp(Math.round(s), 0, 100),
      peak: rt.peak, think: rt.think,
      visits: sol ? sol.visits : 0,
      greedyOk: !!(greedy && greedy.ok),
      leftOk: !!(left && left.ok),
    };
  }

  function recItem(item) { return typeof item === "number" ? { c: item } : item; }

  function splitCounts(total, k, rng) {
    k = Math.max(1, Math.min(k, total));
    if (k === 1) return [total];
    const raw = [];
    for (let i = 0; i < k; i++) raw.push(0.35 + rng());
    if (k >= 3) raw[0] *= 1.6 + rng();
    if (k >= 4 && rng() < 0.7) raw[1] *= 0.45 + rng() * 0.3;
    const sum = raw.reduce((a, b) => a + b, 0);
    const out = raw.map((w) => Math.max(1, Math.round(total * w / sum)));
    let diff = total - out.reduce((a, b) => a + b, 0);
    let i = 0;
    while (diff !== 0 && i < 200) {
      const j = i % k;
      if (diff > 0) { out[j]++; diff--; }
      else if (out[j] > 1) { out[j]--; diff++; }
      i++;
    }
    return out;
  }

  function assign(level, recipe, hiddenSet, rng) {
    hiddenSet = hiddenSet || new Set();
    rng = rng || mulberry32(hashStr("split:" + (level.id || level.n || 0)));
    const { n } = C.countNeed(level.grid);
    const parsed = recipe.map((col) => col.map(recItem));
    const need = {};
    for (const col of parsed) for (const it of col) need[it.c] = (need[it.c] || 0) + 1;
    const piles = {};
    for (const [cs, total] of Object.entries(n)) {
      const c = +cs, k = need[c] || 0;
      piles[c] = [];
      if (k === 0 && total > 0) throw new Error("color leftover " + c);
      if (k === 0) continue;
      const parts = splitCounts(total, k, rng);
      for (const v of parts) piles[c].push(v);
    }
    for (const c of Object.keys(need)) if (!n[+c]) throw new Error("no lights " + c);
    let tid = hashStr(level.id) % 100000;
    level.cols = parsed.map((col, ci) => col.map((it, ri) => {
      const hidden = !!(it.hidden || hiddenSet.has(ci + ":" + ri));
      const extra = {};
      if (hidden) extra.hidden = true;
      if (it.duo) extra.duo = true;
      return { c: it.c, n: piles[it.c].shift(), id: ++tid, ...extra };
    }));
    return level;
  }

  function bboxOf(g, pred) {
    let x0 = 99, y0 = 99, x1 = 0, y1 = 0, n = 0;
    for (let y = 0; y < g.length; y++)
      for (let x = 0; x < g[0].length; x++)
        if (g[y][x] && (!pred || pred(g[y][x], x, y))) {
          n++; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
        }
    return n ? { x0, y0, x1, y1, n } : null;
  }

  function placeKeyCell(g, b, props) {
    const tryAt = (x, y) => {
      if (g[y] && g[y][x] && !g[y][x].key) { Object.assign(g[y][x], props); return true; }
      return false;
    };
    for (let x = b.x; x < b.x + b.w; x++) if (tryAt(x, b.y)) return;
    if (tryAt(b.x, b.y + Math.min(1, b.h - 1))) return;
    if (tryAt(b.x + b.w - 1, b.y + Math.min(1, b.h - 1))) return;
    if (g[b.y] && g[b.y][b.x]) Object.assign(g[b.y][b.x], props);
  }



  function bandPaint(g, x, y, w, h, colors, rng) {
    if (!colors || colors.length < 2) return;
    const step = Math.max(2, Math.floor(h / colors.length));
    let ci = 0;
    for (let yy = y; yy < y + h; yy++) {
      if ((yy - y) && ((yy - y) % step) === 0) ci = (ci + 1) % colors.length;
      for (let xx = x; xx < x + w; xx++) {
        if (g[yy] && g[yy][xx] && !g[yy][xx].key && rng() < 0.45) g[yy][xx].c = colors[ci];
      }
    }
  }

  function nColorsUnlock(n) {
    if (n <= 20) return 5;
    if (n <= 80) return 6;
    if (n <= 200) return 7;
    return C.COLORS.length;
  }

  function sprinkle(g, x, y, w, h, colors, rng, rate) {
    if (!colors || colors.length < 2) return;
    for (let yy = y + 1; yy < y + h - 1; yy++) {
      for (let xx = x + 1; xx < x + w - 1; xx++) {
        if (g[yy] && g[yy][xx] && !g[yy][xx].key && rng() < rate) {
          g[yy][xx].c = colors[(rng() * colors.length) | 0];
        }
      }
    }
  }

  function buildGrid(rng, pacing, mechs, city) {

    const landmark = !!(pacing.n % 10 === 0 && LM && city && LM.MASKS[city.landmark]);
    let W = pacing.W, H = pacing.H;
    let mask = null, mw = 0, mh = 0;
    if (landmark) {
      mask = LM.MASKS[city.landmark];
      const sz = LM.maskSize(mask);
      mw = sz.w; mh = sz.h;
      W = Math.max(W, mw + 5);
      H = Math.max(H, mh);
    }
    const g = C.emptyGrid(W, H);
    const needKey = mechs.some((m) => m === "lock" || m === "shutter" || m === "breaker" || m === "awaken");
    const needExtra = mechs.some((m) => m === "shutter" || m === "awaken");
    const palN = C.COLORS.length;
    const reserved = (needKey ? 1 : 0) + (needExtra ? 1 : 0);
    const want = pacing.colors;
    const paintN = clamp(want - reserved, 3, palN - reserved);
    const unlockedPal = nColorsUnlock(pacing.n);
    const bag = [];
    for (let i = 0; i < unlockedPal; i++) bag.push(i);
    for (let i = bag.length - 1; i > 0; i--) {
      const j = (rng() * (i + 1)) | 0;
      const tmp = bag[i]; bag[i] = bag[j]; bag[j] = tmp;
    }
    const colors = bag.slice(0, paintN);
    const rest = bag.filter((c) => colors.indexOf(c) < 0);
    for (let i = 0; i < palN; i++) if (rest.indexOf(i) < 0 && colors.indexOf(i) < 0) rest.push(i);
    const keyColor = needKey ? (rest[0] != null ? rest[0] : (paintN % palN)) : colors[colors.length - 1];
    const extraColor = needExtra ? (rest[1] != null && rest[1] !== keyColor ? rest[1] : (rest[0] != null && rest[0] !== keyColor ? rest[0] : (keyColor + 1) % palN)) : keyColor;
    // Split paint colors: useful (reachable buildings) vs wait (locked landmark / right building only).
    // Sharing a palette across all buildings made locked colors immediately useful, so greedy could cruise.
    const waitN = clamp(colors.length - 2, 1, Math.min(4, colors.length - 1));
    const usefulPal = colors.slice(0, colors.length - waitN);
    const waitPal = colors.slice(colors.length - waitN);
    if (!usefulPal.length) usefulPal.push(colors[0]);
    const blds = [];

    // always a left gatehouse / workshop for keys & switches
    const gw = landmark ? clamp(irand(rng, 4, 5), 3, Math.max(3, W - mw - 1)) : 0;
    if (landmark) {
      const gh = irand(rng, Math.max(8, H - 5), H);
      const gy = H - gh;
      const border = usefulPal[0], fill = usefulPal[usefulPal.length - 1];
      C.stampBuilding(g, 0, gy, gw, gh, { border, fill });
      sprinkle(g, 0, gy, gw, gh, usefulPal, rng, 0.28);
      blds.push({ x: 0, y: gy, w: gw, h: gh, border, fill, gate: true });
      const lx = W - mw;
      const ly = Math.max(0, H - mh);
      const mc = [
        waitPal[0],
        waitPal[1 % waitPal.length],
        waitPal[2 % waitPal.length],
      ];
      C.stampMask(g, lx, ly, mask, { colors: mc });
      bandPaint(g, lx, ly, mw, mh, waitPal, rng);
      blds.push({ x: lx, y: ly, w: mw, h: mh, border: mc[0], fill: mc[1], landmark: true });
    } else {
      const nB = clamp(pacing.blds, 4, 6);
      let x = 0;
      for (let i = 0; i < nB; i++) {
        const left = W - x;
        const slotsLeft = nB - i;
        const gapBudget = Math.max(0, slotsLeft - 1);
        const maxW = Math.max(3, Math.floor((left - gapBudget) / slotsLeft) + 1);
        const bw = clamp(irand(rng, 3, Math.min(8, maxW)), 3, Math.max(3, left - gapBudget));
        const bh = irand(rng, Math.max(8, H - 4), H);
        const y = H - bh;
        const pal = (i === nB - 1) ? waitPal : usefulPal;
        const border = pal[i % pal.length];
        const fill = pal[(i + 1 + ((rng() * 2) | 0)) % pal.length];
        C.stampBuilding(g, x, y, bw, bh, { border, fill });
        sprinkle(g, x, y, bw, bh, pal, rng, 0.22);
        blds.push({ x, y, w: bw, h: bh, border, fill });
        x += bw + (i === nB - 1 ? 0 : 1);
        if (x >= W - 1) break;
      }
    }
    if (!blds.length) throw new Error("no buildings");

    const leftB = blds[0];
    const midB = blds[Math.floor(blds.length / 2)] || blds[0];
    const rightB = blds[blds.length - 1];
    const used = mechs.slice();

    if (used.includes("lock") && blds.length >= 2) {
      const id = "L" + pacing.n;
      const b = rightB;
      const y0 = b.y + (landmark ? Math.max(1, (b.h * 0.15) | 0) : 0);
      for (let yy = y0; yy < b.y + b.h; yy++)
        for (let xx = b.x; xx < b.x + b.w; xx++)
          if (g[yy][xx]) { g[yy][xx].lock = id; g[yy][xx].kind = g[yy][xx].kind || "zone"; }
      placeKeyCell(g, leftB, { key: id, kind: "key", c: keyColor });
    }

    if (used.includes("shutter")) {
      const id = "S" + pacing.n;
      // Gate the wait-palette building (the last one). Only use mid when lock/breaker already owns the right building.
      const b = landmark ? rightB : ((used.includes("lock") || used.includes("breaker")) ? midB : rightB);
      const y0 = b.y + Math.max(2, (b.h * 0.3) | 0);
      const y1 = Math.min(b.y + b.h - 2, y0 + Math.max(2, (b.h * 0.3) | 0));
      for (let yy = y0; yy < y1; yy++)
        for (let xx = b.x; xx < b.x + b.w; xx++)
          if (g[yy][xx]) { g[yy][xx].lock = id; g[yy][xx].kind = "shutter"; g[yy][xx].c = extraColor; }
      placeKeyCell(g, leftB, { key: id, kind: "button", c: keyColor });
    }

    if (used.includes("breaker") && blds.length >= 2) {
      const id = "B" + pacing.n;
      const b = rightB;
      // if already locked by "lock", apply breaker to a mid band only when both present
      const already = used.includes("lock");
      const y0 = already ? b.y + ((b.h * 0.45) | 0) : b.y;
      for (let yy = y0; yy < b.y + b.h; yy++)
        for (let xx = b.x; xx < b.x + b.w; xx++)
          if (g[yy][xx]) { g[yy][xx].lock = id; g[yy][xx].kind = "zone"; }
      placeKeyCell(g, leftB, { key: id, kind: "breaker", c: keyColor });
    }

    if (used.includes("awaken")) {
      const b = landmark ? rightB : midB;
      const cells = [];
      const ix0 = b.x + (landmark ? Math.max(0, (b.w * 0.15) | 0) : 0);
      const ix1 = b.x + b.w - (landmark ? Math.max(0, (b.w * 0.15) | 0) : 0);
      const iy0 = b.y + Math.max(1, (b.h * 0.25) | 0);
      const iy1 = Math.min(b.y + b.h - 1, iy0 + Math.max(3, (b.h * 0.4) | 0));
      for (let yy = iy0; yy < iy1; yy++)
        for (let xx = ix0; xx < ix1; xx++)
          if (g[yy] && g[yy][xx] && !g[yy][xx].lock) {
            g[yy][xx].on = false;
            g[yy][xx].dormant = true;
            g[yy][xx].kind = "screen";
            g[yy][xx].c = extraColor;
            cells.push([xx, yy]);
          }
      if (cells.length) {
        placeKeyCell(g, leftB, { awaken: cells, kind: "switch", c: keyColor });
      }
    }

    if (used.includes("blink")) {
      const b = rightB;
      for (let xx = b.x; xx < b.x + b.w; xx++) {
        if (g[b.y] && g[b.y][xx]) { g[b.y][xx].blink = true; g[b.y][xx].kind = g[b.y][xx].kind || "lantern"; }
        if (b.h > 3 && g[b.y + 1] && g[b.y + 1][xx] && rng() > 0.4) {
          g[b.y + 1][xx].blink = true;
          g[b.y + 1][xx].kind = g[b.y + 1][xx].kind || "lantern";
        }
      }
    }

    return { grid: g, W, H, blds };
  }

  function gateColors(grid) {
    const set = new Set();
    for (const row of grid) for (const c of row) {
      if (c && (c.key || (c.awaken && c.awaken.length))) set.add(c.c);
    }
    return [...set];
  }

  function colorClasses(grid) {
    const useful = new Set();
    const locked = new Set();
    const present = new Set();
    const keys = new Set();
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const c = grid[y][x];
        if (!c || !(c.on || c.dormant)) continue;
        present.add(c.c);
        if (c.key || (c.awaken && c.awaken.length)) keys.add(c.c);
        if (c.lock) locked.add(c.c);
        if (c.on && C.isReachable(grid, x, y, {}, 0)) useful.add(c.c);
      }
    }
    return { useful, locked, present, keys };
  }

  function buildRecipe(rng, level, pacing, mechs) {
    const { n } = C.countNeed(level.grid);
    const colors = Object.keys(n).map(Number).sort((a, b) => a - b);
    if (!colors.length) throw new Error("no colors");
    const cls = colorClasses(level.grid);
    const gates = [...cls.keys];
    const duoColor = mechs.includes("duo")
      ? (colors.find((c) => cls.useful.has(c) && !cls.keys.has(c) && n[c] >= 16) ?? colors.find((c) => cls.useful.has(c) && !cls.keys.has(c)))
      : null;
    const hide = mechs.includes("hidden");

    const parts = {};
    for (const c of colors) {
      const total = n[c];
      let k = 2;
      if (total >= 14) k = 3;
      if (total >= 24) k = 4;
      if (total >= 40) k = 5;
      if (total >= 70) k = 6;
      if (cls.locked.has(c) && !cls.useful.has(c) && total >= 8) k = Math.max(k, Math.min(isBoss(pacing.role) ? 7 : 6, Math.max(4, Math.floor(total / 10))));
      if (cls.keys.has(c)) k = Math.max(1, Math.min(2, total));
      if (duoColor === c) k = 2;
      if (k > total) k = Math.max(1, total);
      parts[c] = k;
    }

    let tickets = [];
    for (const c of colors) {
      for (let i = 0; i < parts[c]; i++) {
        const t = { c };
        if (duoColor === c) t.duo = true;
        tickets.push(t);
      }
    }

    const keyT = tickets.filter((t) => cls.keys.has(t.c));
    const usefulT = tickets.filter((t) => !cls.keys.has(t.c) && cls.useful.has(t.c));
    const waitT = tickets.filter((t) => !cls.keys.has(t.c) && !cls.useful.has(t.c));
    const cols = [[], [], [], []];
    // 5 slots: at most 4 unusable waits can sit in front of the key.
    const keyDepth = keyT.length
      ? 4
      : 0;
    // All four fronts should be waiting colors so random is tempted to fill the slots.
    // The key sits at the bottom of column 3, behind keyDepth waiting tickets.
    const reserve = waitT.slice(0, keyDepth);
    const restW = waitT.slice(keyDepth);
    // one waiting front on columns 0-2 first, then leftover waits, useful tucked behind in col 0
    for (let i = 0; i < 3; i++) {
      if (restW.length) cols[i].push(restW.shift());
    }
    restW.forEach((t, i) => cols[i % 3].push(t));
    usefulT.forEach((t) => cols[0].push(t));
    reserve.forEach((t) => cols[3].push(t));
    keyT.forEach((t) => cols[3].push(t));
    if (!waitT.length && !keyT.length && usefulT.length >= 5) {
      for (let i = 0; i < 4; i++) cols[i] = [];
      usefulT.forEach((t, i) => cols[i % 4].push(t));
    }
    for (let ci = 0; ci < 4; ci++) {
      if (!cols[ci].length) {
        const src = cols.slice().sort((a, b) => b.length - a.length)[0];
        if (src && src.length > 1) cols[ci].push(src.pop());
      }
    }

    const hiddenSet = new Set();
    if (hide) {
      for (let ci = 0; ci < 4; ci++) {
        for (let ri = 1; ri < cols[ci].length; ri++) {
          if (rng() < (isBoss(pacing.role) ? 0.75 : 0.5)) hiddenSet.add(ci + ":" + ri);
        }
      }
      if (isBoss(pacing.role) || pacing.role === "pit") hiddenSet.add("3:0");
    }
    return { recipe: cols, hiddenSet };
  }

  function hintFor(mechs, role, th) {
    if (role === "chapterBoss") return "今晚要把" + (th && th.landmarkName ? th.landmarkName : "地标") + "的灯关完。先看标记，别着急点。";
    if (isBoss(role)) return "今晚的地标要细想。先看哪些灯已经贴着夜空。";
    if (!mechs.length) return "先看哪些灯已经贴着夜空。";
    const bits = mechs.map((m) => (MECH_META[m] && MECH_META[m].label) || m);
    if (isBoss(role)) return "今晚机关叠在一起：" + bits.join("、") + "。先看标记再下手。";
    return "今晚要注意：" + bits.join("、") + "。";
  }

  function attachWorld(lv, n) {
    const th = themeFor(n);
    const city = W.cityOf(n);
    const role = roleOf(n);
    lv.n = n;
    lv.name = th.name;
    lv.theme = th.id;
    lv.themeDef = th;
    lv.water = !!th.water;
    lv.quote = (role === "chapterBoss" ? city.close : city.quote);
    lv.character = city.character;
    lv.chapter = W.chapterOf(n);
    lv.chapterName = city.name;
    lv.city = city.id;
    lv.cityName = city.name;
    lv.landmark = W.isLandmarkLevel(n);
    lv.landmarkType = city.landmark;
    lv.landmarkName = city.landmarkName;
    lv.region = city.region;
    lv.open = city.open;
    lv.close = city.close;
    if (!lv.tier) {
      lv.tier = role === "chapterBoss" ? "章末" : role === "boss" ? "地标" : role === "pit" ? "困难" : role === "teach" ? "入门" : "普通";
    }
    if (!lv.hint) lv.hint = hintFor(lv.mechs || [], role, th);
    return lv;
  }

  function enrich(L, n) {
    attachWorld(L, n);
    if (!L.mechs) L.mechs = L.mechanic ? String(L.mechanic).split("+") : [];
    L._enriched = true;
    return L;
  }

  function tryOnce(n, attempt, gridOverride) {
    const pacing = pacingOf(n);
    const rng = mulberry32(hashStr("nl5:" + n + ":" + attempt));
    const mechs = gridOverride ? (gridOverride.mechs || pickMechs(n, pacing.role, rng)) : pickMechs(n, pacing.role, rng);
    const th = themeFor(n);
    const city = W.cityOf(n);
    let built;
    if (gridOverride) {
      built = { grid: C.cloneGrid(gridOverride.grid), W: gridOverride.W, H: gridOverride.H };
    } else {
      built = buildGrid(rng, pacing, mechs, city);
    }
    const lv = {
      id: (gridOverride && gridOverride.id) || ("gen-" + n),
      name: th.name,
      hint: hintFor(mechs, pacing.role, th),
      tier: pacing.role === "chapterBoss" ? "章末" : pacing.role === "boss" ? "地标" : pacing.role === "pit" ? "困难" : pacing.role === "teach" ? "入门" : "普通",
      W: built.W,
      H: built.H,
      grid: built.grid,
      cols: null,
      unlocked: {},
      coach: n <= 3,
      mechanic: mechs.join("+") || null,
      mechs,
      n,
      generated: !gridOverride,
      pacing,
    };
    attachWorld(lv, n);
    const { recipe, hiddenSet } = buildRecipe(rng, lv, pacing, mechs);
    assign(lv, recipe, hiddenSet, rng);
    if (!C.ticketSumsOk(lv).ok) return null;
    return lv;
  }

  function evaluate(lv, opts) {
    opts = opts || {};
    const sol = C.solve(lv, 5, { maxVisits: opts.maxVisits || 80000 });
    if (!sol.ok) return { ok: false, reason: "unsolvable", sol };
    const greedy = C.greedySolve(lv, 5);
    const left = C.leftmostSolve(lv, 5);
    const n = lv.n || 0;
    if (n > TUTORIAL && greedy.ok && !opts.keepGoing) {
      const sc = scoreDifficulty(lv, sol, greedy, left, { rand: 1, sols: 99 });
      return { ok: true, sol, greedy, left, rand: { rate: 1, wins: 0, trials: 0 }, cnt: { count: 99, unique: false, keyUnique: false, keyCount: 99 }, diff: sc, failHard: true };
    }
    const randTrials = opts.randTrials || 80;
    const rand = C.randomPlayouts(lv, 5, randTrials, hashStr("rnd:" + lv.n));
    if (n > TUTORIAL && rand.rate > ((isBoss(roleOf(n)) ? 0.02 : 0.10) + 1e-9) && !opts.keepGoing) {
      const sc = scoreDifficulty(lv, sol, greedy, left, { rand: rand.rate, sols: 99 });
      return { ok: true, sol, greedy, left, rand, cnt: { count: 99, unique: false, keyUnique: false, keyCount: 99 }, diff: sc, failHard: true };
    }
    const cnt = C.countSolutions(lv, 5, { maxVisits: opts.countVisits || 60000, maxSol: opts.maxSol || 16 });
    const sc = scoreDifficulty(lv, sol, greedy, left, { rand: rand.rate, sols: cnt.count });
    return { ok: true, sol, greedy, left, rand, cnt, diff: sc };
  }

  function passesHard(n, ev) {
    const role = roleOf(n);
    if (n <= TUTORIAL) return ev.sol && ev.sol.ok;
    if (!ev.sol || !ev.sol.ok) return false;
    if (ev.greedy && ev.greedy.ok) return false;
    const randCap = isBoss(role) ? 0.02 : (role === "teachMech" ? 0.10 : 0.10);
    if (ev.rand && ev.rand.rate > randCap + 1e-9) return false;
    if (isBoss(role)) {
      if (!(ev.cnt && (ev.cnt.unique || ev.cnt.keyUnique))) return false;
    } else {
      const keyCap = role === "pit" ? 4 : 6;
      if (ev.cnt && ev.cnt.keyCount > keyCap) return false;
    }
    return true;
  }

  const cache = {};
  let BANK = null;

  function setBank(bank) { BANK = bank; }

  function installBankFromRaw(raw, meta) {
    const u8 = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
    const list = Array.isArray(meta) ? meta : [];
    const packs = {};
    let i = 0, n = 1;
    while (i + 2 <= u8.length) {
      const len = u8[i] | (u8[i + 1] << 8);
      i += 2;
      if (i + len > u8.length) break;
      const bytes = u8.slice(i, i + len);
      const recMeta = list.find((m) => m && m.n === n) || list[n - 1] || { n };
      packs[n] = { bytes, meta: recMeta };
      i += len;
      n++;
    }
    setBank({ packs });
    return n - 1;
  }

  function b64ToU8(b64) {
    if (typeof Buffer !== "undefined") return Uint8Array.from(Buffer.from(b64, "base64"));
    const bin = atob(b64);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }

  function inflateRaw(u8) {
    if (typeof require === "function") {
      try {
        const zlib = require("zlib");
        const out = zlib.inflateRawSync(Buffer.from(u8));
        return Promise.resolve(out instanceof Uint8Array ? out : Uint8Array.from(out));
      } catch (e) { /* fall through to browser API */ }
    }
    if (typeof DecompressionStream === "undefined") return Promise.reject(new Error("no inflate"));
    const ds = new DecompressionStream("deflate-raw");
    return new Response(new Blob([u8]).stream().pipeThrough(ds)).arrayBuffer().then((b) => new Uint8Array(b));
  }

  function loadBankB64(b64, meta) {
    if (!b64) return Promise.resolve(0);
    return inflateRaw(b64ToU8(b64)).then((raw) => installBankFromRaw(raw, meta));
  }

  function fromBank(n) {
    const src = BANK || root.NIGHT_BANK;
    if (!src || !src.packs) return null;
    const rec = src.packs[n];
    if (!rec) return null;
    const lv = C.unpackLevel(rec.bytes, rec.meta);
    attachWorld(lv, n);
    if (rec.meta) {
      if (rec.meta.diff) lv.diff = rec.meta.diff;
      if (rec.meta.rand != null) lv.rand = rec.meta.rand;
      if (rec.meta.sols != null) lv.sols = rec.meta.sols;
      if (rec.meta.keyCount != null) lv.keyCount = rec.meta.keyCount;
      if (rec.meta.unique != null) lv.unique = rec.meta.unique;
      if (rec.meta.keyUnique != null) lv.keyUnique = rec.meta.keyUnique;
      if (rec.meta.greedyOk != null) lv.greedyOk = rec.meta.greedyOk;
    }
    return lv;
  }

  function generate(n, opts) {
    if (cache[n]) return cache[n];
    const banked = fromBank(n);
    if (banked) { cache[n] = banked; return banked; }
    if (n <= 5 && C.LEVELS[n - 1] && !(opts && opts.forceGen)) {
      const lv = enrich(C.LEVELS[n - 1], n);
      cache[n] = lv;
      return lv;
    }
    const pacing = pacingOf(n);
    const maxTry = (opts && opts.maxTry) || (isBoss(pacing.role) ? 90 : 64);
    let best = null, bestEv = null, bestFit = 1e9;
    const gridOverride = opts && opts.gridOverride;
    for (let a = 0; a < maxTry; a++) {
      let lv = null;
      try { lv = tryOnce(n, a, gridOverride); } catch (e) { continue; }
      if (!lv) continue;
      const ev = evaluate(lv, {
        maxVisits: a < 20 ? 30000 : 80000,
        countVisits: a < 20 ? 40000 : 80000,
        randTrials: 200,
        maxSol: isBoss(pacing.role) ? 8 : 16,
      });
      if (!ev.ok) continue;
      lv.diff = ev.diff;
      lv.rand = ev.rand.rate;
      lv.sols = ev.cnt.count;
      lv.keyCount = ev.cnt.keyCount;
      lv.unique = ev.cnt.unique;
      lv.keyUnique = ev.cnt.keyUnique;
      lv.greedyOk = ev.greedy.ok;
      lv.solPath = ev.sol.path;
      const hard = passesHard(n, ev);
      const fit = Math.abs(ev.diff.score - pacing.target) + (hard ? 0 : 40);
      if (hard && fit < bestFit) { bestFit = fit; best = lv; bestEv = ev; }
      else if (!best && ev.sol.ok) { best = lv; bestEv = ev; bestFit = fit; }
      if (hard && fit <= 8) break;
    }
    if (!best) throw new Error("generate failed " + n);
    if (n > TUTORIAL && bestEv && !passesHard(n, bestEv)) throw new Error("generate failed hard " + n);
    cache[n] = best;
    return best;
  }

  function getLevel(i) {
    const n = i + 1;
    const b = fromBank(n);
    if (b) return b;
    if (i < 5 && C.LEVELS[i]) return enrich(C.LEVELS[i], n);
    return generate(n);
  }

  function introFor(n) { return INTROS.find((x) => x.at === n) || null; }

  const api = {
    INTROS, MECH_META, TUTORIAL, MAX_MENU, colorCountOf,
    hashStr, mulberry32, pacingOf, roleOf, themeFor, chapterOf, chapterName,
    scoreDifficulty, generate, getLevel, introFor, unlockedMechs,
    evaluate, passesHard, isBoss, attachWorld, enrich, setBank, fromBank, installBankFromRaw, loadBankB64,
    tryOnce, assign, buildRecipe, buildGrid, cache,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.NightGen = api;
  if (C) C.getLevel = getLevel;
})(typeof globalThis !== "undefined" ? globalThis : this);
