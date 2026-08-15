// 公众号内联 HTML 导出（安全标签写法）无头验证：用 jsdom 真实渲染 + 断言内联样式。
import { JSDOM } from "jsdom";
import { createRequire } from "module";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/" });
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
const require = createRequire(import.meta.url);
void require;

const { buildWechatHtml, buildPlatformContent, PLATFORMS } = await import("../renderer/src/wechat.js");
const { themeVarsCss, themeTypographyCss, themeStyleBlock, TMPL_COMPONENT_CSS } =
  await import("../renderer/src/themeCss.js");

const theme = {
  accent: "#059669", accentSoft: "#ECFDF5", accentUnderline: "#A7F3D0",
  title: "#111827", text: "#374151", muted: "#6B7280",
  border: "#E5E7EB", divider: "#D1D5DB", surface: "#FFFFFF",
  quoteBg: "#F9FAFB", codeBg: "#F3F4F6", codeText: "#1F2937",
  font: "微软雅黑", fontAscii: "Calibri",
  bodySize: 15, titleSize: 22, h2Size: 18, lineHeight: 1.75, paraAfter: 10, justify: true,
};

// 第二个主题：验证「中性色随主题」（橄榄手记 surface=纸感米白 #FDFDF8，主色=墨黑）
const oliveTheme = {
  accent: "#1e1f23", accentSoft: "#EEEFE9", accentUnderline: "#ed7b2f", accentOrange: "#ed7b2f",
  title: "#23251d", text: "#4d4f46", muted: "#65675e",
  border: "#bfc1b7", divider: "#aeb0a6", surface: "#FDFDF8",
  quoteBg: "#EEEFE9", codeBg: "#E5E7E0", codeText: "#1F2937",
  font: "微软雅黑", fontAscii: "Calibri",
  bodySize: 15, titleSize: 22, h2Size: 18, lineHeight: 1.75, paraAfter: 10, justify: true,
};

const md = `# 文章大标题

这是一段正文，用来测试公众号内联导出。两端对齐与字号应当保留。

> 这是引用块，左边框应为主色。

\`\`\`js
const a = 1;
\`\`\`

<div class="tmpl-keep tmpl-infocard"><div class="tmpl-ic-cap">提示</div><div class="tmpl-ic-body">信息卡片内容，一句话说清要点。</div></div>

<div class="tmpl-keep tmpl-hnum"><h2><span class="tmpl-badge">01</span>为什么关注微软开源</h2></div>

<div class="tmpl-keep tmpl-timeline"><div class="tmpl-tl-item"><span class="tmpl-tl-dot"></span><div class="tmpl-tl-time">2020</div><div class="tmpl-tl-text">Satya Nadella 喊出「微软爱 Linux」</div></div><div class="tmpl-tl-item"><span class="tmpl-tl-dot"></span><div class="tmpl-tl-time">2021</div><div class="tmpl-tl-text">.NET 开源，VS Code 发布</div></div></div>

<div class="tmpl-keep tmpl-price"><div class="tmpl-p-item"><div class="tmpl-p-name">开源免费</div><div class="tmpl-p-num">¥0</div><div class="tmpl-p-desc">代码随意用</div></div><div class="tmpl-p-item tmpl-p-rec"><div class="tmpl-p-name">推荐·社区支持</div><div class="tmpl-p-num">免费</div><div class="tmpl-p-desc">GitHub Discussions</div></div><div class="tmpl-p-item"><div class="tmpl-p-name">商业支持</div><div class="tmpl-p-num">按需</div><div class="tmpl-p-desc">企业级 SLA</div></div></div>

<div class="tmpl-keep tmpl-imgtxt"><div class="tmpl-it-img">配图占位</div><div class="tmpl-it-cap">图文标题</div><div class="tmpl-it-body">图文正文，左侧配图、右侧文字说明。</div></div>

<div class="tmpl-keep tmpl-grid3"><div class="tmpl-g-cell">PowerShell</div><div class="tmpl-g-cell">Windows Terminal</div><div class="tmpl-g-cell">Winget</div></div>

<div class="tmpl-keep tmpl-steps"><div class="tmpl-step"><div class="tmpl-step-no">1</div><div class="tmpl-step-title">步骤一</div><div class="tmpl-step-text">描述一</div></div><div class="tmpl-step"><div class="tmpl-step-no">2</div><div class="tmpl-step-title">步骤二</div><div class="tmpl-step-text">描述二</div></div><div class="tmpl-step"><div class="tmpl-step-no">3</div><div class="tmpl-step-title">步骤三</div><div class="tmpl-step-text">描述三</div></div></div>

<div class="tmpl-keep tmpl-author"><div class="tmpl-avatar">头像</div><div class="tmpl-a-name">开源观察员</div><div class="tmpl-a-bio">专注微软与开源生态</div><div class="tmpl-qr">关注二维码</div></div>

<div class="tmpl-keep tmpl-dialog"><div class="tmpl-dlg-who">小编</div><div class="tmpl-dlg-text">对话框气泡内容，头像在左、气泡在右。</div></div>
`;

const { html } = buildWechatHtml(md, theme);
const { html: htmlOlive } = buildWechatHtml(md, oliveTheme);

let pass = 0,
  fail = 0;
function must(name, cond) {
  if (cond) {
    pass++;
    console.log("PASS " + name);
  } else {
    fail++;
    console.log("FAIL " + name);
  }
}

