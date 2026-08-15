/**
 * exporter.js — 生成可独立分发的导出文件内容。
 *
 * - buildExportHtml(md): 返回完整的 .html 字符串（含内嵌样式 + 已展开 base64 图片）。
 *   md 可以是编辑器工作副本（含 @img 占位符）——这里会自动展开成真实图片。
 * - 复用 preview.js 的 renderFullHtml 做 Markdown→HTML 渲染（标记语法、代码高亮、
 *   目录、净化一脉相承），保证导出内容与预览视觉效果一致。
 */
import { renderFullHtml } from "./preview.js";
import { expandMarkdown } from "./imageStore.js";
import { exportCss } from "./exportStyle.js";
import { getKatexExportCss } from "./math.js";
import { renderExportTemplate } from "./settings.js";
import { themeStyleBlock, TMPL_COMPONENT_CSS } from "./themeCss.js";

/**
 * 导出 HTML 用的 Mermaid 运行时（UMD 单文件，?raw 内联进 bundle）。
 * 只有在文档含 Mermaid 图表时才把它塞进导出文件（~2.7MB 源码文本）。
 * 注意：import.meta.glob 必须用相对路径指向 node_modules。
 */
const MERMAID_UMD = import.meta.glob("../../node_modules/mermaid/dist/mermaid.min.js", {
  query: "?raw",
  import: "default",
  eager: true,
});
const MERMAID_JS = Object.values(MERMAID_UMD)[0] || "";

/**
 * 生成完整的导出 HTML。
 * 异步的原因：公式需要把 KaTeX 的 CSS 及其 woff2 字体以 base64 内联进来，
 * 这样导出的单文件断网也能正确显示公式（否则字体缺失，公式会退化成难看的衬线字）。
 *
 * @param {string} md
 * @param {string} title
 * @param {object|null} theme 传入主题则整篇跟随主题配色（PNG 长图走这条）；
 *        传 null 保持中性 GitHub 风（.html / .pdf 导出走这条，
 *        因为它们是「通用文档」，染上公众号主题色反而不合适）。
 *        注意：即便中性，也要带上 .tmpl-* 组件样式，否则排版组件会散架。
 */
export async function buildExportHtml(md, title = "Markdown Export", theme = null) {
  const expanded = expandMarkdown(md || "");
  const body = renderFullHtml(expanded);
  // 文档里没有公式就不必塞进 ~300KB 的字体
  const katexCss = body.includes("katex") ? await getKatexExportCss() : "";
  // 文档含 Mermaid 图时内联运行时，打开导出文件自动渲染
  const hasMermaid = body.includes("class=\"mermaid\"");
  const mermaidScript = hasMermaid
    ? `<script>${MERMAID_JS}</script>
<script>
document.addEventListener("DOMContentLoaded", function () {
  if (window.mermaid) {
    mermaid.initialize({ startOnLoad: true, securityLevel: "loose", theme: "neutral", fontFamily: "inherit" });
    document.querySelectorAll(".mermaid").forEach(function (el, i) {
      try {
        mermaid.render("mmd-x" + i, el.textContent).then(function (r) {
          var w = document.createElement("div");
          w.className = "mermaid-wrap";
          w.innerHTML = r.svg;
          el.replaceWith(w);
        });
      } catch (e) { el.classList.add("mermaid-error"); }
    });
  }
});
</script>`
    : "";
  // 主题层：有主题就整套 Token+排版跟随；没主题只补组件样式，配色维持中性
  const themeCss = theme
    ? themeStyleBlock(theme, [".markdown-body"])
    : TMPL_COMPONENT_CSS;
  const style = [exportCss, themeCss, katexCss].filter(Boolean).join("\n");
  // 走「自定义导出模板」（L3）：用户没配置时用内置默认模板，输出与以前完全一致
  return renderExportTemplate({
    title,
    content: body,
    style,
    script: mermaidScript,
    date: new Date().toLocaleDateString("zh-CN"),
  });
}
