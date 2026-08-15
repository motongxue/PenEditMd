# 笔削 PenEditMd（MarkItDown Desktop）

微软开源项目 [microsoft/markitdown](https://github.com/microsoft/markitdown) 的桌面应用版。把 PDF / Word / Excel / PowerPoint / 图片 / 音频 / HTML / 电子书 等 20+ 种格式**一键转换为 Markdown**，方便喂给 LLM 或做文本分析。

> 核心转换引擎零改动 —— 本应用只是用 Electron 做了一层桌面壳，把 markitdown 的 Python 引擎包起来，通过本地 HTTP 通信。

## 架构

```
┌──────────────────────────────────────┐
│            Electron (UI 层)            │
│  拖拽上传 / 转换进度 / Markdown 预览   │
│  复制 / 导出 / 暗色模式 / 批量处理      │
└───────────────┬──────────────────────┘
                │  HTTP (localhost:8765)
┌───────────────▼──────────────────────┐
│     Python 后端 (markitdown 核心)      │
│   FastAPI 服务：/convert /convert_path │
│   /health /formats                     │
└───────────────────────────────────────┘
```

| 层 | 技术 | 说明 |
|----|------|------|
| UI 壳 | Electron 31 | 跨平台窗口、文件对话框、子进程管理 |
| 桥接 | preload.js | 安全暴露文件选择等能力 |
| 后端 | Python + FastAPI | 封装 markitdown 引擎 |
| 打包 | PyInstaller + electron-builder | 后端打单文件，前端打安装包 |

## 目录结构

```
markDownApp/
├── main.js                 # Electron 主进程（管理 Python 子进程）
├── preload.js              # 上下文桥接
├── package.json            # Electron / 打包配置
├── python-server/
│   ├── server.py           # FastAPI 转换服务
│   ├── requirements.txt    # Python 依赖
│   └── build.py            # PyInstaller 打包脚本
├── renderer/
│   ├── index.html          # 界面
│   ├── style.css           # 样式（暗/亮双主题）
│   └── app.js              # 业务逻辑
├── scripts/
│   └── setup-python.js     # 开发态 venv 一键初始化
└── README.md
```

## 快速开始（开发模式）

要求：Node.js ≥ 18，Python ≥ 3.10。

```bash
# 1. 安装 Electron 依赖
npm install

# 2. 初始化 Python 环境（创建 venv 并装 markitdown）
npm run setup:python

# 3. 启动应用
npm start
```

启动后 Electron 会自动拉起 Python 后端（端口 8765），窗口内即可拖拽文件转换。

## 核心功能

- **拖拽 / 选择文件**：单个或多个，自动识别格式
- **实时预览**：右侧 Markdown 渲染，可切「预览 / 原始」两种视图
- **批量处理**：多文件排队转换，左侧列表切换
- **一键复制 / 导出**：复制 Markdown 到剪贴板，或导出 `.md` 文件
- **暗色 / 亮色主题**：右上角 🌓 切换，记忆偏好
- **转换状态**：进度遮罩 + 底部状态栏，失败有红色提示

## 打包发布

### 1. 打包 Python 后端（单文件可执行）

```bash
npm run build:python
```

产物在 `python-server/dist/markitdown-server(.exe)`。electron-builder 会在 `extraResources` 中把它拷进应用资源目录，运行时由 `main.js` 拉起。

### 2. 打包桌面安装包

```bash
npm run build
```

输出在 `dist-electron/`：
- Windows：`MarkItDown.Desktop-Setup.exe`（NSIS）
- macOS：`*.dmg`
- Linux：`*.AppImage`

### 3. 完整构建（CI 建议）

```bash
npm install
npm run build:python      # 先产出生存后端可执行
npm run build             # 再打安装包
```

## API 说明（Python 后端）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查，返回 `{status:"ok"}` |
| GET | `/formats` | 返回支持的文件扩展名列表 |
| POST | `/convert` | multipart 上传文件，返回 Markdown |
| POST | `/convert_path` | JSON `{path}` 本地绝对路径，返回 Markdown |

返回示例：

```json
{ "filename": "report.pdf", "markdown": "# 标题\n\n正文..." }
```

## 可扩展点

- **API Key 管理**：在 `python-server/server.py` 的 `_build_converter()` 中读取本地加密配置，注入 OpenAI / Azure Document Intelligence，解锁图片 OCR 和云端高精度转换。
- **插件**：markitdown 自带插件系统，可在 `_build_converter()` 启用 `enable_plugins=True`。
- **离线 Markdown 渲染**：当前 `index.html` 使用 CDN 的 marked.js，生产建议下载到 `renderer/assets/` 本地引用。

## 国内镜像与踩坑记录

本项目在国内网络下安装依赖需要配置镜像。以下地址**均已实测可用**，其余写法多数会 404 / DNS 失败，请勿混用。

| 用途 | 地址 | 状态 |
|------|------|------|
| Electron 二进制 | `https://npmmirror.com/mirrors/electron/` | ✅ 可用（302 重定向到实际文件） |
| PyPI（pip） | `https://mirrors.aliyun.com/pypi/simple/` | ✅ 可用（200） |
| npm 包 | 默认 `registry.npmjs.org` | ✅ 直连可用，无需改 |

### 已固化进项目的配置（无需手动设）

- **`.npmrc`** 已写入 `electron_mirror=https://npmmirror.com/mirrors/electron/`，`npm install` 会自动从镜像拉 electron 二进制。
- **`scripts/setup-python.js`** 已把 pip 镜像写死为 `https://mirrors.aliyun.com/pypi/simple/`，`npm run setup:python` 不用再手动设 `PIP_INDEX_URL`。

### ⚠️ 以下写法实测无效，切勿使用

| 错误写法 | 现象 |
|----------|------|
| `https://registry.npmmirror.com/mirrors/electron/` | 404（electron 二进制下不下来） |
| `https://pypi.npmmirror.com/simple` | DNS 解析失败（域名不存在） |
| `https://registry.npmmirror.com/mirrors/pypi/simple/` | 404（pip 找不到包） |

### 典型故障与排查

- **`Electron failed to install correctly`**：electron 二进制没下下来。检查 `.npmrc` 里 `electron_mirror` 是否为 `npmmirror.com`（不是 `registry.npmmirror.com`）；删 `node_modules` 重装。
- **`Cannot find module 'get-stream'` 等缺包**：第一次 `npm install` 被清理错误打断导致 `node_modules` 损坏。执行 `rmdir /s /q node_modules && del package-lock.json` 后重新 `npm install`。
- **pip 卡在 10~16 kB/s**：直连 PyPI 被限速，确认用的是 aliyun 镜像而非默认源。

## 许可证

本项目以 **GNU Affero General Public License v3 (AGPL-3.0)** 整体发布。

- 核心转换引擎 Microsoft markitdown 遵循其原始 **MIT** 许可证（© Microsoft Corporation）。
- AI 排版组件 `gzh-design-skill` 以 **AGPL-3.0** 发布（© 甲木 × 摸鱼小李）。
- 其余前端 / 运行时依赖的许可证见 `THIRD-PARTY-LICENSES.md`。

> 依据 AGPL-3.0：任何人获取到本软件的二进制（含安装包、在线服务），均有权获得其对应源代码。完整源码见公开仓库 https://github.com/motongxue/PenEditMd。
