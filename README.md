# 夜灯将眠

把通明的像素城市，一盏盏关掉。给微信小游戏包装用的 H5 试玩 demo。

手机浏览器打开：https://sunjoy323.github.io/nightlights-demo/

单文件即可玩：`index.html`（不依赖 CDN）。`core.js` / `game.js` / `style.css` 是源码，改完后运行 `python3 pack.py` 会重新打进 `index.html`。

```
node verify.mjs   # 求解器检查全部 5 关可解
```

玩法对照《蚂蚁搬画》：底下托盘点最前排工单，工单飞进 5 个电闸槽，小电工从露在外面的窗户往里关灯。槽位全被关不到的颜色占住就是「电网过载」。失败页可以时光倒流，或看一段模拟广告加一个槽。
