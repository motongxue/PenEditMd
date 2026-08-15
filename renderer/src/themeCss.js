/**
 * themeCss.js — 主题 CSS 的唯一产出口。
 *
 * 之前主题只在「预览区」生效：main.js 手搓一段 <style> 注入 document.head，
 * 而 PNG / HTML 导出走 exportStyle.js 的中性配色，导致长图不跟主题。
 * 这里把两件事收敛成同一份实现：
 *
 *   themeVarsCss(theme)        → :root { --tmpl-* }   （Token 变量层）
 *   themeTypographyCss(theme)  → 标题/正文/引用/代码   （排版层，可换作用域）
 *   TMPL_COMPONENT_CSS         → .tmpl-* 组件样式      （组件层，与主题解耦）
 *   themeStyleBlock(theme)     → 三层拼好的完整 CSS    （导出侧一把梭）
 *
 * 组件层刻意从 tmplComponents.css 以 ?raw 读入，而不是在 JS 里重写一份：
 * 组件样式只有一处真源，预览改了导出必然同步，不会再出现两边跑偏。
 */

import TMPL_COMPONENT_CSS_RAW from "../tmplComponents.css?raw";

/** .tmpl-* 组件样式原文（与预览区加载的是同一个文件） */
export const TMPL_COMPONENT_CSS = TMPL_COMPONENT_CSS_RAW || "";

/** 主题缺字段时的兜底，与 templates.js 的 DEFAULT_THEME 语义保持一致 */
const FALLBACK = {
  accent: "#1F2328",
  accentSoft: "#F6F8FA",
  border: "#e2e5e9",
  divider: "#d1d5db",
  surface: "#ffffff",
  quoteBg: "#f9fafb",
  codeBg: "#f3f4f6",
  codeText: "#1f2937",
  text: "#2b2f36",
  muted: "#6b7280",
};

/** Token 变量层：所有 .tmpl-* 组件都靠这批变量换肤 */
export function themeVarsCss(theme, selector) {
  if (!theme) return "";
  const t = theme;
  const sel = selector || ":root";
  return (
    sel +
    " { --tmpl-accent:" + (t.accent || FALLBACK.accent) +
    "; --tmpl-accent-soft:" + (t.accentSoft || FALLBACK.accentSoft) +
    "; --tmpl-accent-underline:" + (t.accentUnderline || t.accent || FALLBACK.accent) +
    "; --tmpl-title:" + (t.title || t.text || FALLBACK.text) +
    "; --tmpl-text:" + (t.text || FALLBACK.text) +
    "; --tmpl-muted:" + (t.muted || FALLBACK.muted) +
    "; --tmpl-border:" + (t.border || FALLBACK.border) +
    "; --tmpl-divider:" + (t.divider || t.border || FALLBACK.divider) +
    "; --tmpl-surface:" + (t.surface || FALLBACK.surface) +
    "; --tmpl-quote-bg:" + (t.quoteBg || FALLBACK.quoteBg) +
    "; --tmpl-code-bg:" + (t.codeBg || FALLBACK.codeBg) +
    "; --tmpl-code-text:" + (t.codeText || FALLBACK.codeText) +
    "; }"
  );
}

/**
 * 排版层：标题/正文/引用/代码的字号、行高、配色。
 * @param {object} theme
 * @param {string[]} scopes 作用域选择器前缀，默认覆盖预览与富文本编辑区。
 *        导出时传 [".markdown-body"] 即可。
 */
export function themeTypographyCss(theme, scopes) {
  if (!theme) return "";
  const t = theme;
  const sc = scopes && scopes.length ? scopes : [".preview.markdown-body", ".rich-input"];
  // 把 "h1" 这类标签名展开成 ".preview.markdown-body h1,.rich-input h1"
  const on = (tag) => sc.map((s) => (tag ? s + " " + tag : s)).join(",");

  const font = t.font || "微软雅黑";
  const align = t.justify === false ? "left" : "justify";
  const paraAfter = t.paraAfter != null ? t.paraAfter : 10;
  const quoteBg = t.quoteBg || "#f6f7f9";
  const quoteBorder = t.quoteBorder || t.border || "#e2e5e9";
  const codeBg = t.codeBg || "#f6f8fa";
  const codeSize = t.codeSize || 13;

  const lines = [
    on("") +
      " { color:" + (t.text || FALLBACK.text) +
      "; font-family:" + font + ',-apple-system,"PingFang SC","Microsoft YaHei",sans-serif' +
      "; font-size:" + (t.bodySize || 15) + "px" +
      "; line-height:" + (t.lineHeight || 1.7) +
      "; text-align:" + align + "; }",
    ["h1", "h2", "h3", "h4", "h5", "h6"].map(on).join(",") +
      " { color:" + (t.accent || FALLBACK.accent) + "; }",
    on("h1") +
      " { border-bottom:2px solid " + (t.accentUnderline || t.accent || FALLBACK.accent) +
      "; padding-bottom:.25em; font-size:" + (t.titleSize || 22) + "px; }",
    on("h2") + " { font-size:" + (t.h2Size || 18) + "px; }",
    on("p") + " { margin:0 0 " + paraAfter + "px; }",
    on("blockquote") +
      " { border-left:3px solid " + quoteBorder +
      "; background:" + quoteBg + "; color:" + (t.text || FALLBACK.text) + "; }",
    on("pre") + " { background:" + codeBg + "; font-size:" + codeSize + "px; }",
    on("code") + " { background:" + codeBg + "; font-size:" + codeSize + "px; }",
    on("a") + " { color:" + (t.accent || FALLBACK.accent) + "; }",
    on("hr") + " { border-top:1px solid " + (t.accent || FALLBACK.accent) + "; }",
  ];
  return lines.join("\n");
}

/**
 * 导出侧一把梭：变量层 + 组件层 + 排版层。
 * 传 null 主题则只给组件层兜底样式（组件仍需渲染，只是不染色）。
 */
export function themeStyleBlock(theme, scopes) {
  const parts = [];
  if (theme) parts.push(themeVarsCss(theme));
  parts.push(TMPL_COMPONENT_CSS);
  if (theme) parts.push(themeTypographyCss(theme, scopes));
  return parts.filter(Boolean).join("\n");
}
