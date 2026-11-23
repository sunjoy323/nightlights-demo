#!/usr/bin/env python3
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent
data = json.loads((root / "curve-1-1000.json").read_text())
rows = data["rows"]
N = data["N"]

W, H = 1600, 860
pad_l, pad_r, pad_t, pad_b = 80, 40, 108, 70
img = Image.new("RGB", (W, H), "#07061a")
d = ImageDraw.Draw(img)

font_path = "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
font_b = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"
def fnt(sz, bold=False):
    return ImageFont.truetype(font_b if bold else font_path, sz, index=0)

d.text((W//2, 28), "夜灯将眠  ·  1–1000 关难度曲线", font=fnt(32, True), fill="#f3efe4", anchor="mt")
d.text((W//2, 62), "锯齿节奏：每 5 关一个小坑，每 10 关一个难关，随后 1–2 关放松；整体缓慢上升并封顶", font=fnt(15), fill="#8a84a8", anchor="mt")
d.text((W//2, 82), "新机关出场：4 问号工单 · 5 钥匙灯 · 8 电梯卷帘 · 10 总闸 · 12 会亮的灯 · 14 双槽招牌 · 17 闪烁灯笼", font=fnt(14), fill="#c9a6ff", anchor="mt")

plot_w = W - pad_l - pad_r
plot_h = H - pad_t - pad_b
x0, y0 = pad_l, pad_t

# grid
d.rectangle([x0, y0, x0+plot_w, y0+plot_h], outline="#2c2750")
for s in range(0, 101, 10):
    y = y0 + plot_h - s / 100 * plot_h
    d.line([(x0, y), (x0+plot_w, y)], fill="#1a1730", width=1)
    d.text((x0-10, y), str(s), font=fnt(13), fill="#8a84a8", anchor="rm")
for n in range(0, 1001, 100):
    x = x0 + (n / N) * plot_w
    d.line([(x, y0), (x, y0+plot_h)], fill="#1a1730", width=1)
    d.text((x, y0+plot_h+8), str(n), font=fnt(13), fill="#8a84a8", anchor="mt")
d.text((x0+plot_w//2, H-18), "关卡", font=fnt(15), fill="#8a84a8", anchor="mt")
d.text((22, y0+plot_h//2), "难度分", font=fnt(15), fill="#8a84a8", anchor="mm")

def xy(n, s):
    x = x0 + (n / N) * plot_w
    y = y0 + plot_h - (s / 100) * plot_h
    return x, y

# target envelope (smooth base + cap)
# draw target as a faint gold line using each row's target
tgt = [xy(r["n"], r["target"]) for r in rows]
d.line(tgt, fill="#3a3560", width=2)

# moving average of score
win = 7
ma = []
for i, r in enumerate(rows):
    sl = rows[max(0, i-win): i+win+1]
    ma.append(xy(r["n"], sum(x["score"] for x in sl)/len(sl)))
d.line(ma, fill="#c9a6ff", width=2)

# role points
colors = {"boss": "#ffd56a", "pit": "#ff6b8a", "relax": "#8dffc1", "teach": "#7ee7ff", "normal": "#5a5480"}
# draw normal as faint polyline
norm_line = [xy(r["n"], r["score"]) for r in rows]
# too dense - sample every 2 and use small dots for specials only
for r in rows:
    if r["role"] == "normal":
        x, y = xy(r["n"], r["score"])
        d.point((x, y), fill="#4a4570")

for r in rows:
    if r["role"] == "normal":
        continue
    x, y = xy(r["n"], r["score"])
    col = colors[r["role"]]
    rad = 4 if r["role"] in ("boss", "teach") else 3
    d.ellipse([x-rad, y-rad, x+rad, y+rad], fill=col)

# intro markers (vertical ticks only, labels are in the subtitle)
for it in data["intros"]:
    x, _ = xy(it["at"], 0)
    d.line([(x, y0), (x, y0+plot_h)], fill="#2a3050", width=1)

# legend
lx, ly = x0 + 16, y0 + 12
items = [("难关（每 10 关）", "#ffd56a"), ("小坑（每 5 关）", "#ff6b8a"), ("放松关", "#8dffc1"),
         ("新机关教学", "#7ee7ff"), ("7 关滑动平均", "#c9a6ff"), ("目标曲线", "#3a3560")]
for i, (lab, col) in enumerate(items):
    yy = ly + i * 22
    d.ellipse([lx, yy, lx+10, yy+10], fill=col)
    d.text((lx+16, yy+5), lab, font=fnt(14), fill="#f3efe4", anchor="lm")

# stats box
boss_avg = sum(r["score"] for r in rows if r["role"]=="boss")/100
pit_avg = sum(r["score"] for r in rows if r["role"]=="pit")/100
rel_avg = sum(r["score"] for r in rows if r["role"]=="relax")/199
d.text((x0+plot_w-16, y0+16), f"1000 关全部可解", font=fnt(16, True), fill="#8dffc1", anchor="ra")
d.text((x0+plot_w-16, y0+40), f"难关均分 {boss_avg:.0f}  ·  小坑 {pit_avg:.0f}  ·  放松 {rel_avg:.0f}", font=fnt(14), fill="#8a84a8", anchor="ra")

out = root / "curve-1-1000.png"
img.save(out, "PNG")
# also copy to shots
shots = root.parent / "shots"
shots.mkdir(exist_ok=True)
img.save(shots / "v3-curve-1-1000.png", "PNG")
print("wrote", out, out.stat().st_size)
