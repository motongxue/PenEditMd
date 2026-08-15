/**
 * exportStyle.js — 导出 HTML/PDF 时内嵌的自包含样式。
 *
 * 应用内预览依赖 CSS 变量与深色主题；而导出的 .html/.pdf 是独立文件，
 * 需要在 <style> 里写死颜色，保证在任意浏览器/阅读器里都排版一致。
 * 这里用浅色（白底黑字）作为导出默认外观（符合主流文档导出习惯）。
 * 代码高亮复用 highlight.js 的 github 主题（通过 ?raw 以字符串形式引入）。
 */
import githubCss from "highlight.js/styles/github.css?raw";

export const exportCss = `
:root {
  --text: #1f2328;
  --muted: #656d76;
  --border: #d8dee4;
  --code-bg: #f6f8fa;
  --accent: #0969da;
  --soft: #f6f8fa;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: #ffffff;
  color: #1f2328;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Microsoft YaHei", sans-serif;
  line-height: 1.7;
  font-size: 15px;
}
.markdown-body {
  max-width: 880px;
  margin: 0 auto;
  padding: 36px 32px 72px;
  word-wrap: break-word;
}
.markdown-body h1, .markdown-body h2, .markdown-body h3,
.markdown-body h4, .markdown-body h5, .markdown-body h6 {
  margin: 1.3em 0 0.6em;
  line-height: 1.3;
  font-weight: 600;
  color: #1f2328;
}
.markdown-body h1 { font-size: 1.9em; border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
.markdown-body h2 { font-size: 1.5em; border-bottom: 1px solid var(--border); padding-bottom: 0.25em; }
.markdown-body h3 { font-size: 1.25em; }
.markdown-body h4 { font-size: 1.05em; }
.markdown-body p { margin: 0.7em 0; }
.markdown-body a { color: var(--accent); text-decoration: none; }
.markdown-body a:hover { text-decoration: underline; }
.markdown-body blockquote {
  margin: 0.8em 0;
  padding: 0.4em 1em;
  border-left: 4px solid var(--accent);
  background: var(--soft);
  color: var(--muted);
}
.markdown-body code {
  font-family: "SFMono-Regular", Consolas, Menlo, monospace;
  font-size: 0.88em;
  background: var(--code-bg);
  padding: 0.15em 0.4em;
  border-radius: 4px;
}
.markdown-body pre {
  background: var(--code-bg);
  padding: 14px 16px;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid var(--border);
}
.markdown-body pre code { background: transparent; padding: 0; font-size: 0.85em; }
.markdown-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.9em 0;
  font-size: 0.95em;
}
.markdown-body th, .markdown-body td {
  border: 1px solid var(--border);
  padding: 7px 11px;
  text-align: left;
}
.markdown-body th { background: var(--soft); font-weight: 600; }
.markdown-body tr:nth-child(even) td { background: rgba(127,127,127,0.04); }
.markdown-body img { max-width: 100%; border-radius: 4px; }
/* 多图横排（L3）：同段落内多个图片并排 */
.markdown-body img { display: inline-block; vertical-align: middle; }
.markdown-body p img:only-child { display: block; max-width: 100%; }
.markdown-body p img:not(:only-child) { max-width: 46%; margin: 2px; }
.markdown-body ul, .markdown-body ol { padding-left: 1.8em; margin: 0.6em 0; }
.markdown-body li { margin: 0.25em 0; }
.markdown-body hr { border: none; border-top: 1px solid var(--border); margin: 1.5em 0; }
.markdown-body li:has(> input[type="checkbox"]) { list-style: none; }
.markdown-body li > input[type="checkbox"] { margin-right: 6px; vertical-align: middle; }
/* TOC 目录 */
.markdown-body .toc {
  background: var(--soft);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 16px;
  margin: 1em 0;
}
.markdown-body .toc-title { font-weight: 600; margin-bottom: 6px; color: var(--muted); font-size: 12px; }
.markdown-body .toc ul { list-style: none; padding-left: 0; margin: 0; }
.markdown-body .toc li { margin: 3px 0; }
.markdown-body .toc-l1 { padding-left: 0; }
.markdown-body .toc-l2 { padding-left: 14px; }
.markdown-body .toc-l3 { padding-left: 28px; }
.markdown-body .toc-l4 { padding-left: 42px; }
.markdown-body .toc-l5 { padding-left: 56px; }
.markdown-body .toc-l6 { padding-left: 70px; }
.markdown-body .toc a { color: #1f2328; }
/* 脚注（L2） */
.markdown-body .fn-ref { font-size: 0.75em; vertical-align: super; line-height: 0; }
.markdown-body .fn-ref a { color: var(--accent); text-decoration: none; }
.markdown-body .fn-def {
  margin: 0.4em 0; padding: 2px 10px; font-size: 0.92em;
  color: var(--muted); border-left: 2px solid var(--border);
}
.markdown-body .fn-def .fn-idx { color: var(--accent); margin-right: 6px; }
/* Mermaid 图（L2）：导出文件打开后由内联脚本渲染 */
.markdown-body .mermaid-wrap {
  margin: 0.8em 0; overflow-x: auto; text-align: center;
  background: #fff; border-radius: 8px; padding: 10px;
}
.markdown-body .mermaid-wrap svg { max-width: 100%; height: auto; }
.markdown-body .mermaid-error {
  padding: 10px 12px; color: #cf222e; background: var(--soft);
  border: 1px dashed #cf222e; border-radius: 8px;
  font-family: "SFMono-Regular", Consolas, Menlo, monospace;
  font-size: 12px; white-space: pre-wrap; margin: 0.6em 0;
}
.markdown-body .mermaid {
  padding: 10px 12px; color: var(--muted); background: var(--soft);
  border: 1px dashed var(--border); border-radius: 8px;
  font-family: "SFMono-Regular", Consolas, Menlo, monospace;
  font-size: 12px; white-space: pre-wrap; margin: 0.6em 0;
}
/* 代码高亮（highlight.js github 主题） */
${githubCss}
`;
