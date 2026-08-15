# Markdown 编辑器 / 查看器案例与需求整理

> 整理时间：2026-08-07
> 用途：为 **markitdown 桌面应用（Electron + Python FastAPI）** 后续加「编辑 / 预览增强 / 多图展示」做技术选型参考。
> 数据来源：GitHub 搜索、star-history、各项目 README。Star 数为近似值，会随时间变动。

---

## 〇、我们项目的定位与需求（先对齐）

**当前项目形态**：markitdown 核心（Python）负责把 PDF/Word/Excel/PPT/图片等转成 Markdown；Electron 外壳负责 UI。目前是「**转换 + 只读预览**」，**没有编辑功能**。

**已明确的需求（来自本次讨论 + 你给的案例）**：

| 需求 | 说明 | 来源 |
|------|------|------|
| 编辑能力 | 转换后的 Markdown 应能就地修改，再导出/复制 | 你提出的原始诉求 |
| **多图横排** | 编辑器/预览要能支持多张图片水平排列展示 | 你给的案例「MarkdownNote（编辑器支持多图横排）」 |
| 预览增强 | 主题切换、数学公式(KaTeX)、图表(Mermaid)、目录(ToC) | 你给的案例「markdown-viewer」能力 |
| 轻量 / 单文件 | 希望编辑体验简洁、开箱即用 | 你给的案例「lengyi R-Markdown（单 HTML 文件）」 |
| 所见即所得 | 可选的 WYSIWYG 编辑范式参考 | 你给的案例「marklight」 |
| 本地优先 | 数据存本地、离线可用、不强制云 | 多个案例共通取向 |

**关键约束**：编辑是纯前端行为，加在 `renderer/` 层即可，Python 后端 `server.py` 无需改动。

**三种可加的编辑形态（按改动量从小到大）**：
1. 原始视图改成可编辑 textarea（最小）
2. 双栏：左编辑 + 右实时预览（推荐，体验接近 Typora/MarkText）
3. CodeMirror 语法高亮编辑（最专业，前端体积变大）

---

## 一、我从 GitHub 调研的开源 Markdown 编辑器（15 个）

> 都是真正开源（许可证开放）且比较火的项目。Obsidian/Typora/Atom 因闭源或停更已排除（见文末）。

