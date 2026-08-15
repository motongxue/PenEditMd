/**
 * aiDesignSkill.js
 * --------------------------------------------------------------------------
 * 把开源项目 gzh-design-skill（微信公众号文章排版引擎）的方法论
 * 蒸馏进 笔削 PenEditMd，供「全文 AI 排版」功能调用。
 *
 * 该 skill 的核心：输入 Markdown → AI 按主题组件库选组件组合排版
 *   → 生成 100% 内联、<section> 白名单、<span leaf> 包裹的公众号兼容 HTML
 *   → validate_gzh_html.py 0 ERROR 校验 → 预览/一键复制。
 *
 * 本文件负责「把方法论 + 真实组件库注入 AI 提示词」（即"调用开源项目的 skills"）。
 * 与 WorkBuddy 中 gzh-design-skill 走同一套组件库：提示词里直接附上选中主题的
 * 完整组件 HTML（来自 renderer/assets/ai-layout/theme-*.md）与通用增量库，
 * 强制模型「HTML 一律从中取，不要手写」——这样同一模型、同一主题名产出的排版
 * 质量与 WorkBuddy 一致。生成的 HTML 与现有 wechat 通道的 result 结构完全一致，
 * 可直接复用发布弹窗的预览与复制逻辑。
 */

import { getThemeLibrary, commonComponents, themeIndex, DEFAULT_THEME_ID } from "./aiLayoutThemes.js";

/** 12 套设计语言（取自 gzh-design-skill 的 theme-index.md，含主色、气质与适用场景）
 *  group：core = skill 原生 6 套；ported = 由 gzh-AI-Design-skill 移植改编的 6 套 */
export const DESIGN_LANGUAGES = [
  { id: "moyu-green", group: "core", name: "摸鱼绿", mainColor: "#059669", vibe: "卡片丰富 · 信息密度高 · 呼吸感", fit: "教程、测评、清单、工具盘点、知识整理" },
  { id: "red-white", group: "core", name: "红白色系", mainColor: "#DC2626", vibe: "经典编辑风 · 编号章节 + 引言卡", fit: "深度分析、观点、力量感话题" },
  { id: "graphite-minimal", group: "core", name: "石墨极简风", mainColor: "#52525B", vibe: "极简克制 · 留白理性 · 全灰阶", fit: "设计、科技评论、专业观点、高端品牌" },
  { id: "zen-whitespace", group: "core", name: "留白禅意风", mainColor: "#4A5D52", vibe: "禅意冥想 · 极简生活 · 呼吸感最强", fit: "禅意、极简生活、深度随笔、艺术留白" },
  { id: "moyu-ticket", group: "core", name: "摸鱼票据风", mainColor: "#059669", vibe: "票据/门票视觉隐喻 · 星级评分", fit: "测评、工具对比、创意评测" },
  { id: "olive-journal", group: "core", name: "橄榄手记", mainColor: "#1e1f23", vibe: "编辑部内刊质感 · 分节形式多样", fit: "内刊手记、深度评测、案例复盘、系统性说明文档" },
  { id: "minimal-blue", group: "ported", name: "极简蓝", mainColor: "#2563eb", vibe: "克制 · 理性 · 呼吸感（蓝色锚点 + 灰阶主导）", fit: "技术教程、工具测评、知识整理" },
  { id: "warm-paper", group: "ported", name: "暖纸墨", mainColor: "#b8532a", vibe: "温度 · 杂志感 · 暖细线分隔 + 大引号金句", fit: "观点分析、深度文章、人文思考" },
  { id: "night-cyan", group: "ported", name: "暗夜青", mainColor: "#00d4aa", vibe: "科技 · 终端美学 · 暗底霓虹克制", fit: "开发技术、数据报告、产品深潜" },
  { id: "forest-green", group: "ported", name: "森语绿", mainColor: "#4a7c59", vibe: "自然 · 侘寂 · 大留白（图文并茂）", fit: "随笔、生活方式、冥想反思" },
  { id: "crimson-editorial", group: "ported", name: "绯红编", mainColor: "#c1292e", vibe: "编辑风骨 · 红白张力 · 强结构感", fit: "深度评测、案例复盘、行业分析" },
  { id: "ink-gold", group: "ported", name: "墨金雅", mainColor: "#c9a96e", vibe: "墨色为底 · 金饰点缀 · 经典比例", fit: "人物访谈、品牌叙事、高端内容" },
];

/** 公众号兼容性铁律（源自 gzh-design-skill 平台红线 + 招牌特性，硬规则，写入提示词）
 *  注意：刻意去掉了旧版自创的 `box-sizing:border-box;max-width:100%!important`——
 *  那是 PenEditMD 自己加的、gzh-design 没有的写法，会让产物臃肿且粘贴到公众号不稳。 */
