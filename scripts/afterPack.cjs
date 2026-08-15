// afterPack 钩子：在 win-unpacked 生成后、NSIS 安装包打包前，用 rcedit 嵌入自定义图标。
// 之所以不用 electron-builder 自带的 winCodeSign：本机 Windows 无符号链接特权，
// 7za 解压 winCodeSign 时创建 darwin 的 .dylib 符号链接会失败，导致反复重下卡死。
// 这里直接用已缓存的 rcedit 手动嵌图标，绕过该问题。
const { execFileSync } = require("child_process");
const path = require("path");

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== "win32") return;
  const rcedit = path.join(__dirname, "rcedit-x64.exe");
  const exe = path.join(context.appOutDir, "PenEditMd.exe");
  const ico = path.resolve(__dirname, "..", "assets", "icon.ico");
  try {
    execFileSync(rcedit, [exe, "--set-icon", ico], { stdio: "inherit" });
    console.log("[afterPack] ✓ 已用 rcedit 嵌入自定义图标");
  } catch (e) {
    console.warn("[afterPack] ⚠ rcedit 嵌图标失败（不影响打包）:", e.message);
  }
};