| 编辑器 | GitHub Stars(约) | 平台 / 技术 | 优点 | 缺点 |
|--------|------|------------|------|------|
| **MarkText** | ~52K | Win/Mac/Linux · Electron+Vue | 所见即所得（Typora 最佳平替）、免费、界面简洁、三种模式（源码/打字机/专注）、导出 HTML/PDF、GFM+KaTeX | 维护节奏偏慢、超大型文件偶有卡顿、无双向链接、功能不如 Typora 精致 |
| **Joplin** | ~55K | 全平台(含移动) · Electron | 端到端加密、多端同步(Dropbox/OneDrive/Nextcloud)、Web Clipper、插件生态、笔记/待办一体 | 界面朴实不美观、编辑器偏实用而非精致、数据存内部数据库需导出才能当 .md 用 |
| **VS Code / VSCodium** | ~177K / 开源版 | Win/Mac/Linux · Electron | 内置实时预览、扩展极丰富(Markdown All in One 等)、Git/终端原生集成、VSCodium 无遥测 | 不是纯 MD 编辑器、偏重、需装扩展配置才能达到好体验 |
| **Notable** | ~23.5K | Win/Mac/Linux · Electron | 本地纯文本存储、GFM+KaTeX+Mermaid、多光标、分屏、Zen 模式、导入导出丰富 | 仅早期版本开源，后续维护存疑；无内置云同步 |
| **Zettlr** | ~10K+ | Win/Mac/Linux · Electron | 学术写作向、Zotero/LaTeX 引用、大纲导航、Pandoc 导出 PDF/Word、暗色界面 | 偏重且有主见、高级导出依赖 Pandoc 配置复杂、不适合轻量笔记 |
| **Logseq** | ~33K | 全平台 · Electron | 双向链接+知识图谱、大纲式笔记、本地优先、插件生态强 | 大纲式而非传统 MD 编辑器、上手复杂、导出标准 .md 有局限 |
| **StackEdit** | ~22.6K | 纯浏览器 | 免安装、分栏实时预览、云同步 Google Drive/Dropbox、可发布到 GitHub/Medium | 仓库长期无提交(疑似停滞)、非桌面、离线能力弱 |
| **ghostwriter** | ~6K | Win/Linux · Qt/KDE | 极致无干扰写作、聚焦/海明威模式、实时预览、写作统计、轻量启动快 | **无 Mac 版**、插图需手输语法、无侧边文件树 |
| **HedgeDoc** | ~8K | Web / 自托管 | 多人在线协作、实时编辑、评论、演示模式、数据自主管控(AGPL) | 需要自己搭基础设施维护、AGPL 在企业内可能触发合规审查 |
| **editor.md** | ~14.3K | 前端组件 | 可嵌入网页、双栏实时预览、CodeMirror 高亮、KaTeX/流程图 | 已较久未维护、是组件不是独立应用 |
| **Vditor** | ~11K | 前端组件 | 多模式(可视化/即时/分栏)、公式/流程图/思维导图/脑图齐全 | 偏技术文档组件，需二次集成才能用 |
| **MacDown** | ~9.3K | **仅 macOS** · 原生 | 免费开源、双栏预览、轻量 | 仅 macOS、约 3 年无提交、基本停更 |
| **QOwnNotes** | ~5.8K | Win/Mac/Linux · Qt | 纯文本 .md 文件、Nextcloud 同步、标签/搜索、已接 AI/MCP | 界面偏功能化、不够极简、需要 Nextcloud 才能发挥同步 |
| **Yank Note(闲书)** | ~12K | Win/Mac/Linux · Electron | 本地优先、内置版本控制/加密/终端/跑代码/思维导图/AI Copilot、插件化 | 功能极多学习曲线陡、本地服务模式对新手不常规 |
| **MarkFlowy** | 数百(新) | 跨平台 · **Tauri** | 极轻量(<20MB)、ProseMirror 内核、AI 助手(DeepSeek/ChatGPT)内置 | 年轻项目、尚不稳定、生态未成型 |

---

## 二、你给的 4 个案例（用户补充）

> 你直接发来的参考项目，逐一分析其定位、技术栈、协议，以及和我们项目的关联。

### 1. simov/markdown-viewer（你称 Wiwme）
- **定位**：浏览器扩展，把 `.md` 在浏览器里渲染成漂亮页面（**查看器，非编辑器**）
- **技术**：Chrome/Firefox 扩展；渲染器可在 markdown-it / marked / remark 间切换；30+ 主题、Mermaid、MathJax、目录(ToC)、Prism 高亮
- **协议**：MIT
- **与我们关联**：和「转换 + 预览」的**预览侧**重叠。它的预览能力（主题/公式/图表/目录）值得借鉴——我们 `renderer` 用 marked.js 渲染，可参考它补 Mermaid、KaTeX、目录。但扩展形态，代码不能直接搬进 Electron。

### 2. xiaodou997/marklight（你称 Markdown Reader）
- **定位**：本地优先的**所见即所得(WYSIWYG)** Markdown 编辑器（桌面）
- **技术**：**Tauri 2 + Rust 核心 + TipTap/ProseMirror**，Vue3+TS+Vite，Apache-2.0
- **关键特性**：渲染块（代码/表格/公式/Mermaid/callout）直接编辑、微信/HTML 导出、多主题、图片自动落盘 `assets/`
- **与我们关联**：和我们要加的「编辑」最相关，且是 WYSIWYG 范式（不是分栏源码）。若走 MarkText 那种所见即所得，它是绝佳参考。但 Tauri/Rust 栈和我们 Electron 不同，只能学思路，代码不能直接复用。

