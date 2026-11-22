#!/usr/bin/env python3
"""Pack core.js + game.js + style.css into a self-contained index.html."""
from pathlib import Path
root = Path(__file__).resolve().parent
core = (root / "core.js").read_text()
css = (root / "style.css").read_text()
js = (root / "game.js").read_text()
fav = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect fill='%2307061a' width='32' height='32' rx='6'/%3E%3Ccircle cx='20' cy='12' r='7' fill='%23ffd56a'/%3E%3Ccircle cx='16' cy='10' r='6' fill='%2307061a'/%3E%3Crect x='8' y='20' width='3' height='3' fill='%23ffd56a'/%3E%3Crect x='13' y='20' width='3' height='3' fill='%237ee7ff'/%3E%3Crect x='18' y='20' width='3' height='3' fill='%23ff8ab8'/%3E%3C/svg%3E"
html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="theme-color" content="#07061a" />
  <link rel="icon" href="{fav}" />
  <title>夜灯将眠</title>
  <style>
{css}
  </style>
</head>
<body>
  <div id="app">
    <section id="menu">
      <div class="brand">
        <h1>夜灯将眠</h1>
        <p>把通明的城市，一盏盏关掉</p>
      </div>
      <div id="levels"></div>
    </section>

    <section id="game" hidden>
      <div class="hud">
        <button class="icon" id="backBtn" aria-label="返回">←</button>
        <div class="titles"><span id="lvNo"></span><span id="lvName"></span></div>
        <div class="stat"><em>剩余</em><span id="leftV">0</span></div>
        <button class="tool" id="speedBtn" type="button">▶ 1×</button>
        <button class="tool" id="soundBtn" type="button">♪</button>
      </div>
      <div id="stage">
        <canvas id="board"></canvas>
        <div id="toast"></div>
        <div id="slots"></div>
        <div id="coach" hidden></div>
      </div>
      <div id="tray"></div>

      <div id="loseBox" class="modal" hidden>
        <div class="panel">
          <div class="en">GRID OVERLOAD</div>
          <h2 style="color:#ff6b8a">电网过载了</h2>
          <p>电闸里的颜色都还没露出来，小电工无处下手。</p>
          <button class="btn primary" id="loseRw" type="button">◀ 时光倒流</button>
          <div class="row" style="margin-top:8px">
            <button class="btn ghost" id="loseMenu" type="button">菜单</button>
            <button class="btn" id="loseRetry" type="button">重新开始</button>
            <button class="btn" id="loseAd" type="button">看广告加一个槽</button>
          </div>
          <div class="note">时光倒流会退回最近几步，每关一次。广告是演示用的倒计时，不会真的播放。</div>
        </div>
      </div>

      <div id="winBox" class="modal" hidden>
        <div class="panel">
          <div class="en">CITY ASLEEP</div>
          <h2 id="winTitle">晚安</h2>
          <p id="winSub">城市已入睡</p>
          <div class="row">
            <button class="btn ghost" id="winMenu" type="button">菜单</button>
            <button class="btn" id="winRetry" type="button">再关一次</button>
            <button class="btn primary" id="winNext" type="button" style="min-width:0;flex:1">下一关</button>
          </div>
        </div>
      </div>

      <div id="adBox" class="modal" hidden>
        <div class="panel">
          <div class="en">SIMULATED AD</div>
          <h2>模拟广告</h2>
          <p>这是演示用的倒计时，不是真广告。</p>
          <div id="adSec">5</div>
          <button class="btn ghost" id="adSkip" type="button">跳过并获得槽位</button>
        </div>
      </div>
    </section>
  </div>
  <script id="core">
{core}
  </script>
  <script>
{js}
  </script>
</body>
</html>
"""
(root / "index.html").write_text(html)
print("wrote", root / "index.html", (root / "index.html").stat().st_size, "bytes")