must("输出含 <section>", html.includes("<section"));
must("标题 h1 内联主色", /color:#059669/.test(html));
must("正文 p 内联字号15px", /font-size:15px/.test(html));
must("正文 p 两端对齐", /text-align:justify/.test(html));
must("引用块左边框主色", /border-left:4px solid #059669/.test(html));
must("导出不含 <table>", !html.includes("<table"));
must("组件已转换(无 tmpl-keep)", !html.includes("tmpl-keep"));
must("infocard 转为带浅底 section(surface 驱动)", /background:#FFFFFF/.test(html) && /<section[^>]*data-wx/.test(html) && html.includes("信息卡片内容"));
must("infocard 标题用主色", /color:#059669/.test(html) && html.includes("提示"));
must("timeline 竖线(左边框,divider 驱动)", /border-left:2px solid #D1D5DB/.test(html));
must("编号标题 badge 用主色底", /background:#059669/.test(html) && html.includes("01"));
must("价格卡推荐档主色边框", /border:1px solid #059669/.test(html));
must("公众号价格对比保持 inline-block 并排", /display:inline-block;width:31%/.test(html) && html.includes("推荐·社区支持"));
must("公众号九宫格保持三列 inline-block 并排", /display:inline-block;width:31%/.test(html) && html.includes("PowerShell") && html.includes("Winget"));
must("公众号图文并排左图右文 inline-block", /display:inline-block;width:38%/.test(html) && /display:inline-block;width:58%/.test(html));
must("纵向时间轴含竖线(border-left)+圆点字符○", /border-left:2px solid #D1D5DB/.test(html) && /[○]|&#9675;/.test(html));
must("步骤条竖向排列(外层 border-left+编号圆点)", /border-left:2px solid #D1D5DB/.test(html) && /margin-left:-33px/.test(html) && /width:24px;height:24px;border-radius:50%/.test(html));
must("代码块浅底(codeBg 驱动)", /background:#F3F4F6/.test(html));
must("内联 style 属性已写入", html.includes("style="));
must("h1 字号为标题字号(22px)", /font-size:22px/.test(html));
must("h1 颜色为主色且内联style含主色(未被正文色覆盖)", /color:#059669/.test(html));

// 第二主题：验证中性色随主题（橄榄手记）
must("橄榄·surface 驱动卡片底(纸感米白)", htmlOlive.includes("background:#FDFDF8"));
must("橄榄·主色为墨黑(标题)", /color:#1e1f23/.test(htmlOlive));
must("橄榄·divider 驱动时间轴竖线", /border-left:2px solid #aeb0a6/.test(htmlOlive));

/* ---------------- 组件占位框内插入真实图片：发布转换必须保留 <img> ---------------- */
const imgMd = `
# 插真图

![正文配图](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==)

<div class="tmpl-keep tmpl-imgtxt"><div class="tmpl-it-img"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="></div><div class="tmpl-it-cap">图文标题</div><div class="tmpl-it-body">图文正文。</div></div>
<div class="tmpl-keep tmpl-imgframe"><div class="tmpl-if-img"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="></div><div class="tmpl-if-cap">图注</div></div>
<div class="tmpl-keep tmpl-grid3"><div class="tmpl-g-cell"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="></div><div class="tmpl-g-cell">占位1</div><div class="tmpl-g-cell">占位2</div></div>
`;
const { html: imgHtml } = buildWechatHtml(imgMd, theme);
must("图文：占位框内真实图片被保留为 <img>", /<img src="data:image\/png;base64,[^"]*"/.test(imgHtml));
must("图文：无图时仍回退占位文字", html.includes("配图占位"));
must("封面图：真实图片被保留", imgHtml.includes('<img src="data:image/png;base64,'));
must("九宫格：含图格输出 <img>，无图格仍占位", /<img src="data:image\/png;base64,[^"]*"/.test(imgHtml) && imgHtml.includes("占位1"));

/* ---------------- 平台 profile：仅公众号 ---------------- */

const wx = buildPlatformContent(md, theme, { platform: "wechat" });

must("公众号仍包 <section>", wx.html.includes("<section"));
must("公众号保留圆角", /border-radius:/.test(wx.html));
must("公众号保留 inline-block 标签/徽章", /display:inline-block/.test(wx.html));
must("平台表仅公众号一家", Object.keys(PLATFORMS).length === 1);

/* ---------------- themeCss：PNG/导出侧主题化 ---------------- */

const vars = themeVarsCss(theme);
must("themeVars 产出 :root", vars.startsWith(":root {"));
must("themeVars 写入 accent", vars.includes("--tmpl-accent:#059669"));
must("themeVars 写入 surface", vars.includes("--tmpl-surface:#FFFFFF"));
must("组件 CSS 已从 tmplComponents.css 读到", TMPL_COMPONENT_CSS.includes(".tmpl-infocard"));

const typo = themeTypographyCss(theme, [".markdown-body"]);
must("排版层作用域可切换到导出容器", typo.includes(".markdown-body h1") && !typo.includes(".rich-input"));
must("排版层默认覆盖预览与富文本区", themeTypographyCss(theme).includes(".rich-input h1"));

const block = themeStyleBlock(theme, [".markdown-body"]);
must("导出样式块含变量层", block.includes("--tmpl-accent:#059669"));
must("导出样式块含组件层", block.includes(".tmpl-timeline"));
must("导出样式块含排版层", block.includes(".markdown-body h1"));

const neutral = themeStyleBlock(null);
must("无主题时只给组件层(不染色)", neutral.includes(".tmpl-infocard") && !neutral.includes("--tmpl-accent:"));

console.log(`\n结果: ${fail === 0 ? "ALL PASS" : "有失败"} (${pass} passed, ${fail} failed)`);
process.exit(fail === 0 ? 0 : 1);
