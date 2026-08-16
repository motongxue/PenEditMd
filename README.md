# 笔削 PenEditMd

**本地优先的 Markdown 写作 · 转换 · 排版 · 发布工作台。**

笔削是一个基于 Electron + 微软 [markitdown](https://github.com/microsoft/markitdown) 的桌面应用：既能把 PDF / Word / Excel / PPT / 图片 / 音视频 / 网页 / 电子书 等 30+ 种格式**一键转换为 Markdown**，也内置了富文本/源码双模式编辑、实时预览、文档树、桌面便签、AI 润色与排版，以及 Word / PDF / EPUB / PNG / 公众号 多格式导出与草稿推送。

> 转换只是入口之一——笔削真正想做的是「写完 → 排好 → 发出去」一条龙。

---

## 功能特性

**转换**
- 拖拽 / 选择 / 双击关联文件，自动识别并转换为 Markdown（经本地 Python 后端）
- 支持 PDF、DOCX/DOC、PPTX/PPT、XLSX/XLS、HTML、CSV、JSON、XML、EPUB、MSG、ZIP、TXT/MD、图片（JPG/PNG…）、音频、RTF、ODT 等约 30 种格式
- 图片自动内联为 base64，避免外部引用丢失

**编辑**
- 富文本（WYSIWYG）与源码双模式，可随时切换
- 实时预览：Markdown → HTML，支持 KaTeX 公式、Mermaid 图表、代码高亮、自动目录
- 明暗主题切换（记忆偏好）、分屏 / 专注模式、查找替换、撤销重做
- 选中文本浮动样式条 + 右键菜单，快速套用样式

**AI 能力**
- 行内 AI：润色 / 改写 / 续写 / 翻译 / 摘要 / 加标题标签（走可配置 LLM）
- **AI 排版**：按 `gzh-design-skill` 方法论生成 100% 内联样式的微信公众号兼容 HTML，内置 12 套设计语言，可让 AI 自动选题
- AI 密钥只在主进程代理转发，不进入页面脚本上下文

**文档组织**
- **文档树**：挂载工作文件夹，直接打开 / 转换其中的文件，支持新建 / 重命名 / 删除（路径越界校验）
- **桌面便签**：独立置顶透明浮窗，关掉主窗口也留在桌面，支持开机自启

**导出与发布**
- Markdown (.md)、HTML (.html，内联样式+图片+字体)、PDF、PNG 长图、Word (.docx)、EPUB
- 公众号：复制带格式 HTML、推送至公众号草稿箱

---

## 架构

```
┌──────────────────────────────────────────────┐
│ Electron 主进程  main.js                       │
│  · 拉起/管理 Python 子进程，轮询 /health        │
│  · 原生菜单、单实例锁、窗口与便签浮窗管理        │
│  · 全部 IPC：文件/剪贴板/导出/文档树/便签/      │
│    会话/AI 代理/微信推送/开机自启               │
└──────────┬───────────────────────┬───────────┘
           │ window.api (preload)  │  HTTP localhost:8765
           ▼                       ▼
┌──────────────────────┐   ┌──────────────────────────────────┐
│ 渲染进程 (Vite 构建)   │   │ Python 后端 (FastAPI+markitdown)    │
│ renderer/src/*.js     │   │ python-server/server.py            │
│ 编辑/预览/文档树/便签/ │   │ 打包: PyInstaller → markitdown-    │
│ AI 排版/导出/微信推送  │   │ server(.exe) (extraResources)      │
└──────────────────────┘   └──────────────────────────────────┘
```

| 层 | 技术 | 说明 |
|----|------|------|
| UI 壳 | Electron 31 | 跨平台窗口、文件对话框、子进程管理 |
| 桥接 | preload.js | `contextBridge` 安全暴露能力，开启 `contextIsolation` |
| 渲染 | Vite 5 + 原生模块 | `marked` / `DOMPurify` / `KaTeX` / `Mermaid` 本地打包，无 CDN |
| 后端 | Python + FastAPI | 封装 markitdown 引擎（含图片内联、路径防护等增强） |
| 打包 | PyInstaller + electron-builder | 后端打单文件，前端打 NSIS 安装包 |

---

## 目录结构

```
markDownApp/
├── main.js                     # Electron 主进程
├── preload.js                  # 上下文桥接
├── package.json                # 依赖与打包配置
├── python-server/
│   ├── server.py               # FastAPI 转换服务
│   ├── requirements.txt        # Python 依赖
│   └── build.py                # PyInstaller 打包脚本
├── renderer/
│   ├── index.html              # 渲染层 HTML 外壳
│   └── src/                    # 业务模块（main / richtext / preview /
│                               #   docTree / stickyNotes / aiDesignSkill /
│                               #   wechat / officeExport / exporter …）
├── build/
│   └── installer.nsh           # NSIS 自定义脚本（强杀残留进程释放文件锁）
├── scripts/
│   └── setup-python.js         # 开发态 venv 一键初始化
├── licenses/
│   └── gzh-design-skill-LICENSE  # 内嵌 AGPL-3.0 组件许可证全文
├── LICENSE                     # 本项目 AGPL-3.0
├── THIRD-PARTY-LICENSES.md     # 第三方许可证明细
└── README.md
```

> 注：`renderer/app.js` 等为早期遗留文件，已不再被引用；构建产物在 `dist/renderer/`，安装包在 `dist-electron/`。

---

## 快速开始（开发模式）

要求：Node.js ≥ 18，Python ≥ 3.10。

```bash
# 1. 安装前端依赖
npm install

# 2. 初始化 Python 环境（创建 venv 并安装 markitdown，已固化阿里云镜像）
npm run setup:python

# 3. 启动应用（自动拉起 Python 后端，端口 8765）
npm start
```

也可单独启动前端开发服务器（不拉 Electron）：

```bash
npm run dev
```

---

## 打包发布

### 1. 打包 Python 后端（单文件可执行）

```bash
npm run build:python
```

产物在 `python-server/dist/markitdown-server(.exe)`，由 electron-builder 的 `extraResources` 拷进应用资源目录，运行时由 `main.js` 拉起。

### 2. 打包桌面安装包

```bash
npm run build
```

输出在 `dist-electron/`：
- Windows：`PenEditMd Setup 0.1.0.exe`（NSIS）
- macOS：`*.dmg`
- Linux：`*.AppImage`

### 3. 推荐完整构建（CI）

```bash
npm install
npm run build:python      # 先产出生存后端可执行
npm run build             # 再打安装包
```

---

## AI 排版

AI 排版把当前 Markdown 交给一个**兼容 OpenAI `/chat/completions` 的 LLM**，按 `gzh-design-skill` 方法论生成纯内联样式的公众号 HTML 片段。

**使用前需在「设置 → AI 设置」配置**：接口地址、API Key、模型名（密钥仅在主进程代理转发）。

**内置 12 套设计语言**（`renderer/assets/ai-layout/`）：
- 原生 6 套（gzh-design-skill）：摸鱼绿、红白色系、石墨极简、留白禅意、摸鱼票据、橄榄手记
- 移植 6 套（gzh-design-skill 生态）：极简蓝、暖纸墨、暗夜青、森语绿、绯红编、墨金雅

排版结果可：分屏预览（可编辑）、复制 HTML、保存本地、或**推送至公众号草稿箱**。

---

## 文档树与便签

- **文档树**：侧栏挂载工作文件夹，点击 `.md/.txt` 直接打开，点击可转换格式（docx/pdf/xlsx/html/图片…）自动转成 Markdown 打开；支持新建 / 重命名 / 删除，主进程做路径越界校验防越权。
- **便签**：独立置顶透明浮窗，关掉主窗口仍留在桌面；支持单条重命名、置顶、开机自启。便签内容持久化在用户目录。

---

## 导出格式

| 格式 | 说明 |
|------|------|
| Markdown (.md) | 文本另存 |
| HTML (.html) | 完整独立文件（内联样式 + 图片 + KaTeX 字体 + Mermaid 运行时） |
| PDF (.pdf) | 隐藏窗口打印导出 |
| PNG 长图 (.png) | 整页截图（带尺寸上限保护） |
| Word (.docx) | 生成 OOXML 部件打包 |
| EPUB (.epub) | 按标题切章生成 EPUB3 |
| 公众号 | 复制带格式 HTML / 推送草稿箱 |

---

## 转换后端 API

Python 后端通过**本地 HTTP（默认端口 8765，可用环境变量 `MARKITDOWN_PORT` 覆盖）**通信：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查，返回 `{status:"ok"}` |
| GET | `/formats` | 返回支持的文件扩展名列表 |
| POST | `/convert` | multipart 上传文件，返回 `{filename, markdown}` |
| POST | `/convert_path` | JSON `{path}` 本地绝对路径，返回 `{path, markdown}` |

返回示例：

```json
{ "filename": "report.pdf", "markdown": "# 标题\n\n正文..." }
```

---

## 国内镜像与依赖安装

国内网络下安装依赖需配置镜像，以下地址**已实测可用**：

| 用途 | 地址 | 状态 |
|------|------|------|
| Electron 二进制 | `https://npmmirror.com/mirrors/electron/` | ✅ 可用 |
| PyPI（pip） | `https://mirrors.aliyun.com/pypi/simple/` | ✅ 可用 |
| npm 包 | 默认 `registry.npmjs.org` | ✅ 直连可用 |

已固化进项目（无需手动设）：
- `.npmrc` 写入 `electron_mirror`，`npm install` 自动走镜像
- `scripts/setup-python.js` 写死 pip 阿里云镜像

⚠️ 以下写法实测无效，切勿使用：`registry.npmmirror.com/mirrors/electron/`（404）、`pypi.npmmirror.com/simple`（DNS 失败）、`registry.npmmirror.com/mirrors/pypi/simple/`（404）。

典型故障：
- `Electron failed to install correctly`：二进制没下全，检查 `.npmrc` 的 `electron_mirror`；删 `node_modules` 重装。
- npm 缺包：首次 `npm install` 被打断导致 `node_modules` 损坏，`rmdir /s /q node_modules && del package-lock.json` 后重装。

---

## 许可证

本项目以 **GNU Affero General Public License v3 (AGPL-3.0)** 整体发布（根 `LICENSE`）。

- 核心转换引擎 **Microsoft markitdown**：MIT（© Microsoft Corporation）
- AI 排版组件库 **gzh-design-skill**：AGPL-3.0（© 甲木 × 摸鱼小李），全文见 `licenses/gzh-design-skill-LICENSE`
- 前端 / 运行时依赖（marked、DOMPurify、KaTeX、Mermaid、highlight.js、Turndown、Electron、Chromium、Python 等）许可证见 `THIRD-PARTY-LICENSES.md`

> 依据 AGPL-3.0：任何人获取到本软件的二进制（含安装包、在线服务），均有权获得其对应源代码。完整源码见公开仓库 https://github.com/motongxue/PenEditMd 。
