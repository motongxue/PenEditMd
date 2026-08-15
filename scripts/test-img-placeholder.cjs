/* 验证：富文本图片占位符 <-> markdown 双向转换，且序列化绝不吐出 base64 */
// turndown 在 Node 下自带 domino 解析器，无需 jsdom
const Turndown = require("turndown");
const { gfm } = require("turndown-plugin-gfm");

const turndown = new Turndown({ headingStyle: "atx", codeBlockStyle: "fenced" });
turndown.use(gfm);

turndown.addRule("keepDataUriImages", {
  filter: (n) => n.nodeName === "IMG" && n.getAttribute("src")?.startsWith("data:"),
  replacement: (c, n) => `![${n.getAttribute("alt") || ""}](${n.getAttribute("src")})`,
});
turndown.addRule("imgPlaceholder", {
  filter: (n) =>
    (n.nodeName === "IMG" || n.nodeName === "SPAN") && n.hasAttribute?.("data-img-id"),
  replacement: (c, n) =>
    `![${n.getAttribute("data-img-alt") || ""}](@img:${n.getAttribute("data-img-id")}:${
      n.getAttribute("data-img-name") || "image.png"
    })`,
});

const BIG = "data:image/png;base64," + "A".repeat(200000);
const cases = [
  ["折叠态", `<p><span class="img-ph" data-img-id="3" data-img-name="a.png" data-img-alt="图A">🖼️</span></p>`, "![图A](@img:3:a.png)"],
  ["展开态", `<p><img class="img-expanded" src="${BIG}" data-img-id="3" data-img-name="a.png" data-img-alt="图A"></p>`, "![图A](@img:3:a.png)"],
  ["多图横排", `<p><span class="img-ph" data-img-id="0" data-img-name="a.png" data-img-alt="A">x</span><span class="img-ph" data-img-id="1" data-img-name="b.png" data-img-alt="B">y</span></p>`, "![A](@img:0:a.png)![B](@img:1:b.png)"],
  ["普通网络图不受影响", `<p><img src="https://x.com/a.png" alt="net"></p>`, "![net](https://x.com/a.png)"],
];

let fail = 0;
for (const [name, html, expect] of cases) {
  const got = turndown.turndown(html).trim();
  const hasB64 = got.includes("base64,");
  const ok = got === expect && !hasB64;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) console.log(`   期望: ${expect}\n   实际: ${got.slice(0, 120)}`);
}
console.log(fail === 0 ? "\n全部通过 ✅" : `\n${fail} 项失败 ❌`);
process.exit(fail ? 1 : 0);
