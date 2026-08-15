/**
 * extras.js — L2 拓展语法：脚注 + 标题锚点（slug）
 *
 * 脚注（对齐 Typora / PRD L2「专业拓展语法」）：
 *   正文 [^1]  →  <sup class="fn-ref"><a href="#fn-1">[1]</a></sup>
 *   定义 [^1]: 内容  →  <div class="fn-def" id="fn-1">…</div>
 * 实现为 marked 扩展（与 math.js 相同的占位思路）：先用带 data-fn-id 的节点占位，
 * 交给 DOMPurify 净化（保留 id/class），turndown 读 data 还原成 [^id] 语法。
 *
 * 标题锚点：为所有标题生成「确定性 slug id」（中文保留、空格→-、重复加序号），
 * 使 [文字](#标题) 这类内部链接可以稳定跳转（PRD L2「文档锚点、内部链接」）。
 */

function escAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ---------------- 脚注：marked 扩展 ---------------- */
export const FOOTNOTE_EXTENSIONS = {
  extensions: [
    {
      name: "footnoteRef",
      level: "inline",
      // 不提供 start：marked 的 inlineText 规则会在 "[" 前停下，扩展 tokenizer 自然匹配到 [^id]。
      // 若提供 start（返回 indexOf("[^")），inline 阶段会把文本错误截断。
      tokenizer(src) {
        const m = /^\[\^([\w-]+)\]/.exec(src);
        if (m) return { type: "footnoteRef", raw: m[0], id: m[1] };
      },
      renderer(t) {
        return `<sup class="fn-ref" data-fn-id="${escAttr(t.id)}"><a href="#fn-${escAttr(t.id)}">[${escAttr(t.id)}]</a></sup>`;
      },
    },
    {
      name: "footnoteDef",
      level: "block",
      // 同样不提供 start：block 阶段扩展 tokenizer 先于 paragraph 执行，
      // 只要定义行独立成块（行首 [^id]: ），就能在 paragraph 吞掉它之前匹配。
      // 提供 start 反而会让 marked 裁剪段落、把普通段落误切成两段并插入 \n。
      tokenizer(src) {
        // 单行定义 + 可选的一行缩进续行（4 空格 / tab），足够覆盖常见用法
        const m = /^\[\^([\w-]+)\]:\s+([^\n]*)(?:\n(?: {4}|\t)([^\n]+))?/.exec(src);
        if (!m) return;
        const body = m[2] + (m[3] ? "\n" + m[3] : "");
        return { type: "footnoteDef", raw: m[0], id: m[1], text: body };
      },
      renderer(t) {
        return `<div class="fn-def" id="fn-${escAttr(t.id)}" data-fn-id="${escAttr(t.id)}">` +
          `<span class="fn-idx">[${escAttr(t.id)}]</span> ` +
          `<span class="fn-body">${escHtml(t.text)}</span></div>\n`;
      },
    },
  ],
};

/** marked 是全局单例（richtext/preview 共用），重复 use 会把 tokenizer 压栈两次，这里防重复 */
let _footnoteRegistered = false;
export function useFootnoteExtensions(marked) {
  if (_footnoteRegistered) return;
  _footnoteRegistered = true;
  marked.use(FOOTNOTE_EXTENSIONS);
}

/** 给 turndown 注册脚注还原规则（读 data-fn-id） */
export function footnoteTurndownRules(turndown) {
  turndown.addRule("footnoteRef", {
    filter: (n) => n.nodeName === "SUP" && n.classList.contains("fn-ref"),
    replacement: (_c, n) => "[^" + (n.getAttribute("data-fn-id") || "") + "]",
  });
  turndown.addRule("footnoteDef", {
    filter: (n) => n.nodeName === "DIV" && n.classList.contains("fn-def"),
    replacement: (_c, n) => {
      const id = n.getAttribute("data-fn-id") || "";
      const body = n.querySelector(".fn-body");
      // 多行脚注内容折叠成单行（与 marked 软换行→空格的渲染一致，保证往返稳定）
      const text = body ? body.textContent.replace(/\s+/g, " ").trim() : "";
      return "\n\n[^" + id + "]: " + text + "\n";
    },
  });
}

/* ---------------- 标题锚点：确定性 slug ---------------- */
/** 把标题文本转成 slug：保留中文/字母/数字，其余转连字符 */
export function slugifyTitle(text) {
  const s = String(text || "")
    .replace(/<[^>]+>/g, "") // 去行内 HTML
    .replace(/[*_`~]/g, "") // 去强调符号
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "h";
}

/** 给一组标题元素分配唯一 slug id（重复时追加 -2、-3…），返回 Map<元素, id> */
export function assignHeadingIds(headings) {
  const seen = new Map();
  headings.forEach((h) => {
    if (h.id && !String(h.id).startsWith("h-")) return; // 用户自定义 id 保留（TOC 的 h-xxx 占位除外）
    const base = slugifyTitle(h.textContent || h.text || "");
    let id = base;
    let n = 2;
    while (seen.has(id)) id = base + "-" + n++;
    seen.set(id, true);
    h.id = id;
  });
}
