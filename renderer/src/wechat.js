/**
 * wechat.js — 公众号/头条 内联样式导出（只用稳留标签 + 行内 style）
 *
 * 实测公众号编辑器会保留 <section>/<h1-h6>/<p>/<span>/<img>/<br>，
 * 但会剥掉 <div>。因此这里：
 *   - 组件统一转成 <section data-wx="1"> 或 <p data-wx="1"> 根；
 *   - 内部只用 <p>/<span>/<br>，彻底不用 <div>；
 *   - 多列/并排组件（steps/price/grid3/horizontal-timeline/imgtxt）降级为纵向堆叠；
 *   - data-wx 标记让 inlineStyles 跳过组件子树，避免通用 p/h2 样式覆盖；
 *   - 颜色/字号/边框/背景/圆角等仍走内联 style。
 */

import { renderFullHtml } from "./preview.js";
import { expandMarkdown } from "./imageStore.js";
import { DEFAULT_THEME } from "./templates.js";

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fontStack(theme) {
  const base = theme.fontAscii || "Segoe UI, Roboto, Helvetica, Arial, sans-serif";
  const cjk = theme.font || "微软雅黑";
  return `${cjk}, ${base}`;
}
const MONO = '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace';

// github 浅色高亮配色（仅取常用 token）
const HLJS = {
  "hljs-keyword": "#d73a49",
  "hljs-string": "#032f62",
  "hljs-title": "#6f42c1",
  "hljs-built_in": "#e36209",
  "hljs-comment": "#6a737d",
  "hljs-attr": "#005cc5",
  "hljs-number": "#005cc5",
  "hljs-literal": "#005cc5",
  "hljs-type": "#22863a",
  "hljs-function": "#6f42c1",
  "hljs-params": "#24292e",
  "hljs-meta": "#6a737d",
  "hljs-tag": "#22863a",
  "hljs-name": "#22863a",
  "hljs-attribute": "#005cc5",
};

/** 标准标签 → 内联样式。base 不拼在末尾（避免覆盖标题/正文自身设定）。 */
function tagStyles(theme) {
  const bs = theme.bodySize || 15;
  const ts = theme.titleSize || 22;
  const h2 = theme.h2Size || 18;
  const h3 = theme.h2Size ? Math.round(theme.h2Size - 1) : 17;
  const h4 = theme.h2Size ? Math.round(theme.h2Size - 2) : 16;
  const lh = theme.lineHeight || 1.7;
  const pa = theme.paraAfter != null ? theme.paraAfter : 10;
  const align = theme.justify === false ? "left" : "justify";
  const codeBg = theme.codeBg || "#f6f8fa";
  const codeSize = theme.codeSize || 13;
  const quoteBg = theme.quoteBg || "#f6f7f9";
  const quoteBorder = theme.quoteBorder || theme.accent;
  return {
    h1: `color:${theme.accent};font-size:${ts}px;font-weight:700;margin:1.2em 0 0.6em;line-height:1.3;border-bottom:1px solid #eaecef;padding-bottom:0.3em;`,
    h2: `color:${theme.accent};font-size:${h2}px;font-weight:700;margin:1.1em 0 0.5em;line-height:1.3;border-bottom:1px solid #eaecef;padding-bottom:0.25em;`,
    h3: `color:${theme.accent};font-size:${h3}px;font-weight:700;margin:1em 0 0.5em;line-height:1.3;`,
    h4: `color:${theme.accent};font-size:${h4}px;font-weight:700;margin:0.9em 0 0.4em;line-height:1.5;`,
    h5: `color:${theme.accent};font-size:14px;font-weight:700;margin:0.8em 0 0.4em;line-height:1.5;`,
    h6: `color:${theme.muted};font-size:13px;font-weight:600;margin:0.8em 0 0.4em;line-height:1.5;`,
    p: `font-size:${bs}px;line-height:${lh};margin:0 0 ${pa}px;text-align:${align};color:${theme.text};`,
    ul: `font-size:${bs}px;line-height:${lh};margin:0 0 ${pa}px;padding-left:22px;color:${theme.text};`,
    ol: `font-size:${bs}px;line-height:${lh};margin:0 0 ${pa}px;padding-left:22px;color:${theme.text};`,
    li: `margin:4px 0;`,
    blockquote: `background:${quoteBg};border-left:4px solid ${quoteBorder};margin:0 0 ${pa}px;padding:10px 14px;color:${theme.muted};font-size:${bs}px;line-height:${lh};border-radius:0 6px 6px 0;`,
    a: `color:${theme.accent};text-decoration:none;border-bottom:1px solid ${theme.accent};`,
    strong: `font-weight:700;color:${theme.text};`,
    em: `font-style:italic;`,
    code: `font-family:${MONO};background:${codeBg};font-size:${codeSize}px;padding:1px 5px;border-radius:4px;color:#c0341d;`,
    pre: `background:${codeBg};border-radius:8px;padding:12px 14px;overflow-x:auto;line-height:1.6;margin:0 0 ${pa}px;`,
    img: `max-width:100%;border-radius:6px;display:block;margin:${pa}px auto;`,
    hr: `border:none;border-top:1px solid #e5e7eb;margin:1.4em 0;`,
    table: `width:100%;border-collapse:collapse;margin:0 0 ${pa}px;font-size:${bs}px;`,
    th: `border:1px solid #e5e7eb;padding:8px 10px;background:${quoteBg};font-weight:700;color:${theme.text};text-align:left;`,
    td: `border:1px solid #e5e7eb;padding:8px 10px;color:${theme.text};`,
    section: `font-family:${fontStack(theme)};color:${theme.text};font-size:${bs}px;line-height:${lh};text-align:${align};word-break:break-word;`,
  };
}

