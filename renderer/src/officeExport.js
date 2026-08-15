/**
 * officeExport.js — 进阶导出（L3）：DOCX / EPUB 部件生成。
 *
 * 思路：DOCX 与 EPUB 都是「特定结构的 ZIP」。这里在渲染进程把预览渲染出的 HTML
 * 转成各自需要的 XML/XHTML 部件，然后把 [{name, data}] 列表交给主进程打包落盘
 * （见 main.js 的 export:zip）。这样不引入任何第三方转换库。
 *
 * 图片：正文里的 data:image base64 会被抽出来变成独立的二进制条目
 * （word/media/xxx、OEBPS/images/xxx），正文只引用相对路径 —— 这既是格式规范要求，
 * 也让文件体积比「base64 内联」小约 25%。
 */

import { renderFullHtml } from "./preview.js";
import { expandMarkdown } from "./imageStore.js";
import { exportCss } from "./exportStyle.js";

/* ---------- 公共小工具 ---------- */

const XML_ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => XML_ESC[c]);
}

/** 把渲染后的 HTML 字符串解析成 DOM（用 template 避免执行脚本） */
function parseHtml(html) {
  const doc = new DOMParser().parseFromString(
    `<!doctype html><html><body>${html}</body></html>`,
    "text/html",
  );
  // preview 的增量渲染会把内容按段切成 <div class="md-sec"> 分片（只为局部更新用），
  // 对导出没有意义，反而会挡住「按 h1 分章」的判断，这里先拆平。
  doc.body.querySelectorAll("div.md-sec").forEach((sec) => {
    sec.replaceWith(...sec.childNodes);
  });
  return doc.body;
}

const MIME_EXT = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/bmp": "bmp",
  "image/svg+xml": "svg",
};

/**
 * 抽出 body 内所有 data:image 图片，改写 src 为相对路径。
 * @returns {Array<{ file:string, mime:string, base64:string }>}
 */
function extractInlineImages(body, dirPrefix) {
  const out = [];
  const seen = new Map(); // dataUri -> file，同一张图只存一份
  body.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src") || "";
    const m = src.match(/^data:([^;]+);base64,(.+)$/);
    if (!m) return;
    if (seen.has(src)) {
      img.setAttribute("src", `${dirPrefix}/${seen.get(src)}`);
      return;
    }
    const mime = m[1];
    const ext = MIME_EXT[mime] || "png";
    const file = `image${out.length + 1}.${ext}`;
    out.push({ file, mime, base64: m[2] });
    seen.set(src, file);
    img.setAttribute("src", `${dirPrefix}/${file}`);
  });
  return out;
}

/* ============================================================
   DOCX（OOXML / WordprocessingML）
   ============================================================ */

const EMU_PER_PX = 9525; // OOXML 用 EMU 作长度单位
const DOC_WIDTH_PX = 600; // A4 正文可用宽度约 600px，图片超宽时等比缩到这个值

