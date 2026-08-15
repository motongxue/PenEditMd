/**
 * aiLayoutThemes.js
 * --------------------------------------------------------------------------
 * 把 gzh-design-skill 的「主题组件库」原样打包进 笔削 PenEditMd，
 * 通过 Vite 的 ?raw 导入在构建期把 Markdown 文本内联为字符串，
 * 运行时零额外请求、打包后也可直接用。
 *
 * 目的：让「全文 AI 排版」真正复用 gzh-design 的现成组件 HTML（与 WorkBuddy
 * 同一套「操作手册」），而不是只给模型规则摘要让它凭记忆手写——后者正是
 * PenEditMD 过去排版比 WorkBuddy 差的根本原因。
 *
 * 每个主题库均含：设计变量速查表 / 各组件完整内联 HTML / 完整文章模板骨架 /
 * 文章类型→组件组合配方 / Markdown→组件映射规则。注入提示词时整体附给模型，
 * 并强制「HTML 一律从中取，不要手写」。
 */

// 12 套主题组件库（与 aiDesignSkill.js 的 DESIGN_LANGUAGES.id 一一对应）
import moyuGreen from "../assets/ai-layout/theme-moyu-green.md?raw";
import redWhite from "../assets/ai-layout/theme-red-white.md?raw";
import graphiteMinimal from "../assets/ai-layout/theme-graphite-minimal.md?raw";
import zenWhitespace from "../assets/ai-layout/theme-zen-whitespace.md?raw";
import moyuTicket from "../assets/ai-layout/theme-moyu-ticket.md?raw";
import oliveJournal from "../assets/ai-layout/theme-olive-journal.md?raw";
import minimalBlue from "../assets/ai-layout/theme-minimal-blue.md?raw";
import warmPaper from "../assets/ai-layout/theme-warm-paper.md?raw";
import nightCyan from "../assets/ai-layout/theme-night-cyan.md?raw";
import forestGreen from "../assets/ai-layout/theme-forest-green.md?raw";
import crimsonEditorial from "../assets/ai-layout/theme-crimson-editorial.md?raw";
import inkGold from "../assets/ai-layout/theme-ink-gold.md?raw";

// 通用增量库（代码块 / 图片·GIF / 小标签标题，所有主题共用）
import commonComponents from "../assets/ai-layout/common-components.md?raw";

// 主题清单（题材→主题契合参考，自由选题时给模型看）
import themeIndex from "../assets/ai-layout/theme-index.md?raw";

/** theme.id（见 aiDesignSkill.js DESIGN_LANGUAGES）→ 该主题组件库原始 Markdown */
export const THEME_LIBRARY = {
  "moyu-green": moyuGreen,
  "red-white": redWhite,
  "graphite-minimal": graphiteMinimal,
  "zen-whitespace": zenWhitespace,
  "moyu-ticket": moyuTicket,
  "olive-journal": oliveJournal,
  "minimal-blue": minimalBlue,
  "warm-paper": warmPaper,
  "night-cyan": nightCyan,
  "forest-green": forestGreen,
  "crimson-editorial": crimsonEditorial,
  "ink-gold": inkGold,
};

/** 默认主题库（自由选题时的结构模板；所有主题组件骨架同构，仅配色不同） */
export const DEFAULT_THEME_ID = "moyu-green";

/** 取指定主题的组件库文本；未指定或缺失时回退默认主题 */
export function getThemeLibrary(themeId) {
  if (themeId && THEME_LIBRARY[themeId]) return THEME_LIBRARY[themeId];
  return THEME_LIBRARY[DEFAULT_THEME_ID];
}

export { commonComponents, themeIndex };
