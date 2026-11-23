#!/usr/bin/env python3
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent
data = json.loads((root / "curve-1-500.json").read_text())
rows = data.get("levels") or data.get("rows")
N = data.get("total") or len(rows)

W, H = 1800, 920
pad_l, pad_r, pad_t, pad_b = 80, 40, 120, 86
img = Image.new("RGB", (W, H), "#07061a")
d = ImageDraw.Draw(img)

font_path = "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
font_b = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"
def fnt(sz, bold=False):
    return ImageFont.truetype(font_b if bold else font_path, sz, index=0)

d.text((W//2, 22), "夜灯将眠  ·  环球电工  ·  1–500 关难度曲线", font=fnt(30, True), fill="#f3efe4", anchor="mt")
d.text((W//2, 56), "教学仅 1–5 关；之后维持中高压力，无放松关。大关=每 10 关（章末为每 20 关的地标大关）", font=fnt(15), fill="#8a84a8", anchor="mt")
d.text((W//2, 78), "金点=章末大关  ·  橙点=地标关  ·  粉点=小坑  ·  青点=教学  ·  细线=随机合法点击胜率（右轴）", font=fnt(14), fill="#c9a6ff", anchor="mt")
d.text((W//2, 98), "硬规则：教学后贪心不可通关；随机胜率 <10%，大关 <2%；大关关键决策序列唯一", font=fnt(13), fill="#7ee7ff", anchor="mt")

plot_w = W - pad_l - pad_r
plot_h = H - pad_t - pad_b
x0, y0 = pad_l, pad_t
d.rectangle([x0, y0, x0+plot_w, y0+plot_h], outline="#2c2750")

# left axis score 0-100, right axis rand 0-20%
for s in range(0, 101, 10):
    y = y0 + plot_h - s / 100 * plot_h
    d.line([(x0, y), (x0+plot_w, y)], fill="#1a1730", width=1)
    d.text((x0-10, y), str(s), font=fnt(12), fill="#8a84a8", anchor="rm")
    # right: 0-20% mapped onto 0-100 of left? we'll draw rand as 0-20% using top  of scale: y from 0% at bottom to 20% at mid? 
    # Better: overlay rand as 0-100% would be flat near 0. Scale rand*5 so 20% = 100.
    pass

# chapter boundaries every 20
cities = data.get("cities") or []
for i in range(0, N + 1, 20):
    x = x0 + (i / N) * plot_w
    d.line([(x, y0), (x, y0+plot_h)], fill="#2a2048" if i % 100 else "#3a3060", width=1)
    if i and i <= N:
        d.text((x, y0+plot_h+6), str(i), font=fnt(11), fill="#8a84a8", anchor="mt")
        ci = i // 20 - 1
        if 0 <= ci < len(cities):
            name = cities[ci]["name"]
            d.text((x - 10, y0+plot_h+24), name, font=fnt(11), fill="#ffd56a", anchor="mt")
d.text((x0, y0+plot_h+6), "0", font=fnt(11), fill="#8a84a8", anchor="mt")
d.text((x0+plot_w//2, H-16), "关卡（竖线为章节分界，金字为城市）", font=fnt(14), fill="#8a84a8", anchor="mt")
d.text((22, y0+plot_h//2), "难度分", font=fnt(14), fill="#8a84a8", anchor="mm")
d.text((W-14, y0+plot_h//2), "随机胜率×5", font=fnt(13), fill="#8dffc1", anchor="mm")

def xy(n, s):
    x = x0 + (n / N) * plot_w
    y = y0 + plot_h - (max(0, min(100, s)) / 100) * plot_h
    return x, y

# random rate line (rate*500 so 10% sits at score 50, 20% at 100)
rand_pts = []
for r in rows:
    if r.get("rand") is None:
        continue
    rand_pts.append(xy(r["n"], (r["rand"] or 0) * 500))
if len(rand_pts) >= 2:
    d.line(rand_pts, fill="#2e5a48", width=1)
# 10% threshold line = score 50 on this scale
y10 = xy(1, 50)[1]
d.line([(x0, y10), (x0+plot_w, y10)], fill="#2e5a48", width=1)
d.text((x0+6, y10-8), "随机 10% 上限", font=fnt(11), fill="#8dffc1", anchor="lt")

# moving average of score
win = 5
ma = []
for i, r in enumerate(rows):
    sl = rows[max(0, i-win): i+win+1]
    ma.append(xy(r["n"], sum(x.get("score") or 0 for x in sl)/len(sl)))
if ma:
    d.line(ma, fill="#c9a6ff", width=2)

colors = {
    "chapterBoss": "#ffd56a",
    "boss": "#ff9a4a",
    "pit": "#ff6b8a",
    "teach": "#7ee7ff",
    "teachMech": "#7ee7ff",
    "normal": "#5a5480",
}

for r in rows:
    role = r.get("role") or "normal"
    x, y = xy(r["n"], r.get("score") or 0)
    if role == "normal":
        d.ellipse([x-1.5, y-1.5, x+1.5, y+1.5], fill="#4a4570")
        continue
    col = colors.get(role, "#ffffff")
    rad = 5 if role == "chapterBoss" else 4 if role in ("boss", "teach") else 3
    d.ellipse([x-rad, y-rad, x+rad, y+rad], fill=col)
    if role == "chapterBoss" and r.get("keyUnique") is False and not r.get("unique"):
        d.ellipse([x-rad-2, y-rad-2, x+rad+2, y+rad+2], outline="#ff6b8a")

# legend
leg = [
    ("#ffd56a", "章末大关"),
    ("#ff9a4a", "地标关 / 十年大关"),
    ("#ff6b8a", "小坑"),
    ("#7ee7ff", "教学 / 新机关"),
    ("#c9a6ff", "难度滑动平均"),
    ("#8dffc1", "随机胜率"),
]
lx = x0 + 8
ly = y0 + 10
for col, lab in leg:
    d.ellipse([lx, ly, lx+8, ly+8], fill=col)
    d.text((lx+14, ly+4), lab, font=fnt(12), fill="#f3efe4", anchor="lm")
    lx += 150

out = root / "curve-1-500.png"
img.save(out, "PNG")
print("wrote", out, out.stat().st_size, "bytes")
