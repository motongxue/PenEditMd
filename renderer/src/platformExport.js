/**
 * platformExport.js — 主题平台导出编译器（PRD #7）
 *
 * 一份中性 Markdown，编译成可直接粘贴/上传到公众号的产物：
 * - 公众号：内联化 HTML（去 class/id，把所有计算样式拍平到 style 属性），
 *   粘贴进公众号编辑器即为带样式的图文。图片以 base64 内嵌（微信对 base64 支持有限，
 *   复杂场景需先传微信图床——见导出提示）。
 *
 * 纯前端实现，不依赖主进程；复用 preview.renderFullHtml 保证与预览视觉一致。
 */
import { renderFullHtml } from "./preview.js";
import { expandMarkdown } from "./imageStore.js";
import { exportCss } from "./exportStyle.js";
import { getKatexExportCss } from "./math.js";

/** 把渲染后的 body HTML 编译成「内联样式」版本（供公众号粘贴） */
async function inlineStyles(body) {
  let css = exportCss;
  if (body.includes("katex")) {
    try {
      css += "\n" + (await getKatexExportCss());
    } catch (_) {
      /* 公式 CSS 缺失不致命 */
    }
  }
  const doc = new DOMParser().parseFromString(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`,
    "text/html",
  );
  // 把所有计算样式拍平到元素的 style 属性，去掉 class/id（公众号按内联样式渲染）
  doc.querySelectorAll("*").forEach((el) => {
    const cs = getComputedStyle(el);
    let inline = "";
    for (let i = 0; i < cs.length; i++) {
      const prop = cs.item(i);
      const val = cs.getPropertyValue(prop);
      if (val) inline += `${prop}:${val};`;
    }
    if (inline) el.setAttribute("style", inline);
    el.removeAttribute("class");
    el.removeAttribute("id");
  });
  // 清理无关注释/脚本/样式标签
  doc.querySelectorAll("style, script, link, meta, title").forEach((n) => n.remove());
  return doc.body.innerHTML;
}

/** 公众号图文：内联化 HTML（含 base64 图片） */
export async function toWechatHtml(md) {
  const body = renderFullHtml(expandMarkdown(md || ""));
  return await inlineStyles(body);
}

/** 取元素纯文本（去掉首尾空白与多余换行） */
function textOf(el) {
  return (el.textContent || "").replace(/\s+/g, " ").trim();
}