### 3. woyin2024/lengyi-markdown-editor（你称 R-Markdown）
- **定位**：单 HTML 文件、纯前端、免安装的 Markdown 编辑器（作者「冷逸 / 沃垠AI」）
- **技术**：纯原生 HTML/CSS/JS（无框架），marked.js + KaTeX + Mermaid，localStorage 自动保存
- **关键特性**：拖拽导入、实时预览、三种布局（编辑+预览 / 仅编辑 / 仅预览）、多格式导出（.md/.html/.doc/.pdf/.png）、10 语言、查找替换、表格可视化；另带 Python 本地代理脚本做网页转 MD
- **与我们关联**：**最像我们想做的轻量编辑器**——单文件、marked.js 渲染（和我们 `renderer` 一致！）。其「拖拽导入 + 实时预览 + 导出」架构几乎可直接借鉴进我们 renderer 的编辑模块；Python 代理脚本的思路也和我们「Python 后端」呼应。

### 4. ZyPLJ/MarkdownNote（你称 编辑器支持多图横排）
- **定位**：Windows 桌面 Markdown 便签（轻量、可置顶、预览为主）
- **技术**：**Electron 35 + Vue3 + CodeMirror 6 + markdown-it**，MIT，NSIS 打包
- **关键特性**：多窗口便签、图片粘贴/拖入、**多图**、大图压缩、`attach://` 本地协议、任务列表、历史回收、系统托盘
- **与我们关联**：**和我们同栈（Electron）！** 是最直接可借鉴的代码参考。CodeMirror 6 做编辑器、markdown-it 渲染、图片用本地 `attach://` 协议——正好对标我们要加的「编辑 + 多图展示」。**⚠️ 注意**：README 只写了「多图」，**没有明确说「横排」（水平排列）**，这点需看源码确认。

---

## 三、需求 → 案例映射（怎么用这些参考）

| 我们的需求 | 最该参考的案例 | 备注 |
|-----------|--------------|------|
| 加编辑（同栈、能抄代码模式） | **MarkdownNote**（Electron + CodeMirror 6） | 同 Electron 栈，集成成本最低 |
| 轻量编辑 UI 范式（marked.js，可嵌入 renderer） | **lengyi R-Markdown** | 单文件 marked.js，和我们 renderer 渲染一致 |
| 走 WYSIWYG 所见即所得 | **marklight** | Tauri 栈，只学思路 |
| 预览增强（主题/公式/图表/目录） | **markdown-viewer** | 扩展形态，学预览能力 |
| **多图横排** | **MarkdownNote** | 支持多图粘贴，但是否横排需查源码确认 |
| 通用开源编辑器对标 | 第一节 15 个（尤其 MarkText） | MarkText 与 Electron 同栈，最贴近 |

---

## 四、排除项（常被混淆但不开源/已停更）

- **Obsidian**：社区插件开源，但主程序核心不开源，严格说不算开源。
- **Typora**：商业闭源付费，纯开源替代品是上面的 MarkText。
- **Atom**（~60K，已 sunset）：GitHub 已停止维护，不推荐新项目采用。

---

## 五、备注 / 下一步建议

- 本项目「转换 + 只读预览」骨架已在 `E:\app\WorkBuddy\markDownApp`，编辑尚未实现。
- 若开始加编辑，**首选路径**：参照 MarkdownNote 的 CodeMirror 6 + markdown-it 模式，在 `renderer/` 层实现「可编辑 + 实时预览」，并把「多图横排」作为明确验收点（先确认 MarkdownNote 源码里多图是否横排）。
- 预览增强（Mermaid/KaTeX/目录）可参考 markdown-viewer，作为后续迭代。
- 所有参考均为前端改动，Python 后端 `server.py` 无需改动。