/* ---------------- 组件 → 公众号兼容 HTML（只用稳留标签 + 内联 style） ---------------- */

function _q(el, sel) {
  const n = el.querySelector(sel);
  return n ? n.textContent.trim() : "";
}
function _qa(el, sel) {
  return Array.from(el.querySelectorAll(sel));
}
/** 取占位节点内的真实图片 src（用户往模板组件占位框里插了真图时要用） */
function _imgSrc(el, sel) {
  const node = el.querySelector(sel);
  if (!node) return null;
  const img = node.querySelector("img");
  if (img) return img.getAttribute("src") || null;
  if (node.tagName === "IMG") return node.getAttribute("src") || null;
  return null;
}

function wxColor(t) {
  return {
    A: t.accent || "#1565c0",
    AS: t.accentSoft || "#e8f1fb",
    AU: t.accentUnderline || t.accent || "#1565c0",
    T: t.text || "#2b2f36",
    GRY: t.muted || "#6b7280",
    NEU: t.surface || "#ffffff",        // 容器/卡片底 = 主题 surface
    NBD: t.border || "#e5e7eb",          // 卡片描边 = 主题 border
    GBD: t.divider || t.border || "#d1d5db", // 图片框/虚线 = 主题 divider
    QBG: t.quoteBg || "#f6f7f9",         // 引用/表格头背景 = 主题 quoteBg
    IMG: "#eef0f3",                        // 图片占位背景：固定中性灰，不受主题 quoteBg 影响
    BRAND: t.brand || null,
  };
}