const COMPAT_RULES = `
# 公众号 HTML 兼容性铁律（必须 100% 遵守，违反即粘贴后样式丢失）
1. 标签白名单：只可用 <section> <p> <span> <strong> <em> <img> <br> <h3> 这 8 个标签。
2. 所有可见中文文字必须用 <span leaf="">…</span> 包裹，保证粘贴到公众号编辑器后样式不丢失。
3. 100% 内联样式：禁止 <style> 标签、class、id、外部 CSS、<link>、<script>、外部字体；所有样式写在 style="" 里。
4. 禁止 <div>；标题层级用小节 <h3> 或 <section> + font-size 模拟，不用 <h1>~<h2>/<h4>~<h6>。
5. 颜色只能写 #hex / rgb() / rgba()，禁止 hsl() / oklch() / var() / calc()。
6. 布局主力用 flex（最稳定）；禁止 grid、display:grid（SVG 内除外）、绝对定位叠加、float、@media、@keyframes、CSS 变量。
7. 字号基准：正文 14px，行高 1.7–1.85，字间距 0.3px；标题用 font-size 放大 + font-weight 区分层级。
8. 装饰只用 flex + border + background + emoji 实现，不依赖 <svg> 或不安全 CSS。
9. 容器用 max-width:677px;margin:0 auto;background:#fff 模拟公众号阅读区；内部元素不要加 box-sizing 或 !important（组件库已写好正确样式，直接从中取）。段落间用 margin-bottom 留白，<p> 用 margin:0 起手。

# 图片（必须自然适配，不铺满）
- 正文中图片一律 max-width:100%;height:auto;display:block;margin:0 auto（按图片自身尺寸显示、居中，大图缩到容器宽、小图保持原尺寸），不用 width:100%（会把小图拉伸变糊）。
- 只有表格 / 封面卡 / 流程图这类布局元素才用 width:100%。
- 图片说明：只有 ![说明](url) 里真有说明文字才生成说明组件；空 alt 不编造说明。
- 来自 Markdown 的图片原样保留其 URL（http/https 外部图不重传）；本地相对路径图片保留原路径，由用户后续替换。

# 招牌排版特性（必须做）
- 章节自动编号：按 ## 出现顺序分配 01/02/03…；末章若为结语/总结类，用 ∞ 编号变体（未说明时沿用数字编号）。
- 英文标签：据中文章节标题生成英文标签（实测→TEST、教程→TUTORIAL、总结→SUMMARY、思考→THOUGHTS…），主题库有对应槽位时使用。
- 正文关键词下划线（核心特色）：对每个正文段落主动找 1–3 个最重要短语，用所选主题的下划线 CSS 标记（每段 1–3 处，4–15 字，优先核心观点/结论/关键数据/专有名词）。即使原文无加粗也要主动加下划线。
- 引言卡 + 目录：文章开头 > 引用块做成引言卡；从所有 ## 取前 3 个作导读/目录要点（精选 3 个，不是全量章节列表）。
- 代码块紧凑：每个代码行用 <p style="margin:0"> 包，绝不用 white-space:pre（会把缩进渲染成大左缩进+空行）；缩进只用全角空格，行距靠 line-height:1.6。
- 作者签名区（末尾一处，仅末尾）：用占位 {{作者名}} / {{简介}} 让用户替换；第一句"我是 {{作者名}}，{{一句话简介}}"，第二句"如果你觉得今天这篇有收获，欢迎点赞、在看、转发三连，我们下篇见"。原文末尾已有作者签名段则直接沿用原文。
- 中文全角标点：正文标点一律全角（，。！？：；""''（）—— …），代码块/行内代码/英文专名/URL/代码标识符内部保持半角原样（生成 HTML 时直接写弯引号，不要先写直引号再替换）。

# Do & Don't（真实踩坑）
- DON'T：漏 <span leaf> 包裹（最致命，粘贴后样式整片丢失）。
- DON'T：突出标题/强调用小标签或左竖条（左竖条小标题/药丸标签/左竖条金句提示块），不要用四周虚线框（dashed border）包标题（笨重抢戏）。
- DON'T：跨主题混用组件（一篇只用所选主题的一套组件 + 通用增量库）。
- DON'T：锚点层（主色加粗、深色底白字引用）全文 ≤ 5 处，到处加粗等于没重点。
- DON'T：半角标点混用（代码内除外）；列表项里的关键描述同样要标下划线。
- DON'T：输出任何解释、前后缀或 Markdown 代码块包裹，只输出 HTML 本身。

# 输出格式要求
- 输出一个纯 <section> 正文片段（从全局容器 <section> 开始，不要包 <!DOCTYPE>/<html>/<head>/<body>）——公众号编辑器只接受正文片段，多余的文档外壳会被丢弃或干扰粘贴。
- 最外层用全局容器 <section> 设置整体背景色、内边距与最大宽度（如 style="max-width:677px;margin:0 auto;background:#ffffff;"）模拟公众号阅读区。
- 只输出 HTML 片段，不要任何解释或代码块包裹。`;

/** 拼出注入 AI 的「方法论 + 真实组件库」提示词（与 gzh-design-skill 一致：
 *  规则 + 选中主题完整组件 HTML + 通用增量库 + 配方表，强制从中取组件）。
 * 单独导出，便于在 ai-layout.log 中完整打印，让用户核对实际发给模型的提示词。
 * @param {string|null} themeId 选中的主题 id；null/省略表示让 AI 自由决定（用默认库+主题清单） */
