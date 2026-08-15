/**
 * 开发态 Python 环境一键初始化。
 * 在 python-server 下创建 venv 并安装依赖，供 Electron 在开发态调用。
 * 用法：npm run setup:python
 */

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SERVER_DIR = path.join(ROOT, "python-server");
const VENV_DIR = path.join(SERVER_DIR, ".venv");
const REQ = path.join(SERVER_DIR, "requirements.txt");

// 国内 PyPI 镜像（已验证可访问）；如需切换可改这里
const PIP_MIRROR = "https://mirrors.aliyun.com/pypi/simple/";

const isWin = process.platform === "win32";
const pyExe = isWin ? "python" : "python3";

function run(cmd, args, cwd) {
  console.log(`> ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit" });
  if (r.status !== 0) {
    console.error(`命令失败: ${cmd} ${args.join(" ")}`);
    process.exit(1);
  }
}

console.log("== 初始化 markitdown 开发环境 ==");

// 1. 创建 venv
if (!fs.existsSync(VENV_DIR)) {
  run(pyExe, ["-m", "venv", ".venv"], SERVER_DIR);
} else {
  console.log("venv 已存在，跳过创建");
}

const venvPython = isWin
  ? path.join(VENV_DIR, "Scripts", "python.exe")
  : path.join(VENV_DIR, "bin", "python");

// 2. 升级 pip + 安装依赖（走国内镜像，避免直连 PyPI 限速）
run(venvPython, ["-m", "pip", "install", "--upgrade", "pip", "-i", PIP_MIRROR], SERVER_DIR);
run(venvPython, ["-m", "pip", "install", "-r", REQ, "-i", PIP_MIRROR], SERVER_DIR);

console.log("\n✅ 完成！现在运行 `npm start` 启动桌面应用。");