function componentToWechatHtml(el, theme) {
  const c = wxColor(theme);
  const cls = el.className || "";
  let out = "";

  if (cls.includes("tmpl-infocard")) {
    out = `<section data-wx="1" style="background:${c.NEU};border:1px solid ${c.NBD};border-radius:6px;padding:12px 14px;margin:14px 0;"><p style="font-weight:700;color:${c.A};font-size:14px;margin:0 0 4px;line-height:1.5;">${esc(_q(el, ".tmpl-ic-cap"))}</p><p style="color:${c.T};font-size:15px;line-height:1.7;margin:0;">${esc(_q(el, ".tmpl-ic-body"))}</p></section>`;
  } else if (cls.includes("tmpl-datacard")) {
    out = `<section data-wx="1" style="background:${c.NEU};border:1px solid ${c.NBD};border-radius:8px;padding:14px 16px;margin:14px 0;text-align:center;"><p style="font-size:26px;font-weight:700;color:${c.A};line-height:1.2;margin:0;">${esc(_q(el, ".tmpl-big"))}</p><p style="font-size:12px;color:${c.GRY};margin:4px 0 0;line-height:1.5;">${esc(_q(el, ".tmpl-cap"))}</p></section>`;
  } else if (cls.includes("tmpl-imgtxt")) {
    const cap = _q(el, ".tmpl-it-cap");
    const body = _q(el, ".tmpl-it-body").replace(cap, "");
    const imgSrc = _imgSrc(el, ".tmpl-it-img");
    const imgPart = imgSrc
      ? `<p style="margin:0;"><img src="${imgSrc}" style="width:100%;height:90px;object-fit:cover;border-radius:8px;display:block;border:1px solid ${c.GBD};"></p>`
      : `<p style="width:100%;height:90px;background:${c.IMG};border:1px solid ${c.GBD};border-radius:8px;color:${c.GRY};font-size:12px;text-align:center;line-height:90px;overflow:hidden;margin:0;">${esc(_q(el, ".tmpl-it-img"))}</p>`;
    // 图文并排：左图(38%) + 右文(58%)，用 inline-block section 实现（公众号认可）
    out = `<section data-wx="1" style="margin:14px 0;font-size:0;"><section style="display:inline-block;width:38%;vertical-align:middle;font-size:15px;box-sizing:border-box;margin:0;">${imgPart}</section><section style="display:inline-block;width:58%;vertical-align:middle;font-size:15px;box-sizing:border-box;padding-left:14px;margin:0;"><p style="font-weight:700;color:${c.A};font-size:14px;margin:0 0 4px;line-height:1.5;">${esc(cap)}</p><p style="color:${c.T};font-size:15px;line-height:1.7;margin:0;">${esc(body)}</p></section></section>`;
  } else if (cls.includes("tmpl-toc")) {
    const lines = _qa(el, ".tmpl-toc-item, .tmpl-toc-sub")
      .map((n) => {
        const sub = n.classList.contains("tmpl-toc-sub");
        return `<p style="color:${sub ? c.GRY : c.T};font-size:${sub ? 13 : 14}px;line-height:1.9;margin:0 0 2px;${sub ? "padding-left:18px;" : ""}">${esc(n.textContent)}</p>`;
      })
      .join("");
    out = `<section data-wx="1" style="background:${c.NEU};border:1px solid ${c.NBD};border-radius:6px;padding:12px 14px;margin:14px 0;"><p style="font-weight:700;color:${c.T};font-size:15px;margin:0 0 6px;line-height:1.5;">${esc(_q(el, ".tmpl-toc-title"))}</p>${lines}</section>`;
  } else if (cls.includes("tmpl-author")) {
    // 作者名片：外层恢复 .tmpl-author 的底/边框，内部三列 inline-block 并排
    out = `<section data-wx="1" style="background:${c.NEU};border:1px solid ${c.NBD};border-radius:8px;padding:12px 14px;margin:14px 0;font-size:0;"><section style="display:inline-block;width:14%;vertical-align:middle;font-size:15px;box-sizing:border-box;margin:0;"><p style="width:48px;height:48px;border-radius:50%;background:${c.AS};color:${c.A};font-size:12px;font-weight:700;text-align:center;line-height:48px;overflow:hidden;margin:0;">${esc(_q(el, ".tmpl-avatar"))}</p></section><section style="display:inline-block;width:50%;vertical-align:middle;font-size:15px;box-sizing:border-box;padding:0 10px;margin:0;"><p style="font-weight:700;color:${c.T};font-size:14px;margin:0;line-height:1.5;">${esc(_q(el, ".tmpl-a-name"))}</p><p style="color:${c.GRY};font-size:12px;margin:2px 0 0;line-height:1.5;">${esc(_q(el, ".tmpl-a-bio"))}</p></section><section style="display:inline-block;width:34%;vertical-align:middle;font-size:11px;box-sizing:border-box;margin:0;"><p style="width:100%;height:56px;border:1px dashed ${c.GBD};border-radius:6px;color:${c.GRY};font-size:11px;line-height:56px;text-align:center;overflow:hidden;margin:0;">${esc(_q(el, ".tmpl-qr"))}</p></section></section>`;
  } else if (cls.includes("tmpl-tags")) {
    const list = _qa(el, ".tmpl-tag")
      .map((n) => {
        const accent = n.classList.contains("tmpl-tag-accent");
        const bg = accent ? c.A : c.NEU;
        const fg = accent ? "#fff" : c.GRY;
        const bd = accent ? "transparent" : c.GBD;
        return `<span style="display:inline-block;padding:3px 11px;border-radius:999px;background:${bg};color:${fg};font-size:12px;font-weight:600;border:1px solid ${bd};margin:2px;">${esc(n.textContent)}</span>`;
      })
      .join(" ");
    out = `<p data-wx="1" style="margin:14px 0;line-height:1.6;">${list}</p>`;
  } else if (cls.includes("tmpl-timeline")) {
    // 纵向时间轴：外层统一 border-left 画竖线，圆点用负 margin 压到线中心（与 .tmpl-tl-dot 视觉一致）
    const rows = _qa(el, ".tmpl-tl-item")
      .map(
        (n) =>
          `<section style="margin:0 0 12px;"><span style="display:inline-block;color:${c.A};font-size:20px;line-height:20px;height:20px;width:20px;text-align:center;margin-left:-32px;margin-right:10px;vertical-align:middle;">&#9675;</span><span style="color:${c.A};font-weight:700;font-size:14px;vertical-align:middle;">${esc(_q(n, ".tmpl-tl-time"))}</span><span style="color:${c.T};font-size:15px;margin-left:8px;vertical-align:middle;">${esc(_q(n, ".tmpl-tl-text"))}</span></section>`,
      )
      .join("");
    out = `<section data-wx="1" style="margin:14px 0 14px 8px;border-left:2px solid ${c.GBD};padding-left:20px;">${rows}</section>`;
  } else if (cls.includes("tmpl-steps")) {
    // 步骤条：竖向排列，每个步骤一行；外层统一 border-left 画竖线，编号圆点压到线中心
    const rows = _qa(el, ".tmpl-step")
      .map(
        (n) =>
          `<section style="margin:0 0 14px;"><span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:${c.AS};color:${c.A};font-size:13px;font-weight:700;text-align:center;line-height:24px;vertical-align:top;margin-left:-33px;margin-right:9px;box-sizing:border-box;">${esc(_q(n, ".tmpl-step-no"))}</span><span style="display:inline-block;vertical-align:top;max-width:calc(100% - 40px);"><span style="font-weight:700;color:${c.T};font-size:14px;line-height:1.5;display:block;">${esc(_q(n, ".tmpl-step-title"))}</span><span style="color:${c.GRY};font-size:13px;line-height:1.7;display:block;">${esc(_q(n, ".tmpl-step-text"))}</span></span></section>`,
      )
      .join("");
    out = `<section data-wx="1" style="margin:14px 0 14px 8px;border-left:2px solid ${c.GBD};padding-left:20px;">${rows}</section>`;
  } else if (cls.includes("tmpl-imgframe")) {
    const imgSrc = _imgSrc(el, ".tmpl-if-img");
    const imgPart = imgSrc
      ? `<img src="${imgSrc}" style="width:100%;height:160px;object-fit:cover;border-radius:8px;display:block;border:1px solid ${c.GBD};margin:0;">`
      : `<p style="height:160px;background:${c.IMG};border:1px solid ${c.GBD};border-radius:8px;color:${c.GRY};font-size:13px;text-align:center;line-height:160px;overflow:hidden;margin:0;">${esc(_q(el, ".tmpl-if-img"))}</p>`;
    out = `<section data-wx="1" style="margin:14px 0;">${imgPart}<p style="text-align:center;color:${c.GRY};font-size:12px;margin:6px 0 0;line-height:1.5;">${esc(_q(el, ".tmpl-if-cap"))}</p></section>`;
  } else if (cls.includes("tmpl-grid3")) {
    // 九宫格：三列 inline-block 并排，每格优先用真实图片，没有图则显示占位块
    const cells = _qa(el, ".tmpl-g-cell")
      .map((n) => {
        const imgSrc = _imgSrc(n, "img") || _imgSrc(n, ".tmpl-g-img");
        const inner = imgSrc
          ? `<img src="${imgSrc}" style="width:100%;height:90px;object-fit:cover;border-radius:8px;display:block;border:1px solid ${c.GBD};">`
          : `<p style="height:90px;background:${c.IMG};border:1px solid ${c.GBD};border-radius:8px;color:${c.GRY};font-size:12px;text-align:center;line-height:90px;overflow:hidden;margin:0;">${esc(n.textContent)}</p>`;
        return `<section style="display:inline-block;width:31%;vertical-align:top;font-size:12px;box-sizing:border-box;margin:0 1%;">${inner}</section>`;
      })
      .join("");
    out = `<section data-wx="1" style="margin:14px 0;font-size:0;">${cells}</section>`;
  } else if (cls.includes("tmpl-card")) {
    out = `<section data-wx="1" style="background:${c.NEU};border:1px solid ${c.NBD};border-radius:8px;padding:14px;margin:14px 0;color:${c.T};font-size:15px;line-height:1.7;">${esc(_q(el, ".tmpl-card-body"))}</section>`;
  } else if (cls.includes("tmpl-dialog")) {
    // 对话框：头像(12%) + 气泡(85%) 并排
    out = `<section data-wx="1" style="margin:14px 0;font-size:0;"><section style="display:inline-block;width:12%;vertical-align:top;font-size:12px;box-sizing:border-box;margin:0;"><p style="width:36px;height:36px;border-radius:50%;background:${c.AS};color:${c.A};font-size:12px;font-weight:700;text-align:center;line-height:36px;overflow:hidden;margin:0;">${esc(_q(el, ".tmpl-dlg-who"))}</p></section><section style="display:inline-block;width:85%;vertical-align:top;font-size:15px;box-sizing:border-box;padding-left:10px;margin:0;"><p style="background:${c.NEU};border:1px solid ${c.NBD};border-radius:10px;padding:10px 12px;color:${c.T};font-size:15px;line-height:1.7;margin:0;text-align:left;">${esc(_q(el, ".tmpl-dlg-text"))}</p></section></section>`;
  } else if (cls.includes("tmpl-price")) {
    // 价格对比：三列 inline-block 并排，推荐档高亮
    const cells = _qa(el, ".tmpl-p-item")
      .map((n) => {
        const rec = n.classList.contains("tmpl-p-rec");
        const bd = rec ? `1px solid ${c.A}` : `1px solid ${c.GBD}`;
        const bg = rec ? c.AS : c.NEU;
        return `<section style="display:inline-block;width:31%;vertical-align:top;font-size:13px;box-sizing:border-box;margin:0 1%;border:${bd};background:${bg};border-radius:8px;padding:14px 6px;text-align:center;"><p style="font-weight:700;font-size:13px;color:${c.T};line-height:1.4;margin:0 0 4px;">${esc(_q(n, ".tmpl-p-name"))}</p><p style="color:${c.A};font-size:20px;font-weight:700;line-height:1.3;margin:0 0 4px;">${esc(_q(n, ".tmpl-p-num"))}</p><p style="font-size:11px;color:${c.GRY};line-height:1.5;margin:0;">${esc(_q(n, ".tmpl-p-desc"))}</p></section>`;
      })
      .join("");
    out = `<section data-wx="1" style="margin:14px 0;font-size:0;">${cells}</section>`;
  } else if (cls.includes("tmpl-share") || cls.includes("tmpl-fav") || cls.includes("tmpl-like")) {
    let sel;
    if (cls.includes("tmpl-share")) sel = ["tmpl-share-title", "tmpl-share-actions"];
    else if (cls.includes("tmpl-fav")) sel = ["tmpl-fav-title", "tmpl-fav-sub"];
    else sel = ["tmpl-like-title", "tmpl-like-sub"];
    out = `<section data-wx="1" style="margin:14px 0;text-align:center;border:1px dashed ${c.GBD};border-radius:8px;padding:12px 14px;background:${c.NEU};"><p style="font-weight:700;color:${c.A};font-size:15px;margin:0 0 4px;line-height:1.5;">${esc(_q(el, "." + sel[0]))}</p><p style="font-size:13px;color:${c.GRY};margin:0;line-height:1.6;">${esc(_q(el, "." + sel[1]))}</p></section>`;
  } else if (cls.includes("tmpl-hnum")) {
    const badge = _q(el, ".tmpl-badge");
    const h2 = el.querySelector("h2");
    let title = h2 ? h2.textContent : "";
    title = title.replace(badge, "").trim();
    out = `<section data-wx="1" style="margin:1.1em 0 0.5em;"><h2 style="color:${c.A};font-size:18px;font-weight:700;line-height:1.3;margin:0;padding:0;border:none;"><span style="display:inline-block;background:${c.A};color:#fff;font-weight:700;font-size:13px;padding:2px 8px;border-radius:4px;margin-right:8px;vertical-align:middle;">${esc(badge)}</span>${esc(title)}</h2></section>`;
  } else if (cls.includes("tmpl-hline")) {
    out = `<section data-wx="1" style="margin:1.1em 0 0.5em;text-align:center;border-top:1px solid ${c.GBD};border-bottom:1px solid ${c.GBD};padding:8px 0;"><span style="color:${c.A};font-weight:700;font-size:17px;letter-spacing:1px;">${esc(_q(el, "h2"))}</span></section>`;
  } else if (cls.includes("tmpl-hfill")) {
    out = `<section data-wx="1" style="margin:1.1em 0 0.5em;background:${c.AS};border-left:3px solid ${c.A};border-radius:4px;padding:9px 14px;"><span style="color:${c.A};font-weight:700;font-size:17px;">${esc(_q(el, "h2"))}</span></section>`;
  } else if (cls.includes("tmpl-hsub")) {
    out = `<section data-wx="1" style="margin:1.1em 0 0.5em;"><p style="color:${c.A};font-weight:700;font-size:22px;line-height:1.3;margin:0;">${esc(_q(el, ".tmpl-hsub-main"))}</p><p style="color:${c.GRY};font-size:13px;margin:4px 0 0;line-height:1.5;">${esc(_q(el, ".tmpl-hsub-sub"))}</p></section>`;
  } else if (cls.includes("tmpl-audio") || cls.includes("tmpl-video")) {
    // 公众号不支持直接粘贴本地音/视频文件，转成提示占位块，提醒用户后台重新上传
    const isAudio = cls.includes("tmpl-audio");
    const label = isAudio ? "音频" : "视频";
    const icon = isAudio ? "🎧" : "🎬";
    const cap = esc(_q(el, ".tmpl-media-cap"));
    const media = el.querySelector(isAudio ? "audio" : "video");
    const hasSrc = !!(media && media.getAttribute("src"));
    const tip = hasSrc ? `（已选本地文件，粘贴到公众号后需重新上传${label}）` : `（请在公众号后台上传${label}）`;
    out = `<section data-wx="1" style="margin:14px 0;text-align:center;border:1px dashed ${c.GBD};border-radius:8px;padding:18px 14px;background:${c.NEU};"><p style="font-size:28px;margin:0 0 6px;line-height:1;">${icon}</p><p style="font-weight:700;color:${c.A};font-size:15px;margin:0 0 4px;line-height:1.5;">${label}组件</p><p style="font-size:13px;color:${c.GRY};margin:0;line-height:1.6;">${cap}${tip}</p></section>`;
  }
  return out;
}