/** 行内内容 → <w:r> 序列 */
function docxRuns(node, fmt = {}, ctx = {}) {
  if (node.nodeType === 3) {
    const text = node.nodeValue;
    if (!text) return "";
    const props = [];
    if (fmt.b) props.push("<w:b/>");
    if (fmt.i) props.push("<w:i/>");
    if (fmt.strike) props.push("<w:strike/>");
    if (fmt.code) props.push('<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="19"/>');
    if (fmt.link) props.push('<w:color w:val="0563C1"/><w:u w:val="single"/>');
    if (ctx && ctx.color && !fmt.link) props.push(`<w:color w:val="${esc(ctx.color)}"/>`);
    const rPr = props.length ? `<w:rPr>${props.join("")}</w:rPr>` : "";
    return `<w:r>${rPr}<w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
  }
  if (node.nodeType !== 1) return "";
  const tag = node.tagName.toLowerCase();
  if (tag === "br") return "<w:r><w:br/></w:r>";
  if (tag === "img") return docxImageRun(node);
  const next = { ...fmt };
  if (tag === "strong" || tag === "b") next.b = true;
  if (tag === "em" || tag === "i") next.i = true;
  if (tag === "del" || tag === "s") next.strike = true;
  if (tag === "code") next.code = true;
  if (tag === "a") next.link = true;
  return [...node.childNodes].map((c) => docxRuns(c, next, ctx)).join("");
}

/** 图片 run：用 DrawingML 内联图 */
function docxImageRun(img) {
  const id = img.getAttribute("data-docx-id");
  if (!id) return "";
  const w = Math.min(DOC_WIDTH_PX, Number(img.getAttribute("data-docx-w")) || DOC_WIDTH_PX);
  const h = Number(img.getAttribute("data-docx-h")) || Math.round(w * 0.6);
  const cx = Math.round(w * EMU_PER_PX);
  const cy = Math.round(h * EMU_PER_PX);
  const n = id.replace(/\D/g, "") || "1";
  return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">
<wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${n}" name="Picture ${n}"/>
<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
<pic:nvPicPr><pic:cNvPr id="${n}" name="Picture ${n}"/><pic:cNvPicPr/></pic:nvPicPr>
<pic:blipFill><a:blip r:embed="${esc(id)}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
}

function docxPara(styleId, inner, extraPPr = "", ctx = {}) {
  let pPrInner = (styleId ? `<w:pStyle w:val="${styleId}"/>` : "") + extraPPr;
  if (ctx && ctx.quotePPr && !styleId) pPrInner += ctx.quotePPr;
  const pPr = `<w:pPr>${pPrInner}</w:pPr>`;
  return `<w:p>${pPr}${inner}</w:p>`;
}

/** 块级元素 → <w:p> / <w:tbl> */
function docxBlocks(node, ctx = {}) {
  const out = [];
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      if (child.nodeValue.trim()) out.push(docxPara("", docxRuns(child, {}, ctx)));
      continue;
    }
    if (child.nodeType !== 1) continue;
    const tag = child.tagName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) {
      out.push(docxPara(`Heading${tag[1]}`, docxRuns(child, {}, ctx)));
    } else if (tag === "p") {
      out.push(docxPara("", docxRuns(child, {}, ctx)));
    } else if (tag === "blockquote") {
      // 引用：整块缩进 + 主色左边框 + 浅底 + 主色相关文字，内部段落逐个处理
      const qctx = { ...ctx, inQuote: true, color: ctx.themeMuted };
      out.push(...docxBlocks(child, qctx));
    } else if (tag === "ul" || tag === "ol") {
      out.push(...docxList(child, ctx, tag === "ol" ? 2 : 1, 0));
    } else if (tag === "pre") {
      // 代码块：每行一个等宽段落 + 浅底
      const text = child.textContent.replace(/\n$/, "");
      for (const line of text.split("\n")) {
        out.push(
          docxPara(
            "CodeBlock",
            `<w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="19"/></w:rPr><w:t xml:space="preserve">${esc(line)}</w:t></w:r>`,
          ),
        );
      }
    } else if (tag === "table") {
      out.push(docxTable(child, ctx));
    } else if (tag === "hr") {
      const c = (ctx && ctx.accentNoHash) || "CCCCCC";
      out.push(
        `<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="${c}"/></w:pBdr></w:pPr></w:p>`,
      );
    } else if (tag === "img") {
      out.push(docxPara("", docxImageRun(child)));
    } else if (tag === "br") {
      out.push(docxPara("", "<w:r><w:br/></w:r>"));
    } else {
      // div / section 等容器：递归；纯行内内容则包一个段落
      const hasBlock = [...child.children].some((c) =>
        /^(p|div|h[1-6]|ul|ol|pre|table|blockquote|hr)$/i.test(c.tagName),
      );
      if (hasBlock) out.push(...docxBlocks(child, ctx));
      else if (child.textContent.trim() || child.querySelector("img"))
        out.push(docxPara("", docxRuns(child, {}, ctx)));
    }
  }
  return out;
}

/** 列表：Word 用 numPr 引用编号定义，这里用两套（1=无序 2=有序） */
function docxList(listEl, ctx, numId, level) {
  const out = [];
  for (const li of listEl.children) {
    if (li.tagName.toLowerCase() !== "li") continue;
    // 先取出直接子列表，剩下的作为本条目文字
    const subLists = [...li.children].filter((c) => /^(ul|ol)$/i.test(c.tagName));
    const clone = li.cloneNode(true);
    [...clone.children].forEach((c) => {
      if (/^(ul|ol)$/i.test(c.tagName)) c.remove();
    });
    // 任务列表：把 checkbox 变成 ☑ / ☐ 字符（Word 没有原生 md 任务列表）
    let prefix = "";
    const cb = clone.querySelector('input[type="checkbox"]');
    if (cb) {
      prefix = cb.hasAttribute("checked") || cb.checked ? "☑ " : "☐ ";
      cb.remove();
    }
    const runs =
      (prefix
        ? `<w:r><w:t xml:space="preserve">${prefix}</w:t></w:r>`
        : "") + docxRuns(clone, {}, ctx);
    out.push(
      docxPara(
        "ListParagraph",
        runs,
        `<w:numPr><w:ilvl w:val="${Math.min(level, 8)}"/><w:numId w:val="${numId}"/></w:numPr>`,
        ctx,
      ),
    );
    for (const sub of subLists) {
      out.push(...docxList(sub, ctx, sub.tagName.toLowerCase() === "ol" ? 2 : 1, level + 1));
    }
  }
  return out;
}

function docxTable(table, ctx) {
  const rows = [...table.querySelectorAll("tr")];
  if (!rows.length) return "";
  const colCount = Math.max(...rows.map((r) => r.children.length));
  const colW = Math.floor(9000 / Math.max(1, colCount));
  const grid = `<w:tblGrid>${Array(colCount).fill(`<w:gridCol w:w="${colW}"/>`).join("")}</w:tblGrid>`;
  const border = (side) =>
    `<w:${side} w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>`;
  const tblPr = `<w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders>${["top", "left", "bottom", "right", "insideH", "insideV"].map(border).join("")}</w:tblBorders></w:tblPr>`;
  const body = rows
    .map((tr) => {
      const isHead = tr.closest("thead") || tr.children[0]?.tagName.toLowerCase() === "th";
      const cells = [...tr.children]
        .map((td) => {
          const shd = isHead ? '<w:shd w:val="clear" w:fill="F2F2F2"/>' : "";
          const inner = docxRuns(td) || "<w:r><w:t/></w:r>";
          const bold = isHead ? "<w:b/>" : "";
          const runs = isHead ? inner.replace(/<w:r>(?!<w:rPr>)/g, `<w:r><w:rPr>${bold}</w:rPr>`) : inner;
          return `<w:tc><w:tcPr><w:tcW w:w="${colW}" w:type="dxa"/>${shd}</w:tcPr><w:p>${runs}</w:p></w:tc>`;
        })
        .join("");
      // 列数不齐时补空单元格，否则部分 Word 版本会提示文档损坏
      const pad = Array(Math.max(0, colCount - tr.children.length))
        .fill(`<w:tc><w:tcPr><w:tcW w:w="${colW}" w:type="dxa"/></w:tcPr><w:p/></w:tc>`)
        .join("");
      return `<w:tr>${cells}${pad}</w:tr>`;
    })
    .join("");
  return `<w:tbl>${tblPr}${grid}${body}</w:tbl>`;
}

/** 未选模板时的中性默认主题（复刻原默认观感） */
const FALLBACK_THEME = {
  accent: "#1F2328",
  accentSoft: "#F6F8FA",
  text: "#1F2328",
  muted: "#656D76",
  font: "微软雅黑",
  fontAscii: "Calibri",
  bodySize: 15,
  titleSize: 22,
  h2Size: 18,
  lineHeight: 1.7,
  paraAfter: 10,
  justify: true,
};

/** 由模板主题生成 docx 的 styles.xml（OOXML） */
function docxStylesXml(t) {
  const accent = (t.accent || "#1F2328").replace("#", "");
  const text = (t.text || "#1F2328").replace("#", "");
  const bodyHalf = Math.round((t.bodySize || 15) * 1.5); // 1px ≈ 1.5 半磅
  const line = Math.round((t.lineHeight || 1.7) * 240); // 行距以 240 分之一磅为单位
  const after = Math.round((t.paraAfter || 10) * 15); // 1px ≈ 15 twip
  const justify = t.justify ? '<w:jc w:val="both"/>' : "";
  const fontEA = t.font || "微软雅黑";
  const fontAscii = t.fontAscii || "Calibri";
  const sizes = [0, Math.round((t.titleSize || 22) * 1.5), Math.round((t.h2Size || 18) * 1.5), 24, 22, 21, 20];
  const headingStyles = [1, 2, 3, 4, 5, 6]
    .map(
      (i) =>
        `<w:style w:type="paragraph" w:styleId="Heading${i}"><w:name w:val="heading ${i}"/><w:basedOn w:val="Normal"/><w:pPr><w:outlineLvl w:val="${i - 1}"/><w:spacing w:before="${Math.max(120, 320 - i * 40)}" w:after="120"/><w:jc w:val="left"/></w:pPr><w:rPr><w:b/><w:sz w:val="${sizes[i]}"/><w:color w:val="${accent}"/></w:rPr></w:style>`,
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr>
<w:rFonts w:ascii="${fontAscii}" w:hAnsi="${fontAscii}" w:eastAsia="${fontEA}"/><w:sz w:val="${bodyHalf}"/><w:color w:val="${text}"/>
</w:rPr></w:rPrDefault>
<w:pPrDefault><w:pPr><w:spacing w:after="${after}" w:line="${line}" w:lineRule="auto"/>${justify}</w:pPr></w:pPrDefault>
</w:docDefaults>
${headingStyles}
<w:style w:type="paragraph" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="420"/><w:spacing w:after="60"/></w:pPr></w:style>
<w:style w:type="paragraph" w:styleId="CodeBlock"><w:name w:val="Code Block"/><w:basedOn w:val="Normal"/><w:pPr><w:shd w:val="clear" w:fill="F6F8FA"/><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:ind w:left="240"/></w:pPr><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="19"/></w:rPr></w:style>
</w:styles>`;
}

const DOCX_NUMBERING = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:abstractNum w:abstractNumId="1">${Array.from({ length: 9 })
  .map(
    (_, i) =>
      `<w:lvl w:ilvl="${i}"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="${["•", "◦", "▪"][i % 3]}"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="${420 + i * 360}" w:hanging="360"/></w:pPr></w:lvl>`,
  )
  .join("")}</w:abstractNum>
<w:abstractNum w:abstractNumId="2">${Array.from({ length: 9 })
  .map(
    (_, i) =>
      `<w:lvl w:ilvl="${i}"><w:start w:val="1"/><w:numFmt w:val="${["decimal", "lowerLetter", "lowerRoman"][i % 3]}"/><w:lvlText w:val="%${i + 1}."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="${420 + i * 360}" w:hanging="360"/></w:pPr></w:lvl>`,
  )
  .join("")}</w:abstractNum>
<w:num w:numId="1"><w:abstractNumId w:val="1"/></w:num>
<w:num w:numId="2"><w:abstractNumId w:val="2"/></w:num>
</w:numbering>`;

/**
 * 生成 DOCX 的全部 ZIP 条目。
 * @param {string} md 工作副本 Markdown（含 @img 占位符也没关系，内部会展开）
 * @param {string} title 文档标题
 */
export function buildDocxEntries(md, title = "Document", theme = null) {
  const t = theme || FALLBACK_THEME;
  const ctx = {
    themeMuted: (t.muted || "#656D76").replace("#", ""),
    accentNoHash: (t.accent || "#1F2328").replace("#", ""),
    softNoHash: (t.accentSoft || "#F6F8FA").replace("#", ""),
    quotePPr: `<w:ind w:left="432"/><w:shd w:val="clear" w:color="auto" w:fill="${(t.accentSoft || "#F6F8FA").replace("#", "")}"/><w:pBdr><w:left w:val="single" w:sz="24" w:space="8" w:color="${(t.accent || "#1F2328").replace("#", "")}"/></w:pBdr>`,
  };
  const body = parseHtml(renderFullHtml(expandMarkdown(md || "")));
  // Mermaid 在 Word 里无法执行，降级成代码块，至少保留源码不丢信息
  body.querySelectorAll(".mermaid").forEach((el) => {
    const pre = document.createElement("pre");
    pre.textContent = el.textContent;
    el.replaceWith(pre);
  });
  const images = extractInlineImages(body, "media");
  // 给每张图分配关系 id 与显示尺寸（读 CSS 宽度拿不到，用固定正文宽等比）
  body.querySelectorAll("img").forEach((img, i) => {
    const src = img.getAttribute("src") || "";
    if (!src.startsWith("media/")) {
      img.remove(); // 外链图片 Word 打开时不可用，直接去掉避免红叉占位
      return;
    }
    img.setAttribute("data-docx-id", `rId${100 + i}`);
    const w = Number(img.getAttribute("width")) || DOC_WIDTH_PX;
    img.setAttribute("data-docx-w", String(Math.min(DOC_WIDTH_PX, w)));
    img.setAttribute("data-docx-h", String(Math.round(Math.min(DOC_WIDTH_PX, w) * 0.62)));
  });

  const blocks = docxBlocks(body, ctx).join("");
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
<w:body>${blocks}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body></w:document>`;

  const imgRels = [...body.querySelectorAll("img[data-docx-id]")]
    .map(
      (img) =>
        `<Relationship Id="${esc(img.getAttribute("data-docx-id"))}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${esc(img.getAttribute("src"))}"/>`,
    )
    .join("");

  const defaults = new Set(images.map((im) => MIME_EXT[im.mime] || "png"));
  const entries = [
    {
      name: "[Content_Types].xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
${[...defaults].map((ext) => `<Default Extension="${ext}" ContentType="image/${ext === "jpg" ? "jpeg" : ext}"/>`).join("")}
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>`,
    },
    {
      name: "_rels/.rels",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
    },
    { name: "word/document.xml", data: documentXml },
    { name: "word/styles.xml", data: docxStylesXml(t) },
    { name: "word/numbering.xml", data: DOCX_NUMBERING },
    {
      name: "word/_rels/document.xml.rels",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
<Relationship Id="rIdNum" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
${imgRels}</Relationships>`,
    },
  ];
  for (const im of images) {
    entries.push({ name: `word/media/${im.file}`, data: im.base64, base64: true });
  }
  return entries;
}

/* ============================================================
   EPUB 3
   ============================================================ */

/** HTML → 合法 XHTML（EPUB 要求严格 XML：空元素必须自闭合、属性必须带引号） */
function toXhtml(el) {
  const xml = new XMLSerializer().serializeToString(el);
  // serializeToString 会带上 xmlns 与外层标签，这里取内部内容
  return xml.replace(/^<body[^>]*>/, "").replace(/<\/body>$/, "");
}

/**
 * 生成 EPUB 的全部 ZIP 条目。按 h1 切章，没有 h1 就整篇作一章。
 */
export function buildEpubEntries(md, title = "Document", author = "笔削 PenEditMd") {
  const body = parseHtml(renderFullHtml(expandMarkdown(md || "")));
  // Mermaid / 代码高亮的脚本类节点在 EPUB 阅读器里不可执行，降级为 pre
  body.querySelectorAll(".mermaid").forEach((el) => {
    const pre = document.createElement("pre");
    pre.textContent = el.textContent;
    el.replaceWith(pre);
  });
  body.querySelectorAll("script, style").forEach((el) => el.remove());
  const images = extractInlineImages(body, "../images");
  // 外链图片 EPUB 离线打不开，去掉
  body.querySelectorAll("img").forEach((img) => {
    const s = img.getAttribute("src") || "";
    if (!s.startsWith("../images/")) img.remove();
  });

  // 按 h1 切章：每遇到一个 h1 开一章，章名取 h1 文本
  const chapters = [];
  let cur = { title, nodes: [] };
  for (const node of [...body.childNodes]) {
    if (node.nodeType === 1 && node.tagName.toLowerCase() === "h1") {
      if (cur.nodes.length) chapters.push(cur);
      cur = { title: node.textContent.trim() || title, nodes: [node] };
    } else {
      cur.nodes.push(node);
    }
  }
  if (cur.nodes.length || !chapters.length) chapters.push(cur);

  const uid = `urn:uuid:${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
  const now = new Date().toISOString().replace(/\.\d+Z$/, "Z");

  const chapterFiles = chapters.map((ch, i) => {
    const holder = document.createElement("body");
    ch.nodes.forEach((n) => holder.appendChild(n.cloneNode(true)));
    const file = `text/chapter${i + 1}.xhtml`;
    const data = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="zh-CN" lang="zh-CN">
<head><meta charset="utf-8"/><title>${esc(ch.title)}</title>
<link rel="stylesheet" type="text/css" href="../style.css"/></head>
<body class="markdown-body">${toXhtml(holder)}</body></html>`;
    return { file, data, title: ch.title, id: `ch${i + 1}` };
  });

  const manifestImgs = images
    .map(
      (im, i) =>
        `<item id="img${i + 1}" href="images/${esc(im.file)}" media-type="${esc(im.mime)}"/>`,
    )
    .join("");
  const manifestChs = chapterFiles
    .map((c) => `<item id="${c.id}" href="${esc(c.file)}" media-type="application/xhtml+xml"/>`)
    .join("");
  const spine = chapterFiles.map((c) => `<itemref idref="${c.id}"/>`).join("");

  const entries = [
    // 规范硬性要求：mimetype 必须是第一个条目、且不压缩
    { name: "mimetype", data: "application/epub+zip", store: true },
    {
      name: "META-INF/container.xml",
      data: `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`,
    },
    {
      name: "OEBPS/content.opf",
      data: `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="bookid">${esc(uid)}</dc:identifier>
<dc:title>${esc(title)}</dc:title>
<dc:creator>${esc(author)}</dc:creator>
<dc:language>zh-CN</dc:language>
<meta property="dcterms:modified">${now}</meta>
</metadata>
<manifest>
<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
<item id="css" href="style.css" media-type="text/css"/>
${manifestChs}${manifestImgs}
</manifest>
<spine>${spine}</spine>
</package>`,
    },
    {
      name: "OEBPS/nav.xhtml",
      data: `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="zh-CN" lang="zh-CN">
<head><meta charset="utf-8"/><title>目录</title></head>
<body><nav epub:type="toc" id="toc"><h1>目录</h1><ol>
${chapterFiles.map((c) => `<li><a href="${esc(c.file)}">${esc(c.title)}</a></li>`).join("")}
</ol></nav></body></html>`,
    },
    { name: "OEBPS/style.css", data: exportCss },
  ];
  chapterFiles.forEach((c) => entries.push({ name: `OEBPS/${c.file}`, data: c.data }));
  images.forEach((im) =>
    entries.push({ name: `OEBPS/images/${im.file}`, data: im.base64, base64: true }),
  );
  return entries;
}