export function buildAiLayoutInstruction(themeId) {
  const langDesc = DESIGN_LANGUAGES.map(
    (l) =>
      `- ${l.name}（${l.id}，主色 ${l.mainColor}）：气质「${l.vibe}」，最适合「${l.fit}」`
  ).join("\n");

  // 真实组件库：指定主题取对应库；自由模式取默认库作为结构模板 + 主题清单供选型
  const library = getThemeLibrary(themeId);
  const freeMode = !themeId;
  const librarySection = freeMode
    ? `（自由选题模式）下面附【默认主题库·${DEFAULT_THEME_ID}】作组件结构模板；你选定主题后，按其主色替换配色，组件骨架与所附库保持一致。\n\n` +
      `### 主题清单（题材→主题契合参考，自选时照此选）\n${themeIndex}\n\n` +
      `### 默认主题组件库（结构模板，HTML 从中取）\n${library}`
    : `### 本次所选主题组件库（HTML 一律从中取，不要手写）\n${library}`;

  return (
    "你是一个公众号 AI 排版引擎（遵循 gzh-design-skill 方法论）。你的工作流：\n" +
    "Phase 0 读取并分析文章类型/情绪/结构（教程/盘点/观点/访谈/数据/随笔/案例）；\n" +
    `Phase 1 从 ${DESIGN_LANGUAGES.length} 套主题中选最契合的一套（或按用户指定），确定主色与强调色；\n` +
    "Phase 2 读组件库：下方附所选主题的【完整组件库 HTML】+【通用增量库】——所有组件 HTML 一律从中取用、按需替换占位文字，不要凭记忆手写新组件；\n" +
    "Phase 3 按该主题「文章类型→组件组合配方」确定核心组件组合与点缀组件，逐组件装配生成公众号兼容 HTML 片段；\n" +
    "Phase 4 自检符合兼容性铁律（尤其 <span leaf> 包裹、内联样式、图片自适应、不跨主题混用）后交付。\n\n" +
    "可选主题（仅摘要）：\n" +
    langDesc +
    "\n\n" +
    COMPAT_RULES +
    "\n\n" +
    "# 组件库（必读，HTML 一律从中取）\n" +
    "通用增量库（代码块/图片·GIF/小标签标题，所有主题共用，套用当前主题主色）：\n" +
    commonComponents +
    "\n\n" +
    librarySection +
    "\n\n" +
    "请按上述规范完成 AI 排版：选择最契合的主题（或说明你想要的感觉），从组件库取现成 HTML 逐段装配，生成可直接粘贴公众号的、100% 内联的纯 <section> HTML 片段。只输出 HTML 片段。"
  );
}

/** 拼出给 AI 的完整消息数组。
 * 注意：折叠为单条 user 消息，不依赖 system 角色——
 * 很多 OpenAI 兼容接口/代理对 system 角色支持差（忽略或静默返回空），
 * 会导致排版返回空内容。这与能正常工作的「行内 AI」保持同一结构。
 * @param {string} md 文章 Markdown 源
 * @param {object|null} theme 选中的主题对象（{id,name,mainColor,vibe,fit}）；null/省略表示让 AI 自由选择 */
export function buildAiLayoutMessages(md, theme) {
  const instruction = buildAiLayoutInstruction(theme && theme.id ? theme.id : null);
  let themeLine;
  if (theme && theme.name) {
    // 指定主题：强约束使用该主题的配色与组件风格，不混用其它主题
    themeLine =
      `\n\n【指定主题】请务必使用「${theme.name}」主题完成本次排版` +
      (theme.mainColor ? `（主色 ${theme.mainColor}）` : "") +
      (theme.vibe ? `，气质：${theme.vibe}` : "") +
      "。严格遵循该主题的设计语言、配色（以主色为视觉锚点）与组件风格，不要混用其它主题。" +
      (theme.fit ? `该主题适用：${theme.fit}。` : "");
  } else {
    // 不指定主题：AI 根据文章自行选择最契合的一套（或自由设计）
    themeLine =
      `\n\n【主题自由选择】不指定主题：请根据文章类型、情绪与结构，从内置 ${DESIGN_LANGUAGES.length} 套主题中自主选最契合的一套（或按你的判断自由设计），确定主色与强调色；组件结构参考所附默认主题库，配色按所选主题主色替换。`;
  }
  const content =
    instruction +
    themeLine +
    "\n\n下面是文章的 Markdown 源：\n\n" +
    md +
    "\n\n请按上述规范完成 AI 排版，生成可直接粘贴公众号的、100% 内联的纯 <section> HTML 片段。只输出 HTML 片段。";

  return [{ role: "user", content: content }];
}

/** 去掉模型可能多包的代码围栏（```html … ```），保证拿到的是纯 HTML */
export function stripCodeFence(text) {
  if (!text) return text;
  let s = text.trim();
  const fence = s.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/i);
  if (fence) s = fence[1].trim();
  // 若仍以 <!doctype 或 <html 开头则返回，否则尝试从第一个 <!doctype 截取
  const i = s.search(/<!doctype\s+html/i);
  if (i > 0) s = s.slice(i).trim();
  return s;
}