/** 把所有 .tmpl-keep 组件替换为公众号兼容的内联样式 HTML（section/span），并打 data-wx 标记让 inlineStyles 跳过 */
function convertComponentsForPlatform(container, theme, profile) {
  const els = Array.from(container.querySelectorAll(".tmpl-keep"));
  els.forEach((el) => {
    const html = componentToWechatHtml(el, theme);
    if (!html) return;
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const nodes = Array.from(tmp.childNodes);
    if (nodes.length) {
      nodes.forEach((n) => {
        if (n.nodeType === 1) n.setAttribute("data-wx", "1");
      });
      el.replaceWith(...nodes);
    }
  });
}


/** 遍历 DOM，给每个元素合并 标签样式 + hljs 配色；跳过已转换组件（data-wx） */
function inlineStyles(root, theme) {
  const ts = tagStyles(theme);
  const nodes = Array.from(root.querySelectorAll("*")).filter((el) => !el.closest("[data-wx]"));
  nodes.forEach((el) => {
    const tag = el.tagName.toLowerCase();
    const parts = [];
    if (ts[tag]) parts.push(ts[tag]);
    el.classList.forEach((c) => {
      if (HLJS[c]) parts.push(`color:${HLJS[c]};`);
    });
    if (parts.length) {
      const existing = el.getAttribute("style") || "";
      el.setAttribute("style", existing ? existing + parts.join("") : parts.join(""));
    }
  });
  root.setAttribute("style", (root.getAttribute("style") || "") + ts.section);
}

