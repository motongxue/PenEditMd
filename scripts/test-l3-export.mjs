/**
 * L3 进阶导出验证：在 jsdom 里跑 officeExport 的 DOCX / EPUB 生成，
 * 用 zipWriter 打包后落盘，再由 Python zipfile 做结构校验。
 */
import { JSDOM } from "jsdom";
import fs from "fs";
import { createRequire } from "module";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
global.window = dom.window;
global.document = dom.window.document;
global.DOMParser = dom.window.DOMParser;
global.XMLSerializer = dom.window.XMLSerializer;
global.Node = dom.window.Node;
global.localStorage = {
  _d: {},
  getItem(k) { return this._d[k] ?? null; },
  setItem(k, v) { this._d[k] = v; },
  removeItem(k) { delete this._d[k]; },
};

const { buildDocxEntries, buildEpubEntries } = await import("../renderer/src/officeExport.js");
const require = createRequire(import.meta.url);
const { createZip } = require("../zipWriter.js");

// 1x1 透明 PNG
const PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const MD = `# 第一章 概述

这是一段**加粗**、*斜体*、~~删除线~~ 和 \`行内代码\` 的正文。

- 无序项 A
- 无序项 B
  - 嵌套项 B1
- [x] 已完成任务
- [ ] 未完成任务

1. 有序一
2. 有序二

> 这是一段引用文字。

\`\`\`python
def hello():
    print("hi")
\`\`\`

| 列一 | 列二 |
| --- | --- |
| a1 | b1 |
| a2 | b2 |

![测试图](data:image/png;base64,${PNG})

多图横排：![图1](data:image/png;base64,${PNG})![图2](data:image/png;base64,${PNG})

---

# 第二章 结尾

[链接文字](https://example.com) 结束。
`;

fs.mkdirSync("_shots", { recursive: true });

const docx = buildDocxEntries(MD, "测试文档");
fs.writeFileSync("_shots/test.docx", createZip(docx));
console.log("DOCX 条目数:", docx.length, docx.map((e) => e.name).join(", "));

const epub = buildEpubEntries(MD, "测试文档");
fs.writeFileSync("_shots/test.epub", createZip(epub));
console.log("EPUB 条目数:", epub.length, epub.map((e) => e.name).join(", "));
