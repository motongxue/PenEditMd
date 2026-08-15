# MarkItDown 桌面应用 · 开发蓝图（2026-08-07 锁定）

> 本文档汇总了项目目标、技术选型、12 条需求、界面设计、排版策略与开发路线，是明天（2026-08-08）开始开发的唯一基准。
> 案例调研细节见同目录 `markdown-editors.md`，依赖镜像踩坑见 `README.md`「国内镜像与踩坑记录」。

---

## 0. 项目目标

把微软开源的 [microsoft/markitdown](https://github.com/microsoft/markitdown)（Python，多格式→Markdown 转换引擎）包装成一个**桌面应用**：用户拖入 PDF/Word/Excel/PPT/图片/音频/HTML 等文件，本地转换出 Markdown，并能在应用内**编辑、排版、导出、管理**。

核心引擎零改动，只在它外面包一层桌面 UI 壳。

---

## 1. 技术架构（已定）

```
Electron (UI 壳)  ──HTTP localhost:8765──>  Python FastAPI (markitdown 核心)
```

- **前端**（renderer/）：HTML/CSS/JS，负责所有 UI 与编辑
- **后端**（python-server/server.py）：FastAPI 服务，封装 markitdown，提供 `/convert`、`/convert_path`、`/health`、`/formats`
- **主进程**（main.js）：拉起/管理 Python 子进程、等待健康端口、文件对话框
- **桥接**（preload.js）：安全暴露白名单接口给渲染进程

**关键约束**：markitdown 是 Python，必须随包发布 Python 运行时（~100–200MB），Electron 和 Tauri 都无法回避这部分。

---

## 2. 技术选型结论：继续用 Electron（已定，不纠结）

| 维度 | 结论 |
|------|------|
| 为什么留 Electron | 核心约束是 Python（markitdown），不是壳；12 条需求中约 9 条是纯前端 webview 能力，Electron/Tauri 用同一套前端，体验一致 |
| Tauri 优势被削弱 | Tauri 的"小体积"被 Python payload 大幅抵消（Electron≈350–500MB vs Tauri≈150–250MB，差距被 Python 抹平） |
| Python 调用成本 | 第 9（Word 导出）、11（AI）条涉及 Python，Electron 用 `child_process` 直调零成本；Tauri 必须走 sidecar（多一层二进制封装） |
| 退路 | 前端写成**壳无关**（不依赖 Electron 专有 API，只经 preload 通用接口通信）；若日后体积/启动真成瓶颈，把同一套前端迁 Tauri 壳，成本低 |
| 切 Tauri 成本 | 重写主进程为 Rust + 学 Tauri API + Python 改 sidecar，约 3–5 天且初期坑多 |

**一句话**：留在 Electron 风险最低、收益最快；前端可移植，保留 Tauri 退路。

---

## 3. 12 条需求清单（用户锁定版）

| # | 需求 | 说明 / 验收点 |
|---|------|--------------|
| 1 | 编辑能力 | 编辑区直接显示**工具栏**：字体、字号、颜色、加粗/斜体等 |
| 2 | 预览增强 | 实时渲染支持 KaTeX 公式、Mermaid 图、目录(ToC)、代码高亮 |
| 3 | 多图横排 | 预览区图片用 flex 横排展示（来自 MarkdownNote 案例的明确需求） |
| 4 | 轻量单文件 | 前端写成单页、可移植，不绑重框架（参考 lengyi 单 HTML 思路） |
| 5 | WYSIWYG | 所见即所得（建议 TipTap/ProseMirror，与 marklight 同内核） |
| 6 | 本地优先 | 数据存本机、不依赖云、离线可用（**已天然满足**，作为选型红线守住） |
| 7 | 主题模板 | 微信公众号 / 今日头条 / CSDN 文章排版（见第 5 节导出策略） |
| 8 | 文档树 | **独立功能**：左侧文件树状导航，管"正式文档"（文件夹+文件层级+展开折叠+点击打开） |
| 9 | 导出 | md→Word / PDF / HTML（Word 走 python-docx 经 Python 后端最省事） |
| 10 | 便签管理 | **独立功能**：MarkdownNote 形态小纸条（置顶浮窗、多条并存、本地存储、系统托盘、轻量增删），与主编辑器解耦 |
| 11 | 接入 AI | 后续可能；Python 后端已带 openai/azure 依赖，天然衔接（走云端 API，不本地跑模型） |
| 12 | 体积小/内存小/启动快 | 性能红线；见第 6 节体积估算 |

> ⚠️ **便签（#10）与文档树（#8）是两个独立功能**，不合并。便签=随手碎片小窗；文档树=正式文件管理。

---

## 4. 界面设计方案（三栏布局，已出草图）

```
┌───────────────────────────────────────────────────────────┐
│ 顶栏：标题 · 菜单(文件/编辑/视图/帮助) · [AI按钮占位]        │
├──────────┬──────────────────────────┬──────────────────────┤
│ 左栏(可折叠)│ 中栏：编辑区              │ 右栏(可折叠)          │
│ 文档树 tab │ 工具栏(字体/字号/颜色…)   │ 预览增强(公式/图/ToC) │
│ 便签 tab   │ 模式:WYSIWYG/源码/分栏    │ 主题模板(公众号/头条/ │
│            │ 编辑面(TipTap 富文本)     │        CSDN 芯片)     │
│            │                          │ 多图横排(flex)        │
│            │                          │ 导出(Word/PDF/HTML)   │
├──────────┴──────────────────────────┴──────────────────────┤
│ 状态栏：Python引擎状态(绿点)·字数·文件名·主题·AI状态          │
└───────────────────────────────────────────────────────────┘
```

- **便签**为独立可置顶浮窗（不在主窗内编辑），点左栏便签列表项弹出。
- 所有 UI 用标准 HTML/CSS/JS，**壳无关**（第 2 节退路要求）。

---

## 5. 排版范式与三家平台导出策略（已定）

### 范式：混合（内容/样式分离 + 实时预览）
- 用**中性 Markdown/WYSIWYG** 写内容（不绑任何平台样式）
- 右栏**实时按所选平台主题渲染预览**
- **导出时按该平台规则编译输出**

即「一份中性内容，三套皮 + 三条编译管道」。对应需求 1/5（写）+ 7（模板）。

### 三家平台导出策略（优先级 CSDN > 公众号 > 头条）

| 平台 | 认什么 | 外部CSS | 外链图 | 我们产出 | 难度 |
|------|--------|---------|--------|----------|------|
| **CSDN** | 原生 Markdown | 不需要(自带主题) | 基本可 | 标准 `.md`（几乎现成） | 低 |
| **公众号** | 纯内联 style HTML | ❌不支持 | ❌必传微信图床 | 全内联 HTML + 图片重传(接素材API或提示手动) | 高 |
| **头条** | 富文本，会过滤样式 | ❌过滤 | ❌必传头条图库 | 干净结构化文本+图片占位，供粘贴为纯文本后手动排版 | 中(尴尬) |

- **公众号**是核心难点：需做"内联化编译器"（去 class、拍平 style）+ 图片走微信图床。
- **头条**靠 CSS 皮肤解决不了，现实做法是产出结构干净文本 + 图片占位，或用头条号 API（成本高）。

---

## 6. 体积估算（exe 安装包）

| 部分 | 解压后 | 压缩后(进包) |
|------|-------|-------------|
| Electron 壳 (Chromium+Node) | ~170MB | ~70MB |
| Python 3.13 + markitdown[all] | ~500MB | ~200MB |
| 前端资源 (renderer+TipTap+KaTeX+Mermaid) | ~40MB | ~20MB |
| **合计** | **~710MB** | **~290MB** |

- **典型安装包 ≈ 290MB，装完占硬盘 ≈ 750MB**。
- 你的 12 条需求几乎不撑体积（前端总计才 ~40MB），大头是固定的 Python+Electron。
- **优化**：只装 `markitdown[pdf,docx,pptx,xlsx]`（不 `[all]`）→ 安装包降到 ~200MB；AI 走云端 API（不本地跑 LLM，否则 +2–8GB）。

---

## 7. 参考案例索引（详见 `markdown-editors.md`）

- **GitHub 调研 15 个**：MarkText / Joplin / VS Code·VSCodium / Notable / Zettlr / Logseq / StackEdit / ghostwriter / HedgeDoc / editor.md / Vditor / MacDown / QOwnNotes / Yank Note / MarkFlowy
- **用户补充 4 个**：
  - `simov/markdown-viewer`（Wiwme，浏览器扩展查看器，预览增强参考）
  - `xiaodou997/marklight`（Tauri2+Rust+TipTap WYSIWYG，范式参考）
  - `woyin2024/lengyi-markdown-editor`（单 HTML 文件 marked.js，轻量单文件参考）
  - `ZyPLJ/MarkdownNote`（Electron35+Vue3+CodeMirror6，**多图横排需求来源，同栈可借鉴**，横排需查源码确认）

---

## 8. 已固化配置（勿再踩坑）

- `.npmrc`：`electron_mirror=https://npmmirror.com/mirrors/electron/`
- `scripts/setup-python.js`：`PIP_MIRROR=https://mirrors.aliyun.com/pypi/simple/`
- 失效写法（勿用）：`registry.npmmirror.com/mirrors/electron/`、`pypi.npmmirror.com/simple`、`registry.npmmirror.com/mirrors/pypi/simple/`

---

## 9. 当前项目状态（2026-08-07 收工）

- ✅ 骨架已建：`main.js` / `preload.js` / `renderer/*` / `python-server/server.py` / `python-server/build.py` / `scripts/setup-python.js` / `package.json` / `README.md` / `.gitignore` / `.npmrc` / `docs/`
- ⏳ **依赖未装好**：`node_modules` 与 `python-server/.venv` 当前不存在（之前清掉后未重装）
- 所有源码已通过 JS/Python 语法检查；`main.js` 路径 bug 已修

### 明天第一步：跑通现有骨架
```bash
cd /d E:\app\WorkBuddy\markDownApp
rmdir /s /q node_modules      # 若残留损坏则清；干净可跳过
del package-lock.json
npm install                   # 走 .npmrc 镜像，自动下 electron 二进制
npm run setup:python          # venv + markitdown（走 aliyun 镜像）
npm start                     # 应看到桌面窗口，拖文件可转 MD
```
跑通后验证「选文件 → 调引擎 → 出结果」闭环，再进入功能开发。

---

## 10. 建议开发路线（MVP 阶段）

| 阶段 | 内容 | 对应需求 |
|------|------|----------|
| P0 | 跑通骨架（装依赖、看到窗口、转换闭环） | 基础 |
| P1 | 编辑工具栏 + WYSIWYG（引入 TipTap/ProseMirror） | 1, 5 |
| P2 | 文档树 + 本地 .md 文件管理（IndexedDB 或本地文件） | 8 |
| P3 | 预览增强（KaTeX/Mermaid/ToC）+ 多图横排 | 2, 3 |
| P4 | 主题模板 + 导出（CSDN→公众号→头条；Word/PDF/HTML） | 7, 9 |
| P5 | 便签浮窗（置顶/多条/托盘） | 10 |
| P6 | AI 接口预留（云端 API） | 11 |

> P1 是后续所有编辑功能的基础，建议优先；多图横排（#3）是用户明确验收点，务必从 MarkdownNote 源码确认实现方式。