function wrapDocument(inner, theme, profile) {
  const ts = tagStyles(theme);
  // 外层容器同样要过 profile：否则 section 上的 text-align:justify 会漏到头条
  const sectionStyle = transformStyle(ts.section, profile).style;
  const body = profile && profile.wrapSection === false
    ? `<div style="${sectionStyle}">${inner}</div>`
    : `<section style="${sectionStyle}">${inner}</section>`;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${body}</body></html>`;
}

/* ---------------- 平台 Profile：同一份内容，按各家编辑器的脾气降级 ---------------- */

/**
 * 公众号后台编辑器（ProseMirror 内核）对 inline style 容忍度最高，
 * 圆角 / inline-block 多列 / 虚线都吃得下，这里用一份 profile 描述其差异，
 * 再由 applyPlatformProfile 统一后处理。
 */
export const PLATFORMS = {
  wechat: {
    id: "wechat",
    name: "公众号",
    kind: "html",
    wrapSection: true,
    radius: true,
    multiColumn: true,
    dashed: true,
    align: null, // 跟随主题（默认两端对齐）
    hint: "已复制排版 HTML，去公众号后台正文区 Ctrl+V；图片需在后台重新上传。",
  },
};

export function getPlatform(id) {
  return PLATFORMS[id] || PLATFORMS.wechat;
}

/** 拆 inline style 字符串为 [[prop, value], ...]，保持顺序 */
function parseStyle(s) {
  return String(s || "")
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => {
      const i = x.indexOf(":");
      return i < 0 ? null : [x.slice(0, i).trim().toLowerCase(), x.slice(i + 1).trim()];
    })
    .filter(Boolean);
}

function stringifyStyle(pairs) {
  return pairs.map(([k, v]) => k + ":" + v).join(";") + (pairs.length ? ";" : "");
}

/**
 * 按 profile 改写单条 inline style 字符串。
 * 只做「减法/降级」，不新增平台专属装饰——保证公众号那套依旧是基准。
 * @returns {{style:string, stacked:boolean}} stacked 表示这一条发生了多列→堆叠的降级
 */
function transformStyle(raw, profile) {
  const style = String(raw || "");
  if (!profile || profile.kind !== "html") return { style, stacked: false };
  let stacked = false;

  let pairs = parseStyle(style).reduce((acc, [k, v]) => {
    // 圆角：头条编辑器保存后经常丢，干脆统一直角，避免「有的圆有的方」
    if (!profile.radius && k === "border-radius") return acc;
    // 多列：inline-block + 百分比宽度是公众号绕开 flex 的手段，头条不认，改纵向堆叠
    if (!profile.multiColumn) {
      if (k === "display" && /inline-block/.test(v)) {
        stacked = true;
        acc.push(["display", "block"]);
        return acc;
      }
      if (k === "width" && /%$/.test(v)) {
        acc.push(["width", "100%"]);
        return acc;
      }
      if (k === "vertical-align") return acc;
      if (k === "padding-left" && stacked) return acc;
    }
    // 虚线边框：头条会渲染成实线或直接丢，主动换成实线保持一致
    if (!profile.dashed && /^border/.test(k) && /dashed/.test(v)) {
      acc.push([k, v.replace(/dashed/g, "solid")]);
      return acc;
    }
    // 两端对齐：头条正文默认左对齐，强行 justify 会出现字距拉伸
    if (profile.align && k === "text-align" && v === "justify") {
      acc.push([k, profile.align]);
      return acc;
    }
    acc.push([k, v]);
    return acc;
  }, []);

  // 堆叠后相邻块会贴在一起，补一点行间距
  if (stacked && !pairs.some(([k]) => k === "margin-bottom")) {
    pairs = pairs.concat([["margin-bottom", "10px"]]);
  }
  return { style: stringifyStyle(pairs), stacked };
}

/** 按 profile 改写整棵子树的 inline style（跳过已转换组件子树，保留其自带样式） */
function applyPlatformProfile(root, profile) {
  if (!profile || profile.kind !== "html") return;
  const all = [root].concat(
    Array.from(root.querySelectorAll("*")).filter((el) => !el.closest("[data-wx]")),
  );
  all.forEach((el) => {
    const raw = el.getAttribute && el.getAttribute("style");
    if (!raw) return;
    el.setAttribute("style", transformStyle(raw, profile).style);
  });
}

/**
 * 生成指定平台的内联样式 HTML。
 * @param {string} md  Markdown 源
 * @param {object} theme 主题（缺省用 DEFAULT_THEME）
 * @param {object} opts { platform:"wechat", fullDoc:boolean }
 * @returns {{kind:"html", html:string, inner:string, text?:string, platform:object}}
 */
export function buildPlatformContent(md, theme, opts = {}) {
  const profile = getPlatform(opts.platform);
  const fullDoc = opts.fullDoc !== false;
  theme = theme || DEFAULT_THEME;

  const expanded = expandMarkdown(md || "");
  const bodyHtml = renderFullHtml(expanded);
  const container = document.createElement("div");
  container.innerHTML = bodyHtml;
  convertComponentsForPlatform(container, theme, profile);
  inlineStyles(container, theme);
  applyPlatformProfile(container, profile);
  const inner = container.innerHTML;
  const out = {
    kind: "html",
    platform: profile,
    inner,
    html: fullDoc ? wrapDocument(inner, theme, profile) : inner,
  };
  return out;
}

/**
 * 生成公众号内联样式 HTML（向后兼容的薄封装）。
 * @returns {{html:string, inner:string}}
 */
export function buildWechatHtml(md, theme, fullDoc = true) {
  const r = buildPlatformContent(md, theme, { platform: "wechat", fullDoc });
  return { html: r.html, inner: r.inner };
}

/** 复制纯文本到剪贴板（用于「复制源码」等场景） */
export async function copyPlainToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}

/** 把公众号排版结果写进剪贴板（带格式的 HTML，公众号编辑器识别内联样式） */
export async function copyPlatformResult(result) {
  if (!result) return false;
  return copyRichToClipboard(result.html || "");
}

/** 复制带格式的 HTML 到剪贴板（优先 ClipboardItem，失败落 execCommand） */
export async function copyRichToClipboard(html) {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new window.ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([html], { type: "text/plain" }),
        }),
      ]);
      return true;
    }
  } catch (_) {}
  try {
    const ta = document.createElement("textarea");
    ta.value = html;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}
