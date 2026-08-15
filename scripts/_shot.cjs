// 用 Electron（与应用同一 Chromium 渲染引擎）给验证页截图，眼见为实。
const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

const PAGE = process.argv[2];
const OUT = process.argv[3];

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 900,
    height: 1400,
    show: false,
    // 不用 offscreen：本环境 GPU 进程会崩，离屏渲染随之 ERR_FAILED
  });
  const url = PAGE.startsWith("http") ? PAGE : require("node:url").pathToFileURL(path.resolve(PAGE)).href;
  win.webContents.on("did-fail-load", (_e, code, desc, u) =>
    console.log("LOAD FAIL", code, desc, u)
  );
  await win.loadURL(url);
  await new Promise((r) => setTimeout(r, 1500)); // 等字体与 KaTeX 布局稳定
  const img = await win.webContents.capturePage();
  fs.writeFileSync(OUT, img.toPNG());
  console.log("shot: " + OUT);

  // 顺便切到浅色主题再截一张
  await win.webContents.executeJavaScript(
    "document.documentElement.classList.add('light')"
  );
  await new Promise((r) => setTimeout(r, 600));
  const img2 = await win.webContents.capturePage();
  const out2 = OUT.replace(/\.png$/, "-light.png");
  fs.writeFileSync(out2, img2.toPNG());
  console.log("shot: " + out2);

  app.quit();
});
