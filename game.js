/* 夜灯将眠 — game shell. Depends on NightCore. */
(function () {
  const C = window.NightCore;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

  const SLOT_N = 5;
  const TICK = 1 / 60;

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
  let workers = [];
  let parts = [];
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
  let cleared = {};
  let adFor = null;
  let adLeft = 0;
  let winTimer = 0;

  const board = $("#board");
  const ctx = board.getContext("2d");

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
  };

  /* ---------- stars ---------- */
  function seedStars() {
    stars = Array.from({ length: 56 }, (_, i) => ({
      x: Math.random(),
      y: Math.random() * 0.62,
      r: 0.5 + Math.random() * 1.6,
      p: Math.random() * Math.PI * 2,
      s: 0.6 + Math.random() * 1.8,
      b: 0.4 + Math.random() * 0.6,
    }));
  }

  /* ---------- layout ---------- */
  function resize() {
    const wrap = $("#stage");
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    board.width = Math.max(1, w * dpr);
    board.height = Math.max(1, h * dpr);
    board.style.width = w + "px";
    board.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout(w, h);
  }

  function layout(w, h) {
    if (!LV) { geo = { w, h }; return; }
    const slotBand = 68;
    const streetY = h - slotBand;
    const sky = Math.max(64, h * 0.12);
    const cityH = Math.max(80, streetY - sky - 6);
    const cs = Math.max(10, Math.min((w - 12) / LV.W, cityH / LV.H));
    const ox = (w - cs * LV.W) / 2;
    const oy = streetY - 6 - cs * LV.H;
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

  function trayPt(ci, k) {
    const btn = $(`.tcol[data-c="${ci}"] .box[data-k="${k}"]`);
    if (!btn) return { x: 0, y: 0 };
    const r = btn.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  }

  /* ---------- flow ---------- */
  function openMenu() {
    screen = "menu";
    LV = null;
    $("#game").hidden = true;
    $("#menu").hidden = false;
    renderMenu();
  }

  function renderMenu() {
    const box = $("#levels");
    box.innerHTML = "";
    C.LEVELS.forEach((L, i) => {
      const b = document.createElement("button");
      b.className = "card" + (cleared[i] ? " done" : "") + (i === 0 ? " start" : "");
      b.type = "button";
      const cv = document.createElement("canvas");
      cv.width = 280;
      cv.height = 160;
      drawThumb(cv, L);
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.innerHTML = `<span class="no">第 ${i + 1} 关 · ${L.tier}</span><strong>${L.name}</strong>`;
      if (cleared[i]) meta.innerHTML += `<span class="star">★</span>`;
      b.append(cv, meta);
      b.onclick = () => openLevel(i);
      box.appendChild(b);
    });
  }

  function drawThumb(cv, L) {
    const c = cv.getContext("2d");
    const W = cv.width, H = cv.height;
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0a0a22");
    g.addColorStop(1, "#1a1440");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    // mini stars
    c.fillStyle = "rgba(255,255,255,.55)";
    for (let i = 0; i < 18; i++) {
      const x = (i * 47) % W, y = (i * 29) % (H * 0.45);
      c.fillRect(x, y, 1.4, 1.4);
    }
    const cs = Math.min((W - 16) / L.W, (H - 28) / L.H);
    const ox = (W - cs * L.W) / 2, oy = 18 + (H - 28 - cs * L.H);
    for (let y = 0; y < L.H; y++) {
      for (let x = 0; x < L.W; x++) {
        const cell = L.grid[y][x];
        if (!cell) continue;
        const px = ox + x * cs, py = oy + y * cs;
        c.fillStyle = "#16132a";
        c.fillRect(px, py, cs, cs);
        if (cell.on) {
          c.fillStyle = C.COLORS[cell.c].fill;
          c.fillRect(px + 1, py + 1, Math.max(1, cs - 2), Math.max(1, cs - 2));
        }
      }
    }
  }

  function openLevel(i) {
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
    workers = [];
    parts = [];
    playTime = 0;
    startTotal = C.leftCount(grid);
    coach = null;
    winTimer = 0;
    $("#loseBox").hidden = true;
    $("#winBox").hidden = true;
    $("#adBox").hidden = true;
    $("#coach").hidden = true;
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
      slotCount,
    };
  }
  function restore(s) {
    grid = C.cloneGrid(s.grid);
    cols = C.cloneCols(s.cols);
    slots = C.cloneSlots(s.slots);
    unlocked = { ...s.unlocked };
    slotCount = s.slotCount;
    workers = [];
    parts = [];
    over = false;
    won = false;
    paused = false;
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
    const u = C.frontsUseful(grid, cols, unlocked);
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
    $("#lvNo").textContent = `第${li + 1}关 · ${LV.tier}`;
    $("#lvName").textContent = LV.name;
    $("#leftV").textContent = C.leftCount(grid);
    $("#speedBtn").textContent = speed === 1 ? "▶ 1×" : speed === 2 ? "▶ 2×" : "▶ 3×";
    $("#soundBtn").textContent = muted ? "×" : "♪";
  }

  function renderSlots() {
    const bar = $("#slots");
    bar.style.gridTemplateColumns = `repeat(${slotCount}, 1fr)`;
    bar.innerHTML = "";
    for (let i = 0; i < slotCount; i++) {
      const d = document.createElement("div");
      d.className = "slot" + (slots[i] ? " full" : "") + (slots[i] && slots[i]._wait ? " wait" : "");
      if (slots[i]) {
        const col = C.COLORS[slots[i].c];
        d.innerHTML = `<button class="box in" style="background:${col.fill};color:${col.ink}">${slots[i].n}${slots[i]._wait ? '<i class="zz">zz</i>' : ""}</button>`;
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
        btn.className = "box" + (t.hidden && k !== 0 && false ? " hid" : "");
        const hidden = !!t.hidden;
        btn.style.background = hidden ? "#3a3558" : colr.fill;
        btn.style.color = hidden ? "#dcd6ff" : colr.ink;
        btn.dataset.k = k;
        btn.textContent = hidden ? "?" : String(t.n);
        if (k === 0 || /* hand not implemented */ false) {
          btn.onclick = () => tapBox(ci, k);
        } else {
          btn.tabIndex = -1;
          btn.classList.add("back");
        }
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

  /* ---------- interaction ---------- */
  function tapBox(ci, k) {
    if (over || won || paused) return;
    if (coach && coachBlocks(ci)) return;
    if (k > 0) return;
    if (!cols[ci] || !cols[ci][0]) return;
    let si = slots.findIndex((s, i) => i < slotCount && !s);
    if (si < 0) {
      toast("电闸槽满了");
      SFX.wait();
      return;
    }
    history.push(snapshot());
    if (history.length > 24) history.shift();
    const t = cols[ci].shift();
    const revealed = t.hidden;
    t.hidden = false;
    slots[si] = { c: t.c, n: t.n, id: t.id, _enter: 0, _wait: false };
    SFX.seat();
    if (revealed) toast("工单现形：" + C.COLORS[t.c].name, true);
    if (coach && coach.i === 0) coachNext();
    renderTray();
    renderSlots();
    updateHud();
    // If this color isn't reachable yet, toast after a short beat (set wait in step)
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
        vx: (Math.random() - 0.5) * 140,
        vy: -Math.random() * 120 - 20,
        life: 0.35 + Math.random() * 0.25,
        max: 0.6,
        c: col,
        sz: 1.5 + Math.random() * 2.5,
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
    const rushing = cols.every((c) => !c.length);
    const sp = rushing ? Math.max(speed, 8) : speed;

    // dispatch workers
    for (let i = 0; i < slotCount; i++) {
      const s = slots[i];
      if (!s || s.n <= 0 || s._busy) continue;
      const t = C.findTarget(grid, s.c, unlocked);
      if (!t) {
        if (!s._wait) {
          s._wait = true;
          toast("这种颜色还埋在里面，小电工在等", true);
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
        if (w.s >= w.len - 0.1) {
          w.st = "work";
          w.t = 0;
        }
      } else if (w.st === "work") {
        w.t += dt * sp;
        if (w.t > 0.08 && !w.did) {
          w.did = true;
          const cell = grid[w.ty][w.tx];
          if (cell && cell.on && cell.c === w.color) {
            const wasKey = !!cell.key;
            C.turnOff(grid, { x: w.tx, y: w.ty }, unlocked);
            const col = C.COLORS[w.color].glow;
            burst(w.x, w.y, col, 12);
            SFX.spark();
            SFX.off();
            if (wasKey) { SFX.unlock(); toast("咔哒，顶楼的锁开了", true); }
            if (slots[w.si]) slots[w.si].n--;
          }
        }
        if (w.t > 0.16) {
          const s = slots[w.si];
          if (s && s.n > 0) {
            const nxt = C.findTarget(grid, s.c, unlocked);
            if (nxt) {
              const dest = cellXY(nxt.x, nxt.y);
              const go = [
                { x: w.x, y: w.y },
                { x: dest.x, y: w.y },
                { x: dest.x, y: dest.y },
              ];
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

    // pop empty slots when no worker belongs to them
    for (let i = 0; i < slotCount; i++) {
      if (slots[i] && slots[i].n <= 0 && !slots[i]._busy && !workers.some((w) => w.si === i && w.st !== "back")) {
        slots[i] = null;
        SFX.pop();
      }
    }

    // win / lose when idle
    const left = C.leftCount(grid);
    const busy = workers.length > 0;
    if (left === 0 && !busy && !won) {
      won = true;
      winTimer = 0.55;
    } else if (!won && !busy && C.isLost(grid, cols, slots, slotCount, unlocked)) {
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
    cleared[li] = true;
    SFX.win();
    $("#winBox").hidden = false;
    $("#winNext").hidden = li >= C.LEVELS.length - 1;
    $("#winTitle").textContent = "晚安";
    $("#winSub").textContent = "城市已入睡 · " + LV.name;
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
    const k = darkK();
    // sky
    const g = ctx.createLinearGradient(0, 0, 0, h);
    const top = lerpC("#14163a", "#05051a", k);
    const bot = lerpC("#2a1b48", "#070612", k);
    g.addColorStop(0, top);
    g.addColorStop(0.55, lerpC("#1a1440", "#08071c", k));
    g.addColorStop(1, bot);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // stars
    const starA = 0.25 + 0.75 * k;
    for (const s of stars) {
      const tw = 0.55 + 0.45 * Math.sin(playTime * s.s + s.p);
      ctx.globalAlpha = starA * s.b * tw;
      ctx.fillStyle = "#fff8e8";
      const x = s.x * w, y = s.y * geo.sky * 1.15;
      ctx.beginPath();
      ctx.arc(x, y, s.r * (0.7 + 0.6 * k), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // moon
    const mx = w * 0.82, my = geo.sky * 0.42;
    const mr = 18 + 10 * k;
    ctx.save();
    ctx.shadowColor = `rgba(255,244,210,${0.2 + 0.45 * k})`;
    ctx.shadowBlur = 18 + 24 * k;
    ctx.fillStyle = `rgba(255,244,214,${0.55 + 0.4 * k})`;
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(230,214,170,${0.25 + 0.2 * k})`;
    ctx.beginPath(); ctx.arc(mx - mr * 0.28, my - mr * 0.18, mr * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(mx + mr * 0.22, my + mr * 0.2, mr * 0.14, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    if (LV && grid) drawCity();

    // particles
    for (const p of parts) {
      ctx.globalAlpha = Math.max(0, p.life / (p.max || 0.6));
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x - p.sz / 2, p.y - p.sz / 2, p.sz, p.sz);
    }
    ctx.globalAlpha = 1;

    for (const w of workers) drawWorker(w);
  }

  function drawCity() {
    const { cs, ox, oy } = geo;
    // haze from remaining lights
    const k = darkK();
    const left = C.leftCount(grid);
    if (left > 0) {
      const hg = ctx.createRadialGradient(geo.w / 2, oy + LV.H * cs, 10, geo.w / 2, oy + LV.H * cs * 0.4, geo.w * 0.7);
      hg.addColorStop(0, `rgba(255, 180, 80, ${0.07 * (1 - k)})`);
      hg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = hg;
      ctx.fillRect(0, 0, geo.w, geo.h);
    }

    // street
    ctx.fillStyle = "#0b0a14";
    ctx.fillRect(0, geo.streetY - 8, geo.w, geo.h - geo.streetY + 8);
    ctx.fillStyle = "#16141f";
    ctx.fillRect(0, geo.streetY - 10, geo.w, 4);
    ctx.fillStyle = "rgba(255,210,120,.12)";
    for (let x = 16; x < geo.w; x += 28) ctx.fillRect(x, geo.streetY - 8, 12, 1.5);

    // glow pass
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let y = 0; y < LV.H; y++) {
      for (let x = 0; x < LV.W; x++) {
        const cell = grid[y][x];
        if (!cell || !cell.on) continue;
        if (cell.lock && !unlocked[cell.lock]) continue;
        const p = cellXY(x, y);
        const col = C.COLORS[cell.c];
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, cs * 1.7);
        grd.addColorStop(0, hexA(col.glow, 0.55));
        grd.addColorStop(0.45, hexA(col.glow, 0.16));
        grd.addColorStop(1, hexA(col.glow, 0));
        ctx.fillStyle = grd;
        ctx.fillRect(p.x - cs * 1.7, p.y - cs * 1.7, cs * 3.4, cs * 3.4);
      }
    }
    ctx.restore();

    // facades + windows
    for (let y = 0; y < LV.H; y++) {
      for (let x = 0; x < LV.W; x++) {
        const cell = grid[y][x];
        if (!cell) continue;
        const px = ox + x * cs, py = oy + y * cs;
        const locked = cell.lock && !unlocked[cell.lock];
        ctx.fillStyle = locked ? "#1a1528" : "#161326";
        ctx.fillRect(px, py, cs + 0.4, cs + 0.4);
        const inset = Math.max(1.2, cs * 0.16);
        const wx = px + inset, wy = py + inset;
        const ww = cs - inset * 2, wh = cs - inset * 2;
        if (cell.on && !locked) {
          ctx.fillStyle = C.COLORS[cell.c].fill;
          roundRect(ctx, wx, wy, ww, wh, 1);
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,230,.35)";
          ctx.fillRect(wx + 0.6, wy + 0.6, ww * 0.35, wh * 0.28);
        } else {
          ctx.fillStyle = locked ? "#0c0a16" : "#0a0914";
          roundRect(ctx, wx, wy, ww, wh, 1);
          ctx.fill();
          ctx.strokeStyle = "rgba(80,70,120,.25)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        if (cell.key && cell.on) {
          ctx.fillStyle = "#ffe27a";
          ctx.font = `${Math.max(8, cs * 0.62)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("♔", px + cs / 2, py + cs / 2 + 0.5);
        }
        if (locked && cell.on && y === minLockY(cell.lock) && x === midLockX(cell.lock)) {
          ctx.fillStyle = "#ffd56a";
          ctx.font = `${Math.max(10, cs * 0.8)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🔒", px + cs / 2, py + cs / 2);
        }
      }
    }

    // roofs
    for (let x = 0; x < LV.W; x++) {
      let top = -1;
      for (let y = 0; y < LV.H; y++) if (grid[y][x]) { top = y; break; }
      if (top < 0) continue;
      const px = ox + x * cs, py = oy + top * cs;
      ctx.fillStyle = "#0e0c1c";
      ctx.fillRect(px - 0.5, py - 3, cs + 1, 3);
      // antenna on some tops
      if (top <= 2 && x % 5 === 2) {
        ctx.strokeStyle = "#2a2740";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px + cs * 0.7, py - 3);
        ctx.lineTo(px + cs * 0.7, py - 10);
        ctx.stroke();
        ctx.fillStyle = "#ff8ab8";
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(playTime * 4 + x);
        ctx.beginPath(); ctx.arc(px + cs * 0.7, py - 11, 1.4, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }

  function minLockY(id) {
    let m = 99;
    for (let y = 0; y < LV.H; y++)
      for (let x = 0; x < LV.W; x++)
        if (grid[y][x] && grid[y][x].lock === id) m = Math.min(m, y);
    return m;
  }
  function midLockX(id) {
    const xs = [];
    const y = minLockY(id);
    for (let x = 0; x < LV.W; x++) if (grid[y][x] && grid[y][x].lock === id) xs.push(x);
    return xs[xs.length >> 1] || 0;
  }

  function drawWorker(w) {
    const col = C.COLORS[w.color].fill;
    const climbing = w.st === "go" || w.st === "back";
    // van on the street whenever the worker is mid-path near street
    const onStreet = Math.abs(w.y - geo.streetY) < 18 && (w.st === "go" || w.st === "back");
    if (onStreet || (w.st === "go" && w.s < w.len * 0.55)) {
      const vx = onStreet ? w.x : atPoly(w.path, Math.min(w.s, polyLen([w.path[0], w.path[1], w.path[2]]))).x;
      const vy = geo.streetY;
      drawVan(vx, vy, col, w.a > 0);
    }
    // little electrician
    ctx.save();
    ctx.translate(w.x, w.y);
    ctx.scale(1.25, 1.25);
    const walk = Math.sin(w.ph) * 2;
    // wand
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.6;
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
    // body
    ctx.fillStyle = "#1c1a28";
    ctx.fillRect(-3.5, -2 + walk * 0.2, 7, 8);
    ctx.fillStyle = col;
    ctx.fillRect(-3.5, -1, 7, 3.5);
    // head + hat
    ctx.fillStyle = "#f1d2b0";
    ctx.beginPath(); ctx.arc(0, -5, 3.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffd56a";
    ctx.fillRect(-3.4, -9, 6.8, 2.4);
    ctx.fillRect(-1, -11, 2, 2);
    // legs
    ctx.fillStyle = "#2a2738";
    ctx.fillRect(-3, 6, 2.2, 4 + walk);
    ctx.fillRect(1, 6, 2.2, 4 - walk);
    ctx.restore();
  }

  function drawVan(x, y, col, flip) {
    ctx.save();
    ctx.translate(x, y + 2);
    if (flip) ctx.scale(-1, 1);
    ctx.fillStyle = "#1a1830";
    ctx.fillRect(-11, -9, 22, 10);
    ctx.fillStyle = col;
    ctx.fillRect(-11, -9, 22, 3.5);
    ctx.fillStyle = "#7ee7ff";
    ctx.globalAlpha = 0.7;
    ctx.fillRect(3, -7, 6, 3);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#2a2738";
    ctx.beginPath(); ctx.arc(-6, 2, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, 2, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hexA(h, a) {
    const n = h.replace("#", "");
    const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  function lerpC(a, b, t) {
    const P = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const A = P(a), B = P(b);
    return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(",")})`;
  }

  /* ---------- loop ---------- */
  function frame(t) {
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
    lastT = t;
    acc += dt;
    tickAd(dt);
    if (screen === "game") {
      const stepDt = dt;
      step(stepDt);
    }
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
  $("#winNext").onclick = () => openLevel(Math.min(C.LEVELS.length - 1, li + 1));
  $("#loseRw").onclick = rewind;
  $("#loseAd").onclick = openAd;
  $("#adSkip").onclick = () => { $("#adBox").hidden = true; addSlotFromAd(); };
  $("#coach").onclick = () => { if (coach) coachNext(); };

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
    startLevel: openLevel,
    tap: (ci) => tapBox(ci, 0),
    state: () => ({
      screen, li, left: grid ? C.leftCount(grid) : 0, over, won,
      slots: slots.map((s) => (s ? { c: s.c, n: s.n, wait: !!s._wait } : null)),
      fronts: cols ? cols.map((c) => (c[0] ? { c: c[0].c, n: c[0].n, hidden: !!c[0].hidden } : null)) : [],
      slotCount, usedRewind, coach: coach && coach.i,
      name: LV && LV.name,
    }),
    solutions: solutions.map((s) => s.path),
    skipCoach() { coach = null; const el = document.getElementById("coach"); if (el) el.hidden = true; },
    showLose,
    setSpeed: (n) => { speed = n; if (LV) updateHud(); },
    rewind,
    addSlotFromAd,
    openAd,
    loadLevel,
    COLORS: C.COLORS,
  };
})();
