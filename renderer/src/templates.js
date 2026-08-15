/**
 * templates.js — 公众号 / 头条 主题目录库（基于秀米/135/稿轻松等主流工具的设计规律）
 *
 * 每个主题含三部分：
 * - theme：配色 / 字号 / 行距 / 段距 / 字体。会被注入「编辑器预览」(CSS) 与
 *   「docx 导出」(OOXML)，使公众号/头条导入即得排版，所见即所得。
 * - skeleton：Markdown 骨架（带示例文案占位），用户选中后载入编辑区改写。
 * - rules：导出前校验规则，不符合时在编辑区提示并阻止导出。
 *
 * 设计规律（来自市场调研）：
 *   正文 15–16px、小标题 16–18px、大标题 18–22px；行距 1.5–1.75；段间距 10–15px；
 *   正文深灰非纯黑；主色 ≤1 + 辅助色 ≤2；引用块做提示框；首行不缩进、两端对齐。
 */

import { expandMarkdown } from "./imageStore.js";

const IMG_MAX = 2 * 1024 * 1024; // 公众号单图建议 ≤2MB

/* ---------- 导出校验规则（平台通用） ---------- */
export const RULES = [
  {
    id: "title",
    level: "error",
    test(md) {
      const levels = [...md.matchAll(/^(#{1,6})\s+/gm)].map((m) => m[1].length);
      const h1 = levels.filter((l) => l === 1).length;
      if (h1 === 0) return "缺少文章标题：请在最开头用「# 标题」写文章标题。";
      if (h1 > 1) return "检测到多个一级标题（#），公众号/头条文章只需一个标题，其余请改为二级标题（##）。";
      return true;
    },
  },
  {
    id: "hierarchy",
    level: "error",
    test(md) {
      const levels = [...md.matchAll(/^(#{1,6})\s+/gm)].map((m) => m[1].length);
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i - 1] > 1)
          return "标题层级跳跃（如 # 之后直接 ###），请按顺序使用 ## / ### 逐级展开。";
      }
      return true;
    },
  },
  {
    id: "body",
    level: "error",
    test(md) {
      const text = md
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
        .replace(/[#>*`\-]/g, "")
        .replace(/\s+/g, "")
        .trim();
      if (text.length < 50) return "正文内容太少（少于 50 字），公众号文章至少写点内容吧。";
      return true;
    },
  },
  {
    id: "image",
    level: "warn",
    test(md, expanded) {
      const re = /!\[([^\]]*)\]\((data:image\/[^;]+;base64,([A-Za-z0-9+/=]+))\)/g;
      const warns = [];
      let m;
      while ((m = re.exec(expanded))) {
        const bytes = Math.floor((m[3] || "").length * 3 / 4);
        if (bytes > IMG_MAX) {
          const mb = (bytes / 1048576).toFixed(1);
          warns.push(`图片「${m[1] || "未命名"}」约 ${mb}MB，超过公众号建议的 2MB，可能被拒绝导入，建议压缩或换图床链接。`);
        }
      }
      return warns.length ? warns.join("；") : true;
    },
  },
  {
    id: "paragraph",
    level: "warn",
    test(md) {
      const paras = md
        .split(/\n\s*\n/)
        .map((s) => s.replace(/[#>*`\-]/g, "").replace(/\s+/g, "").trim())
        .filter(Boolean);
      const long = paras.filter((p) => p.length > 800);
      if (long.length) return `有 ${long.length} 段超过 800 字，建议按小标题拆分，移动端阅读更轻松。`;
      return true;
    },
  },
];

/* ---------- 主题骨架复用的组件片段 ---------- */
// 让「套用主题」直接呈现组件样式（信息卡/提示/编号标题/结尾），而非原始 > 引用。
function cInfocard(cap, body) {
  return `<div class="tmpl-keep tmpl-infocard"><div class="tmpl-ic-cap">${cap}</div><div class="tmpl-ic-body">${body}</div></div>`;
}
function cTip(body) {
  return `<div class="tmpl-keep tmpl-infocard"><div class="tmpl-ic-cap">提示</div><div class="tmpl-ic-body">${body}</div></div>`;
}
function cHnum(n, t) {
  return `<div class="tmpl-keep tmpl-hnum"><h2><span class="tmpl-badge">${n}</span>${t}</h2></div>`;
}
const C_ENDING =
  '<hr><p>欢迎关注「你的公众号名称」</p><blockquote>点击下方卡片，第一时间收到更新</blockquote><p><br></p>';

/* ---------- 主题定义（主题 = Design Tokens + 语义层 vibe/scenes） ----------
 * 6 套对齐 gzh-design 文章1；色值对照 GitHub clincherkong168/gzh-design-skill 真实文件。
 * 中性色统一用 Tailwind 灰阶，不随主题染色（muted/border/divider/surface/codeBg 等）。
 * 主题仅作用于「发布」四出口（公众号HTML/docx/PNG）+ 预览/编辑区；MD/HTML/PDF 导出保持中性。 */

// 中性灰阶基准（不随主题染色；个别主题会覆盖成自己的灰阶，见下）
export const NEUTRAL = {
  title: "#111827",
  text: "#374151",
  muted: "#6B7280",
  border: "#E5E7EB",
  divider: "#D1D5DB",
  surface: "#FFFFFF",
  codeBg: "#F3F4F6",
  codeText: "#1F2937",
  quoteBg: "#F9FAFB",
};

// 通用骨架（复用上方 cInfocard / cHnum / cTip / C_ENDING）
function buildSkeleton({ title, lead, p1, p2, tip }) {
  return `# ${title}\n\n${cInfocard("导语", lead)}\n\n${cHnum("01", p1)}\n\n这里是正文段落。保持单段 2–3 行，阅读更轻松，避免大段文字堆砌带来压迫感。\n\n${cHnum("02", p2)}\n\n- 要点一\n- 要点二\n- 要点三\n\n${cTip(tip)}\n\n${C_ENDING}`;
}

const FONT = { font: "微软雅黑", fontAscii: "Calibri" };
const SIZE = { bodySize: 15, titleSize: 22, h2Size: 18, lineHeight: 1.75, paraAfter: 10, justify: true };

export const THEMES = [
  {
    id: "moyu-green",
    name: "摸鱼绿",
    desc: "治愈绿主色 · 清爽留白，适合教程 / 测评 / 清单",
    category: "清新",
    vibe: "清爽 · 治愈 · 轻运营",
    scenes: ["教程", "测评", "清单", "工具盘点"],
    theme: {
      ...FONT, ...SIZE,
      accent: "#059669", accentSoft: "#ECFDF5", accentUnderline: "#A7F3D0",
      title: "#111827", text: "#374151", muted: "#6B7280",
      border: "#E5E7EB", divider: "#D1D5DB", surface: "#FFFFFF",
      quoteBg: "#F9FAFB", codeBg: "#F3F4F6", codeText: "#1F2937",
    },
    skeleton: buildSkeleton({
      title: "用摸鱼的心态，把效率拉满",
      lead: "一句治愈系开场，让读者愿意往下读。",
      p1: "效率工具清单", p2: "我的使用心得",
      tip: "把最重要的结论放在这里，读者一眼就能抓住。",
    }),
  },
  {
    id: "red-white",
    name: "红白色系",
    desc: "态度红主色 · 力量感，适合深度分析 / 观点",
    category: "态度",
    vibe: "态度 · 力量 · 热点",
    scenes: ["深度分析", "观点", "力量感"],
    theme: {
      ...FONT, ...SIZE,
      accent: "#DC2626", accentDeep: "#991B1B", accentSoft: "#FEF2F2", accentUnderline: "#FECACA",
      title: "#1C1917", text: "#374151", muted: "#9CA3AF",
      border: "#E5E7EB", divider: "#D1D5DB", surface: "#FFFFFF",
      quoteBg: "#FEF2F2", codeBg: "#F3F4F6", codeText: "#1F2937",
    },
    skeleton: buildSkeleton({
      title: "为什么这件事，越早想清楚越好",
      lead: "一个值得争论的观点，抛出来引发思考。",
      p1: "核心矛盾", p2: "我的判断",
      tip: "态度鲜明：别怕差异化，记忆点来自鲜明的立场。",
    }),
  },
  {
    id: "graphite-minimal",
    name: "石墨极简",
    desc: "灰黑主色 · 克制专业，适合设计 / 科技评论",
    category: "极简",
    vibe: "理性 · 克制 · 专业",
    scenes: ["设计", "科技评论", "专业观点"],
    theme: {
      ...FONT,
      bodySize: 15, titleSize: 22, h2Size: 18, lineHeight: 1.7, paraAfter: 10, justify: true,
      accent: "#52525B", accentSoft: "#FAFAFA", accentUnderline: "#52525B", accentOrange: "#F97316",
      title: "#27272A", text: "#52525B", muted: "#A1A1AA",
      border: "#E4E4E7", divider: "#D4D4D8", surface: "#FFFFFF",
      quoteBg: "#FAFAFA", codeBg: "#F4F4F5", codeText: "#1F2937",
    },
    skeleton: buildSkeleton({
      title: "少即是多：一份克制的设计清单",
      lead: "去掉多余，只留必要。",
      p1: "原则", p2: "取舍",
      tip: "专业内容重在逻辑清晰，不靠装饰。",
    }),
  },
  {
    id: "zen-whitespace",
    name: "留白禅意",
    desc: "青灰主色 · 衬线留白，适合禅意 / 极简生活",
    category: "禅意",
    vibe: "安静 · 呼吸 · 留白",
    scenes: ["禅意", "极简生活", "深度随笔"],
    theme: {
      font: "宋体", fontAscii: "Georgia",
      bodySize: 15, titleSize: 21, h2Size: 17, lineHeight: 1.8, paraAfter: 12, justify: true,
      accent: "#4A5D52", accentSoft: "#EEF3F0", accentUnderline: "#B5C8BC", highlight: "#D6E4DC",
      title: "#2B2B2B", text: "#525252", muted: "#A3A3A3",
      border: "#E8E8E8", divider: "#DCDCDC", surface: "#FFFFFF",
      quoteBg: "#FAFAFA", codeBg: "#F9FAFB", codeText: "#1F2937",
    },
    skeleton: buildSkeleton({
      title: "留白，是给生活的一点呼吸",
      lead: "有些话，适合在安静的时候慢慢说。",
      p1: "起风的时候", p2: "灯下的人",
      tip: "后来才懂，最深的情绪往往没有声音。",
    }),
  },
  {
    id: "moyu-ticket",
    name: "摸鱼票据",
    desc: "同主色 + 纸感黄 / 硬黑边 / 品牌紫，适合工具对比",
    category: "手作",
    vibe: "复古 · 票据 · 手作感",
    scenes: ["工具对比", "创意评测"],
    theme: {
      ...FONT, ...SIZE,
      accent: "#059669", accentSoft: "#F0FDF4", accentUnderline: "#A7F3D0", brand: "#7C3AED",
      title: "#1a1a1a", text: "#374151", muted: "#888888",
      border: "#EEEEEE", divider: "#D1D5DB", surface: "#FFFEF8",
      quoteBg: "#FFFEF8", codeBg: "#F3F4F6", codeText: "#1F2937",
    },
    skeleton: buildSkeleton({
      title: "两张票据，看懂工具怎么选",
      lead: "复古票据风，把对比讲清楚。",
      p1: "工具 A", p2: "工具 B",
      tip: "用虚线撕票感，区分不同方案的边界。",
    }),
  },
  {
    id: "olive-journal",
    name: "橄榄手记",
    desc: "墨黑主色 + 橙色点睛，适合内刊 / 深度评测",
    category: "内刊",
    vibe: "手记 · 内刊 · 温度",
    scenes: ["内刊手记", "深度评测", "案例复盘"],
    theme: {
      ...FONT, ...SIZE,
      accent: "#1e1f23", accentSoft: "#EEEFE9", accentUnderline: "#ed7b2f", accentOrange: "#ed7b2f",
      title: "#23251d", text: "#4d4f46", muted: "#65675e",
      border: "#bfc1b7", divider: "#aeb0a6", surface: "#FDFDF8",
      quoteBg: "#EEEFE9", codeBg: "#E5E7E0", codeText: "#1F2937",
    },
    skeleton: buildSkeleton({
      title: "内刊手记：这一期的三个发现",
      lead: "像翻一本小册子，慢慢读。",
      p1: "发现一", p2: "发现二",
      tip: "手记的体温，来自具体的细节与案例。",
    }),
  },
];

/* ---------- 排版组件库（参考秀米的模块化组件思路） ----------
 * 每个组件都给出「源码 Markdown」与「富文本 HTML」两版，
 * 由当前主题（accent / accentSoft）在预览与导出 docx 中统一着色。
 * 选主题不再是「整篇骨架」，而是按需把组件插入光标处自由组合。 */
export const COMPONENTS = [
  {
    id: "h1",
    name: "主色大标题",
    group: "标题",
    md: "# 在此输入大标题\n\n",
    html: "<h1>在此输入大标题</h1><p><br></p>",
  },
  {
    id: "h2",
    name: "小节标题",
    group: "标题",
    md: "## 在此输入小标题\n\n",
    html: "<h2>在此输入小标题</h2><p><br></p>",
  },
  {
    id: "quote",
    name: "引用卡片",
    group: "引用",
    md: "> 在此输入引用内容\n\n",
    html: "<blockquote>在此输入引用内容</blockquote><p><br></p>",
  },
  {
    id: "tip",
    name: "重点提示",
    group: "引用",
    md: "> **重点**：在此输入提示内容\n\n",
    html: "<blockquote><strong>重点</strong>：在此输入提示内容</blockquote><p><br></p>",
  },
  {
    id: "hr",
    name: "分割线",
    group: "分隔",
    md: "\n---\n\n",
    html: "<hr><p><br></p>",
  },
  {
    id: "ending",
    name: "结尾引导关注",
    group: "结尾",
    md: "\n---\n\n欢迎关注「你的公众号名称」\n\n> 点击下方卡片，第一时间收到更新\n\n",
    html: "<hr><p>欢迎关注「你的公众号名称」</p><blockquote>点击下方卡片，第一时间收到更新</blockquote><p><br></p>",
  },
  {
    id: "hnum",
    name: "编号标题",
    group: "标题",
    md: "## 01 小节标题\n\n",
    html: '<div class="tmpl-keep tmpl-hnum"><h2><span class="tmpl-badge">01</span>小节标题</h2></div>',
  },
  {
    id: "infocard",
    name: "信息卡片",
    group: "卡片",
    md: "> 💡 **提示**\n> 这里是信息卡片内容，一句话说清要点。\n\n",
    html:
      '<div class="tmpl-keep tmpl-infocard"><div class="tmpl-ic-cap">提示</div><div class="tmpl-ic-body">这里是信息卡片内容，一句话说清要点，放在卡片里更醒目。</div></div>',
  },
  {
    id: "datacard",
    name: "数据模块",
    group: "卡片",
    md: "> **98%** — 用户满意度\n\n",
    html:
      '<div class="tmpl-keep tmpl-datacard"><div class="tmpl-big">98%</div><div class="tmpl-cap">用户满意度</div></div>',
  },
  {
    id: "imgtxt",
    name: "图文并排",
    group: "图文",
    md: "> 🖼️ **图片占位** ｜ 右侧说明文字：图文左右对应。\n\n",
    html:
      '<div class="tmpl-keep tmpl-imgtxt"><div class="tmpl-it-img">图片</div><div class="tmpl-it-body"><div class="tmpl-it-cap">小标题</div><div>右侧说明文字，图文左右对应，案例 / 产品介绍常用。</div></div></div>',
  },
  {
    id: "toc",
    name: "目录导航",
    group: "导航",
    dynamic: "toc", // 插入时按正文标题自动生成，可用「更新目录」重新生成
    md: "**目录**\n1. 第一节\n2. 第二节\n3. 第三节\n\n",
    html:
      '<div class="tmpl-keep tmpl-toc"><div class="tmpl-toc-title">目录</div><div class="tmpl-toc-item">1. 第一节</div><div class="tmpl-toc-item">2. 第二节</div><div class="tmpl-toc-item">3. 第三节</div></div>',
  },
  {
    id: "author",
    name: "作者名片",
    group: "名片",
    md: "> 👤 **作者名** · 一句话简介\n> 扫码关注👇\n\n",
    html:
      '<div class="tmpl-keep tmpl-author"><div class="tmpl-avatar">头像</div><div class="tmpl-a-info"><div class="tmpl-a-name">作者名</div><div class="tmpl-a-bio">一句话简介 · 点击下方关注</div></div><div class="tmpl-qr">关注\n二维码</div></div>',
  },
  {
    id: "tags",
    name: "贴纸标签",
    group: "标签",
    md: "**NEW** · **重点** · **安排**\n\n",
    html:
      '<div class="tmpl-keep tmpl-tags"><span class="tmpl-tag tmpl-tag-accent">NEW</span><span class="tmpl-tag">重点</span><span class="tmpl-tag">安排</span></div>',
  },
  {
    id: "timeline",
    name: "时间轴",
    group: "时间",
    md: "> **2020** 事件一\n> **2021** 事件二\n> **2022** 事件三\n\n",
    html:
      '<div class="tmpl-keep tmpl-timeline"><div class="tmpl-tl-item"><span class="tmpl-tl-dot"></span><div class="tmpl-tl-time">2020</div><div class="tmpl-tl-text">事件一</div></div><div class="tmpl-tl-item"><span class="tmpl-tl-dot"></span><div class="tmpl-tl-time">2021</div><div class="tmpl-tl-text">事件二</div></div><div class="tmpl-tl-item"><span class="tmpl-tl-dot"></span><div class="tmpl-tl-time">2022</div><div class="tmpl-tl-text">事件三</div></div></div>',
  },
  {
    id: "steps",
    name: "步骤条",
    group: "流程",
    md:
      "**步骤 1 · 准备**：一句话说明这一步要做什么。\n\n" +
      "**步骤 2 · 执行**：一句话说明这一步要做什么。\n\n" +
      "**步骤 3 · 复盘**：一句话说明这一步要做什么。\n\n",
    html:
      '<div class="tmpl-keep tmpl-steps">' +
      '<div class="tmpl-step"><span class="tmpl-step-no">1</span><div class="tmpl-step-body"><div class="tmpl-step-title">准备</div><div class="tmpl-step-text">一句话说明这一步要做什么。</div></div></div>' +
      '<div class="tmpl-step"><span class="tmpl-step-no">2</span><div class="tmpl-step-body"><div class="tmpl-step-title">执行</div><div class="tmpl-step-text">一句话说明这一步要做什么。</div></div></div>' +
      '<div class="tmpl-step"><span class="tmpl-step-no">3</span><div class="tmpl-step-body"><div class="tmpl-step-title">复盘</div><div class="tmpl-step-text">一句话说明这一步要做什么。</div></div></div>' +
      "</div>",
  },
  {
    id: "hline",
    name: "线框标题",
    group: "标题",
    md: "## 在此输入小标题\n\n",
    html:
      '<div class="tmpl-keep tmpl-hline"><h2>在此输入小标题</h2></div>',
  },
  {
    id: "hfill",
    name: "底色标题",
    group: "标题",
    md: "## 在此输入小标题\n\n",
    html:
      '<div class="tmpl-keep tmpl-hfill"><h2>在此输入小标题</h2></div>',
  },
  {
    id: "hsub",
    name: "主副标题",
    group: "标题",
    md: "# 主标题\n\n副标题：一句话补充说明\n\n",
    html:
      '<div class="tmpl-keep tmpl-hsub"><h1 class="tmpl-hsub-main">主标题</h1><div class="tmpl-hsub-sub">副标题：一句话补充说明</div></div>',
  },
  {
    id: "imgframe",
    name: "圆角配图框",
    group: "图文",
    md: "> 🖼️ **图片占位**\n> 图注：一句话说明这张图\n\n",
    html:
      '<div class="tmpl-keep tmpl-imgframe"><div class="tmpl-if-img">图片占位</div><div class="tmpl-if-cap">图注：一句话说明这张图</div></div>',
  },
  {
    id: "grid3",
    name: "九宫格拼图",
    group: "图文",
    md: "> 🖼️ 图1 ｜ 图2 ｜ 图3\n\n",
    html:
      '<div class="tmpl-keep tmpl-grid3"><div class="tmpl-g-cell">图1</div><div class="tmpl-g-cell">图2</div><div class="tmpl-g-cell">图3</div></div>',
  },
  {
    id: "card",
    name: "留白卡片",
    group: "卡片",
    md: "> 把一段正文放进卡片，提升模块感与可读性。\n\n",
    html:
      '<div class="tmpl-keep tmpl-card"><div class="tmpl-card-body">把一段正文放进卡片，提升模块感与可读性，避免大段文字堆砌。</div></div>',
  },
  {
    id: "dialog",
    name: "对话框",
    group: "卡片",
    md: "> **小编**：用对话语气拉近与读者距离。\n\n",
    html:
      '<div class="tmpl-keep tmpl-dialog"><div class="tmpl-dlg-who">小编</div><div class="tmpl-dlg-text">用对话语气拉近与读者距离，增加亲和力。</div></div>',
  },
  {
    id: "price",
    name: "价格对比卡",
    group: "卡片",
    md: "| 基础版 | 推荐·专业版 | 旗舰版 |\n| --- | --- | --- |\n| ¥99 | ¥199 | ¥299 |\n| 适合个人 | 适合团队 | 适合企业 |\n\n",
    html:
      '<div class="tmpl-keep tmpl-price"><div class="tmpl-p-item"><div class="tmpl-p-name">基础版</div><div class="tmpl-p-num">¥99</div><div class="tmpl-p-desc">适合个人</div></div><div class="tmpl-p-item tmpl-p-rec"><div class="tmpl-p-name">推荐·专业版</div><div class="tmpl-p-num">¥199</div><div class="tmpl-p-desc">适合团队</div></div><div class="tmpl-p-item"><div class="tmpl-p-name">旗舰版</div><div class="tmpl-p-num">¥299</div><div class="tmpl-p-desc">适合企业</div></div></div>',
  },
  {
    id: "share",
    name: "引导分享",
    group: "结尾",
    md: "> 🔁 如果觉得有用，欢迎**分享**给更多朋友\n\n",
    html:
      '<div class="tmpl-keep tmpl-share"><div class="tmpl-share-title">觉得有用？分享给朋友</div><div class="tmpl-share-actions">👍 点赞 · 🔁 转发 · 💬 在看</div></div>',
  },
  {
    id: "fav",
    name: "引导收藏",
    group: "结尾",
    md: "> ⭐ 觉得不错，点击右上角**收藏**本篇\n\n",
    html:
      '<div class="tmpl-keep tmpl-fav"><div class="tmpl-fav-title">喜欢就收藏</div><div class="tmpl-fav-sub">点击右上角「···」收藏本篇，随时回看</div></div>',
  },
  {
    id: "like",
    name: "引导赞·在看",
    group: "结尾",
    md: "> 👍 点个「**赞**」和「**在看**」，是对我最大的鼓励\n\n",
    html:
      '<div class="tmpl-keep tmpl-like"><div class="tmpl-like-title">点个赞和在看</div><div class="tmpl-like-sub">你的「赞」和「在看」，是我更新的动力</div></div>',
  },
  {
    id: "audio",
    name: "音频",
    group: "媒体",
    md: '<div class="tmpl-keep tmpl-audio"><audio controls src=""></audio><div class="tmpl-media-cap">音频说明</div></div>\n\n',
    html:
      '<div class="tmpl-keep tmpl-audio"><audio controls src=""></audio><div class="tmpl-media-cap">音频说明</div></div>',
  },
  {
    id: "video",
    name: "视频",
    group: "媒体",
    md: '<div class="tmpl-keep tmpl-video"><video controls src=""></video><div class="tmpl-media-cap">视频说明</div></div>\n\n',
    html:
      '<div class="tmpl-keep tmpl-video"><video controls src=""></video><div class="tmpl-media-cap">视频说明</div></div>',
  },
];

export const CATEGORIES = ["全部", "清新", "态度", "极简", "禅意", "手作", "内刊"];

/** 默认主题（无主题时使用，供一键配色派生） */
export const DEFAULT_THEME = {
  ...FONT, ...SIZE,
  accent: "#1F2328", accentSoft: "#F6F8FA", accentUnderline: "#1F2328",
  title: "#111827", text: "#1F2328", muted: "#656D76",
  border: "#E5E7EB", divider: "#D1D5DB", surface: "#FFFFFF",
  quoteBg: "#F6F8FA", codeBg: "#F3F4F6", codeText: "#1F2937",
};

/* ---------- 一键配色：基于当前主题派生自定义主色主题 ---------- */
function hexToRgb(h) {
  h = (h || "").replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0"))
      .join("")
  );
}
/** 把颜色向白色混合 amt(0~1)，得到浅色背景 */
function lighten(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
}
export function deriveTheme(base, accentHex) {
  const b = base || DEFAULT_THEME;
  // 自定义主色：仅重算主色与浅底/下划线；中性色（border/surface/quoteBg 等）沿用基底，不染主题色
  return {
    ...b,
    accent: accentHex,
    accentSoft: lighten(accentHex, 0.86),
    accentUnderline: lighten(accentHex, 0.7),
  };
}

export function getTheme(id) {
  return THEMES.find((t) => t.id === id) || null;
}

/* ---------- 目录组件：按正文标题自动生成 ---------- */

function escapeHtml(s) {
  return String(s || "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

/** 标题文字去标记：去 html 标签（编号徽标）、行内 md 标记、链接语法 */
function cleanHeadingText(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** 标题自带序号（01 / 1. / 2.1 / 一、/ 第三章）时，目录不再重复编号 */
function hasOwnNumber(t) {
  return /^(\d+(\.\d+)+|\d+\s*[.、．)）:：]|\d{1,2}\s+\S|[一二三四五六七八九十百]+\s*[、．.)）]|第\s*[一二三四五六七八九十百\d]+\s*[章节讲篇部课])/.test(
    t
  );
}

/** 从 markdown 中按出现顺序提取标题：# 语法 + 组件里的 <h1~h4>（编号/线框标题等） */
export function extractHeadings(md) {
  const src = String(md || "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/~~~[\s\S]*?~~~/g, "");
  const re = /(?:^|\n)(#{1,4})[ \t]+([^\n]+)|<h([1-4])\b[^>]*>([\s\S]*?)<\/h\3>/gi;
  const out = [];
  let m;
  while ((m = re.exec(src))) {
    const level = m[1] ? m[1].length : Number(m[3]);
    const text = cleanHeadingText(m[1] ? m[2] : m[4]);
    if (text) out.push({ level, text });
  }
  return out;
}

/**
 * 生成目录组件。返回 { html, md, count }。
 * 只取最外两层：顶层编号 1./2.，次级缩进 1.1/1.2；正文没有标题时给占位示例。
 */
export function buildToc(md) {
  let items = extractHeadings(md);
  // 仅有一个一级标题时视为文章大标题，不进目录
  const h1s = items.filter((h) => h.level === 1);
  if (h1s.length === 1 && items.some((h) => h.level > 1)) items = items.filter((h) => h.level !== 1);
  if (!items.length) {
    const c = COMPONENTS.find((x) => x.id === "toc");
    return { html: c.html, md: c.md, count: 0 };
  }
  const base = Math.min(...items.map((h) => h.level));
  const rows = [];
  let top = 0;
  let sub = 0;
  for (const h of items) {
    if (h.level === base) {
      top += 1;
      sub = 0;
      rows.push({ no: hasOwnNumber(h.text) ? "" : `${top}.`, text: h.text, sub: false });
    } else if (h.level === base + 1 && top > 0) {
      sub += 1;
      rows.push({ no: hasOwnNumber(h.text) ? "" : `${top}.${sub}`, text: h.text, sub: true });
    }
  }
  const label = (r) => (r.no ? r.no + " " : "") + r.text;
  const html =
    '<div class="tmpl-keep tmpl-toc"><div class="tmpl-toc-title">目录</div>' +
    rows
      .map(
        (r) => `<div class="tmpl-toc-item${r.sub ? " tmpl-toc-sub" : ""}">${escapeHtml(label(r))}</div>`
      )
      .join("") +
    "</div>";
  // 顶层：自动编号写成有序列表 `1. xxx`；标题自带序号则用 `- 01 xxx`，避免编号重复
  const line = (r) => (r.sub ? `   - ${label(r)}` : r.no ? `${r.no} ${r.text}` : `- ${r.text}`);
  const mdOut = "**目录**\n" + rows.map(line).join("\n") + "\n\n";
  return { html, md: mdOut, count: rows.length };
}

/** 从 start 处的 <div 找到配对的 </div>，返回结束下标（不匹配返回 -1） */
function matchDivEnd(s, start) {
  const re = /<div\b|<\/div>/gi;
  re.lastIndex = start;
  let depth = 0;
  let m;
  while ((m = re.exec(s))) {
    if (m[0].toLowerCase() === "</div>") {
      depth -= 1;
      if (depth <= 0) return m.index + m[0].length;
    } else {
      depth += 1;
    }
  }
  return -1;
}

/** 把正文里所有目录组件替换为新的目录 html，返回 { md, count } */
export function replaceTocBlocks(md, newHtml) {
  // (?![-\w]) 避免误命中内部的 tmpl-toc-title / tmpl-toc-item
  const re = /<div\s[^>]*class="[^"]*\btmpl-toc(?![-\w])[^"]*"[^>]*>/i;
  let out = String(md || "");
  let from = 0;
  let count = 0;
  for (;;) {
    const m = re.exec(out.slice(from));
    if (!m) break;
    const s = from + m.index;
    const e = matchDivEnd(out, s);
    if (e < 0) break;
    out = out.slice(0, s) + newHtml + out.slice(e);
    from = s + newHtml.length;
    count += 1;
  }
  return { md: out, count };
}

/** 对给定 Markdown 跑模板校验，返回 [{level:'error'|'warn', msg}] */
export function validateTemplate(md, template) {
  void template; // 当前所有主题共用同一套平台校验规则
  const expanded = expandMarkdown(md || "");
  const issues = [];
  for (const r of RULES) {
    const res = r.test(md, expanded);
    if (res !== true) issues.push({ level: r.level, msg: res });
  }
  return issues;
}
