// afterPack 钩子：在 win-unpacked 生成后、NSIS 安装包打包前，用本地 rcedit 手动处理 exe 资源。
// 之所以不用 electron-builder 自带的 winCodeSign（signAndEditExecutable）：本机 Windows 无符号链接特权，
// 7za 解压 winCodeSign 时创建 darwin 的 .dylib 符号链接会失败，导致反复重下卡死，且离线环境无法下载。
// 这里直接用已缓存的 rcedit 手动嵌图标 + 写入版本信息字符串，绕过该问题。
// 关键：写版本信息后，「打开方式」/ 文件属性里才会显示 "PenEditMd" 而不是默认的 "Electron"。
const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== "win32") return;
  const rcedit = path.join(__dirname, "rcedit-x64.exe");
  if (!fs.existsSync(rcedit)) {
    console.warn("[afterPack] ⚠ 找不到本地 rcedit，跳过图标/版本信息写入");
    return;
  }
  const exe = path.join(context.appOutDir, "PenEditMd.exe");
  const ico = path.resolve(__dirname, "..", "assets", "icon.ico");
  try {
    execFileSync(rcedit, [exe, "--set-icon", ico], { stdio: "inherit" });
    console.log("[afterPack] ✓ 已用 rcedit 嵌入自定义图标");
  } catch (e) {
    console.warn("[afterPack] ⚠ rcedit 嵌图标失败（不影响打包）:", e.message);
  }
  // 写入版本信息字符串：决定「打开方式」/ 文件属性中显示的名称与描述
  const versionArgs = [
    exe,
    "--set-version-string", "FileDescription", "PenEditMd",
    "--set-version-string", "ProductName", "PenEditMd",
    "--set-version-string", "InternalName", "PenEditMd",
    "--set-version-string", "OriginalFilename", "PenEditMd.exe",
    "--set-version-string", "CompanyName", "PenEditMd",
    "--set-file-version", "0.1.0",
    "--set-product-version", "0.1.0",
  ];
  try {
    execFileSync(rcedit, versionArgs, { stdio: "inherit" });
    console.log("[afterPack] ✓ 已用 rcedit 写入版本信息（打开方式显示 PenEditMd）");
  } catch (e) {
    console.warn("[afterPack] ⚠ rcedit 写版本信息失败（不影响打包，但打开方式可能显示 Electron）:", e.message);
  }
};
