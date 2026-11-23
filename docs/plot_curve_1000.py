#!/usr/bin/env python3
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent
data = json.loads((root / "curve-1-1000.json").read_text())
rows = data.get("levels") or data.get("rows")
N = data.get("total") or len(rows)

W, H = 2200, 980
pad_l, pad_r, pad_t, pad_b = 80, 70, 130, 90
img = Image.new("RGB", (W, H), "#07061a")
d = ImageDraw.Draw(img)

font_path = "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
font_b = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"
def fnt(sz, bold=False):
    return ImageFont.truetype(font_b if bold else font_path, sz, index=0)

d.text((W//2, 18), "夜灯将眠  ·  环球电工  ·  1–1000 关难度曲线", font=fnt(30, True), fill="#f3efe4", anchor="mt")
d.text((W//2, 52), "教学仅 1–5 关；之后维持中高压力。颜色种类按章节锯齿增减，也是难度维度。", font=fnt(15), fill="#8a84a8", anchor="mt")
d.text((W//2, 74), "金点=章末大关  ·  橙点=地标关  ·  粉点=小坑  ·  青点=教学  ·  绿线=随机胜率  ·  黄线=颜色数", font=fnt(14), fill="#c9a6ff", anchor="mt")
d.text((W//2, 96), "硬规则：教学后贪心不可通关；随机胜率 <10%，大关 <2%；大关关键决策序列唯一", font=fnt(13), fill="#7ee7ff", anchor="mt")

plot_w = W - pad_l - pad_r
plot_h = H - pad_t - pad_b
x0, y0 = pad_l, pad_t
d.rectangle([x0, y0, x0+plot_w, y0+plot_h], outline="#2c2750")

# left axis 0-100 score, right axis random 0-20% and colors 0-10
def x_of(n):
    return x0 + (n - 1) / max(1, N - 1) * plot_w
def y_score(s):
    return y0 + plot_h - (s / 100.0) * plot_h
def y_rand(r):
    return y_score(min(100, (r or 0) * 500))  # 10% sits at score 50, 20% at 100
def y_col(c):
    return y_score((c or 0) * 10)  # 10 colors at 100, 5 at 50

# chapter boundaries
cities = data.get("cities") or []
for i, city in enumerate(cities):
    n = i * 20 + 1
    x = x_of(n)
    d.line([x, y0, x, y0+plot_h], fill="#1c1830")
    if i % 2 == 0:
        name = city.get("name") or str(i+1)
        d.text((x+2, y0+2), name, font=fnt(9), fill="#4a4660")

# 10% reference
y10 = y_rand(0.10)
d.line([x0, y10, x0+plot_w, y10], fill="#3a5a48")
d.text((x0+plot_w-4, y10-8), "随机 10%", font=fnt(11), fill="#8dffc1", anchor="rt")

# moving average of score
scores = [r.get("score") or 0 for r in rows]
def ma(arr, w=15):
    out=[]
    for i in range(len(arr)):
        sl=arr[max(0,i-w):i+w+1]
        out.append(sum(sl)/len(sl))
    return out
smooth = ma(scores, 12)
d.line([(x_of(i+1), y_score(s)) for i,s in enumerate(smooth)], fill="#a87cff", width=3)

# color count line
cols = [r.get("nColors") or 0 for r in rows]
if any(cols):
    col_s = ma(cols, 8)
    d.line([(x_of(i+1), y_col(s)) for i,s in enumerate(col_s)], fill="#ffd56a", width=2)

# random rate line
rands = [r.get("rand") or 0 for r in rows]
d.line([(x_of(i+1), y_rand(r)) for i,r in enumerate(rands)], fill="#8dffc1", width=1)

# points
for r in rows:
    n = r["n"]
    x, y = x_of(n), y_score(r.get("score") or 0)
    role = r.get("role") or ""
    if role == "chapterBoss":
        d.ellipse([x-4, y-4, x+4, y+4], fill="#ffd56a")
    elif role == "boss":
        d.ellipse([x-3, y-3, x+3, y+3], fill="#ff9a4a")
    elif role == "pit":
        d.ellipse([x-2.5, y-2.5, x+2.5, y+2.5], fill="#ff8ab8")
    elif role in ("teach", "teachMech"):
        d.ellipse([x-2.5, y-2.5, x+2.5, y+2.5], fill="#7ee7ff")
    else:
        d.ellipse([x-1.5, y-1.5, x+1.5, y+1.5], fill="#6a6490")

# axes labels
for s in range(0, 101, 20):
    yy = y_score(s)
    d.line([x0-4, yy, x0, yy], fill="#8a84a8")
    d.text((x0-8, yy), str(s), font=fnt(11), fill="#8a84a8", anchor="rm")
d.text((18, y0+plot_h/2), "难度分", font=fnt(13), fill="#f3efe4", anchor="mm")

# x ticks
for n in range(0, N+1, 100):
    if n==0: n=1
    x=x_of(n)
    d.line([x, y0+plot_h, x, y0+plot_h+5], fill="#8a84a8")
    d.text((x, y0+plot_h+8), str(n), font=fnt(11), fill="#8a84a8", anchor="mt")
d.text((x0+plot_w/2, H-18), "关卡", font=fnt(13), fill="#f3efe4", anchor="mm")

# right axis: colors
for c in range(0, 11, 2):
    yy=y_col(c)
    d.text((W-pad_r+8, yy), str(c)+"色", font=fnt(10), fill="#ffd56a", anchor="lm")

out = root / "curve-1-1000.png"
img.save(out)
print("wrote", out, out.stat().st_size)
