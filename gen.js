// Procedural level generator + pacing for 夜灯将眠. Depends on NightCore.
(function (root) {
  const C = root.NightCore || (typeof require === "function" ? require("./core.js") : null);
  if (!C) throw new Error("NightCore required");

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

  const CHAPTERS = [
    "江岸灯火", "跨年之前", "修灯夜话", "河岸回声", "深巷再巡",
    "港湾值夜", "高架夜风", "旧城钟声", "园区打烊", "江心沙洲",
    "北站过夜", "山城灯梯", "海滨栈道", "林间小镇", "古城墙根",
    "运河夜泊", "雪后灯笼", "雨巷电器", "工坊夜班", "天台天线",
  ];

  const THEME_POOL = [
    { id: "canal", name: "运河夜泊", water: true, signs: ["运河", "船坞"], sky0: "#10182a", sky1: "#182438", sky2: "#243048", accent: "#7ee7ff", wall: ["#121c28", "#1a2838"], landmark: "bridge", quote: "河面只剩下船灯的倒影。" },
    { id: "clock", name: "钟楼打烊", signs: ["钟楼", "广场"], sky0: "#141028", sky1: "#201838", sky2: "#302448", accent: "#ffd56a", wall: ["#1a1628", "#261e38"], landmark: "clock", quote: "最后一声钟响，广场也暗了。" },
    { id: "station", name: "北站过夜", signs: ["北站", "进站"], sky0: "#0c1420", sky1: "#182030", sky2: "#243040", accent: "#c8e4ff", wall: ["#141c28", "#1c2838"], landmark: "hall", quote: "末班车走了，候车厅睡了。" },
    { id: "temple", name: "山门夜香", signs: ["山门", "禅院"], sky0: "#1c1010", sky1: "#2a1814", sky2: "#3a2018", accent: "#ff9a4a", wall: ["#221818", "#2c2018"], landmark: "temple", quote: "香火歇了，山门也歇了。" },
    { id: "tvtower", name: "电视塔下", signs: ["电视塔", "瞭望"], sky0: "#08141c", sky1: "#102028", sky2: "#183040", accent: "#7ee7ff", wall: ["#0c1c24", "#142830"], landmark: "tower", quote: "塔尖的红点，也终于暗了。" },
    { id: "hotspring", name: "山汤夜雾", water: true, signs: ["温泉", "旅馆"], sky0: "#201018", sky1: "#301820", sky2: "#402028", accent: "#ff8ab8", wall: ["#281818", "#382422"], landmark: "roof", quote: "雾气散尽，汤屋也安静了。" },
    { id: "wharf2", name: "南码头", water: true, signs: ["码头", "吊机"], sky0: "#061820", sky1: "#0c2830", sky2: "#143840", accent: "#7ee7ff", wall: ["#0c2024", "#143038"], landmark: "crane", quote: "吊机停了，岸边只剩潮声。" },
    { id: "oldtown", name: "砖巷夜灯", signs: ["砖巷", "茶馆"], sky0: "#2a0c10", sky1: "#3a1418", sky2: "#5a2018", accent: "#ff9a4a", wall: ["#2a1414", "#3a1c18"], landmark: "lane", quote: "茶馆打烊，青石板也凉了。" },
    { id: "campus2", name: "林荫校道", signs: ["图书馆", "操场"], sky0: "#0c1c14", sky1: "#14281c", sky2: "#1c3828", accent: "#8dffc1", wall: ["#102018", "#183024"], landmark: "hall", quote: "操场的灯，最后也熄了。" },
    { id: "stadium", name: "体育场夜", signs: ["赛场", "看台"], sky0: "#141018", sky1: "#201828", sky2: "#2c2038", accent: "#ffd56a", wall: ["#1a1624", "#261e30"], landmark: "bowl", quote: "看台空了，场地睡了。" },
    { id: "hospital", name: "夜班医院", signs: ["门诊", "急诊"], sky0: "#101820", sky1: "#182430", sky2: "#203040", accent: "#c8e4ff", wall: ["#141c28", "#1c2834"], landmark: "cross", quote: "走廊的灯，一盏盏交了班。" },
    { id: "market2", name: "花市收摊", signs: ["花市", "花店"], sky0: "#1c1020", sky1: "#2a1830", sky2: "#3a2040", accent: "#ff8ab8", wall: ["#221428", "#2e1c34"], landmark: "awning", quote: "花桶收了，棚灯也收了。" },
    { id: "factory2", name: "夜班车间", signs: ["车间", "危险"], sky0: "#0c140c", sky1: "#142014", sky2: "#1c2c18", accent: "#8dffc1", wall: ["#141c14", "#1c2818"], landmark: "stack", quote: "汽笛停了，车间也暗了。" },
    { id: "bridge2", name: "二桥夜航", water: true, signs: ["二桥", "通航"], sky0: "#0c1420", sky1: "#182838", sky2: "#203040", accent: "#7ee7ff", wall: ["#141c28", "#1c2838"], landmark: "bridge", quote: "桥灯灭尽，江面只剩下星。" },
    { id: "airport2", name: "廊桥过夜", signs: ["出发", "到达"], sky0: "#0c1420", sky1: "#142030", sky2: "#1c2c40", accent: "#c8e4ff", wall: ["#141c28", "#1c2838"], landmark: "wing", quote: "廊桥收回，停机坪睡着了。" },
    { id: "ferry", name: "渡口末班", water: true, signs: ["渡口", "售票"], sky0: "#10183a", sky1: "#1c1540", sky2: "#2a1c48", accent: "#ffd56a", wall: ["#1a1630", "#241e38"], landmark: "pier", quote: "末班渡轮走了，渡口也暗了。" },
    { id: "museum", name: "博物院夜", signs: ["展厅", "门票"], sky0: "#14101c", sky1: "#201828", sky2: "#2c2038", accent: "#c9a6ff", wall: ["#1a1624", "#261e30"], landmark: "hall", quote: "展柜暗了，石阶也凉了。" },
    { id: "zoo", name: "园路夜灯", signs: ["园门", "熊猫"], sky0: "#0c1c14", sky1: "#14281c", sky2: "#1c3424", accent: "#8dffc1", wall: ["#102018", "#183024"], landmark: "gate", quote: "动物睡了，园路的灯也歇了。" },
    { id: "ski", name: "雪场夜灯", signs: ["雪道", "缆车"], sky0: "#101828", sky1: "#182438", sky2: "#243048", accent: "#c8e4ff", wall: ["#141c28", "#1c2838"], landmark: "peak", quote: "缆车停了，雪道只剩月光。" },
    { id: "bookstore", name: "书店街灯", signs: ["书店", "咖啡"], sky0: "#1a1014", sky1: "#281820", sky2: "#382428", accent: "#ffd56a", wall: ["#221418", "#2c1c20"], landmark: "lane", quote: "橱窗关了，街角也静了。" },
    { id: "techpark", name: "园区加班", signs: ["园区", "大厦"], sky0: "#08141c", sky1: "#102028", sky2: "#183038", accent: "#7ee7ff", wall: ["#0c1c24", "#142830"], landmark: "tower", quote: "最后一栋楼也交了班。" },
    { id: "residence", name: "小区夜灯", signs: ["小区", "物业"], sky0: "#14101c", sky1: "#1c1828", sky2: "#282030", accent: "#ffd56a", wall: ["#1a1624", "#241e2c"], landmark: "blocks", quote: "楼道的灯，一盏盏睡了。" },
    { id: "highway", name: "服务区夜", signs: ["服务区", "加油"], sky0: "#101418", sky1: "#1a2028", sky2: "#242c34", accent: "#ff9a4a", wall: ["#161c22", "#202830"], landmark: "canopy", quote: "加油灯灭了，高速只剩车灯。" },
    { id: "subway", name: "地铁出口", signs: ["地铁", "出站"], sky0: "#0c1018", sky1: "#161c28", sky2: "#202430", accent: "#7ee7ff", wall: ["#121820", "#1a2430"], landmark: "gate", quote: "出站口的灯，也跟着末班关了。" },
    { id: "observatory", name: "天文台夜", signs: ["天文台", "圆顶"], sky0: "#080c18", sky1: "#101428", sky2: "#181c38", accent: "#c9a6ff", wall: ["#101428", "#181c34"], landmark: "dome", quote: "圆顶合上，把天空还给星星。" },
    { id: "lighthouse", name: "灯塔守夜", water: true, signs: ["灯塔", "航道"], sky0: "#06141c", sky1: "#0c2028", sky2: "#142c38", accent: "#ffd56a", wall: ["#0c1c24", "#142830"], landmark: "lighthouse", quote: "灯塔也歇一晚，把海交给月亮。" },
    { id: "pagoda", name: "古塔夜影", signs: ["古塔", "禅院"], sky0: "#1a1014", sky1: "#281818", sky2: "#38201c", accent: "#ff9a4a", wall: ["#221416", "#2c1c1a"], landmark: "pagoda", quote: "塔檐的铃，也不再响了。" },
    { id: "expo", name: "会展收灯", signs: ["会展", "展馆"], sky0: "#10141c", sky1: "#1a2030", sky2: "#242c40", accent: "#7ee7ff", wall: ["#141c28", "#1c2838"], landmark: "hall", quote: "展馆的灯，一批批暗下去。" },
    { id: "music", name: "音乐厅后", signs: ["音乐厅", "演出"], sky0: "#140c18", sky1: "#241428", sky2: "#341c38", accent: "#c9a6ff", wall: ["#1c1424", "#2a1c30"], landmark: "hall", quote: "谢幕之后，大厅也睡了。" },
    { id: "garden", name: "园林夜游", signs: ["园林", "亭台"], sky0: "#0c1814", sky1: "#14241c", sky2: "#1c3028", accent: "#8dffc1", wall: ["#102018", "#183024"], landmark: "pavilion", quote: "亭里的灯灭了，湖面只剩月。" },
  ];

  const SUFFIX = ["", "·又一夜", "·深秋", "·入冬", "·春雨后", "·夏末"];

  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < String(s).length; i++) h = Math.imul(h ^ String(s).charCodeAt(i), 16777619);
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function irand(rng, a, b) { return a + ((rng() * (b - a + 1)) | 0); }
  function pick(rng, arr) { return arr[(rng() * arr.length) | 0]; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function chapterOf(n) { return Math.ceil(n / 10); }
  function chapterName(n) { return CHAPTERS[(chapterOf(n) - 1) % CHAPTERS.length] + (chapterOf(n) > CHAPTERS.length ? "·" + Math.ceil(chapterOf(n) / CHAPTERS.length) : ""); }

  function roleOf(n) {
    const m = n % 10;
    if (m === 0) return "boss";
    if (n > 1 && (m === 1 || m === 2)) return "relax";
    if (m === 5) return "pit";
    const intro = INTROS.find((x) => x.at === n);
    if (intro) return "teach";
    return "normal";
  }

  function unlockedMechs(n) {
    const out = [];
    for (const it of INTROS) if (n >= it.at) out.push(it.id);
    return out;
  }

  function pickMechs(n, role, rng) {
    const unlocked = unlockedMechs(n);
    if (n <= 20) return []; // hand levels
    if (role === "teach") return [];
    const comboCap = clamp(1 + Math.floor((n - 20) / 20), 1, 3);
    let k = 1;
    if (role === "relax") k = 1;
    else if (role === "pit") k = Math.min(2, Math.max(1, comboCap));
    else if (role === "boss") k = Math.min(unlocked.length, Math.max(2, comboCap));
    else k = (n % 3 === 0 && comboCap > 1) ? Math.min(2, comboCap) : 1;
    if (n < 30 && role !== "boss") k = 1;
    const pool = unlocked.slice();
    const chosen = [];
    // cycle the primary mechanic by level so we don't keep drawing the same one
    if (pool.length) {
      const primary = pool[(n * 3 + Math.floor(n / 7)) % pool.length];
      chosen.push(primary);
      pool.splice(pool.indexOf(primary), 1);
    }
    while (chosen.length < k && pool.length) {
      const i = (rng() * pool.length) | 0;
      chosen.push(pool.splice(i, 1)[0]);
    }
    return chosen;
  }

  function baseScore(n) {
    return clamp(18 + Math.sqrt(n) * 3.15, 14, 72);
  }

  function pacingOf(n) {
    const role = roleOf(n);
    const base = baseScore(n);
    let target = base;
    if (role === "boss") target = base + 14;
    else if (role === "pit") target = base + 7;
    else if (role === "relax") target = Math.max(16, base - 10);
    else if (role === "teach") target = Math.max(14, base - 8);
    target = clamp(target, 12, 86);
    const colors = n <= 8 ? 3 : n <= 20 ? 4 : clamp(3 + Math.floor(n / 40), 3, 6);
    const bury = role === "boss" ? 2 : role === "pit" ? 2 : role === "relax" || role === "teach" ? 0 : (n > 40 ? 1 : 0);
    return {
      n, role, target,
      lo: target - 12,
      hi: target + 12,
      colors,
      bury,
      blds: role === "boss" ? 4 : role === "relax" ? 3 : 3 + (n > 50 ? 1 : 0),
      W: role === "boss" ? 18 : 16 + (n > 80 ? 1 : 0),
      H: role === "boss" ? 12 : 11,
    };
  }

  function themeFor(n) {
    const base = THEME_POOL[(n - 1) % THEME_POOL.length];
    const cycle = Math.floor((n - 1) / THEME_POOL.length);
    const suffix = SUFFIX[cycle % SUFFIX.length];
    const name = (n % 10 === 0 ? "地标·" : "") + base.name + suffix;
    return { ...base, name, landmark: n % 10 === 0, landmarkType: base.landmark, quote: base.quote };
  }

  function replayPeakAndThink(level, path, slotCount) {
    let grid = C.cloneGrid(level.grid);
    let cols = C.cloneCols(level.cols);
    let slots = Array(slotCount).fill(null);
    let unlocked = { ...(level.unlocked || {}) };
    let takes = 0;
    let peak = 0;
    let think = 0;
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

  function scoreDifficulty(level, sol, greedy, left) {
    const slotCount = 5;
    const rt = sol && sol.ok ? replayPeakAndThink(level, sol.path, slotCount) : { peak: 0, think: 0 };
    const colors = new Set();
    if (level.grid) {
      for (const row of level.grid) for (const c of row) if (c && (c.on || c.dormant)) colors.add(c.c);
    }
    const mechs = (level.mechs && level.mechs.length) ? level.mechs.length : (level.mechanic ? 1 : 0);
    let s = 0;
    if (greedy && !greedy.ok) s += 24;
    if (left && !left.ok) s += 12;
    s += clamp(rt.think * 5, 0, 20);
    s += clamp(Math.log10((sol && sol.visits) || 1) * 8, 0, 16);
    s += clamp((rt.peak - 2) * 5, 0, 14);
    s += (colors.size - 3) * 3;
    s += mechs * 4;
    if (level.pacing && level.pacing.bury) s += level.pacing.bury * 3;
    return { score: clamp(Math.round(s), 0, 100), peak: rt.peak, think: rt.think, visits: sol ? sol.visits : 0, greedyOk: !!(greedy && greedy.ok), leftOk: !!(left && left.ok) };
  }

  function recItem(item) { return typeof item === "number" ? { c: item } : item; }

  function assign(level, recipe, hiddenSet) {
    hiddenSet = hiddenSet || new Set();
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
      const base = Math.floor(total / k);
      let rem = total - base * k;
      for (let i = 0; i < k; i++) { piles[c].push(base + (rem > 0 ? 1 : 0)); if (rem > 0) rem--; }
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

  function findCell(g, pred) {
    for (let y = 0; y < g.length; y++)
      for (let x = 0; x < g[0].length; x++)
        if (g[y][x] && pred(g[y][x], x, y)) return [x, y];
    return null;
  }

  function buildGrid(rng, pacing, mechs) {
    const W = pacing.W, H = pacing.H;
    const g = C.emptyGrid(W, H);
    const nB = clamp(pacing.blds, 3, 5);
    const colors = [];
    for (let i = 0; i < pacing.colors; i++) colors.push(i % 6);
    // place buildings
    const blds = [];
    let x = 0;
    const remain = nB;
    for (let i = 0; i < remain; i++) {
      const left = W - x;
      const slotsLeft = remain - i;
      const maxW = Math.max(2, Math.floor((left - (slotsLeft - 1)) / slotsLeft) + 1);
      const bw = clamp(irand(rng, 3, Math.min(7, maxW)), 2, left - (slotsLeft - 1));
      const bh = irand(rng, Math.max(5, H - 6), H - 1);
      const y = H - bh;
      const border = colors[i % colors.length];
      const fill = colors[(i + 1 + ((rng() * 2) | 0)) % colors.length];
      C.stampBuilding(g, x, y, bw, bh, { border, fill });
      blds.push({ x, y, w: bw, h: bh, border, fill });
      x += bw + 1;
      if (x >= W - 1) break;
    }
    if (!blds.length) throw new Error("no buildings");

    const used = mechs.slice();
    // apply spatial mechanics
    const leftB = blds[0];
    const midB = blds[Math.floor(blds.length / 2)] || blds[0];
    const rightB = blds[blds.length - 1];

    if (used.includes("lock") && blds.length >= 2) {
      const id = "L" + pacing.n;
      for (let yy = rightB.y; yy < rightB.y + rightB.h; yy++)
        for (let xx = rightB.x; xx < rightB.x + rightB.w; xx++)
          if (g[yy][xx]) { g[yy][xx].lock = id; g[yy][xx].kind = g[yy][xx].kind || "zone"; }
      const kx = leftB.x + (leftB.w >> 1);
      const ky = leftB.y;
      if (g[ky][kx]) { g[ky][kx].key = id; g[ky][kx].kind = "key"; g[ky][kx].c = leftB.border; }
    }

    if (used.includes("shutter")) {
      const id = "S" + pacing.n;
      const b = midB;
      const y0 = b.y + Math.max(2, (b.h * 0.35) | 0);
      const y1 = Math.min(b.y + b.h - 2, y0 + Math.max(2, (b.h * 0.35) | 0));
      for (let yy = y0; yy < y1; yy++)
        for (let xx = b.x; xx < b.x + b.w; xx++)
          if (g[yy][xx]) { g[yy][xx].lock = id; g[yy][xx].kind = "shutter"; }
      // button on leftmost building, not overlapping existing key if possible
      const bx = leftB.x + 1;
      const by = Math.min(H - 2, leftB.y + leftB.h - 2);
      if (g[by][bx]) { g[by][bx].key = id; g[by][bx].kind = "button"; }
    }

    if (used.includes("breaker") && blds.length >= 2) {
      const id = "B" + pacing.n;
      const b = rightB;
      for (let yy = b.y; yy < b.y + b.h; yy++)
        for (let xx = b.x; xx < b.x + b.w; xx++)
          if (g[yy][xx]) { g[yy][xx].lock = id; g[yy][xx].kind = "zone"; }
      const bx = leftB.x;
      const by = leftB.y;
      if (g[by][bx]) { g[by][bx].key = id; g[by][bx].kind = "breaker"; }
    }

    if (used.includes("awaken")) {
      const b = midB;
      const cells = [];
      const ix0 = b.x + 1, ix1 = b.x + b.w - 1;
      const iy0 = b.y + 2, iy1 = b.y + b.h - 1;
      for (let yy = iy0; yy < iy1; yy++)
        for (let xx = ix0; xx < ix1; xx++)
          if (g[yy][xx] && !g[yy][xx].lock) {
            g[yy][xx].on = false;
            g[yy][xx].dormant = true;
            g[yy][xx].kind = "screen";
            cells.push([xx, yy]);
          }
      if (cells.length) {
        const sx = leftB.x + (leftB.w >> 1);
        const sy = Math.min(H - 1, leftB.y + 1);
        if (g[sy][sx]) { g[sy][sx].awaken = cells; g[sy][sx].kind = g[sy][sx].kind || "switch"; }
        else if (g[leftB.y][leftB.x]) { g[leftB.y][leftB.x].awaken = cells; g[leftB.y][leftB.x].kind = "switch"; }
      }
    }

    if (used.includes("blink")) {
      const b = (used.includes("lock") || used.includes("breaker")) ? midB : rightB;
      for (let xx = b.x; xx < b.x + b.w; xx++) {
        if (g[b.y] && g[b.y][xx]) { g[b.y][xx].blink = true; g[b.y][xx].kind = g[b.y][xx].kind || "lantern"; }
        if (b.h > 3 && g[b.y + 1] && g[b.y + 1][xx] && rng() > 0.35) {
          g[b.y + 1][xx].blink = true;
          g[b.y + 1][xx].kind = g[b.y + 1][xx].kind || "lantern";
        }
      }
    }

    return { grid: g, W, H };
  }

  function gateColors(grid) {
    const set = new Set();
    for (const row of grid) for (const c of row) {
      if (c && (c.key || (c.awaken && c.awaken.length))) set.add(c.c);
    }
    return [...set];
  }

  function buildRecipe(rng, level, pacing, mechs) {
    const { n } = C.countNeed(level.grid);
    const colors = Object.keys(n).map(Number).sort((a, b) => a - b);
    if (!colors.length) throw new Error("no colors");
    const gates = gateColors(level.grid);
    const duoColor = mechs.includes("duo") ? colors[colors.length - 1] : null;
    const hide = mechs.includes("hidden");

    // tickets per color
    const parts = {};
    for (const c of colors) {
      const total = n[c];
      let k = 2;
      if (total >= 28) k = 3;
      if (total >= 50) k = 4;
      if (pacing.role === "relax") k = Math.min(k, 2);
      if (duoColor === c) k = Math.max(2, Math.min(k, 2));
      if (k > total) k = Math.max(1, total);
      parts[c] = k;
    }

    // flatten tickets then deal into 4 columns
    let tickets = [];
    for (const c of colors) {
      for (let i = 0; i < parts[c]; i++) {
        const t = { c };
        if (duoColor === c) t.duo = true;
        tickets.push(t);
      }
    }
    // bury gate colors: move them to the end of the list so they land deeper
    if (pacing.bury > 0 && gates.length) {
      const gset = new Set(gates);
      const buried = [];
      const rest = [];
      for (const t of tickets) {
        if (gset.has(t.c) && buried.filter((x) => x.c === t.c).length < pacing.bury) buried.push(t);
        else rest.push(t);
      }
      tickets = rest.concat(buried);
    } else if (pacing.role === "relax" || pacing.role === "teach") {
      // put gates first (fronts)
      const gset = new Set(gates);
      tickets.sort((a, b) => (gset.has(b.c) ? 1 : 0) - (gset.has(a.c) ? 1 : 0));
    }

    // deal into 4 columns, roughly even, bury at end of last columns
    const cols = [[], [], [], []];
    tickets.forEach((t, i) => cols[i % 4].push(t));
    // for bury, rotate last gate ticket to the end of column 3
    if (pacing.bury > 0 && gates.length) {
      for (let ci = 0; ci < 4; ci++) {
        const idx = cols[ci].findIndex((t) => gates.includes(t.c));
        if (idx >= 0 && idx < cols[ci].length - 1 && ci === 3) {
          const [g] = cols[ci].splice(idx, 1);
          cols[ci].push(g);
        }
      }
    }

    const hiddenSet = new Set();
    if (hide) {
      // hide some backs and maybe one non-front if enough tickets
      for (let ci = 0; ci < 4; ci++) {
        for (let ri = 1; ri < cols[ci].length; ri++) {
          if (rng() < 0.55) hiddenSet.add(ci + ":" + ri);
        }
      }
      if (pacing.role === "boss" || pacing.role === "pit") hiddenSet.add("3:0");
    }
    return { recipe: cols, hiddenSet };
  }

  function tryOnce(n, attempt) {
    const pacing = pacingOf(n);
    const rng = mulberry32(hashStr("nl:" + n + ":" + attempt));
    const mechs = pickMechs(n, pacing.role, rng);
    const th = themeFor(n);
    const built = buildGrid(rng, pacing, mechs);
    const lv = {
      id: "gen-" + n,
      name: th.name,
      hint: hintFor(mechs, pacing.role),
      tier: pacing.role === "boss" ? "超难" : pacing.role === "pit" ? "困难" : pacing.role === "relax" ? "普通" : "普通",
      W: built.W,
      H: built.H,
      grid: built.grid,
      cols: null,
      unlocked: {},
      coach: false,
      mechanic: mechs.join("+") || null,
      mechs,
      theme: th.id,
      water: !!th.water,
      quote: th.quote,
      chapter: chapterOf(n),
      chapterName: chapterName(n),
      landmark: n % 10 === 0,
      landmarkType: th.landmarkType,
      n,
      generated: true,
      pacing,
      themeDef: th,
    };
    const { recipe, hiddenSet } = buildRecipe(rng, lv, pacing, mechs);
    assign(lv, recipe, hiddenSet);
    if (!C.ticketSumsOk(lv).ok) return null;
    return lv;
  }

  function hintFor(mechs, role) {
    if (!mechs.length) return "先看哪些灯已经贴着夜空。";
    const bits = mechs.map((m) => (MECH_META[m] && MECH_META[m].label) || m);
    if (role === "boss") return "今晚机关叠在一起：" + bits.join("、") + "。先看标记再下手。";
    return "今晚要注意：" + bits.join("、") + "。";
  }

  const cache = {};

  function generate(n) {
    if (n <= 20 && C.LEVELS[n - 1]) return enrich(C.LEVELS[n - 1], n);
    if (cache[n]) return cache[n];
    let best = null;
    let bestSol = null;
    const pacing = pacingOf(n);
    const maxTry = 28;
    for (let a = 0; a < maxTry; a++) {
      let lv = null;
      try { lv = tryOnce(n, a); } catch (e) { continue; }
      if (!lv) continue;
      const sol = C.solve(lv, 5, { maxVisits: a < 18 ? 25000 : 80000 });
      if (!sol.ok) continue;
      const greedy = C.greedySolve(lv, 5);
      const left = C.leftmostSolve(lv, 5);
      const sc = scoreDifficulty(lv, sol, greedy, left);
      lv.diff = sc;
      lv.solPath = sol.path;
      // prefer in-band; accept first solvable if tight
      const inBand = sc.score >= pacing.lo && sc.score <= pacing.hi;
      const roleFit =
        (pacing.role === "boss" || pacing.role === "pit") ? (!greedy.ok || !left.ok || sc.think >= 1) :
        (pacing.role === "relax" || pacing.role === "teach") ? (greedy.ok || sc.score <= pacing.hi) :
        true;
      if (inBand && roleFit) {
        cache[n] = lv;
        return lv;
      }
      if (!best || Math.abs(sc.score - pacing.target) < Math.abs(best.diff.score - pacing.target)) {
        best = lv; bestSol = sol;
      }
    }
    if (best) { cache[n] = best; return best; }
    // last resort: simpler layout, must be solvable
    for (let a = 100; a < 140; a++) {
      const p2 = { ...pacing, bury: 0, role: "relax" };
      let lv = null;
      try {
        const rng = mulberry32(hashStr("nl-fb:" + n + ":" + a));
        const mechs = pickMechs(n, "relax", rng).slice(0, 1);
        const th = themeFor(n);
        const built = buildGrid(rng, p2, mechs);
        lv = {
          id: "gen-" + n, name: th.name, hint: hintFor(mechs, "relax"),
          tier: "普通", W: built.W, H: built.H, grid: built.grid, cols: null,
          unlocked: {}, mechanic: mechs.join("+") || null, mechs, theme: th.id,
          water: !!th.water, quote: th.quote, chapter: chapterOf(n),
          chapterName: chapterName(n), landmark: n % 10 === 0,
          landmarkType: th.landmarkType, n, generated: true, pacing: p2, themeDef: th,
        };
        const rec = buildRecipe(rng, lv, p2, mechs);
        assign(lv, rec.recipe, rec.hiddenSet);
      } catch (e) { continue; }
      const sol = C.solve(lv, 5, { maxVisits: 80000 });
      if (!sol.ok) continue;
      const greedy = C.greedySolve(lv, 5);
      const left = C.leftmostSolve(lv, 5);
      lv.diff = scoreDifficulty(lv, sol, greedy, left);
      lv.solPath = sol.path;
      cache[n] = lv;
      return lv;
    }
    throw new Error("failed to generate solvable level " + n);
  }

  function enrich(L, n) {
    const th = themeFor(n);
    if (L._enriched) return L;
    L.n = n;
    L.chapter = chapterOf(n);
    L.chapterName = chapterName(n);
    L.landmark = n % 10 === 0;
    const HAND_TYPES = {
      river: "pier", neon: "lane", twins: "tower", mist: "awning", lock: "roof",
      nightmarket: "lane", port: "crane", overpass: "bridge", campus: "hall",
      fishery: "crane", mall: "awning", cinema: "hall", onsen: "roof", park: "wheel",
      plant: "stack", bridge: "bridge", festival: "lantern", airport: "wing",
      satellite: "blocks", newyear: "tower",
    };
    if (!L.landmarkType) L.landmarkType = HAND_TYPES[L.theme] || (L.landmark ? "tower" : null);
    if (!L.mechs) L.mechs = L.mechanic ? String(L.mechanic).split("+") : [];
    if (!L.themeDef) L.themeDef = null;
    L._enriched = true;
    return L;
  }

  function getLevel(i) {
    const n = i + 1;
    if (i < C.LEVELS.length) return enrich(C.LEVELS[i], n);
    return generate(n);
  }

  function introFor(n) { return INTROS.find((x) => x.at === n) || null; }

  const api = {
    INTROS, MECH_META, THEME_POOL, CHAPTERS,
    hashStr, pacingOf, roleOf, themeFor, chapterOf, chapterName,
    scoreDifficulty, generate, getLevel, introFor, unlockedMechs,
    cache,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.NightGen = api;
  if (C) C.getLevel = getLevel;
})(typeof globalThis !== "undefined" ? globalThis : this);
