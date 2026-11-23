// Landmark masks (playable window shapes) + high-res silhouettes.
(function (root) {
  const MASKS = {
    pearl: [
      "   111   ",
      "  11111  ",
      "   111   ",
      "    2    ",
      "    2    ",
      "   222   ",
      "  22222  ",
      " 2222222 ",
      "  22222  ",
      "   222   ",
      "    2    ",
      "    2    ",
      "   333   ",
      "  33333  ",
      "   333   ",
    ],
    cctv: [
      "22222222    ",
      "22222222    ",
      "2222    2222",
      "2222    2222",
      "2222    2222",
      "2222    2222",
      "    22222222",
      "    22222222",
      "    2222    ",
      "    2222    ",
    ],
    canton: [
      "      1      ",
      "      1      ",
      "      1      ",
      "     111     ",
      "   1111111   ",
      "   1111111   ",
      "    11111    ",
      "    11111    ",
      "     222     ",
      "     222     ",
      "     222     ",
      "     222     ",
      "    22222    ",
      "    22222    ",
      "    22222    ",
      "   2222222   ",
      "   2222222   ",
      "   2222222   ",
      "  333333333  ",
      "  333333333  ",
      "  333333333  ",
      " 33333333333 ",
      " 33333333333 ",
      " 33333333333 ",
      "3333333333333",
      "3333333333333",
    ],
    spring: [
      "    1    ",
      "    1    ",
      "    1    ",
      "   111   ",
      "   111   ",
      "   111   ",
      "   111   ",
      "  11111  ",
      "  11111  ",
      "  11111  ",
      "  11111  ",
      " 1111111 ",
      " 1111111 ",
    ],
    bochk: [
      "      2  ",
      "     222 ",
      "   222  2",
      "  22    2",
      " 222    2",
      "22  22  2",
      "2    2222",
      "2     222",
      "22    222",
      "222  2222",
      "222222222",
    ],
    taipei101: [
      "    1    ",
      "   111   ",
      "  11111  ",
      "   111   ",
      "  11111  ",
      "   111   ",
      "  11111  ",
      "   111   ",
      "  11111  ",
      "   111   ",
      "  11111  ",
      "  11111  ",
      " 1111111 ",
    ],
    tokyo: [
      "    1    ",
      "    1    ",
      "   111   ",
      "   111   ",
      "   111   ",
      "  11 11  ",
      "  1 1 1  ",
      "  1   1  ",
      " 11   11 ",
      " 1     1 ",
      "11     11",
    ],
    pagoda: [
      "    1    ",
      "   111   ",
      "  11111  ",
      "   111   ",
      "  11111  ",
      "   111   ",
      " 1111111 ",
      "   111   ",
      " 1111111 ",
      "  11111  ",
      " 1111111 ",
    ],
    nseoul: [
      "    1    ",
      "    1    ",
      "   111   ",
      "  11111  ",
      "   111   ",
      "    1    ",
      "    1    ",
      "    1    ",
      "    1    ",
      "   111   ",
      "  11111  ",
    ],
    sands: [
      "  222222222  ",
      " 22       22 ",
      " 2  1  1  1 2",
      " 2  1  1  1 2",
      " 2  1  1  1 2",
      "    1  1  1  ",
      "    1  1  1  ",
      "    1  1  1  ",
      "   111111111 ",
    ],
    opera: [
      "    1                     ",
      "    11                    ",
      "   1111      3            ",
      "   11111     33           ",
      "   111111    333     1    ",
      "   1111111  33333    11   ",
      "  111111111 333333   111  ",
      "  11111111113333333311111 ",
      "  111111111133333333111111",
      "22222222222222222222222222",
      "22222222222222222222222222",
      "22222222222222222222222222",
    ],
    burj: [
      "    1    ",
      "    1    ",
      "    1    ",
      "   111   ",
      "   111   ",
      "    1    ",
      "   111   ",
      "   111   ",
      "  11111  ",
      "   111   ",
      "  11111  ",
      "  11111  ",
      " 1111111 ",
      " 1111111 ",
    ],
    pyramid: [
      "    1    ",
      "   111   ",
      "   111   ",
      "  11111  ",
      "  11111  ",
      " 1111111 ",
      " 1111111 ",
      "111111111",
    ],
    mosque: [
      "1    1    1    1",
      "1   2222  1    1",
      "1  222222 1    1",
      "1 22222222     1",
      "1 222222221    1",
      "1111111111111111",
      "1  11111111    1",
      "1  11111111    1",
      "1111111111111111",
    ],
    colosseum: [
      "  11111111   ",
      " 11 1 1 111  ",
      "11111111111  ",
      "11 1 1 1 11  ",
      "111111111111 ",
      "11 1 1 1 1 11",
      "1111111111111",
      " 11111111111 ",
    ],
    eiffel: [
      "      111      ",
      "      111      ",
      "     11 11     ",
      "     11 11     ",
      "    11 1 11    ",
      "    1111111    ",
      "   11     11   ",
      "   11     11   ",
      "  11  111  11  ",
      "  11  111  11  ",
      " 11    1    11 ",
      " 11    1    11 ",
      "11    111    11",
      "11    111    11",
      "1    11 11    1",
      "1    11 11    1",
      "11  11   11  11",
      "11 11     11 11",
      "1111       1111",
      "11           11",
    ],
    bigben: [
      "  111  ",
      " 11111 ",
      " 11 11 ",
      " 11111 ",
      "  111  ",
      "  111  ",
      "  111  ",
      "  111  ",
      "  111  ",
      " 11111 ",
    ],
    canal: [
      "  2    2   2  ",
      " 222  222 222 ",
      " 222  222 222 ",
      "22222 222 2222",
      "2 2 2 2 2 2 2 ",
      "22222 222 2222",
      "22222222222222",
    ],
    tvball: [
      "    1    ",
      "    1    ",
      "   111   ",
      "  11111  ",
      "  11111  ",
      "   111   ",
      "    1    ",
      "    1    ",
      "    1    ",
      "   111   ",
    ],
    sagrada: [
      "1  1   1  1",
      "1  1   1  1",
      "11 11 11 11",
      "11 11 11 11",
      "11111111111",
      " 11 111 11 ",
      " 111111111 ",
      " 111111111 ",
      "11111111111",
    ],
    stbasil: [
      "  1  1  1  1  ",
      " 111 111 111 1",
      "  1  111  1  1",
      " 1111111111111",
      "  11  1  11   ",
      " 111 111 111  ",
      "11111111111111",
      "  1111111111  ",
      "  1111111111  ",
    ],
    liberty: [
      "      1 ",
      "      1 ",
      "  1   1 ",
      " 111 11 ",
      " 1111111",
      "  1111  ",
      "   11   ",
      "   11   ",
      "  1111  ",
      " 111111 ",
      "11111111",
    ],
    goldengate: [
      "1           1",
      "1           1",
      "111 11111 111",
      "1 11     11 1",
      "1   11 11   1",
      "1     1     1",
      "1           1",
      "1           1",
      "1           1",
    ],
    willis: [
      "   111   ",
      "   111   ",
      "   111   ",
      "  11111  ",
      "  11111  ",
      "  11111  ",
      " 1111111 ",
      " 1111111 ",
      " 1111111 ",
      "111111111",
    ],
    cristo: [
      "      1      ",
      "      1      ",
      "1111111111111",
      "      1      ",
      "      1      ",
      "     111     ",
      "     111     ",
      "    11111    ",
      "    11111    ",
    ],

    leifeng: [
      "      1      ",
      "     111     ",
      "    11111    ",
      "     111     ",
      "    11111    ",
      "   1111111   ",
      "    11111    ",
      "   1111111   ",
      "  111111111  ",
      "    22222    ",
      "   2222222   ",
      "  222222222  ",
      " 22222222222 ",
      "     333     ",
    ],
    wildgoose: [
      "    11111    ",
      "    11111    ",
      "    1 1 1    ",
      "    11111    ",
      "    1 1 1    ",
      "    11111    ",
      "    1 1 1    ",
      "    11111    ",
      "    1 1 1    ",
      "    11111    ",
      "    1 1 1    ",
      "    11111    ",
      "    1 1 1    ",
      "   1111111   ",
      "  222222222  ",
      "  222222222  ",
    ],
    hongya: [
      "      11  11  11     ",
      "     111111111111    ",
      "    11 11 11 11 11   ",
      "    11111111111111   ",
      "   11 11 11 11 11 11 ",
      "   11111111111111111 ",
      "  11 11 11 11 11 11  ",
      "  111111111111111111 ",
      " 11 11 11 11 11 11 11",
      " 11111111111111111111",
      "222222222222222222222",
      "  333   333   333    ",
    ],
    zhonghuamen: [
      "  1     1     1  ",
      " 111   111   111 ",
      "11111111111111111",
      "1  11   11   11 1",
      "1 1  1 1  1 1  11",
      "1 111  111  111 1",
      "1 1 1  1 1  1 1 1",
      "11111111111111111",
      "22222222222222222",
      "22 2 2 2 2 2 2 22",
      "22222222222222222",
    ],
    yellowcrane: [
      "      1      ",
      "     111     ",
      "   1111111   ",
      "  11 111 11  ",
      "    11111    ",
      "  111111111  ",
      " 11  111  11 ",
      "    11111    ",
      " 11111111111 ",
      "11   111   11",
      "    22222    ",
      "   2222222   ",
      "  222222222  ",
      "     333     ",
    ],
    huqiu: [
      "      1      ",
      "     111     ",
      "    11111    ",
      "     1 1     ",
      "    11111    ",
      "   11 1 11   ",
      "    11111    ",
      "   1111111   ",
      "  11 111 11  ",
      "   1111111   ",
      "    22222    ",
      "     2 2     ",
      "    22222    ",
      "   2222222   ",
    ],
    ruins: [
      "1 1  11 11  1 1 1",
      "111  11 11  11111",
      "1 1 1  1  1 1 1 1",
      "111 1111111 11111",
      "1 1 1 1 1 1 1   1",
      "111 1111111 11111",
      "    11   11      ",
      "    11 1 11      ",
      "    1111111      ",
      "    2222222      ",
      "    2222222      ",
    ],
    osakacastle: [
      "       1       ",
      "      111      ",
      "    1111111    ",
      "   11 111 11   ",
      "     11111     ",
      "   111111111   ",
      "  11  111  11  ",
      "     22222     ",
      "   222222222   ",
      "  22  222  22  ",
      "  22222222222  ",
      " 3333333333333 ",
      "333333333333333",
    ],
    arun: [
      "      1      ",
      "     111     ",
      "    11111    ",
      "    1 1 1    ",
      "   1111111   ",
      "  1 11111 1  ",
      " 11111111111 ",
      "1  1111111  1",
      "1   11111   1",
      "1    222    1",
      "     222     ",
      "    22222    ",
      "   2222222   ",
      "  333   333  ",
    ],
    petronas: [
      "  1        1  ",
      " 111      111 ",
      " 111      111 ",
      " 111      111 ",
      " 111 1111 111 ",
      " 111      111 ",
      " 111      111 ",
      " 111      111 ",
      "11111    11111",
      "11111    11111",
      "11111    11111",
      "22222    22222",
      "22222    22222",
      "33333    33333",
    ],
    gateway: [
      "11111111111111111",
      "1  11       11  1",
      "1 11111   11111 1",
      "1 11  1   1  11 1",
      "1 11  1   1  11 1",
      "1 11111   11111 1",
      "1  11       11  1",
      "1  11       11  1",
      "11111111111111111",
      "222             2",
      "22222222222222222",
    ],
    campanile: [
      "   111   ",
      "  11111  ",
      "  1 1 1  ",
      "  11111  ",
      "   111   ",
      "   111   ",
      "   1 1   ",
      "   111   ",
      "   1 1   ",
      "   111   ",
      "   1 1   ",
      "   111   ",
      "   1 1   ",
      "  11111  ",
      " 2222222 ",
      "222222222",
    ],
    parthenon: [
      "1 1 1 1 1 1 1 1 1",
      "11111111111111111",
      "1 1 1 1 1 1 1 1 1",
      "1 1 1 1 1 1 1 1 1",
      "1 1 1 1 1 1 1 1 1",
      "1 1 1 1 1 1 1 1 1",
      "11111111111111111",
      "22222222222222222",
      "2 2 2 2 2 2 2 2 2",
      "22222222222222222",
    ],
    charles: [
      "  111                 11",
      " 11111               111",
      " 1 1 1              1111",
      " 11111            111111",
      "  111     1  1   11 1 11",
      "  111  111111111111 1 11",
      "  111 11  11  11  111111",
      "  11111   11  11   11111",
      "222222222222222222222222",
    ],
    riesenrad: [
      "      11111      ",
      "   111     111   ",
      "  11  11111  11  ",
      " 11  11   11  11 ",
      " 1  11     11  1 ",
      "11  11     11  11",
      "11  11     11  11",
      " 1  11     11  1 ",
      " 11  11   11  11 ",
      "  11  11111  11  ",
      "   111     111   ",
      "      11111      ",
      "        2        ",
      "       222       ",
      "      22222      ",
    ],
    belem: [
      "      1 1      ",
      "     11111     ",
      "     1 1 1     ",
      "    1111111    ",
      "  1 1111111 1  ",
      " 111 11111 111 ",
      " 1 1 1 1 1 1 1 ",
      " 111 11111 111 ",
      " 1 1 11111 1 1 ",
      "111111111111111",
      "222222222222222",
      "22 2 2 2 2 2 22",
      "222222222222222",
    ],
    spaceneedle: [
      "      1      ",
      "      1      ",
      "     111     ",
      "   1111111   ",
      "  111111111  ",
      "   1111111   ",
      "     111     ",
      "      2      ",
      "      2      ",
      "      2      ",
      "      2      ",
      "     222     ",
      "    2 2 2    ",
      "   2  2  2   ",
      "  2   2   2  ",
      " 22   3   22 ",
    ],
    hollywood: [
      "1 1 111 1   1   1 1 1 111 11  111",
      "1 1 1 1 1   1   1 1 1 1 1 1 1 1 1",
      "111 1 1 1   1    1  1 1 1 1 1 1 1",
      "1 1 1 1 1   1    1  1 1 1 1 1 1 1",
      "1 1 111 111 111  1  111 111 11  111",
      "              2222222              ",
      "            22222222222            ",
      "          222222222222222          ",
    ],
    cntower: [
      "      1      ",
      "      1      ",
      "     111     ",
      "    11111    ",
      "   1111111   ",
      "    11111    ",
      "     111     ",
      "      2      ",
      "      2      ",
      "      2      ",
      "      2      ",
      "      2      ",
      "      2      ",
      "     222     ",
      "    2 2 2    ",
      "   2  3  2   ",
    ],
    sunpyramid: [
      "        1        ",
      "       111       ",
      "      11111      ",
      "      1 1 1      ",
      "     1111111     ",
      "     1 1 1 1     ",
      "    111111111    ",
      "    1 1 1 1 1    ",
      "   11111111111   ",
      "   1 1 1 1 1 1   ",
      "  1111111111111  ",
      " 222222222222222 ",
      "22222222222222222",
    ],
    obelisco: [
      "    1    ",
      "   111   ",
      "   111   ",
      "   1 1   ",
      "   111   ",
      "   1 1   ",
      "   111   ",
      "   1 1   ",
      "   111   ",
      "   1 1   ",
      "   111   ",
      "  11111  ",
      " 2222222 ",
      "222222222",
    ],
    tablemountain: [
      "  11111111111111111  ",
      "  11 11 11 11 11 11  ",
      "  11111111111111111  ",
      "   111111111111111   ",
      "   11 11 11 11 11    ",
      "    1111111111111    ",
      "    111  11  111     ",
      "     2222222222      ",
      "    222222222222     ",
      "   2222      2222    ",
      "  333          333   ",
    ],
    potala: [
      "     11 11  11 11 11     ",
      "    11111111111111111    ",
      "    11 11 11 11 11 11    ",
      "   1111111111111111111   ",
      "   2222222222222222222   ",
      "  22 22 22 22 22 22 22   ",
      "  222222222222222222222  ",
      "  22 22 22 22 22 22 22   ",
      " 33333333333333333333333 ",
      " 33 33 33 33 33 33 33 33 ",
      "3333333333333333333333333",
      "3333333333333333333333333",
    ],
    welcomesign: [
      "   11111111111111111   ",
      "  11               11  ",
      "  11 1 1 111 1   1 11  ",
      "  11 1 1 1   1   1 11  ",
      "  11 1 1 111 1   1 11  ",
      "  11 1 1 1   1   1 11  ",
      "  11 111 111 111 1 11  ",
      "  11               11  ",
      "   11111111111111111   ",
      "          222          ",
      "          222          ",
      "         22222         ",
    ],
    duomo: [
      "        1         1  ",
      "      11111      111 ",
      "    111111111    1 1 ",
      "   11111111111   111 ",
      "    11 111 11    1 1 ",
      "     1111111     111 ",
      "  1111111111111  1 1 ",
      " 11 11 11 11 11  111 ",
      " 111111111111111 1 1 ",
      " 11 11 11 11 11 11111",
      "222222222222222222222",
    ],
  };


  function scaleMask(mask, sx, sy) {
    const out = [];
    for (const row of mask) {
      let r = "";
      for (const ch of row) r += ch.repeat(sx);
      for (let i = 0; i < sy; i++) out.push(r);
    }
    return out;
  }
  // Enlarge older compact masks so window-count and silhouette both get a bump.
  // canton / opera were hand-redrawn at a larger size and must not be doubled.
  const SCALE2 = ["pearl","cctv","spring","bochk","taipei101","tokyo","pagoda","nseoul","sands","burj","pyramid","mosque","colosseum","bigben","canal","tvball","sagrada","stbasil","liberty","goldengate","willis","cristo"];
  for (const k of SCALE2) if (MASKS[k]) MASKS[k] = scaleMask(MASKS[k], 2, 2);

  function maskSize(mask) {
    return { h: mask.length, w: Math.max(...mask.map((r) => r.length)) };
  }

  function fillRound(ctx, x, y, w, h) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, Math.min(6, w * 0.15));
    else ctx.rect(x, y, w, h);
    ctx.fill();
  }
  function tri(ctx, x0, y0, x1, y1, x2, y2) {
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.closePath(); ctx.fill();
  }

  function onion(ctx, x, baseY, r) {
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.bezierCurveTo(x - r * 1.2, baseY - r * 0.05, x - r * 1.15, baseY - r * 1.15, x, baseY - r * 1.95);
    ctx.bezierCurveTo(x + r * 1.15, baseY - r * 1.15, x + r * 1.2, baseY - r * 0.05, x, baseY);
    ctx.closePath();
    ctx.fill();
  }

  // Draw a large, recognizable silhouette. ground is the baseline (street), cx is center x.
  // s is a scale in pixels (height of the monument roughly 1*s to 1.4*s).
  function draw(ctx, type, cx, ground, s, opt) {
    opt = opt || {};
    const wall = opt.wall || "#0a0c14";
    const acc = opt.accent || "#ffd56a";
    const lit = opt.lit == null ? 1 : opt.lit;
    ctx.save();
    ctx.fillStyle = wall;
    ctx.strokeStyle = wall;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const glow = (a) => {
      ctx.save();
      ctx.fillStyle = acc;
      ctx.globalAlpha = Math.max(0, a * lit);
    };
    const endg = () => ctx.restore();

    if (type === "pearl") {
      const shaft = s * 0.07;
      ctx.fillRect(cx - shaft / 2, ground - s, shaft, s);
      const balls = [
        { y: ground - s * 0.18, r: s * 0.16 },
        { y: ground - s * 0.52, r: s * 0.22 },
        { y: ground - s * 0.88, r: s * 0.14 },
      ];
      for (const b of balls) {
        ctx.beginPath(); ctx.arc(cx, b.y, b.r, 0, Math.PI * 2); ctx.fill();
        glow(0.55); ctx.beginPath(); ctx.arc(cx, b.y, b.r * 0.35, 0, Math.PI * 2); ctx.fill(); endg();
      }
      ctx.fillRect(cx - 1, ground - s * 1.12, 2, s * 0.12);
    } else if (type === "cctv") {
      // 大裤衩：错位的回字形，上横挑出、下横连接
      const w = s * 1.05, h = s * 0.78;
      const tw = w * 0.28;
      ctx.fillRect(cx - w / 2, ground - h, tw, h);                 // left tower
      ctx.fillRect(cx + w / 2 - tw, ground - h * 0.82, tw, h * 0.82); // right shorter
      ctx.fillRect(cx - w / 2, ground - h, w * 0.92, h * 0.2);     // top cantilever, hangs past mid
      ctx.fillRect(cx - w / 2 + tw * 0.15, ground - h * 0.28, w * 0.72, h * 0.2); // lower link
      glow(0.35); fillRound(ctx, cx + w * 0.08, ground - h * 0.22, w * 0.18, h * 0.1); endg();
    } else if (type === "canton") {
      // 小蛮腰：头顶椭圆舱、细腰、下半段明显鼓出，再收到底座
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.05, ground - s * 1.02);
      ctx.quadraticCurveTo(cx - s * 0.08, ground - s * 0.82, cx - s * 0.045, ground - s * 0.62); // tight waist
      ctx.quadraticCurveTo(cx - s * 0.28, ground - s * 0.32, cx - s * 0.16, ground);            // wide hip
      ctx.lineTo(cx + s * 0.16, ground);
      ctx.quadraticCurveTo(cx + s * 0.28, ground - s * 0.32, cx + s * 0.045, ground - s * 0.62);
      ctx.quadraticCurveTo(cx + s * 0.08, ground - s * 0.82, cx + s * 0.05, ground - s * 1.02);
      ctx.closePath(); ctx.fill();
      // top capsule
      ctx.beginPath(); ctx.ellipse(cx, ground - s * 1.08, s * 0.11, s * 0.09, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(cx - 1.5, ground - s * 1.28, 3, s * 0.14);
      glow(0.5);
      ctx.beginPath(); ctx.ellipse(cx, ground - s * 1.08, s * 0.045, s * 0.035, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx, ground - s * 0.36, s * 0.07, s * 0.04, 0, 0, Math.PI * 2); ctx.fill();
      endg();
    } else if (type === "spring") {
      // 平安大厦：细高、缓收、三角冠、长针
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.2, ground);
      ctx.lineTo(cx - s * 0.11, ground - s * 0.72);
      ctx.lineTo(cx - s * 0.05, ground - s * 1.02);
      ctx.lineTo(cx, ground - s * 1.28);
      ctx.lineTo(cx + s * 0.05, ground - s * 1.02);
      ctx.lineTo(cx + s * 0.11, ground - s * 0.72);
      ctx.lineTo(cx + s * 0.2, ground);
      ctx.closePath(); ctx.fill();
      // crown facets
      glow(0.4);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.05, ground - s * 1.02);
      ctx.lineTo(cx, ground - s * 1.2);
      ctx.lineTo(cx + s * 0.05, ground - s * 1.02);
      ctx.closePath(); ctx.fill();
      endg();
      ctx.fillRect(cx - 1.2, ground - s * 1.4, 2.4, s * 0.14);
    } else if (type === "bochk") {
      const w = s * 0.55, h = s * 1.05;
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.18, ground);
      ctx.lineTo(cx - w * 0.5, ground - h * 0.5);
      ctx.lineTo(cx - w * 0.08, ground - h);
      ctx.lineTo(cx + w * 0.06, ground - h * 0.7);
      ctx.lineTo(cx + w * 0.22, ground - h * 0.92);
      ctx.lineTo(cx + w * 0.5, ground - h * 0.62);
      ctx.lineTo(cx + w * 0.32, ground);
      ctx.closePath(); ctx.fill();
      glow(0.35);
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.02, ground - h * 0.92);
      ctx.lineTo(cx + w * 0.1, ground - h * 0.7);
      ctx.lineTo(cx + w * 0.02, ground - h * 0.62);
      ctx.closePath(); ctx.fill();
      endg();
    } else if (type === "taipei101") {
      // 八节如意：每节上宽下窄的倒梯形，底座厚，长针
      const podiumH = s * 0.18, podiumW = s * 0.42;
      ctx.fillRect(cx - podiumW / 2, ground - podiumH, podiumW, podiumH);
      let y = ground - podiumH;
      const segs = 8;
      for (let i = 0; i < segs; i++) {
        const h = s * 0.1;
        const bot = s * (0.34 - i * 0.016);
        const top = bot * 1.18;
        y -= h;
        ctx.beginPath();
        ctx.moveTo(cx - bot / 2, y + h);
        ctx.lineTo(cx - top / 2, y + h * 0.12);
        ctx.lineTo(cx - top / 2 + 2, y);
        ctx.lineTo(cx + top / 2 - 2, y);
        ctx.lineTo(cx + top / 2, y + h * 0.12);
        ctx.lineTo(cx + bot / 2, y + h);
        ctx.closePath(); ctx.fill();
      }
      ctx.fillRect(cx - s * 0.04, y - s * 0.06, s * 0.08, s * 0.06);
      ctx.fillRect(cx - 1.6, y - s * 0.28, 3.2, s * 0.22);
      glow(0.5); ctx.fillRect(cx - 2, y - s * 0.34, 4, 5); endg();
    } else if (type === "tokyo") {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.32, ground);
      ctx.lineTo(cx - s * 0.08, ground - s * 0.62);
      ctx.lineTo(cx - s * 0.06, ground - s * 0.62);
      ctx.lineTo(cx - s * 0.22, ground);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.32, ground);
      ctx.lineTo(cx + s * 0.08, ground - s * 0.62);
      ctx.lineTo(cx + s * 0.06, ground - s * 0.62);
      ctx.lineTo(cx + s * 0.22, ground);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(cx - s * 0.16, ground - s * 0.66, s * 0.32, s * 0.07);
      ctx.fillRect(cx - s * 0.1, ground - s * 0.84, s * 0.2, s * 0.06);
      ctx.fillRect(cx - 2, ground - s * 1.08, 4, s * 0.24);
      glow(0.55); ctx.fillRect(cx - 3, ground - s * 1.14, 6, 5); endg();
    } else if (type === "pagoda") {
      for (let i = 0; i < 5; i++) {
        const y = ground - s * 0.16 * (i + 1);
        const w = s * (0.7 - i * 0.1);
        tri(ctx, cx - w / 2, y + s * 0.08, cx, y - s * 0.04, cx + w / 2, y + s * 0.08);
        ctx.fillRect(cx - s * 0.08, y, s * 0.16, s * 0.12);
      }
      glow(0.4); ctx.fillRect(cx - 1.5, ground - s * 1.02, 3, 5); endg();
    } else if (type === "nseoul") {
      // N首尔塔：下粗上细的瓶状塔身 + 扁飞碟观景层，不要做成柏林那样的圆球
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.13, ground);
      ctx.lineTo(cx - s * 0.06, ground - s * 0.7);
      ctx.lineTo(cx + s * 0.06, ground - s * 0.7);
      ctx.lineTo(cx + s * 0.13, ground);
      ctx.closePath(); ctx.fill();
      // mushroom decks
      ctx.beginPath();
      ctx.ellipse(cx, ground - s * 0.78, s * 0.2, s * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx, ground - s * 0.88, s * 0.15, s * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - s * 0.04, ground - s * 1.08, s * 0.08, s * 0.14);
      ctx.fillRect(cx - 1.5, ground - s * 1.22, 3, s * 0.14);
      glow(0.45);
      ctx.beginPath();
      ctx.ellipse(cx, ground - s * 0.88, s * 0.07, s * 0.035, 0, 0, Math.PI * 2);
      ctx.fill();
      endg();
    } else if (type === "sands") {
      const tw = s * 0.12, gap = s * 0.2;
      for (let i = -1; i <= 1; i++) {
        ctx.fillRect(cx + i * (tw + gap) - tw / 2, ground - s * 0.72, tw, s * 0.72);
      }
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.55, ground - s * 0.72);
      ctx.quadraticCurveTo(cx - s * 0.1, ground - s * 1.05, cx + s * 0.62, ground - s * 0.78);
      ctx.lineTo(cx + s * 0.62, ground - s * 0.68);
      ctx.lineTo(cx + s * 0.5, ground - s * 0.64);
      ctx.quadraticCurveTo(cx, ground - s * 0.86, cx - s * 0.5, ground - s * 0.64);
      ctx.closePath(); ctx.fill();
      glow(0.4); fillRound(ctx, cx - s * 0.18, ground - s * 0.92, s * 0.4, s * 0.07); endg();
    } else if (type === "opera") {
      // overlapping pointed shells (sails), not rounded hills
      const sails = [
        { x: -0.38, w: 0.42, h: 0.42 },
        { x: -0.14, w: 0.48, h: 0.62 },
        { x: 0.12, w: 0.5, h: 0.82 },
        { x: 0.38, w: 0.36, h: 0.5 },
      ];
      ctx.fillRect(cx - s * 0.62, ground - s * 0.08, s * 1.2, s * 0.08);
      for (const sh of sails) {
        const x = cx + sh.x * s;
        ctx.beginPath();
        ctx.moveTo(x - sh.w * s * 0.15, ground - s * 0.06);
        ctx.quadraticCurveTo(x - sh.w * s * 0.02, ground - sh.h * s * 0.55, x + sh.w * s * 0.08, ground - sh.h * s);
        ctx.quadraticCurveTo(x + sh.w * s * 0.62, ground - sh.h * s * 0.4, x + sh.w * s * 0.45, ground - s * 0.06);
        ctx.closePath(); ctx.fill();
      }
      glow(0.28);
      const sh = sails[2];
      const x = cx + sh.x * s;
      ctx.beginPath();
      ctx.moveTo(x + sh.w * s * 0.02, ground - s * 0.1);
      ctx.quadraticCurveTo(x + sh.w * s * 0.1, ground - sh.h * s * 0.5, x + sh.w * s * 0.12, ground - sh.h * s * 0.85);
      ctx.quadraticCurveTo(x + sh.w * s * 0.4, ground - sh.h * s * 0.4, x + sh.w * s * 0.32, ground - s * 0.1);
      ctx.fill();
      endg();
    } else if (type === "burj") {
      // 哈利法塔：分段收进的阶梯轮廓 + 长针，不要光滑三角
      const profile = [
        [0, 0.22], [0.18, 0.22], [0.18, 0.18], [0.34, 0.18], [0.34, 0.15],
        [0.5, 0.15], [0.5, 0.12], [0.66, 0.12], [0.66, 0.09], [0.82, 0.09],
        [0.82, 0.06], [1.02, 0.045], [1.02, 0.03], [1.22, 0.0],
      ];
      ctx.beginPath();
      ctx.moveTo(cx, ground);
      for (const [yy, half] of profile) ctx.lineTo(cx - s * half, ground - s * yy);
      for (let i = profile.length - 1; i >= 0; i--) {
        const [yy, half] = profile[i];
        ctx.lineTo(cx + s * half, ground - s * yy);
      }
      ctx.closePath(); ctx.fill();
      // a slight side setback wing
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.02, ground - s * 0.15);
      ctx.lineTo(cx + s * 0.2, ground - s * 0.15);
      ctx.lineTo(cx + s * 0.2, ground - s * 0.28);
      ctx.lineTo(cx + s * 0.12, ground - s * 0.28);
      ctx.lineTo(cx + s * 0.12, ground - s * 0.48);
      ctx.lineTo(cx + s * 0.04, ground - s * 0.48);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(cx - 1.2, ground - s * 1.4, 2.4, s * 0.2);
      glow(0.5); ctx.fillRect(cx - 1.6, ground - s * 1.46, 3.2, 5); endg();
    } else if (type === "pyramid") {
      tri(ctx, cx - s * 0.55, ground, cx, ground - s * 0.72, cx + s * 0.55, ground);
      ctx.globalAlpha *= 0.7;
      tri(ctx, cx + s * 0.28, ground, cx + s * 0.55, ground - s * 0.4, cx + s * 0.82, ground);
      ctx.globalAlpha = 1;
      glow(0.25); tri(ctx, cx - s * 0.08, ground - s * 0.5, cx, ground - s * 0.66, cx + s * 0.08, ground - s * 0.5); endg();
    } else if (type === "mosque") {
      // 蓝色清真寺：层层半圆顶 + 六座尖塔
      ctx.fillRect(cx - s * 0.42, ground - s * 0.32, s * 0.84, s * 0.32);
      ctx.beginPath(); ctx.arc(cx, ground - s * 0.32, s * 0.28, Math.PI, 0); ctx.fill();
      for (const dx of [-0.38, 0.38]) {
        ctx.beginPath(); ctx.arc(cx + dx * s, ground - s * 0.28, s * 0.14, Math.PI, 0); ctx.fill();
      }
      for (const dx of [-0.22, 0.22]) {
        ctx.beginPath(); ctx.arc(cx + dx * s * 0.2, ground - s * 0.32, s * 0.1, Math.PI, 0); ctx.fill();
      }
      ctx.fillRect(cx - 2, ground - s * 0.72, 4, s * 0.12);
      glow(0.45); ctx.beginPath(); ctx.arc(cx, ground - s * 0.76, 4, 0, Math.PI * 2); ctx.fill(); endg();
      const minarets = [-0.7, -0.52, -0.34, 0.34, 0.52, 0.7];
      minarets.forEach((dx, i) => {
        const h = s * (0.72 + (i === 0 || i === 5 ? 0.12 : 0));
        ctx.fillRect(cx + dx * s - 3, ground - h, 6, h);
        ctx.fillRect(cx + dx * s - 5, ground - h * 0.55, 10, 4);
        ctx.fillRect(cx + dx * s - 5, ground - h * 0.8, 10, 4);
        ctx.beginPath();
        ctx.moveTo(cx + dx * s - 5, ground - h);
        ctx.lineTo(cx + dx * s, ground - h - s * 0.14);
        ctx.lineTo(cx + dx * s + 5, ground - h);
        ctx.fill();
      });
    } else if (type === "colosseum") {
      // 站立的椭圆墙，三层拱门；右侧上沿塌了一截，不是侧面被咬一口
      const w = s * 1.08, h = s * 0.88;
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.48, ground - h * 0.12);
      ctx.quadraticCurveTo(cx - w * 0.54, ground - h * 0.5, cx - w * 0.4, ground - h);
      ctx.lineTo(cx + w * 0.08, ground - h);
      ctx.lineTo(cx + w * 0.14, ground - h * 0.78);
      ctx.lineTo(cx + w * 0.3, ground - h * 0.74);
      ctx.lineTo(cx + w * 0.38, ground - h * 0.52);
      ctx.quadraticCurveTo(cx + w * 0.52, ground - h * 0.28, cx + w * 0.46, ground - h * 0.1);
      ctx.quadraticCurveTo(cx, ground + h * 0.04, cx - w * 0.48, ground - h * 0.12);
      ctx.closePath(); ctx.fill();
      glow(0.28);
      for (let row = 0; row < 3; row++) {
        const colsN = 7;
        for (let i = 0; i < colsN; i++) {
          const ax = cx - w * 0.34 + i * (w * 0.11);
          const ay = ground - h * 0.22 - row * (h * 0.2);
          if (row === 2 && ax > cx + w * 0.08) continue;
          if (row === 1 && ax > cx + w * 0.28) continue;
          ctx.beginPath();
          ctx.moveTo(ax - w * 0.032, ay);
          ctx.lineTo(ax - w * 0.032, ay - h * 0.09);
          ctx.arc(ax, ay - h * 0.09, w * 0.032, Math.PI, 0);
          ctx.lineTo(ax + w * 0.032, ay);
          ctx.closePath(); ctx.fill();
        }
      }
      endg();
    } else if (type === "eiffel") {
      // 宽腿、腿间拱门、两层平台、细尖顶 —— 和东京塔区分开
      const arch = () => {
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.46, ground);
        ctx.lineTo(cx - s * 0.14, ground - s * 0.46);
        ctx.lineTo(cx - s * 0.22, ground - s * 0.46);
        ctx.quadraticCurveTo(cx, ground - s * 0.22, cx + s * 0.22, ground - s * 0.46);
        ctx.lineTo(cx + s * 0.14, ground - s * 0.46);
        ctx.lineTo(cx + s * 0.46, ground);
        ctx.lineTo(cx + s * 0.34, ground);
        ctx.quadraticCurveTo(cx, ground - s * 0.34, cx - s * 0.34, ground);
        ctx.closePath(); ctx.fill();
      };
      arch();
      // mid to top
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.16, ground - s * 0.46);
      ctx.lineTo(cx - s * 0.07, ground - s * 0.82);
      ctx.lineTo(cx + s * 0.07, ground - s * 0.82);
      ctx.lineTo(cx + s * 0.16, ground - s * 0.46);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(cx - s * 0.2, ground - s * 0.5, s * 0.4, s * 0.07); // first deck
      ctx.fillRect(cx - s * 0.1, ground - s * 0.86, s * 0.2, s * 0.055); // second deck
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.06, ground - s * 0.86);
      ctx.lineTo(cx - s * 0.015, ground - s * 1.18);
      ctx.lineTo(cx + s * 0.015, ground - s * 1.18);
      ctx.lineTo(cx + s * 0.06, ground - s * 0.86);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(cx - 1.4, ground - s * 1.32, 2.8, s * 0.14);
      glow(0.5); ctx.fillRect(cx - 2.5, ground - s * 1.36, 5, 5); endg();
    } else if (type === "bigben") {
      const w = s * 0.28;
      ctx.fillRect(cx - w / 2, ground - s * 0.85, w, s * 0.85);
      ctx.fillRect(cx - w * 0.62, ground - s * 0.18, w * 1.24, s * 0.18);
      ctx.fillRect(cx - w * 0.62, ground - s * 0.95, w * 1.24, s * 0.22);
      glow(0.7);
      ctx.beginPath(); ctx.arc(cx, ground - s * 0.84, w * 0.38, 0, Math.PI * 2); ctx.fill();
      endg();
      ctx.fillStyle = wall;
      ctx.strokeStyle = wall;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, ground - s * 0.84); ctx.lineTo(cx, ground - s * 0.94); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, ground - s * 0.84); ctx.lineTo(cx + w * 0.2, ground - s * 0.84); ctx.stroke();
      ctx.fillStyle = wall;
      tri(ctx, cx - 6, ground - s * 0.95, cx, ground - s * 1.12, cx + 6, ground - s * 0.95);
    } else if (type === "canal") {
      const houses = [-0.42, -0.14, 0.14, 0.42];
      const hs = [0.55, 0.7, 0.5, 0.62];
      const gable = ["step", "bell", "step", "point"];
      houses.forEach((dx, i) => {
        const x = cx + dx * s, h = hs[i] * s, w = s * 0.22;
        ctx.fillRect(x - w / 2, ground - h, w, h);
        if (gable[i] === "step") {
          ctx.fillRect(x - w * 0.35, ground - h - s * 0.06, w * 0.7, s * 0.06);
          ctx.fillRect(x - w * 0.2, ground - h - s * 0.12, w * 0.4, s * 0.06);
          ctx.fillRect(x - w * 0.08, ground - h - s * 0.18, w * 0.16, s * 0.06);
        } else if (gable[i] === "bell") {
          ctx.beginPath();
          ctx.moveTo(x - w / 2, ground - h);
          ctx.quadraticCurveTo(x - w * 0.15, ground - h - s * 0.16, x, ground - h - s * 0.2);
          ctx.quadraticCurveTo(x + w * 0.15, ground - h - s * 0.16, x + w / 2, ground - h);
          ctx.closePath(); ctx.fill();
        } else {
          tri(ctx, x - w / 2 - 2, ground - h, x, ground - h - s * 0.16, x + w / 2 + 2, ground - h);
        }
        glow(0.3);
        for (let r = 0; r < 3; r++) {
          ctx.fillRect(x - w * 0.25, ground - h + 8 + r * 12, 5, 6);
          ctx.fillRect(x + w * 0.05, ground - h + 8 + r * 12, 5, 6);
        }
        endg();
        ctx.fillStyle = wall;
      });
    } else if (type === "tvball") {
      ctx.fillRect(cx - s * 0.05, ground - s * 0.7, s * 0.1, s * 0.7);
      ctx.beginPath(); ctx.arc(cx, ground - s * 0.82, s * 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(cx - s * 0.09, ground - s * 0.72, s * 0.18, s * 0.05);
      ctx.fillRect(cx - 2, ground - s * 1.15, 4, s * 0.14);
      glow(0.55); ctx.beginPath(); ctx.arc(cx, ground - s * 0.82, s * 0.07, 0, Math.PI * 2); ctx.fill(); endg();
    } else if (type === "sagrada") {
      // 四座簇拥的细长塔，顶略圆、高低错落
      const tips = [
        { x: -0.36, h: 0.92, w: 0.13 },
        { x: -0.12, h: 1.18, w: 0.14 },
        { x: 0.12, h: 1.1, w: 0.14 },
        { x: 0.36, h: 0.88, w: 0.13 },
      ];
      ctx.fillRect(cx - s * 0.5, ground - s * 0.28, s * 1.0, s * 0.28);
      tips.forEach((tp) => {
        const x = cx + tp.x * s, h = tp.h * s, w = tp.w * s;
        ctx.beginPath();
        ctx.moveTo(x - w * 0.55, ground - s * 0.24);
        ctx.lineTo(x - w * 0.28, ground - h * 0.7);
        ctx.quadraticCurveTo(x, ground - h - s * 0.02, x + w * 0.28, ground - h * 0.7);
        ctx.lineTo(x + w * 0.55, ground - s * 0.24);
        ctx.closePath(); ctx.fill();
        // texture holes
        glow(0.25);
        for (let k = 0; k < 4; k++) {
          ctx.beginPath();
          ctx.ellipse(x, ground - h * (0.35 + k * 0.14), w * 0.12, w * 0.18, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        endg();
        ctx.fillStyle = wall;
        glow(0.4); ctx.beginPath(); ctx.arc(x, ground - h, 3.5, 0, Math.PI * 2); ctx.fill(); endg();
        ctx.fillStyle = wall;
      });
    } else if (type === "stbasil") {
      const domes = [
        { x: 0, h: 0.62, r: 0.16, drum: 0.22 },
        { x: -0.3, h: 0.5, r: 0.12, drum: 0.16 },
        { x: 0.3, h: 0.48, r: 0.12, drum: 0.16 },
        { x: -0.52, h: 0.38, r: 0.1, drum: 0.13 },
        { x: 0.52, h: 0.36, r: 0.1, drum: 0.13 },
      ];
      ctx.fillRect(cx - s * 0.58, ground - s * 0.28, s * 1.16, s * 0.28);
      for (const d of domes) {
        const x = cx + d.x * s;
        const drumTop = ground - s * d.h;
        ctx.fillRect(x - s * d.r * 0.55, drumTop, s * d.r * 1.1, s * d.drum);
        onion(ctx, x, drumTop, s * d.r);
        ctx.fillRect(x - 1.2, drumTop - s * d.r * 1.95 - 8, 2.4, 10);
        glow(0.45);
        onion(ctx, x, drumTop - s * d.r * 0.15, s * d.r * 0.42);
        endg();
        ctx.fillStyle = wall;
      }
    } else if (type === "liberty") {
      // 基座 + 袍摆 + 高举火炬 + 七叉皇冠 + 石板
      const pedH = s * 0.22, pedW = s * 0.42;
      ctx.fillRect(cx - pedW / 2, ground - pedH, pedW, pedH);
      ctx.fillRect(cx - pedW * 0.38, ground - pedH - s * 0.06, pedW * 0.76, s * 0.06);
      // robe
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.16, ground - pedH);
      ctx.lineTo(cx - s * 0.12, ground - pedH - s * 0.4);
      ctx.lineTo(cx - s * 0.07, ground - pedH - s * 0.62);
      ctx.lineTo(cx + s * 0.08, ground - pedH - s * 0.62);
      ctx.lineTo(cx + s * 0.14, ground - pedH - s * 0.4);
      ctx.lineTo(cx + s * 0.18, ground - pedH);
      ctx.closePath(); ctx.fill();
      // tablet (left)
      ctx.save();
      ctx.translate(cx - s * 0.16, ground - pedH - s * 0.42);
      ctx.rotate(-0.2);
      ctx.fillRect(-s * 0.02, 0, s * 0.12, s * 0.18);
      ctx.restore();
      // raised torch arm
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.04, ground - pedH - s * 0.58);
      ctx.lineTo(cx + s * 0.22, ground - pedH - s * 0.88);
      ctx.lineTo(cx + s * 0.16, ground - pedH - s * 0.92);
      ctx.lineTo(cx + s * 0.0, ground - pedH - s * 0.6);
      ctx.closePath(); ctx.fill();
      // torch + flame
      ctx.fillRect(cx + s * 0.16, ground - pedH - s * 0.96, s * 0.06, s * 0.08);
      glow(0.8);
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.13, ground - pedH - s * 0.96);
      ctx.quadraticCurveTo(cx + s * 0.19, ground - pedH - s * 1.14, cx + s * 0.25, ground - pedH - s * 0.96);
      ctx.closePath(); ctx.fill();
      endg();
      ctx.fillStyle = wall;
      // head
      const hy = ground - pedH - s * 0.72;
      ctx.beginPath(); ctx.arc(cx, hy, s * 0.07, 0, Math.PI * 2); ctx.fill();
      // 7 crown spikes
      for (let i = -3; i <= 3; i++) {
        const a = -Math.PI / 2 + i * 0.32;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a - 0.12) * s * 0.06, hy + Math.sin(a - 0.12) * s * 0.06);
        ctx.lineTo(cx + Math.cos(a) * s * 0.16, hy + Math.sin(a) * s * 0.16);
        ctx.lineTo(cx + Math.cos(a + 0.12) * s * 0.06, hy + Math.sin(a + 0.12) * s * 0.06);
        ctx.closePath(); ctx.fill();
      }
    } else if (type === "goldengate") {
      const half = s * 0.55, tw = s * 0.07;
      ctx.fillRect(cx - half - tw / 2, ground - s * 0.85, tw, s * 0.85);
      ctx.fillRect(cx + half - tw / 2, ground - s * 0.85, tw, s * 0.85);
      // tower portals
      glow(0.2);
      ctx.fillRect(cx - half - tw * 0.15, ground - s * 0.7, tw * 0.3, s * 0.16);
      ctx.fillRect(cx + half - tw * 0.15, ground - s * 0.7, tw * 0.3, s * 0.16);
      endg();
      ctx.fillStyle = wall;
      ctx.fillRect(cx - half - s * 0.12, ground - s * 0.42, half * 2 + s * 0.24, s * 0.05);
      ctx.strokeStyle = wall;
      ctx.lineWidth = Math.max(2, s * 0.03);
      ctx.beginPath();
      ctx.moveTo(cx - half, ground - s * 0.85);
      ctx.quadraticCurveTo(cx, ground - s * 0.28, cx + half, ground - s * 0.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - half, ground - s * 0.78);
      ctx.quadraticCurveTo(cx, ground - s * 0.36, cx + half, ground - s * 0.78);
      ctx.stroke();
      glow(0.35); ctx.fillRect(cx - half - 3, ground - s * 0.9, 6, 4); ctx.fillRect(cx + half - 3, ground - s * 0.9, 6, 4); endg();
    } else if (type === "willis") {
      const bands = [0.22, 0.28, 0.36, 0.46];
      let y = ground;
      for (let i = bands.length - 1; i >= 0; i--) {
        const h = s * (0.18 + i * 0.02);
        y -= h;
        ctx.fillRect(cx - s * bands[i] / 2, y, s * bands[i], h + 1);
      }
      ctx.fillRect(cx - s * 0.08, ground - s * 1.18, 3, s * 0.16);
      ctx.fillRect(cx + s * 0.05, ground - s * 1.14, 3, s * 0.12);
      glow(0.45); ctx.fillRect(cx - s * 0.08, ground - s * 1.22, 3, 4); endg();
    } else if (type === "cristo") {
      // 基督像：袍摆更宽，双臂平举略斜，头和袖分开
      const pedH = s * 0.16;
      ctx.fillRect(cx - s * 0.18, ground - pedH, s * 0.36, pedH);
      // robe
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.16, ground - pedH);
      ctx.lineTo(cx - s * 0.07, ground - pedH - s * 0.5);
      ctx.lineTo(cx + s * 0.07, ground - pedH - s * 0.5);
      ctx.lineTo(cx + s * 0.16, ground - pedH);
      ctx.closePath(); ctx.fill();
      // arms with sleeves
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.08, ground - pedH - s * 0.52);
      ctx.lineTo(cx - s * 0.56, ground - pedH - s * 0.6);
      ctx.lineTo(cx - s * 0.56, ground - pedH - s * 0.52);
      ctx.lineTo(cx - s * 0.08, ground - pedH - s * 0.44);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.08, ground - pedH - s * 0.52);
      ctx.lineTo(cx + s * 0.56, ground - pedH - s * 0.6);
      ctx.lineTo(cx + s * 0.56, ground - pedH - s * 0.52);
      ctx.lineTo(cx + s * 0.08, ground - pedH - s * 0.44);
      ctx.closePath(); ctx.fill();
      // head
      ctx.beginPath(); ctx.arc(cx, ground - pedH - s * 0.62, s * 0.075, 0, Math.PI * 2); ctx.fill();
      glow(0.4); ctx.beginPath(); ctx.arc(cx, ground - pedH - s * 0.62, s * 0.03, 0, Math.PI * 2); ctx.fill(); endg();

    } else if (type === "leifeng") {
      for (let i = 0; i < 5; i++) {
        const y = ground - s * 0.16 * (i + 1);
        const w = s * (0.62 - i * 0.07);
        tri(ctx, cx - w / 2, y + s * 0.07, cx, y - s * 0.03, cx + w / 2, y + s * 0.07);
        ctx.fillRect(cx - s * 0.09, y, s * 0.18, s * 0.11);
      }
      ctx.fillRect(cx - s * 0.18, ground - s * 0.08, s * 0.36, s * 0.08);
      glow(0.4); ctx.fillRect(cx - 1.5, ground - s * 0.96, 3, 5); endg();
    } else if (type === "wildgoose") {
      const w = s * 0.42, h = s * 1.05;
      ctx.fillRect(cx - w / 2, ground - h, w, h);
      for (let i = 0; i < 7; i++) {
        const y = ground - h + (i + 0.25) * (h / 7);
        ctx.fillStyle = acc; ctx.globalAlpha = 0.18 * lit;
        ctx.fillRect(cx - w * 0.38, y, w * 0.76, h / 14);
        ctx.globalAlpha = 1; ctx.fillStyle = wall;
      }
      ctx.fillRect(cx - w * 0.62, ground - s * 0.1, w * 1.24, s * 0.1);
    } else if (type === "hongya") {
      const layers = 6;
      for (let i = 0; i < layers; i++) {
        const y = ground - s * 0.12 * (i + 1);
        const w = s * (1.15 - i * 0.08);
        ctx.fillRect(cx - w / 2, y, w, s * 0.1);
        ctx.fillRect(cx - w / 2 - s * 0.03, y - s * 0.03, w + s * 0.06, s * 0.03);
      }
      glow(0.35);
      for (let i = 0; i < 5; i++) ctx.fillRect(cx - s * 0.4 + i * s * 0.18, ground - s * 0.55, s * 0.06, s * 0.04);
      endg();
    } else if (type === "zhonghuamen") {
      const w = s * 1.15, h = s * 0.7;
      ctx.fillRect(cx - w / 2, ground - h, w, h);
      for (let i = -1; i <= 1; i++) {
        ctx.fillStyle = "#0a0c14";
        ctx.beginPath();
        ctx.moveTo(cx + i * w * 0.28 - s * 0.08, ground);
        ctx.quadraticCurveTo(cx + i * w * 0.28, ground - h * 0.55, cx + i * w * 0.28 + s * 0.08, ground);
        ctx.fill();
      }
      ctx.fillStyle = wall;
      ctx.fillRect(cx - w / 2, ground - h - s * 0.08, w, s * 0.08);
      for (let i = -1; i <= 1; i++) ctx.fillRect(cx + i * w * 0.28 - s * 0.04, ground - h - s * 0.22, s * 0.08, s * 0.16);
    } else if (type === "yellowcrane") {
      for (let i = 0; i < 5; i++) {
        const y = ground - s * 0.15 * (i + 1);
        const w = s * (0.85 - i * 0.08);
        tri(ctx, cx - w / 2, y + s * 0.08, cx, y - s * 0.02, cx + w / 2, y + s * 0.08);
        ctx.fillRect(cx - s * 0.1, y, s * 0.2, s * 0.1);
      }
      // upturned corners
      ctx.fillRect(cx - s * 0.48, ground - s * 0.22, s * 0.1, s * 0.03);
      ctx.fillRect(cx + s * 0.38, ground - s * 0.22, s * 0.1, s * 0.03);
      glow(0.4); ctx.fillRect(cx - 1.5, ground - s * 0.92, 3, 5); endg();
    } else if (type === "huqiu") {
      for (let i = 0; i < 7; i++) {
        const y = ground - s * 0.12 * (i + 1);
        const w = s * (0.55 - i * 0.04);
        const tilt = i * s * 0.012;
        tri(ctx, cx - w / 2 + tilt, y + s * 0.06, cx + tilt, y - s * 0.03, cx + w / 2 + tilt, y + s * 0.06);
        ctx.fillRect(cx - s * 0.07 + tilt, y, s * 0.14, s * 0.08);
      }
    } else if (type === "ruins") {
      const w = s * 0.95, h = s * 0.72;
      ctx.fillRect(cx - w / 2, ground - h * 0.35, w, h * 0.35);
      // pediment with triangular gable and niches
      ctx.beginPath();
      ctx.moveTo(cx - w / 2, ground - h * 0.35);
      ctx.lineTo(cx, ground - h);
      ctx.lineTo(cx + w / 2, ground - h * 0.35);
      ctx.closePath(); ctx.fill();
      glow(0.25);
      for (let i = -2; i <= 2; i++) {
        ctx.fillRect(cx + i * s * 0.15 - s * 0.04, ground - h * 0.32, s * 0.08, h * 0.22);
      }
      endg();
    } else if (type === "osakacastle") {
      for (let i = 0; i < 5; i++) {
        const y = ground - s * 0.14 * (i + 1) - s * 0.12;
        const w = s * (0.85 - i * 0.12);
        ctx.fillRect(cx - w / 2, y, w, s * 0.1);
        tri(ctx, cx - w / 2 - s * 0.04, y, cx - w / 2, y - s * 0.05, cx - w / 2 + s * 0.08, y);
        tri(ctx, cx + w / 2 + s * 0.04, y, cx + w / 2, y - s * 0.05, cx + w / 2 - s * 0.08, y);
      }
      ctx.fillRect(cx - s * 0.5, ground - s * 0.14, s, s * 0.14);
      glow(0.35); ctx.fillRect(cx - 2, ground - s * 0.92, 4, 5); endg();
    } else if (type === "arun") {
      const prangs = [{ x: 0, h: 1.15, w: 0.22 }, { x: -0.38, h: 0.62, w: 0.14 }, { x: 0.38, h: 0.62, w: 0.14 }];
      for (const p of prangs) {
        ctx.beginPath();
        ctx.moveTo(cx + p.x * s - p.w * s, ground);
        ctx.lineTo(cx + p.x * s - p.w * s * 0.45, ground - p.h * s * 0.55);
        ctx.lineTo(cx + p.x * s, ground - p.h * s);
        ctx.lineTo(cx + p.x * s + p.w * s * 0.45, ground - p.h * s * 0.55);
        ctx.lineTo(cx + p.x * s + p.w * s, ground);
        ctx.closePath(); ctx.fill();
      }
      glow(0.35); ctx.fillRect(cx - 2, ground - s * 1.18, 4, 5); endg();
    } else if (type === "petronas") {
      const gap = s * 0.22, tw = s * 0.2, h = s * 1.15;
      for (const sign of [-1, 1]) {
        const x = cx + sign * (gap / 2 + tw / 2);
        ctx.beginPath();
        ctx.moveTo(x - tw / 2, ground);
        ctx.lineTo(x - tw * 0.28, ground - h * 0.72);
        ctx.lineTo(x, ground - h);
        ctx.lineTo(x + tw * 0.28, ground - h * 0.72);
        ctx.lineTo(x + tw / 2, ground);
        ctx.closePath(); ctx.fill();
      }
      ctx.fillRect(cx - gap / 2 - tw * 0.1, ground - h * 0.62, gap + tw * 0.2, s * 0.06);
      glow(0.4); ctx.fillRect(cx - gap / 2 - tw * 0.15, ground - h - 2, 3, 4); ctx.fillRect(cx + gap / 2 + tw * 0.15 - 3, ground - h - 2, 3, 4); endg();
    } else if (type === "gateway") {
      const w = s * 1.05, h = s * 0.72;
      ctx.fillRect(cx - w / 2, ground - h, w, h);
      ctx.fillStyle = "#0a0c14";
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.22, ground);
      ctx.quadraticCurveTo(cx, ground - h * 0.85, cx + w * 0.22, ground);
      ctx.fill();
      ctx.fillRect(cx - w * 0.42, ground - h * 0.55, w * 0.12, h * 0.4);
      ctx.fillRect(cx + w * 0.3, ground - h * 0.55, w * 0.12, h * 0.4);
      ctx.fillStyle = wall;
      ctx.fillRect(cx - w / 2, ground - h - s * 0.06, w, s * 0.06);
      for (let i = -1; i <= 1; i++) ctx.fillRect(cx + i * w * 0.28 - 2, ground - h - s * 0.16, 4, s * 0.12);
    } else if (type === "campanile") {
      const w = s * 0.22, h = s * 1.15;
      ctx.fillRect(cx - w / 2, ground - h, w, h);
      ctx.fillRect(cx - w * 0.85, ground - h - s * 0.08, w * 1.7, s * 0.1);
      ctx.fillRect(cx - w * 0.55, ground - h - s * 0.2, w * 1.1, s * 0.12);
      ctx.fillRect(cx - 2, ground - h - s * 0.36, 4, s * 0.16);
      glow(0.4); ctx.fillRect(cx - 3, ground - h * 0.45, 6, 5); endg();
    } else if (type === "parthenon") {
      const w = s * 1.15, h = s * 0.55;
      ctx.beginPath();
      ctx.moveTo(cx - w / 2 - s * 0.04, ground - h);
      ctx.lineTo(cx, ground - h - s * 0.16);
      ctx.lineTo(cx + w / 2 + s * 0.04, ground - h);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(cx - w / 2, ground - h, w, s * 0.06);
      for (let i = 0; i < 8; i++) {
        const x = cx - w / 2 + s * 0.06 + i * (w - s * 0.12) / 7;
        ctx.fillRect(x, ground - h + s * 0.06, s * 0.07, h - s * 0.14);
      }
      ctx.fillRect(cx - w / 2, ground - s * 0.08, w, s * 0.08);
    } else if (type === "charles") {
      ctx.fillRect(cx - s * 0.7, ground - s * 0.1, s * 1.4, s * 0.1);
      // left tower taller
      ctx.fillRect(cx - s * 0.62, ground - s * 0.72, s * 0.2, s * 0.72);
      ctx.fillRect(cx - s * 0.66, ground - s * 0.8, s * 0.28, s * 0.1);
      ctx.fillRect(cx + s * 0.38, ground - s * 0.52, s * 0.22, s * 0.52);
      ctx.fillRect(cx + s * 0.34, ground - s * 0.6, s * 0.3, s * 0.1);
      ctx.strokeStyle = wall; ctx.lineWidth = Math.max(2, s * 0.04);
      ctx.beginPath(); ctx.moveTo(cx - s * 0.42, ground - s * 0.22); ctx.lineTo(cx + s * 0.38, ground - s * 0.22); ctx.stroke();
      glow(0.3); ctx.fillRect(cx - s * 0.54, ground - s * 0.86, 4, 4); endg();
    } else if (type === "riesenrad") {
      ctx.strokeStyle = wall; ctx.lineWidth = Math.max(3, s * 0.05);
      ctx.beginPath(); ctx.arc(cx, ground - s * 0.62, s * 0.55, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, ground - s * 0.62, s * 0.32, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, ground - s * 0.62);
        ctx.lineTo(cx + Math.cos(a) * s * 0.55, ground - s * 0.62 + Math.sin(a) * s * 0.55);
        ctx.stroke();
        ctx.fillStyle = wall;
        ctx.fillRect(cx + Math.cos(a) * s * 0.55 - s * 0.05, ground - s * 0.62 + Math.sin(a) * s * 0.55 - s * 0.035, s * 0.1, s * 0.07);
      }
      ctx.fillStyle = wall;
      ctx.fillRect(cx - s * 0.06, ground - s * 0.2, s * 0.12, s * 0.2);
    } else if (type === "belem") {
      const w = s * 0.42, h = s * 0.85;
      ctx.fillRect(cx - w / 2, ground - h * 0.7, w, h * 0.7);
      ctx.fillRect(cx - w * 0.7, ground - h * 0.45, w * 0.22, h * 0.45);
      ctx.fillRect(cx + w * 0.48, ground - h * 0.45, w * 0.22, h * 0.45);
      ctx.fillRect(cx - w * 0.22, ground - h, w * 0.44, h * 0.32);
      ctx.fillRect(cx - 2, ground - h - s * 0.12, 4, s * 0.12);
      glow(0.3); ctx.fillRect(cx - w * 0.12, ground - h * 0.55, w * 0.24, s * 0.06); endg();
    } else if (type === "spaceneedle") {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.22, ground);
      ctx.lineTo(cx - s * 0.04, ground - s * 0.7);
      ctx.lineTo(cx + s * 0.04, ground - s * 0.7);
      ctx.lineTo(cx + s * 0.22, ground);
      ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx, ground - s * 0.82, s * 0.22, s * 0.1, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(cx - 2, ground - s * 1.18, 4, s * 0.22);
      glow(0.45); ctx.beginPath(); ctx.ellipse(cx, ground - s * 0.82, s * 0.1, s * 0.04, 0, 0, Math.PI * 2); ctx.fill(); endg();
    } else if (type === "hollywood") {
      const letters = "HOLLYWOOD";
      const w = s * 1.35, h = s * 0.28;
      ctx.beginPath();
      ctx.moveTo(cx - w / 2, ground - s * 0.15);
      ctx.lineTo(cx + w / 2, ground - s * 0.35);
      ctx.lineTo(cx + w / 2, ground);
      ctx.lineTo(cx - w / 2, ground);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = acc; ctx.globalAlpha = 0.85 * lit;
      ctx.font = `bold ${Math.max(8, s * 0.16)}px sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(letters, cx, ground - s * 0.28);
      ctx.globalAlpha = 1; ctx.fillStyle = wall;
    } else if (type === "cntower") {
      ctx.fillRect(cx - s * 0.045, ground - s * 1.15, s * 0.09, s * 1.15);
      ctx.beginPath(); ctx.ellipse(cx, ground - s * 0.72, s * 0.16, s * 0.08, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(cx - 1.5, ground - s * 1.32, 3, s * 0.16);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.2, ground);
      ctx.lineTo(cx - s * 0.05, ground - s * 0.2);
      ctx.lineTo(cx + s * 0.05, ground - s * 0.2);
      ctx.lineTo(cx + s * 0.2, ground);
      ctx.closePath(); ctx.fill();
      glow(0.4); ctx.fillRect(cx - 3, ground - s * 0.78, 6, 4); endg();
    } else if (type === "sunpyramid") {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.7, ground);
      ctx.lineTo(cx - s * 0.08, ground - s * 0.85);
      ctx.lineTo(cx + s * 0.08, ground - s * 0.85);
      ctx.lineTo(cx + s * 0.7, ground);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = acc; ctx.globalAlpha = 0.3 * lit; ctx.lineWidth = 1.2;
      for (let i = 1; i <= 4; i++) {
        const t = i / 5;
        const y = ground - s * 0.85 * t;
        const w = s * 1.4 * (1 - t);
        ctx.beginPath(); ctx.moveTo(cx - w / 2, y); ctx.lineTo(cx + w / 2, y); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } else if (type === "obelisco") {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.08, ground - s * 0.12);
      ctx.lineTo(cx - s * 0.05, ground - s * 1.05);
      ctx.lineTo(cx, ground - s * 1.18);
      ctx.lineTo(cx + s * 0.05, ground - s * 1.05);
      ctx.lineTo(cx + s * 0.08, ground - s * 0.12);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(cx - s * 0.16, ground - s * 0.12, s * 0.32, s * 0.12);
    } else if (type === "tablemountain") {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.7, ground);
      ctx.lineTo(cx - s * 0.55, ground - s * 0.55);
      ctx.lineTo(cx - s * 0.4, ground - s * 0.7);
      ctx.lineTo(cx + s * 0.42, ground - s * 0.72);
      ctx.lineTo(cx + s * 0.58, ground - s * 0.5);
      ctx.lineTo(cx + s * 0.7, ground);
      ctx.closePath(); ctx.fill();
      glow(0.25); ctx.fillRect(cx - s * 0.4, ground - s * 0.74, s * 0.82, s * 0.06); endg();
    } else if (type === "potala") {
      // wide terraces, red upper, white lower
      ctx.fillRect(cx - s * 0.7, ground - s * 0.28, s * 1.4, s * 0.28);
      ctx.fillRect(cx - s * 0.55, ground - s * 0.5, s * 1.1, s * 0.24);
      ctx.fillStyle = acc; ctx.globalAlpha = 0.35 * lit;
      ctx.fillRect(cx - s * 0.38, ground - s * 0.72, s * 0.76, s * 0.24);
      ctx.globalAlpha = 1; ctx.fillStyle = wall;
      ctx.fillRect(cx - s * 0.22, ground - s * 0.88, s * 0.44, s * 0.16);
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(cx - s * 0.5 + i * s * 0.18, ground - s * 0.86, s * 0.06, s * 0.08);
      }
    } else if (type === "welcomesign") {
      ctx.fillRect(cx - s * 0.04, ground - s * 0.55, s * 0.08, s * 0.55);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.55, ground - s * 0.95);
      ctx.lineTo(cx + s * 0.55, ground - s * 0.95);
      ctx.quadraticCurveTo(cx + s * 0.62, ground - s * 0.7, cx + s * 0.5, ground - s * 0.55);
      ctx.lineTo(cx - s * 0.5, ground - s * 0.55);
      ctx.quadraticCurveTo(cx - s * 0.62, ground - s * 0.7, cx - s * 0.55, ground - s * 0.95);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = acc; ctx.globalAlpha = 0.8 * lit;
      ctx.font = `bold ${Math.max(7, s * 0.12)}px sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("WELCOME", cx, ground - s * 0.78);
      ctx.globalAlpha = 1; ctx.fillStyle = wall;
    } else if (type === "duomo") {
      // dome + side campanile
      ctx.fillRect(cx - s * 0.45, ground - s * 0.4, s * 0.7, s * 0.4);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.32, ground - s * 0.4);
      ctx.quadraticCurveTo(cx - s * 0.1, ground - s * 0.95, cx - s * 0.1, ground - s * 1.02);
      ctx.lineTo(cx + s * 0.12, ground - s * 1.02);
      ctx.quadraticCurveTo(cx + s * 0.12, ground - s * 0.95, cx + s * 0.22, ground - s * 0.4);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(cx - s * 0.13, ground - s * 1.14, s * 0.06, s * 0.12);
      // campanile
      ctx.fillRect(cx + s * 0.32, ground - s * 0.85, s * 0.16, s * 0.85);
      ctx.fillRect(cx + s * 0.3, ground - s * 0.95, s * 0.2, s * 0.12);
      glow(0.35); ctx.fillRect(cx - s * 0.14, ground - s * 1.18, 4, 4); endg();
    } else {
      ctx.fillRect(cx - s * 0.08, ground - s, s * 0.16, s);
    }
    ctx.restore();
  }

  const api = { MASKS, maskSize, draw };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.NightLandmarks = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
