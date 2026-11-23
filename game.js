/* 夜灯将眠 — game shell. Depends on NightCore. */
(function () {
  const C = window.NightCore;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

  const SLOT_N = 5;
  const SAVE_KEY = "nightlights-save-v1";

  let screen = "menu";
  let li = 0;
  let LV = null;
  let grid = null;
  let cols = null;
  let slots = [];
  let unlocked = {};
  let slotCount = SLOT_N;
  let over = false;
  let won = false;
  let paused = false;
  let speed = 1;
  let muted = false;
  let history = [];
  let usedRewind = false;
  let usedAd = false;
  let workers = [];
  let parts = [];
  let afterglow = [];
  let lah = [];
  let meteors = [];
  let stars = [];
  let toastT = 0;
  let toastMsg = "";
  let coach = null;
  let playTime = 0;
  let startTotal = 0;
  let geo = null;
  let acc = 0;
  let lastT = 0;
  let solutions = [];
  let adFor = null;
  let adLeft = 0;
  let winTimer = 0;
  let takes = 0;
  let shakeT = 0;
  let glowDirty = true;
  let lightSig = "";
  let decor = null;
  let titleClicks = [];
  let cars = [];

  const board = $("#board");
  const ctx = board.getContext("2d");

  const THEMES = {
    river:       { sky0:"#10183a", sky1:"#1c1540", sky2:"#2a1c48", fog:"rgba(200,150,90,0.20)", water:"#101c32", waterHi:"#3a6a9a", moon:"warm", signs:["江岸","渡口"], accent:"#ffd56a", wall:["#1a1630","#241e38"] },
    neon:        { sky0:"#1a0530", sky1:"#2a0a48", sky2:"#4a1860", fog:"rgba(255,80,160,0.18)", signs:["夜市","KTV","酒吧"], accent:"#ff5e9a", wall:["#1c1028","#2a1438"] },
    twins:       { sky0:"#0c1428", sky1:"#182038", sky2:"#243048", fog:"rgba(80,120,180,0.16)", signs:["环球","金融"], accent:"#7ee7ff", wall:["#121826","#1a2434"] },
    mist:        { sky0:"#161028", sky1:"#241838", sky2:"#3a2450", fog:"rgba(180,160,220,0.28)", signs:["橱窗","时装"], accent:"#c9a6ff", wall:["#1a1428","#261c38"] },
    lock:        { sky0:"#140c28", sky1:"#241430", sky2:"#3a2040", fog:"rgba(200,160,80,0.16)", signs:["顶楼","会所"], accent:"#ffd56a", wall:["#1a1428","#281c30"] },
    nightmarket: { sky0:"#2a0c10", sky1:"#3a1418", sky2:"#5a2018", fog:"rgba(255,120,40,0.22)", signs:["夜市","小吃","灯笼"], accent:"#ff9a4a", wall:["#2a1414","#3a1c18"] },
    port:        { sky0:"#061820", sky1:"#0c2830", sky2:"#143840", fog:"rgba(40,180,160,0.16)", water:"#0a2030", waterHi:"#1a6070", signs:["码头","仓储"], accent:"#7ee7ff", wall:["#0c2024","#143038"] },
    overpass:    { sky0:"#101820", sky1:"#1a2830", sky2:"#243038", fog:"rgba(120,150,180,0.22)", signs:["天桥","的士"], accent:"#8aa0b8", wall:["#161c24","#222830"] },
    campus:      { sky0:"#0c1c14", sky1:"#14281c", sky2:"#1c3828", fog:"rgba(80,180,120,0.14)", signs:["图书馆","食堂"], accent:"#8dffc1", wall:["#102018","#183024"] },
    fishery:     { sky0:"#1a1010", sky1:"#2a1814", sky2:"#3a2018", fog:"rgba(255,160,60,0.18)", water:"#141820", waterHi:"#3a4030", signs:["渔市","冰鲜"], accent:"#ff9a4a", wall:["#221818","#2c2018"] },
    mall:        { sky0:"#180818", sky1:"#2a1028", sky2:"#401848", fog:"rgba(255,100,180,0.16)", signs:["百货","超市","药店"], accent:"#ff8ab8", wall:["#201020","#301830"] },
    cinema:      { sky0:"#140808", sky1:"#280c10", sky2:"#3a1018", fog:"rgba(180,40,60,0.20)", signs:["影城","IMAX"], accent:"#ff6b8a", wall:["#1c1010","#2a1414"] },
    onsen:       { sky0:"#201018", sky1:"#301820", sky2:"#402028", fog:"rgba(255,180,180,0.22)", water:"#201820", waterHi:"#604050", signs:["温泉","旅馆"], accent:"#ff8ab8", wall:["#281818","#382422"] },
    park:        { sky0:"#180830", sky1:"#2a1048", sky2:"#4a1860", fog:"rgba(255,80,200,0.18)", signs:["乐园","摩天轮"], accent:"#ff8ab8", wall:["#201030","#301848"] },
    plant:       { sky0:"#0c140c", sky1:"#142014", sky2:"#1c2c18", fog:"rgba(80,160,80,0.14)", signs:["危险","高压"], accent:"#8dffc1", wall:["#141c14","#1c2818"] },
    bridge:      { sky0:"#0c1420", sky1:"#182838", sky2:"#203040", fog:"rgba(80,140,200,0.16)", water:"#0c1828", waterHi:"#2a5080", signs:["大桥"], accent:"#7ee7ff", wall:["#141c28","#1c2838"] },
    festival:    { sky0:"#280c0c", sky1:"#3a1410", sky2:"#5a2010", fog:"rgba(255,140,40,0.22)", signs:["庙会","灯会"], accent:"#ff9a4a", wall:["#2a1410","#3a1c14"] },
    airport:     { sky0:"#0c1420", sky1:"#142030", sky2:"#1c2c40", fog:"rgba(160,200,255,0.14)", signs:["出发","到达"], accent:"#c8e4ff", wall:["#141c28","#1c2838"] },
    satellite:   { sky0:"#08141c", sky1:"#102028", sky2:"#183040", fog:"rgba(60,200,200,0.14)", signs:["卫星城","新区"], accent:"#7ee7ff", wall:["#0c1c24","#142830"] },
    newyear:     { sky0:"#14081c", sky1:"#281030", sky2:"#4a1848", fog:"rgba(255,200,80,0.20)", signs:["跨年","倒计时"], accent:"#ffd56a", wall:["#1c1028","#2c1838"] },
  };
  function themeOf(L) { return THEMES[(L && (L.theme || L.id)) || "river"] || THEMES.river; }

  /* ---------- save ---------- */
  function loadSave() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
      if (s && s.v === 1 && s.stars) return { v: 1, stars: s.stars, unlocked: s.unlocked || 1, all: !!s.all };
    } catch (e) {}
    return { v: 1, stars: {}, unlocked: 1, all: false };
  }
  let save = loadSave();
  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {}
  }
  function isOpenLevel(i) {
    return save.all || i < save.unlocked || save.stars[i] != null;
  }

  /* ---------- audio ---------- */
  let AC = null;
  function ac() {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === "suspended") AC.resume();
    return AC;
  }
  function beep(freq, dur, type, vol, delay, slide) {
    if (muted) return;
    try {
      const a = ac();
      const t0 = a.currentTime + (delay || 0);
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = type || "square";
      o.frequency.setValueAtTime(freq, t0);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.06, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g);
      g.connect(a.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    } catch (e) {}
  }
  function noise(dur, vol, delay) {
    if (muted) return;
    try {
      const a = ac();
      const t0 = a.currentTime + (delay || 0);
      const n = a.sampleRate * dur;
      const buf = a.createBuffer(1, n, a.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const s = a.createBufferSource();
      s.buffer = buf;
      const g = a.createGain();
      const f = a.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = 1800;
      g.gain.setValueAtTime(vol || 0.04, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      s.connect(f);
      f.connect(g);
      g.connect(a.destination);
      s.start(t0);
      s.stop(t0 + dur + 0.02);
    } catch (e) {}
  }
  const SFX = {
    tap: () => beep(720, 0.05, "triangle", 0.05),
    seat: () => { beep(660, 0.06, "triangle", 0.05); beep(880, 0.08, "triangle", 0.04, 0.06); },
    spark: () => { noise(0.07, 0.05); beep(1400, 0.05, "square", 0.03); },
    off: () => beep(520, 0.09, "sine", 0.04, 0, 180),
    pop: () => { beep(990, 0.08, "sine", 0.04); beep(1320, 0.1, "sine", 0.035, 0.06); },
    wait: () => beep(180, 0.12, "square", 0.04),
    lose: () => { beep(220, 0.25, "triangle", 0.06, 0, 90); beep(140, 0.35, "triangle", 0.05, 0.12, 70); },
    win: () => { [523, 659, 784, 1046].forEach((f, i) => beep(f, 0.28, "sine", 0.05, i * 0.14)); },
    unlock: () => { beep(880, 0.1, "triangle", 0.05); beep(1320, 0.16, "triangle", 0.05, 0.08); },
    toast: () => beep(400, 0.08, "square", 0.03),
    awaken: () => { beep(440, 0.1, "sine", 0.04); beep(880, 0.16, "sine", 0.05, 0.08); beep(1320, 0.2, "sine", 0.04, 0.16); },
  };

  /* ---------- helpers ---------- */
  function hash(n) {
    n = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
    return (n ^ (n >>> 13)) >>> 0;
  }
  function rnd(seed) {
    return function () {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }
  function seedOf(s) {
    let n = 2166136261;
    for (let i = 0; i < s.length; i++) n = Math.imul(n ^ s.charCodeAt(i), 16777619);
    return n >>> 0;
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hexA(h, a) {
    const n = (h || "#ffffff").replace("#", "");
    const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  function lerpC(a, b, t) {
    const P = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const A = P(a), B = P(b);
    return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(",")})`;
  }
  function roundRect(c, x, y, w, h, r) {
    const rr = Math.max(0, Math.min(r, w / 2, h / 2));
    c.beginPath();
    c.moveTo(x + rr, y);
    c.arcTo(x + w, y, x + w, y + h, rr);
    c.arcTo(x + w, y + h, x, y + h, rr);
    c.arcTo(x, y + h, x, y, rr);
    c.arcTo(x, y, x + w, y, rr);
    c.closePath();
  }

  /* ---------- glow sprites (no per-frame shadowBlur) ---------- */
  const glowSprites = [];
  function makeGlows() {
    for (let i = 0; i < C.COLORS.length; i++) {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const x = c.getContext("2d");
      const col = C.COLORS[i].glow;
      const g = x.createRadialGradient(32, 32, 2, 32, 32, 30);
      g.addColorStop(0, hexA("#fff8e0", 0.95));
      g.addColorStop(0.2, hexA(col, 0.7));
      g.addColorStop(0.55, hexA(col, 0.22));
      g.addColorStop(1, hexA(col, 0));
      x.fillStyle = g;
      x.fillRect(0, 0, 64, 64);
      glowSprites[i] = c;
    }
  }
  makeGlows();

  let bloomCv = document.createElement("canvas");
  let bloomCtx = bloomCv.getContext("2d");
  let skyCv = document.createElement("canvas");
  let skyCtx = skyCv.getContext("2d");
  let skyKey = "";

  /* ---------- stars ---------- */
  function seedStars() {
    stars = Array.from({ length: 90 }, (_, i) => ({
      x: Math.random(),
      y: Math.random() * 0.7,
      r: 0.4 + Math.random() * 1.7,
      p: Math.random() * Math.PI * 2,
      s: 0.5 + Math.random() * 1.8,
      b: 0.35 + Math.random() * 0.65,
    }));
  }

  /* ---------- layout ---------- */
  function resize() {
    const wrap = $("#stage");
    if (!wrap) return;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    board.width = Math.max(1, w * dpr);
    board.height = Math.max(1, h * dpr);
    board.style.width = w + "px";
    board.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout(w, h);
    glowDirty = true;
    skyKey = "";
  }

  function layout(w, h) {
    if (!LV) { geo = { w, h }; return; }
    const slotBand = 70;
    const streetY = h - slotBand;
    const sky = Math.max(96, h * 0.22);
    const cityH = Math.max(80, streetY - sky - 8);
    const cs = Math.max(9, Math.min((w - 12) / LV.W, cityH / LV.H));
    const ox = (w - cs * LV.W) / 2;
    const oy = streetY - 8 - cs * LV.H;
    geo = { w, h, cs, ox, oy, sky, street: slotBand, streetY };
  }

  function cellXY(x, y) {
    return { x: geo.ox + (x + 0.5) * geo.cs, y: geo.oy + (y + 0.5) * geo.cs };
  }
  function slotPt(i) {
    const el = $$("#slots .slot")[i];
    if (!el || !geo) return { x: geo.w * (i + 0.5) / slotCount, y: geo.h - 8 };
    const r = el.getBoundingClientRect();
    const b = board.getBoundingClientRect();
    return { x: r.left + r.width / 2 - b.left, y: r.top - b.top + 6 };
  }

  /* ---------- decor ---------- */
  function buildDecor(L) {
    const r = rnd(seedOf(L.id + ":" + L.name));
    const th = themeOf(L);
    // connected buildings
    const seen = Array.from({ length: L.H }, () => Array(L.W).fill(false));
    const blds = [];
    const inb = (x, y) => y >= 0 && y < L.H && x >= 0 && x < L.W && L.grid[y][x];
    for (let y = 0; y < L.H; y++) {
      for (let x = 0; x < L.W; x++) {
        if (!inb(x, y) || seen[y][x]) continue;
        const cells = [];
        const q = [[x, y]];
        seen[y][x] = true;
        let x0 = x, y0 = y, x1 = x, y1 = y;
        while (q.length) {
          const [cx, cy] = q.pop();
          cells.push([cx, cy]);
          x0 = Math.min(x0, cx); y0 = Math.min(y0, cy);
          x1 = Math.max(x1, cx); y1 = Math.max(y1, cy);
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = cx + dx, ny = cy + dy;
            if (inb(nx, ny) && !seen[ny][nx]) { seen[ny][nx] = true; q.push([nx, ny]); }
          }
        }
        const wall = th.wall[(blds.length) % th.wall.length];
        blds.push({
          cells, x0, y0, x1, y1,
          wall, wall2: lerpC(wall, "#000000", 0.25),
          roof: (r() * 5) | 0,
          tower: r() > 0.55,
          antenna: r() > 0.4,
          ac: 1 + ((r() * 3) | 0),
          sign: th.signs[blds.length % th.signs.length],
          signY: y0 + 1 + ((r() * Math.max(1, (y1 - y0 - 2))) | 0),
          pipe: r() > 0.35,
        });
      }
    }
    function makeSky(count, hMin, hMax, dark, startX) {
      const arr = [];
      let x = startX;
      for (let i = 0; i < count && x < 1.12; i++) {
        const w = 0.045 + r() * 0.09;
        const h = hMin + r() * (hMax - hMin);
        const wins = [];
        const cols = 2 + ((r() * 4) | 0);
        const rows = 4 + ((r() * 8) | 0);
        for (let j = 0; j < cols * rows; j++) if (r() > 0.28) wins.push(j);
        arr.push({
          x, w, h, roof: (r() * 4) | 0,
          wall: lerpC(th.wall[0], dark, 0.25 + r() * 0.35),
          edge: lerpC(th.wall[1] || th.wall[0], "#8a90b0", 0.12),
          cols, rows, wins, lit: 0.45 + r() * 0.5,
          spire: r() > 0.65,
        });
        x += w + 0.004 + r() * 0.02;
      }
      return arr;
    }
    const skylineFar = makeSky(16, 0.58, 1.12, "#0a0a18", -0.02);
    const skylineMid = makeSky(12, 0.32, 0.72, "#12101c", -0.05);
    const lamps = [];
    for (let i = 0; i < 5; i++) lamps.push({ t: (i + 0.5) / 5 + (r() - 0.5) * 0.06 });
    return { blds, skylineFar, skylineMid, lamps, seed: r };
  }

  /* ---------- menu ---------- */
  function openMenu() {
    screen = "menu";
    LV = null;
    $("#game").hidden = true;
    $("#menu").hidden = false;
    renderMenu();
  }

  function renderMenu() {
    const cleared = Object.keys(save.stars).length;
    const prog = $("#progress");
    if (prog) prog.textContent = save.all ? `已入睡 ${cleared} / ${C.LEVELS.length} 座城 · 测试解锁` : `已入睡 ${cleared} / ${C.LEVELS.length} 座城`;
    const box = $("#levels");
    box.innerHTML = "";
    C.LEVELS.forEach((L, i) => {
      const open = isOpenLevel(i);
      const b = document.createElement("button");
      const starsN = save.stars[i] || 0;
      b.className = "card" + (starsN ? " done" : "") + (open && !starsN && i === save.unlocked - 1 ? " start" : "") + (open ? "" : " locked");
      b.type = "button";
      const cv = document.createElement("canvas");
      cv.width = 280;
      cv.height = 150;
      drawThumb(cv, L, open);
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.innerHTML = `<span class="no">第 ${i + 1} 关 · ${L.tier}</span><strong>${L.name}</strong>`;
      if (!open) meta.innerHTML += `<span class="lock">锁</span>`;
      else if (starsN) meta.innerHTML += `<span class="star">${"★".repeat(starsN)}${"☆".repeat(3 - starsN)}</span>`;
      b.append(cv, meta);
      b.onclick = () => {
        if (!open) { /* stay */ return; }
        openLevel(i);
      };
      box.appendChild(b);
    });
  }

  function drawThumb(cv, L, open) {
    const c = cv.getContext("2d");
    const W = cv.width, H = cv.height;
    const th = themeOf(L);
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, th.sky0);
    g.addColorStop(1, th.sky2);
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    c.fillStyle = "rgba(255,255,255,.5)";
    for (let i = 0; i < 16; i++) c.fillRect((i * 47) % W, (i * 29) % (H * 0.4), 1.4, 1.4);
    const cs = Math.min((W - 16) / L.W, (H - 22) / L.H);
    const ox = (W - cs * L.W) / 2, oy = 12 + (H - 22 - cs * L.H);
    for (let y = 0; y < L.H; y++) {
      for (let x = 0; x < L.W; x++) {
        const cell = L.grid[y][x];
        if (!cell) continue;
        const px = ox + x * cs, py = oy + y * cs;
        c.fillStyle = th.wall[0];
        c.fillRect(px, py, cs + 0.5, cs + 0.5);
        if (cell.on || cell.dormant) {
          c.fillStyle = cell.dormant ? "rgba(40,40,60,.8)" : C.COLORS[cell.c].fill;
          c.globalAlpha = open ? 1 : 0.45;
          c.fillRect(px + 0.8, py + 0.8, Math.max(1, cs - 1.6), Math.max(1, cs - 1.6));
          c.globalAlpha = 1;
        }
      }
    }
  }

  function openLevel(i, force) {
    if (!force && !isOpenLevel(i)) return;
    try { ac(); } catch (e) {}
    li = i;
    screen = "game";
    $("#menu").hidden = true;
    $("#game").hidden = false;
    loadLevel(i);
  }

  function loadLevel(i) {
    const src = C.LEVELS[i];
    LV = src;
    grid = C.cloneGrid(src.grid);
    cols = C.cloneCols(src.cols);
    slots = Array(SLOT_N).fill(null);
    unlocked = { ...(src.unlocked || {}) };
    slotCount = SLOT_N;
    over = false;
    won = false;
    paused = false;
    history = [];
    usedRewind = false;
    usedAd = false;
    workers = [];
    parts = [];
    afterglow = [];
    lah = [];
    meteors = [];
    playTime = 0;
    startTotal = C.leftCount(grid);
    coach = null;
    winTimer = 0;
    takes = 0;
    shakeT = 0;
    glowDirty = true;
    decor = buildDecor(src);
    cars = [0, 1, 2].map((k) => ({ t: k * 0.33, v: 0.04 + (k % 2) * 0.02, dir: k % 2 ? 1 : -1 }));
    skyKey = "";
    $("#loseBox").hidden = true;
    $("#winBox").hidden = true;
    $("#adBox").hidden = true;
    $("#coach").hidden = true;
    $$(".fly").forEach((el) => el.remove());
    renderSlots();
    renderTray();
    updateHud();
    resize();
    if (src.coach) startCoach();
    else toast(src.hint, true);
  }

  function snapshot() {
    return {
      grid: C.cloneGrid(grid),
      cols: C.cloneCols(cols),
      slots: C.cloneSlots(slots),
      unlocked: { ...unlocked },
      slotCount, takes,
    };
  }
  function restore(s) {
    grid = C.cloneGrid(s.grid);
    cols = C.cloneCols(s.cols);
    slots = C.cloneSlots(s.slots);
    for (const sl of slots) if (sl) { sl._busy = false; sl._wait = false; }
    unlocked = { ...s.unlocked };
    slotCount = s.slotCount;
    takes = s.takes || 0;
    workers = [];
    parts = [];
    over = false;
    won = false;
    paused = false;
    glowDirty = true;
    $("#loseBox").hidden = true;
    renderSlots();
    renderTray();
    updateHud();
    resize();
  }

  function startCoach() {
    coach = { i: 0, wait: 0 };
    showCoach();
  }
  function coachPick() {
    const u = C.frontsUseful(grid, cols, unlocked, takes);
    return u.length ? u[0] : 0;
  }
  function showCoach() {
    const el = $("#coach");
    if (!coach || over || won) { el.hidden = true; return; }
    const steps = [
      { k: "tap", html: "点<b>最前排</b>的工单，派出同色的小电工" },
      { k: "read", html: "小电工只会关<b>露在外面</b>的灯，从外往里、从上往下" },
      { k: "read", html: "电闸只有 <b>5</b> 个槽。关不到的颜色会占着，<b>全堵住就电网过载了</b>" },
    ];
    const s = steps[coach.i];
    if (!s) { el.hidden = true; coach = null; toast("把整座城的灯关完就过关，晚安。", true); return; }
    el.hidden = false;
    el.innerHTML = `<div class="bubble">${s.html}${s.k === "read" ? '<div class="next">点一下继续</div>' : ""}</div>`;
    $$(".box").forEach((b) => b.classList.remove("point"));
    if (s.k === "tap") {
      const ci = coachPick();
      const btn = $(`.tcol[data-c="${ci}"] .box[data-k="0"]`);
      if (btn) btn.classList.add("point");
    }
  }
  function coachNext() {
    if (!coach) return;
    coach.i++;
    showCoach();
  }
  function coachBlocks(ci) {
    if (!coach) return false;
    const steps = ["tap", "read", "read"];
    const k = steps[coach.i];
    if (!k || k === "read") return k === "read";
    return ci !== coachPick();
  }

  /* ---------- hud / tray / slots ---------- */
  function updateHud() {
    if (!LV) return;
    $("#lvNo").textContent = `第${li + 1}关 · ${LV.tier}`;
    $("#lvName").textContent = LV.name;
    $("#leftV").textContent = C.leftCount(grid);
    $("#speedBtn").textContent = speed === 1 ? "▶ 1×" : speed === 2 ? "▶ 2×" : "▶ 3×";
    $("#soundBtn").textContent = muted ? "×" : "♪";
    const used = slots.filter((s) => s && !s.hold).length + slots.filter((s) => s && s.hold).length;
    const fill = $("#loadFill");
    if (fill) {
      fill.style.width = (used / slotCount * 100) + "%";
      fill.classList.toggle("hot", used >= slotCount - 1);
    }
  }

  function renderSlots() {
    const bar = $("#slots");
    bar.style.gridTemplateColumns = `repeat(${slotCount}, 1fr)`;
    bar.innerHTML = "";
    for (let i = 0; i < slotCount; i++) {
      const s = slots[i];
      const d = document.createElement("div");
      d.className = "slot" + (s ? " full" : "") + (s && s._wait ? " wait" : "") + (s && s.duo && !s.hold ? " duo" : "") + (s && s.hold ? " hold" : "");
      if (s) {
        const col = C.COLORS[s.c];
        if (s.hold) {
          d.innerHTML = `<button class="box in" style="background:${col.fill};color:${col.ink}"><span class="tag">招牌</span></button>`;
        } else {
          d.innerHTML = `<button class="box in" style="background:${col.fill};color:${col.ink}">${s._wait ? '<span class="sleeper">💤</span>' : ""}${s.n}${s._wait ? '<i class="zz">zz</i>' : ""}${s.duo ? '<span class="tag">双槽</span>' : ""}</button>`;
        }
      }
      bar.appendChild(d);
    }
  }

  function renderTray() {
    const tr = $("#tray");
    tr.innerHTML = "";
    cols.forEach((col, ci) => {
      const d = document.createElement("div");
      d.className = "tcol";
      d.dataset.c = ci;
      const vis = col.slice(0, 3);
      vis.forEach((t, k) => {
        const colr = C.COLORS[t.c];
        const btn = document.createElement("button");
        btn.type = "button";
        const hidden = !!t.hidden;
        btn.className = "box" + (t.duo ? " duo" : "");
        btn.style.background = hidden ? "#3a3558" : colr.fill;
        btn.style.color = hidden ? "#dcd6ff" : colr.ink;
        btn.dataset.k = k;
        btn.textContent = hidden ? "?" : String(t.n);
        if (k === 0) btn.onclick = () => tapBox(ci, k);
        else { btn.tabIndex = -1; btn.classList.add("back"); }
        d.appendChild(btn);
      });
      if (col.length > 3) {
        const m = document.createElement("div");
        m.className = "more";
        m.textContent = "+" + (col.length - 3);
        d.appendChild(m);
      }
      tr.appendChild(d);
    });
    if (coach) showCoach();
  }

  function toast(msg, soft) {
    toastMsg = msg;
    toastT = soft ? 2.2 : 1.6;
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    el.classList.toggle("soft", !!soft);
    if (!soft) SFX.toast();
  }

  function flyCard(fromEl, color, text, ink) {
    if (!fromEl) return;
    const r = fromEl.getBoundingClientRect();
    // snapshot dest before renderSlots replaces the nodes
    const dest = $$("#slots .slot").find((s) => !s.classList.contains("full")) || $("#slots .slot");
    const d = dest ? dest.getBoundingClientRect() : r;
    const el = document.createElement("div");
    el.className = "fly";
    el.style.left = r.left + "px";
    el.style.top = r.top + "px";
    el.style.width = r.width + "px";
    el.style.height = r.height + "px";
    el.style.background = color;
    el.style.color = ink;
    el.style.fontSize = "18px";
    el.textContent = text;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.left = d.left + "px";
      el.style.top = d.top + "px";
      el.style.transform = "scale(0.88)";
      el.style.opacity = "0.2";
    });
    setTimeout(() => el.remove(), 420);
  }

  /* ---------- interaction ---------- */
  function tapBox(ci, k) {
    if (over || won || paused) return;
    if (coach && coachBlocks(ci)) return;
    if (k > 0) return;
    if (!cols[ci] || !cols[ci][0]) return;
    const t0 = cols[ci][0];
    if (!C.canPlaceTicket(slots, slotCount, t0)) {
      toast(t0.duo ? "这块大招牌要两个挨着的槽" : "电闸槽满了");
      SFX.wait();
      return;
    }
    const from = $(`.tcol[data-c="${ci}"] .box[data-k="0"]`);
    const colr = C.COLORS[t0.c];
    flyCard(from, t0.hidden ? "#3a3558" : colr.fill, t0.hidden ? "?" : String(t0.n), t0.hidden ? "#dcd6ff" : colr.ink);
    history.push(snapshot());
    if (history.length > 24) history.shift();
    const revealed = t0.hidden;
    C.place(cols, slots, ci, slotCount);
    takes++;
    SFX.seat();
    SFX.tap();
    if (revealed) toast("工单现形：" + C.COLORS[slots.find((s) => s && s.c === t0.c && !s.hold).c].name, true);
    if (coach && coach.i === 0) coachNext();
    renderTray();
    renderSlots();
    updateHud();
  }

  function spawnWorker(si, target) {
    const start = slotPt(si);
    const dest = cellXY(target.x, target.y);
    const streetY = geo.streetY;
    const go = [
      { x: start.x, y: start.y },
      { x: start.x, y: streetY },
      { x: dest.x, y: streetY },
      { x: dest.x, y: dest.y },
    ];
    workers.push({
      si, color: slots[si].c, tx: target.x, ty: target.y,
      path: go, s: 0, len: polyLen(go), st: "go", t: 0,
      x: start.x, y: start.y, a: -Math.PI / 2, ph: Math.random() * 6,
      kind: si % 2 === 0 ? "van" : "climb",
      vanX: dest.x,
    });
    slots[si]._busy = true;
    slots[si]._wait = false;
  }

  function polyLen(pts) {
    let n = 0;
    for (let i = 1; i < pts.length; i++) n += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    return n;
  }
  function atPoly(pts, s) {
    let left = s;
    for (let i = 1; i < pts.length; i++) {
      const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      if (left <= d || i === pts.length - 1) {
        const k = d ? left / d : 1;
        const x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) * k;
        const y = pts[i - 1].y + (pts[i].y - pts[i - 1].y) * k;
        const a = Math.atan2(pts[i].y - pts[i - 1].y, pts[i].x - pts[i - 1].x);
        return { x, y, a };
      }
      left -= d;
    }
    const last = pts[pts.length - 1];
    return { x: last.x, y: last.y, a: 0 };
  }

  function burst(x, y, col, n) {
    for (let i = 0; i < (n || 10); i++) {
      parts.push({
        x, y,
        vx: (Math.random() - 0.5) * 160,
        vy: -Math.random() * 140 - 20,
        life: 0.35 + Math.random() * 0.28,
        max: 0.65,
        c: col,
        sz: 1.6 + Math.random() * 2.6,
      });
    }
  }

  function step(dt) {
    if (over || paused || !LV || !geo) {
      if (won && winTimer > 0) {
        winTimer -= dt;
        if (winTimer <= 0) showWin();
      }
      stepFx(dt);
      return;
    }
    playTime += dt;
    if (shakeT > 0) shakeT -= dt;
    const rushing = cols.every((c) => !c.length);
    const sp = rushing ? Math.max(speed, 8) : speed;

    for (let i = 0; i < slotCount; i++) {
      const s = slots[i];
      if (s && s._busy && !workers.some((w) => w.si === i)) s._busy = false;
      if (!s || s.n <= 0 || s._busy || s.hold) continue;
      const t = C.findTarget(grid, s.c, unlocked, takes);
      if (!t) {
        if (!s._wait) {
          s._wait = true;
          const anyBlink = (function () {
            for (const row of grid) for (const c of row) if (c && c.on && c.c === s.c && c.blink) return true;
            return false;
          })();
          toast(anyBlink && takes % 2 === 0 ? "灯笼还在亮着，等它暗下去再关" : "这种颜色还埋在里面，小电工在等", true);
        }
        continue;
      }
      spawnWorker(i, t);
    }

    const climb = geo.cs * 22 * sp;
    for (let k = workers.length - 1; k >= 0; k--) {
      const w = workers[k];
      w.ph += dt * 16;
      if (w.st === "go") {
        w.s = Math.min(w.len, w.s + climb * dt);
        const p = atPoly(w.path, w.s);
        w.x = p.x; w.y = p.y; w.a = p.a;
        if (w.s >= w.len - 0.1) { w.st = "work"; w.t = 0; }
      } else if (w.st === "work") {
        w.t += dt * sp;
        if (w.t > 0.08 && !w.did) {
          w.did = true;
          const cell = grid[w.ty][w.tx];
          if (cell && cell.on && cell.c === w.color) {
            const wasKey = !!cell.key;
            const kind = cell.kind;
            const willAwaken = !!(cell.awaken && cell.awaken.length);
            C.turnOff(grid, { x: w.tx, y: w.ty }, unlocked);
            glowDirty = true;
            const col = C.COLORS[w.color].glow;
            burst(w.x, w.y, col, 12);
            afterglow.push({ x: w.x, y: w.y, c: col, t: 1 });
            shakeT = Math.max(shakeT, 0.08);
            SFX.spark();
            SFX.off();
            if (wasKey) {
              SFX.unlock();
              const msg = kind === "button" ? "叮，电梯门开了，中间几层能关了"
                : kind === "breaker" ? "总闸拉开了，整片都有电了"
                : kind === "beacon" ? "航标灭了，那边解锁了"
                : kind === "switch" ? "开关一拉，有些灯亮起来了"
                : "咔哒，锁开了";
              toast(msg, true);
            }
            if (willAwaken) {
              SFX.awaken();
              if (!wasKey) toast("那边一下子亮起来了", true);
            }
            if (slots[w.si]) slots[w.si].n--;
          }
        }
        if (w.t > 0.16) {
          const s = slots[w.si];
          if (s && s.n > 0) {
            const nxt = C.findTarget(grid, s.c, unlocked, takes);
            if (nxt) {
              const dest = cellXY(nxt.x, nxt.y);
              const go = [{ x: w.x, y: w.y }, { x: dest.x, y: w.y }, { x: dest.x, y: dest.y }];
              w.tx = nxt.x; w.ty = nxt.y;
              w.path = go; w.s = 0; w.len = polyLen(go); w.st = "go"; w.t = 0; w.did = false;
            } else {
              w.st = "back"; w.t = 0;
              const sp0 = slotPt(w.si);
              w.path = [{ x: w.x, y: w.y }, { x: w.x, y: geo.streetY }, { x: sp0.x, y: geo.streetY }, { x: sp0.x, y: sp0.y }];
              w.s = 0; w.len = polyLen(w.path);
            }
          } else {
            w.st = "back"; w.t = 0;
            const sp0 = slotPt(w.si);
            w.path = [{ x: w.x, y: w.y }, { x: w.x, y: geo.streetY }, { x: sp0.x, y: geo.streetY }, { x: sp0.x, y: sp0.y }];
            w.s = 0; w.len = polyLen(w.path);
          }
        }
      } else if (w.st === "back") {
        w.s = Math.min(w.len, w.s + climb * 1.15 * dt);
        const p = atPoly(w.path, w.s);
        w.x = p.x; w.y = p.y; w.a = p.a;
        if (w.s >= w.len - 0.1) {
          if (slots[w.si]) slots[w.si]._busy = false;
          workers.splice(k, 1);
        }
      }
    }

    for (let i = 0; i < slotCount; i++) {
      if (slots[i] && slots[i].n <= 0 && !slots[i].hold && !slots[i]._busy && !workers.some((w) => w.si === i && w.st !== "back")) {
        const pt = slotPt(i);
        lah.push({ x: pt.x, y: pt.y - 12, t: 0.7, text: "啦" });
        if (slots[i].duo && slots[i].pair != null) slots[slots[i].pair] = null;
        slots[i] = null;
        SFX.pop();
      }
    }

    const left = C.leftCount(grid);
    const busy = workers.length > 0;
    if (left === 0 && !busy && !won) {
      won = true;
      winTimer = 0.55;
    } else if (!won && !busy && C.isLost(grid, cols, slots, slotCount, unlocked, takes)) {
      showLose();
    }

    if (toastT > 0) {
      toastT -= dt;
      if (toastT <= 0) $("#toast").classList.remove("show");
    }
    if (winTimer > 0) {
      winTimer -= dt;
      if (winTimer <= 0) showWin();
    }
    stepFx(dt);
    const sig = slots.map((s) => (s ? s.c + ":" + s.n + (s._wait ? "w" : "") : "-")).join("|") + "#" + slotCount;
    if (sig !== step._slotSig) { step._slotSig = sig; renderSlots(); updateHud(); }
    else if (Math.floor(playTime * 8) !== step._hudN) { step._hudN = Math.floor(playTime * 8); updateHud(); }
  }

  function stepFx(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 220 * dt;
      if (p.life <= 0) parts.splice(i, 1);
    }
    for (let i = afterglow.length - 1; i >= 0; i--) {
      afterglow[i].t -= dt * 2.6;
      if (afterglow[i].t <= 0) afterglow.splice(i, 1);
    }
    for (let i = lah.length - 1; i >= 0; i--) {
      lah[i].t -= dt;
      if (lah[i].t <= 0) lah.splice(i, 1);
    }
    if (LV && Math.random() < dt * (0.15 + darkK() * 0.6) && meteors.length < 2) {
      meteors.push({ x: 0.1 + Math.random() * 0.7, y: 0.02 + Math.random() * 0.12, vx: 0.25 + Math.random() * 0.2, vy: 0.18 + Math.random() * 0.12, t: 0.7 });
    }
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx * dt; m.y += m.vy * dt; m.t -= dt;
      if (m.t <= 0 || m.x > 1.2) meteors.splice(i, 1);
    }
    cars.forEach((c) => {
      c.t += c.v * c.dir * dt;
      if (c.t > 1.15) { c.t = -0.1; }
      if (c.t < -0.15) { c.t = 1.1; }
    });
  }

  function showLose() {
    if (over || won) return;
    over = true;
    SFX.lose();
    $("#loseRw").hidden = usedRewind || history.length === 0;
    $("#loseBox").hidden = false;
  }
  function showWin() {
    over = true;
    won = true;
    const starsN = (usedRewind && usedAd) ? 1 : (usedRewind || usedAd) ? 2 : 3;
    const prev = save.stars[li] || 0;
    if (starsN > prev) save.stars[li] = starsN;
    if (save.unlocked < li + 2) save.unlocked = Math.min(C.LEVELS.length, li + 2);
    persist();
    SFX.win();
    if (LV && LV.theme === "newyear") {
      for (let i = 0; i < 40; i++) {
        const col = C.COLORS[i % 6].glow;
        burst(geo.w * (0.2 + Math.random() * 0.6), geo.sky * (0.3 + Math.random() * 0.4), col, 8);
      }
    }
    $("#winBox").hidden = false;
    $("#winNext").hidden = li >= C.LEVELS.length - 1;
    $("#winTitle").textContent = "晚安";
    const starEl = $("#winStars");
    if (starEl) starEl.innerHTML = "★".repeat(starsN) + `<span class="dim">${"★".repeat(3 - starsN)}</span>`;
    $("#winSub").textContent = (LV.quote || "城市已入睡。") + " · " + LV.name;
  }

  function rewind() {
    if (usedRewind || !history.length) return;
    usedRewind = true;
    const steps = Math.min(3, history.length);
    let s = null;
    for (let i = 0; i < steps; i++) s = history.pop();
    restore(s);
    toast("时光倒流，回到 " + steps + " 步之前", true);
  }

  function addSlotFromAd() {
    if (slotCount >= 7) { toast("槽位已经加满了", true); return; }
    slotCount++;
    slots.push(null);
    usedAd = true;
    over = false;
    won = false;
    $("#loseBox").hidden = true;
    renderSlots();
    toast("多了一个电闸槽", true);
    SFX.seat();
  }
  function openAd() {
    adFor = "slot";
    adLeft = 5;
    $("#adBox").hidden = false;
    $("#adSec").textContent = "5";
  }
  function tickAd(dt) {
    if ($("#adBox").hidden) return;
    adLeft -= dt;
    const n = Math.max(0, Math.ceil(adLeft));
    $("#adSec").textContent = String(n);
    if (adLeft <= 0) {
      $("#adBox").hidden = true;
      addSlotFromAd();
    }
  }

  /* ---------- render ---------- */
  function darkK() {
    if (!LV) return 0;
    const left = C.leftCount(grid);
    return 1 - left / Math.max(1, startTotal);
  }

  function draw() {
    if (!geo) return;
    const { w, h } = geo;
    const k = LV ? darkK() : 0;
    const th = themeOf(LV);
    ctx.save();
    if (shakeT > 0) {
      const s = shakeT * 10;
      ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    }
    // sky
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, lerpC(th.sky0, "#050510", k * 0.75));
    g.addColorStop(0.5, lerpC(th.sky1, "#070616", k * 0.75));
    g.addColorStop(1, lerpC(th.sky2, "#06050e", k * 0.8));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // milky way — soft dust, no hard polygon
    if (k > 0.15) {
      ctx.save();
      ctx.globalAlpha = (k - 0.15) * 0.55;
      const yy0 = (geo.sky || 80) * 0.15;
      for (let i = 0; i < 80; i++) {
        const u = i / 80;
        const px = w * (0.05 + u * 0.85);
        const py = yy0 + u * (geo.sky || 80) * 0.7 + Math.sin(i * 1.7) * 10;
        const rr = (i % 5 === 0) ? 1.6 : 0.7;
        ctx.fillStyle = "rgba(220,230,255," + (0.15 + (i % 7) * 0.05) + ")";
        ctx.beginPath();
        ctx.arc(px, py, rr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    const starA = 0.2 + 0.8 * k;
    for (const s of stars) {
      const tw = 0.55 + 0.45 * Math.sin(playTime * s.s + s.p);
      ctx.globalAlpha = starA * s.b * tw;
      ctx.fillStyle = "#fff8e8";
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * (geo.sky || h * 0.3) * 1.35, s.r * (0.7 + 0.6 * k), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const m of meteors) {
      ctx.strokeStyle = `rgba(255,245,220,${Math.max(0, m.t)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(m.x * w, m.y * h);
      ctx.lineTo((m.x - m.vx * 0.12) * w, (m.y - m.vy * 0.12) * h);
      ctx.stroke();
    }

    // moon
    const mx = w * 0.82, my = (geo.sky || 80) * 0.38;
    const mr = 16 + 12 * k;
    ctx.fillStyle = `rgba(255,244,214,${0.5 + 0.45 * k})`;
    ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(230,214,170,${0.25 + 0.2 * k})`;
    ctx.beginPath(); ctx.arc(mx - mr * 0.28, my - mr * 0.18, mr * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(mx + mr * 0.22, my + mr * 0.2, mr * 0.14, 0, Math.PI * 2); ctx.fill();

    // warm fog, fades as city sleeps
    if (th.fog) {
      ctx.fillStyle = th.fog.replace(/[\d.]+\)$/, (0.22 * (1 - k * 0.85)).toFixed(3) + ")");
      // fog string may not match; fallback
      const fogA = 0.18 * (1 - k * 0.85);
      const fg = ctx.createLinearGradient(0, (geo.sky || 80), 0, (geo.streetY || h));
      fg.addColorStop(0, hexA(th.accent, 0));
      fg.addColorStop(0.55, hexA(th.accent, fogA * 0.45));
      fg.addColorStop(1, hexA(th.accent, fogA));
      ctx.fillStyle = fg;
      ctx.fillRect(0, 0, w, h);
    }

    drawSkyline(k, th);
    if (LV && grid) drawCity(k, th);
    drawStreet(k, th);

    for (const a of afterglow) {
      ctx.globalAlpha = Math.max(0, a.t);
      ctx.fillStyle = a.c;
      ctx.beginPath(); ctx.arc(a.x, a.y, 6 + (1 - a.t) * 8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const p of parts) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, p.sz, p.sz);
    }
    ctx.globalAlpha = 1;

    if (LV && grid) workers.forEach(drawWorker);

    for (const t of lah) {
      ctx.globalAlpha = Math.max(0, t.t / 0.7);
      ctx.fillStyle = "#fff4c0";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(t.text, t.x, t.y - (0.7 - t.t) * 28);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
    ctx.restore();
  }

  function drawSkyline(k, th) {
    if (!decor || !geo) return;
    const key = (LV && LV.id) + ":" + ((k * 8) | 0) + ":" + geo.w + ":" + geo.h;
    if (skyKey !== key) {
      skyCv.width = Math.max(1, geo.w);
      skyCv.height = Math.max(1, geo.h);
      skyCtx.clearRect(0, 0, skyCv.width, skyCv.height);
      const streetY = geo.streetY || geo.h - 70;
      const horizon = streetY - 6;
      const fill = skyCtx;
      const paint = (list, heightMul, winA, shade) => {
        for (const b of list) {
          const x = b.x * geo.w;
          const bw = Math.max(8, b.w * geo.w);
          const bh = b.h * horizon * heightMul;
          const y = horizon - bh;
          fill.fillStyle = lerpC(b.wall, "#050508", shade + k * 0.25);
          fill.fillRect(x, y, bw, bh + 2);
          // left highlight so silhouettes read against the sky
          fill.fillStyle = hexA(b.edge || "#8890aa", 0.18);
          fill.fillRect(x, y, 1.4, bh);
          if (b.roof === 0) {
            fill.fillStyle = lerpC(b.wall, "#050508", shade + k * 0.25);
            fill.beginPath();
            fill.moveTo(x - 1, y);
            fill.lineTo(x + bw / 2, y - Math.min(16, bw * 0.35));
            fill.lineTo(x + bw + 1, y);
            fill.fill();
          } else if (b.roof === 1 || b.spire) {
            fill.fillStyle = lerpC(b.wall, "#050508", shade);
            fill.fillRect(x + bw * 0.42, y - 16, Math.max(2, bw * 0.12), 16);
            if (b.spire) {
              fill.fillStyle = hexA(th.accent, 0.45 * (1 - k * 0.5));
              fill.fillRect(x + bw * 0.42 + 0.5, y - 18, 2, 2);
            }
          } else if (b.roof === 2) {
            fill.fillStyle = lerpC(b.wall, "#050508", shade);
            fill.fillRect(x, y - 5, bw, 5);
          }
          const cw = bw / (b.cols + 1), ch = bh / (b.rows + 2);
          fill.fillStyle = hexA(th.accent, winA * b.lit * (1 - k * 0.7));
          for (const i of b.wins) {
            const cx = i % b.cols, cy = (i / b.cols) | 0;
            fill.fillRect(x + cw * (cx + 0.45), y + ch * (cy + 0.8), Math.max(1.4, cw * 0.5), Math.max(1.4, ch * 0.5));
          }
        }
      };
      paint(decor.skylineFar || [], 0.92, 0.28, 0.35);
      paint(decor.skylineMid || decor.skyline || [], 0.78, 0.5, 0.12);
      skyKey = key;
    }
    ctx.drawImage(skyCv, 0, 0);
  }

  function drawCity(k, th) {
    const { cs, ox, oy } = geo;
    // facades first
    if (decor) {
      for (const b of decor.blds) {
        const x = ox + b.x0 * cs, y = oy + b.y0 * cs;
        const bw = (b.x1 - b.x0 + 1) * cs, bh = (b.y1 - b.y0 + 1) * cs;
        ctx.fillStyle = b.wall;
        ctx.fillRect(x - 2, y - 2, bw + 4, bh + 6);
        // left pipe
        if (b.pipe) {
          ctx.fillStyle = "#2a2a38";
          ctx.fillRect(x - 4, y + 8, 3, bh - 10);
        }
        // roof
        ctx.fillStyle = lerpC(b.wall2, th.accent, 0.08);
        const rx = x - 3, ry = y, rw = bw + 6;
        if (b.roof === 0) {
          ctx.beginPath();
          ctx.moveTo(rx - 2, ry);
          ctx.lineTo(rx + rw / 2, ry - Math.min(18, cs * 1.4));
          ctx.lineTo(rx + rw + 2, ry);
          ctx.closePath();
          ctx.fill();
        } else if (b.roof === 1) {
          ctx.fillRect(rx, ry - 6, rw, 6);
          ctx.fillStyle = b.wall2;
          ctx.fillRect(rx + rw * 0.35, ry - 16, rw * 0.3, 10);
        } else if (b.roof === 2) {
          ctx.fillRect(rx, ry - 5, rw, 5);
          if (b.tower) {
            ctx.fillStyle = "#2a2838";
            ctx.fillRect(rx + rw * 0.6, ry - 20, cs * 0.7, 16);
            ctx.beginPath(); ctx.arc(rx + rw * 0.6 + cs * 0.35, ry - 20, cs * 0.38, Math.PI, 0); ctx.fill();
          }
        } else if (b.roof === 3) {
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx + 4, ry - 8);
          ctx.lineTo(rx + rw - 4, ry - 8);
          ctx.lineTo(rx + rw, ry);
          ctx.fill();
        } else {
          ctx.fillRect(rx, ry - 4, rw, 4);
        }
        if (b.antenna) {
          ctx.strokeStyle = "#4a4860";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(x + bw * 0.2, y - 4);
          ctx.lineTo(x + bw * 0.2, y - 18 - (cs > 12 ? 6 : 0));
          ctx.stroke();
          ctx.fillStyle = hexA(th.accent, 0.5 + 0.5 * Math.sin(playTime * 3 + b.x0));
          ctx.beginPath(); ctx.arc(x + bw * 0.2, y - 18, 1.8, 0, Math.PI * 2); ctx.fill();
        }
        // AC units
        ctx.fillStyle = "#2a3040";
        for (let i = 0; i < b.ac; i++) {
          const ax = x + 4 + i * Math.max(10, cs * 1.1);
          const ay = oy + (b.y1 + 0.15) * cs - 5;
          if (ax < x + bw - 8) ctx.fillRect(ax, ay, 8, 5);
        }
        // neon sign
        if (b.sign && bw > cs * 2) {
          const sy = oy + b.signY * cs + 2;
          ctx.save();
          ctx.font = `bold ${Math.max(8, cs * 0.55)}px "PingFang SC","Noto Sans SC",sans-serif`;
          ctx.fillStyle = hexA(th.accent, 0.25 + 0.55 * (1 - k));
          ctx.textAlign = "center";
          ctx.fillText(b.sign, x + bw / 2, sy);
          ctx.restore();
        }
      }
    }

    // bloom of playable lights
    const sig = lightKey();
    if (glowDirty || sig !== lightSig) {
      rebuildBloom();
      lightSig = sig;
      glowDirty = false;
    }
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.85;
    ctx.drawImage(bloomCv, 0, 0, geo.w, geo.h);
    ctx.restore();

    // windows
    for (let y = 0; y < LV.H; y++) {
      for (let x = 0; x < LV.W; x++) {
        const cell = grid[y][x];
        if (!cell) continue;
        const px = ox + x * cs, py = oy + y * cs;
        const pad = Math.max(1, cs * 0.16);
        const locked = cell.lock && !unlocked[cell.lock];
        const blinkDim = cell.blink && (takes % 2 === 1);
        const style = hash(x * 73 + y * 911 + seedOf(LV.id)) % 5;

        // shutter overlay later
        if (cell.dormant) {
          ctx.fillStyle = "rgba(18,16,30,0.95)";
          ctx.fillRect(px + pad, py + pad, cs - pad * 2, cs - pad * 2);
          ctx.strokeStyle = "rgba(80,80,110,0.35)";
          ctx.strokeRect(px + pad, py + pad, cs - pad * 2, cs - pad * 2);
          continue;
        }
        if (!cell.on) {
          ctx.fillStyle = "rgba(10,10,20,0.92)";
          ctx.fillRect(px + pad * 0.8, py + pad * 0.8, cs - pad * 1.6, cs - pad * 1.6);
          continue;
        }
        const col = C.COLORS[cell.c];
        let a = locked ? 0.28 : 1;
        if (cell.blink) a *= blinkDim ? 0.35 : 1;
        ctx.globalAlpha = a;
        ctx.fillStyle = col.fill;
        const wx = px + pad, wy = py + pad, ww = cs - pad * 2, wh = cs - pad * 2;
        if (style === 1) {
          ctx.fillRect(wx, wy, ww, wh);
          ctx.fillStyle = "rgba(10,8,20,0.35)";
          ctx.fillRect(wx + ww / 2 - 0.6, wy, 1.2, wh);
          ctx.fillRect(wx, wy + wh / 2 - 0.6, ww, 1.2);
        } else if (style === 2) {
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(wx, wy, ww, wh, 2) : ctx.rect(wx, wy, ww, wh);
          ctx.fill();
        } else if (style === 3) {
          const tw = ww / 3;
          for (let i = 0; i < 3; i++) ctx.fillRect(wx + i * tw + 0.4, wy, tw - 0.8, wh);
        } else if (style === 4) {
          ctx.fillRect(wx, wy, ww, wh * 0.45);
          ctx.fillRect(wx, wy + wh * 0.55, ww, wh * 0.45);
        } else {
          ctx.fillRect(wx, wy, ww, wh);
        }
        ctx.globalAlpha = 1;
        // special kinds
        if (cell.key || cell.kind === "button" || cell.kind === "breaker" || cell.kind === "switch" || cell.kind === "beacon") {
          ctx.strokeStyle = "#fff4c0";
          ctx.lineWidth = 1.2;
          ctx.strokeRect(wx - 1, wy - 1, ww + 2, wh + 2);
          ctx.fillStyle = "#fff8e0";
          ctx.font = `bold ${Math.max(7, cs * 0.42)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const mark = cell.kind === "breaker" ? "闸" : cell.kind === "button" ? "梯" : cell.kind === "switch" ? "开" : cell.kind === "beacon" ? "标" : "钥";
          ctx.fillText(mark, px + cs / 2, py + cs / 2);
          ctx.textBaseline = "alphabetic";
        }
        if (cell.kind === "sign" && cell.on) {
          ctx.fillStyle = hexA("#fff4c0", 0.35 + 0.25 * Math.sin(playTime * 4 + x));
          ctx.fillRect(wx, wy, ww, 1.5);
        }
        if (cell.kind === "shutter" && locked) {
          ctx.fillStyle = "rgba(20,22,30,0.72)";
          ctx.fillRect(px, py, cs, cs);
          ctx.strokeStyle = "rgba(70,80,100,0.8)";
          ctx.lineWidth = 1;
          for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(px, py + (cs * i) / 4);
            ctx.lineTo(px + cs, py + (cs * i) / 4);
            ctx.stroke();
          }
        }
        if (locked && cell.kind === "zone") {
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.fillRect(px, py, cs, cs);
        }
      }
    }
    ctx.textAlign = "left";
  }

  function lightKey() {
    if (!grid) return "";
    let s = takes + ":";
    for (const row of grid) for (const c of row) s += c && c.on ? (c.c + (c.blink ? "b" : "") + (c.lock && !unlocked[c.lock] ? "L" : "")) : ".";
    return s;
  }
  function rebuildBloom() {
    const scale = 0.35;
    bloomCv.width = Math.max(1, (geo.w * scale) | 0);
    bloomCv.height = Math.max(1, (geo.h * scale) | 0);
    bloomCtx.clearRect(0, 0, bloomCv.width, bloomCv.height);
    if (!grid || !LV) return;
    const { cs, ox, oy } = geo;
    for (let y = 0; y < LV.H; y++) {
      for (let x = 0; x < LV.W; x++) {
        const cell = grid[y][x];
        if (!cell || !cell.on) continue;
        if (cell.lock && !unlocked[cell.lock]) continue;
        if (cell.blink && takes % 2 === 1) continue;
        const px = (ox + (x + 0.5) * cs) * scale;
        const py = (oy + (y + 0.5) * cs) * scale;
        const spr = glowSprites[cell.c];
        const sz = cs * 3.2 * scale;
        bloomCtx.drawImage(spr, px - sz / 2, py - sz / 2, sz, sz);
      }
    }
  }

  function drawStreet(k, th) {
    const y = geo.streetY || geo.h - 70;
    const w = geo.w, h = geo.h;
    const water = !!(LV && (LV.water || themeOf(LV).water));
    if (water) {
      const wh = 28;
      const wy = y - wh;
      const wg = ctx.createLinearGradient(0, wy, 0, y);
      wg.addColorStop(0, hexA(th.waterHi || "#2a5080", 0.0));
      wg.addColorStop(0.2, hexA(th.water || "#101c32", 0.55));
      wg.addColorStop(1, hexA(th.water || "#101c32", 0.9));
      ctx.fillStyle = wg;
      ctx.fillRect(0, wy, w, wh + 2);
      // reflections of lights
      if (grid && LV) {
        ctx.save();
        ctx.beginPath(); ctx.rect(0, wy, w, wh); ctx.clip();
        ctx.globalAlpha = 0.5 * (1 - k * 0.25);
        ctx.translate(0, y + (y - 8) - (geo.oy + LV.H * geo.cs));
        ctx.scale(1, -0.45);
        // rough: draw colored strips under buildings
        for (let yy = 0; yy < LV.H; yy++) {
          for (let xx = 0; xx < LV.W; xx++) {
            const cell = grid[yy][xx];
            if (!cell || !cell.on) continue;
            if (cell.lock && !unlocked[cell.lock]) continue;
            ctx.fillStyle = C.COLORS[cell.c].fill;
            const px = geo.ox + xx * geo.cs, py = geo.oy + yy * geo.cs;
            ctx.fillRect(px, py, geo.cs, geo.cs);
          }
        }
        ctx.restore();
        // ripples
        ctx.strokeStyle = hexA("#c8e4ff", 0.12);
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
          const ry = wy + 4 + i * 5 + Math.sin(playTime * 1.4 + i) * 1.2;
          ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(w, ry); ctx.stroke();
        }
      }
    }
    // quay / pavement
    ctx.fillStyle = "#12101c";
    ctx.fillRect(0, y - 3, w, 6);
    ctx.fillStyle = "#1a1730";
    ctx.fillRect(0, y, w, h - y);
    // lamps
    if (decor) {
      for (const lp of decor.lamps) {
        const lx = lp.t * w;
        ctx.fillStyle = "#2a2838";
        ctx.fillRect(lx - 1.2, y - 26, 2.4, 26);
        ctx.fillStyle = hexA("#ffd56a", 0.35 + 0.35 * (1 - k));
        ctx.beginPath(); ctx.arc(lx, y - 26, 3.2, 0, Math.PI * 2); ctx.fill();
        const lg = ctx.createRadialGradient(lx, y - 26, 1, lx, y - 26, 18);
        lg.addColorStop(0, hexA("#ffd56a", 0.25 * (1 - k * 0.5)));
        lg.addColorStop(1, hexA("#ffd56a", 0));
        ctx.fillStyle = lg;
        ctx.fillRect(lx - 18, y - 44, 36, 44);
      }
    }
    // cars
    for (const c of cars) {
      const cx = c.t * w;
      const cy = y - 4;
      ctx.fillStyle = "#1a1828";
      ctx.fillRect(cx, cy - 6, 16, 6);
      ctx.fillStyle = c.dir > 0 ? "#ff5a4a" : "#ffd56a";
      ctx.globalAlpha = 0.8;
      ctx.fillRect(c.dir > 0 ? cx : cx + 13, cy - 4, 3, 2);
      ctx.globalAlpha = 1;
    }
  }

  function drawWorker(w) {
    const col = C.COLORS[w.color].fill;
    const onStreet = Math.abs(w.y - geo.streetY) < 20 && (w.st === "go" || w.st === "back");
    if (w.kind === "van" && (onStreet || w.st === "go" || w.st === "back" || w.st === "work")) {
      const vx = onStreet ? w.x : w.vanX;
      const vy = geo.streetY;
      if (Math.abs((onStreet ? w.x : vx) - w.vanX) < geo.w) drawVan(onStreet ? w.x : w.vanX, vy, col, w.a > 0);
    }
    ctx.save();
    ctx.translate(w.x, w.y);
    ctx.scale(1.65, 1.65);
    const walk = Math.sin(w.ph) * 2;
    // wand
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(6, -2);
    ctx.lineTo(11, -8 + (w.st === "work" ? -2 : 0));
    ctx.stroke();
    if (w.st === "work") {
      ctx.fillStyle = "#fff4c0";
      ctx.globalAlpha = 0.7 + 0.3 * Math.sin(playTime * 30);
      ctx.beginPath(); ctx.arc(11, -10, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // toolbox
    ctx.fillStyle = "#3a2a10";
    ctx.fillRect(4, 1, 5, 4);
    ctx.fillStyle = col;
    ctx.fillRect(4, 1, 5, 1.4);
    // body
    ctx.fillStyle = "#1c1a28";
    ctx.fillRect(-4, -2 + walk * 0.2, 8, 9);
    ctx.fillStyle = "#2a4060";
    ctx.fillRect(-4, -1, 8, 4);
    // head + hat
    ctx.fillStyle = "#f1d2b0";
    ctx.beginPath(); ctx.arc(0, -5.2, 3.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffd56a";
    ctx.fillRect(-3.8, -9.2, 7.6, 2.6);
    ctx.fillRect(-1.1, -11.2, 2.2, 2);
    // legs
    ctx.fillStyle = "#2a2738";
    ctx.fillRect(-3.2, 7, 2.4, 4.5 + walk);
    ctx.fillRect(1, 7, 2.4, 4.5 - walk);
    ctx.restore();
  }

  function drawVan(x, y, col, flip) {
    ctx.save();
    ctx.translate(x, y + 2);
    if (flip) ctx.scale(-1, 1);
    ctx.fillStyle = "#1a1830";
    ctx.fillRect(-14, -12, 28, 13);
    ctx.fillStyle = col;
    ctx.fillRect(-14, -12, 28, 4);
    ctx.fillStyle = "#7ee7ff";
    ctx.globalAlpha = 0.7;
    ctx.fillRect(4, -9, 8, 4);
    ctx.globalAlpha = 1;
    // boom
    ctx.strokeStyle = "#4a4860";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(8, -22);
    ctx.stroke();
    ctx.fillStyle = "#2a2738";
    ctx.beginPath(); ctx.arc(-7, 2, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, 2, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /* ---------- loop ---------- */
  function frame(t) {
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
    lastT = t;
    acc += dt;
    tickAd(dt);
    if (screen === "game") step(dt);
    draw();
    requestAnimationFrame(frame);
  }

  /* ---------- events ---------- */
  $("#backBtn").onclick = openMenu;
  $("#speedBtn").onclick = () => { if (over) return; speed = speed === 1 ? 2 : speed === 2 ? 3 : 1; updateHud(); };
  $("#soundBtn").onclick = () => { muted = !muted; try { ac(); } catch (e) {} updateHud(); };
  $("#loseMenu").onclick = openMenu;
  $("#loseRetry").onclick = () => loadLevel(li);
  $("#winMenu").onclick = openMenu;
  $("#winRetry").onclick = () => loadLevel(li);
  $("#winNext").onclick = () => {
    const n = Math.min(C.LEVELS.length - 1, li + 1);
    if (isOpenLevel(n)) openLevel(n);
    else openMenu();
  };
  $("#loseRw").onclick = rewind;
  $("#loseAd").onclick = openAd;
  $("#adSkip").onclick = () => { $("#adBox").hidden = true; addSlotFromAd(); };
  $("#coach").onclick = () => { if (coach) coachNext(); };

  const brand = $("#brandTitle") || $(".brand h1");
  if (brand) {
    brand.addEventListener("click", () => {
      const now = Date.now();
      titleClicks = titleClicks.filter((t) => now - t < 2500);
      titleClicks.push(now);
      if (titleClicks.length >= 5) {
        titleClicks = [];
        save.all = true;
        persist();
        renderMenu();
        toast("测试用：已全部解锁", true);
      }
    });
  }

  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", () => setTimeout(resize, 80));

  /* ---------- boot ---------- */
  seedStars();
  solutions = C.LEVELS.map((L) => C.solve(L, 5));
  solutions.forEach((s, i) => {
    if (!s.ok) console.error("UNSOLVABLE", C.LEVELS[i].id);
  });
  renderMenu();
  resize();
  requestAnimationFrame((t) => { lastT = t; requestAnimationFrame(frame); });

  window.__DEMO__ = {
    startLevel: (i) => openLevel(i, true),
    tap: (ci) => tapBox(ci, 0),
    state: () => ({
      screen, li, left: grid ? C.leftCount(grid) : 0, over, won,
      slots: slots.map((s) => (s ? { c: s.c, n: s.n, wait: !!s._wait, duo: !!s.duo, hold: !!s.hold } : null)),
      fronts: cols ? cols.map((c) => (c[0] ? { c: c[0].c, n: c[0].n, hidden: !!c[0].hidden, duo: !!c[0].duo } : null)) : [],
      slotCount, usedRewind, usedAd, takes, coach: coach && coach.i,
      name: LV && LV.name, unlocked: save.unlocked, stars: { ...save.stars }, all: save.all,
    }),
    solutions: solutions.map((s) => s.path),
    skipCoach() { coach = null; const el = document.getElementById("coach"); if (el) el.hidden = true; },
    showLose,
    setSpeed: (n) => { speed = n; if (LV) updateHud(); },
    rewind,
    addSlotFromAd,
    openAd,
    loadLevel,
    unlockAll() { save.all = true; persist(); renderMenu(); },
    COLORS: C.COLORS,
  };
})();
