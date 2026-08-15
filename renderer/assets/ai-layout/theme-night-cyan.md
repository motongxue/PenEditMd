# 公众号排版组件库 —— 暗夜青（night-cyan）

> **使用说明**：本组件库为「暗夜青」主题（暗色科技美学·终端质感·霓虹克制），所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：深空底色 `#1a1a2e` + 青绿霓虹锚点 `#00d4aa`。青色是发光二极管——只在锚点（章节编号、代码边框、关键数字、下划线、按钮）出现，覆盖面积 ≤ 3%；其余 97% 由灰阶与暗底承载。等宽字体用于标签、数据、终端提示符，制造代码/终端气质。
>
> **招牌特性**（本主题全部具备）：① 章节自动编号 01/02/03…，末章 ∞；② 正文每段关键词下划线（青绿 `#00d4aa`）；③ 开头引言卡片；④ 前言导读区精选前 3 章节做目录卡；⑤ 代码块紧凑——每行 `<p style="margin:0">`，绝不用 `white-space:pre`；⑥ 结尾作者签名区占位 `{{作者名}}/{{简介}}`。
>
> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class/id、`position:fixed/absolute`、`float`、`@media`/`@keyframes`、`display:grid`、`calc()`/`var()`/`hsl()`
> - ✅ 支持内联 `style`、`display:flex`（有限）、`linear-gradient`、`border-radius`、`box-shadow`、`<section>/<p>/<span>/<strong>/<em>/<img>/<br>/<h3>` 等基础标签（**禁止 `<div>`**）
>
> **WeChat 兼容铁律**（本主题组件全部已按此写好，改动时必须遵守）：
> - 所有"装饰性空元素"（青绿霓虹分割线、END 短线、时间线竖条/圆点、数据卡分隔）**必须在内部放 `<span leaf=""><br></span>` 占位**，否则微信会剥掉样式
> - **不要把 `font-size`/`border-bottom` 打在 `<strong>` 上**，也不要在同一个 `<p>` 里混多个不同 `font-size`——微信编辑器会自动"纠正"导致样式被重写。正确做法：拆成多个 `<p>`，每个 `<p>` 只有一个字号；高亮样式统一挂在外层 `<span>` 上
> - 不用 `position:absolute` 做划线/高亮，删除线用 `text-decoration:line-through`
> - 结构化区域（如引言卡右下署名、图片说明）没有内容时**整块删掉**，不留空 section
> - 暗色主题虽用深色底，但内容区仍须 `max-width:677px` 居中；中文文字仍须 `<span leaf="">` 包裹；不要因为暗色就放松平台铁律

---

## 设计变量速查表

```
主色调：       #00d4aa（青绿霓虹，出现在章节编号、代码块边框、关键数据、按钮底色、下划线）
辅色：         #00e5bf（浅一阶青绿，hover 态或二级标记，极少使用）
点缀亮青：     #00ffcc（极高亮数据、关键数字脉冲感）
文章深色基底： #1a1a2e（深空蓝紫调，比纯黑更有深度，绝非 #000）
卡片暗底：     #252540（半透明深紫灰底，卡片/引用块背景）
深紫灰边框：   #2d2d50（卡片描边、分割线、图片容器边框）
代码块底：     #16162a（比文章底更深一阶，终端深度感）
终端栏色：     #0f0f1f（代码块顶栏，最深色）
标题色：       #e8e8f0（近白浅灰，标题专用）
正文色：       #d0d0d0（浅灰正文，在深底上保持柔和可读，绝非纯白 #fff）
辅助文字色：   #808090（中灰，日期、说明、元数据）
注释色：       #5a5a70（深灰，来源、版权、占位文字）
分割线色：     #2d2d50（与深紫灰边框同色）
正文字号：     14px（不可改）
正文行高：     1.85
章节标题字号： 18-20px
字间距：       0.3px
卡片圆角：     8px（暗色底上圆角需更明显才被感知）
最大宽度：     677px
内容区边距：   0 10px（左右各 10px）
```

字体栈（正文）：`-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif`
等宽字体栈（标签/数据/终端提示符/代码）：`Consolas,Monaco,monospace`

> **霓虹克制原则**：青色 `#00d4aa` 是信号而非氛围灯。每屏青色元素 ≤ 2 处；全文青色覆盖面积 ≤ 3%。卡片底色用 `#252540` + `1px solid #2d2d50` 边框（无边框的暗卡会融入底色"消失"）。代码块必须用深色终端 `#16162a`，绝不用浅色代码块。

---

## 组件 1 全局容器（暗底）

```html
<section style="max-width:677px;margin:0 auto;background:#1a1a2e;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;color:#d0d0d0;line-height:1.85;letter-spacing:0.3px;overflow-x:hidden;box-sizing:border-box;max-width:100%!important;">

  <!-- 所有组件放在这里 -->

</section>
```

---

## 组件 2 开头引言卡片（暗底 + 青绿锚点 + 终端提示符）

> **文案策略（先读，比代码重要）**：
> - 引言卡金句和公众号外标题是**两层**，视角要错开——外标题卖"为什么点开"，引言卡卖"核心观点是什么"
> - 已知外标题时，金句**禁止原样复述**其核心关键词；从文章第一段或核心论点提炼一句有张力的判断句
> - 右下署名按文章实际作者填，未知则整行删掉，**不要固定写"甲木"**
> - 顶部仿终端提示符 `$ cat intro.md` 是暗夜青签名式元素，可按文章主题换命令（如 `$ cat report.json`）；不需要时可整段删
> - 青绿下划线仅在本卡片内用于关键词锚点，正文中的关键词下划线每屏 ≤ 2 处

```html
<section style="margin:10px 10px 32px;background:#252540;border:1px solid #2d2d50;border-radius:8px;padding:26px 24px 22px;overflow:hidden;box-sizing:border-box;max-width:100%!important;">
  <p style="font-family:Consolas,Monaco,monospace;font-size:11px;color:#00d4aa;letter-spacing:1px;margin:0 0 12px;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">$ cat intro.md</span>
  </p>
  <p style="font-size:16px;font-weight:800;color:#e8e8f0;margin:0 0 8px;line-height:1.75;padding-left:4px;box-sizing:border-box;max-width:100%!important;">
    <span style="border-bottom:2px solid #00d4aa;font-weight:600;"><span leaf="">{{高亮关键词}}</span></span>
    <span leaf="">{{金句中段}}</span>
    <span style="border-bottom:2px solid #00d4aa;font-weight:600;"><span leaf="">{{高亮关键词}}</span></span>
    <span leaf="">{{金句收尾}}</span>
  </p>
  <p style="text-align:right;font-size:12px;color:#808090;margin:8px 0 0;letter-spacing:1px;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">—— {{作者名，未知则删整行}}</span>
  </p>
</section>
```

---

## 组件 3 前言导读区域（本文看点，三列目录卡片）

> 3 个及以上章节时生成。青绿等宽编号 + 近白标题；展示**精选 3 个核心看点**，不是全量章节列表。暗底卡片 `#252540` + `#2d2d50` 边框。

```html
<section style="padding:0 10px 32px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:14px;color:#808090;margin:0 0 14px;letter-spacing:1px;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">📌 本文看点</span>
  </p>
  <section style="display:flex;justify-content:space-between;box-sizing:border-box;max-width:100%!important;">
    <section style="flex:1;background:#252540;border:1px solid #2d2d50;border-radius:8px;padding:16px 12px;margin-right:8px;text-align:center;box-sizing:border-box;max-width:100%!important;">
      <p style="display:inline-block;background:#00d4aa;color:#1a1a2e;font-family:Consolas,Monaco,monospace;font-size:12px;font-weight:800;padding:2px 10px;border-radius:4px;margin:0 0 8px;box-sizing:border-box;max-width:100%!important;"><span leaf="">01</span></p>
      <p style="font-size:13px;font-weight:700;color:#e8e8f0;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{看点一}}</span></p>
    </section>
    <section style="flex:1;background:#252540;border:1px solid #2d2d50;border-radius:8px;padding:16px 12px;margin-right:8px;text-align:center;box-sizing:border-box;max-width:100%!important;">
      <p style="display:inline-block;background:#00d4aa;color:#1a1a2e;font-family:Consolas,Monaco,monospace;font-size:12px;font-weight:800;padding:2px 10px;border-radius:4px;margin:0 0 8px;box-sizing:border-box;max-width:100%!important;"><span leaf="">02</span></p>
      <p style="font-size:13px;font-weight:700;color:#e8e8f0;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{看点二}}</span></p>
    </section>
    <section style="flex:1;background:#252540;border:1px solid #2d2d50;border-radius:8px;padding:16px 12px;text-align:center;box-sizing:border-box;max-width:100%!important;">
      <p style="display:inline-block;background:#00d4aa;color:#1a1a2e;font-family:Consolas,Monaco,monospace;font-size:12px;font-weight:800;padding:2px 10px;border-radius:4px;margin:0 0 8px;box-sizing:border-box;max-width:100%!important;"><span leaf="">03</span></p>
      <p style="font-size:13px;font-weight:700;color:#e8e8f0;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{看点三}}</span></p>
    </section>
  </section>
</section>
```

---

## 组件 4 章节分割线（青绿霓虹符号 / 细渐变线）

> 技术文章用样式 A 终端虚线，数据报告用样式 B 霓虹 `◆ ◆ ◆`，一般分隔用样式 C 细渐变线。样式 B 菱形符号每篇最多出现 2 次（物以稀为贵）。

**样式 A（终端风格，等宽虚线）**：

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <p style="text-align:center;margin:0;color:#2d2d50;font-family:Consolas,Monaco,monospace;letter-spacing:4px;font-size:12px;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">- - - - - -</span>
  </p>
</section>
```

**样式 B（霓虹符号，暗夜青最华丽视觉元素）**：

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <p style="text-align:center;margin:0;color:#00d4aa;font-family:Consolas,Monaco,monospace;letter-spacing:6px;font-size:11px;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">◆ ◆ ◆</span>
  </p>
</section>
```

**样式 C（细青绿渐变线，推荐默认分隔）**：

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="height:1px;background:linear-gradient(to right,transparent,#00d4aa,transparent);margin:0;box-sizing:border-box;max-width:100%!important;">
    <span leaf=""><br></span>
  </section>
</section>
```

---

## 组件 5 章节标题（青绿等宽编号 + 标题，含 ∞ 末章变体）

> 青绿实底编号标签（等宽字体，像终端行号）+ 英文小标签 + 中文大标题，底部深紫灰细线。第一章 `margin-top:16px`，后续章节 `margin-top:48px`。编号必须用等宽字体（与正文非等宽字体形成"代码感"）。

```html
<section style="margin-top:48px;margin-bottom:28px;padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;align-items:center;margin-bottom:18px;padding-bottom:12px;border-bottom:1px solid #2d2d50;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-block;background:#00d4aa;color:#1a1a2e;font-family:Consolas,Monaco,monospace;font-size:16px;font-weight:900;padding:4px 12px;border-radius:6px;margin-right:14px;line-height:1.3;box-sizing:border-box;max-width:100%!important;"><span leaf="">01</span></span>
    <section style="box-sizing:border-box;max-width:100%!important;">
      <p style="font-size:10px;color:#00d4aa;font-weight:700;letter-spacing:3px;margin:0 0 2px;font-family:Consolas,Monaco,monospace;text-transform:uppercase;box-sizing:border-box;max-width:100%!important;">
        <span leaf="">{{ENGLISH TAG}}</span>
      </p>
      <h3 style="font-size:18px;font-weight:800;color:#e8e8f0;margin:0;letter-spacing:0.3px;box-sizing:border-box;max-width:100%!important;">
        <span leaf="">{{中文章节标题}}</span>
      </h3>
    </section>
  </section>

  <!-- 本章节正文内容放在这里 -->

</section>
```

**结语章节变体**（编号用 `∞` 替代数字，英文标签用 `THE END` / `EPILOGUE`）：

```html
<span style="display:inline-block;background:#00d4aa;color:#1a1a2e;font-family:Consolas,Monaco,monospace;font-size:16px;font-weight:900;padding:4px 12px;border-radius:6px;margin-right:14px;line-height:1.3;box-sizing:border-box;max-width:100%!important;"><span leaf="">∞</span></span>
```

---

## 组件 6 正文段落

> **关键规则**：每段主动识别 1~3 个关键短语，用**青绿下划线**标记（CSS：`border-bottom:2px solid #00d4aa;font-weight:600;`）——这是本风格的核心视觉特征，让读者快速扫到每段重点。暗底上段落更短（4-5 行），每段间距 8-10px 维持可读性。

**基础段落**：

```html
<p style="margin-bottom:20px;font-size:14px;line-height:1.85;color:#d0d0d0;text-align:justify;letter-spacing:0.3px;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">{{正文内容}}</span>
</p>
```

**带关键词下划线标记的段落**（推荐默认，青绿锚点）：

```html
<p style="margin-bottom:20px;font-size:14px;line-height:1.85;color:#d0d0d0;text-align:justify;letter-spacing:0.3px;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">{{前半句}}</span>
  <span style="border-bottom:2px solid #00d4aa;font-weight:600;color:#d0d0d0;"><span leaf="">{{需要强调的关键短语}}</span></span>
  <span leaf="">{{后半句}}</span>
</p>
```

**首段微装饰变体**（左侧 2px 青绿竖条提示"从这里开始"，文字色不变）：

```html
<p style="margin-bottom:20px;font-size:14px;line-height:1.85;color:#d0d0d0;text-align:justify;letter-spacing:0.3px;border-left:2px solid #00d4aa;padding-left:10px;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">{{首段正文内容}}</span>
</p>
```

**标记原则**：每段选 1~3 个关键短语（4~15 字）加下划线，不要整段都标；优先标核心观点、结论判断、关键数据、专有名词；无重点的段落可不标。每屏下划线不超过 2 处。

---

## 组件 6b 子标题（`###` 小节标题）

> `###` 子标题用青绿左竖条 + 近白标题，**不套用组件 5 的编号章节样式**（编号章节只给 `##`）。

```html
<p style="font-size:16px;font-weight:800;color:#e8e8f0;margin:28px 0 14px;padding-left:10px;border-left:3px solid #00d4aa;line-height:1.4;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">{{子标题}}</span>
</p>
```

---

## 组件 7 正文高亮样式（6 种变体 + 使用策略）

> **核心理念**：克制用色，青绿只在真正需要的锚点出现。
>
> **优先级**：① 7d 青绿下划线（正文默认标记）→ ② 7a 普通加粗为主、青绿加粗仅锚点 → ③ 7b 青绿镂空标签（每篇 2~4 个）→ ④ 7c 半透明深底（次要）→ ⑤ 7e 终端高亮（偶尔长句强调）→ ⑥ 7f 行内代码（终端感）

### 7a. 加粗强调

普通加粗（默认，绝大部分加粗用这个，颜色提亮至 `#e8e8f0`）：

```html
<strong><span leaf="">普通加粗强调</span></strong>
```

青绿加粗（仅限产品名/步骤/CTA 等锚点，全文 ≤5 处）：

```html
<strong style="color:#00d4aa;"><span leaf="">青绿加粗锚点</span></strong>
```

### 7b. 青绿镂空标签（核心概念，每篇 2~4 个，暗夜青签名式标签）

```html
<span style="display:inline-block;border:1px solid #00d4aa;color:#00d4aa;font-family:Consolas,Monaco,monospace;font-size:11px;font-weight:600;padding:1px 10px;border-radius:4px;margin-right:6px;box-sizing:border-box;max-width:100%!important;"><span leaf="">关键词标签</span></span>
```

### 7c. 半透明深底高亮（次要关键词）

```html
<span style="background:#252540;color:#00d4aa;padding:1px 6px;border-radius:3px;font-weight:600;font-family:Consolas,Monaco,monospace;box-sizing:border-box;max-width:100%!important;"><span leaf="">半透明深底关键词</span></span>
```

### 7d. 青绿下划线（最常用，本风格标志性标记）

```html
<span style="border-bottom:2px solid #00d4aa;font-weight:600;color:#d0d0d0;"><span leaf="">青绿下划线关键词</span></span>
```

### 7e. 终端高亮（偶尔用于长句强调，低透明度青绿背景光晕）

```html
<span style="background:rgba(0,212,170,0.16);color:#e8e8f0;font-weight:700;padding:1px 4px;border-radius:3px;box-sizing:border-box;max-width:100%!important;"><span leaf="">终端高亮的重要长句</span></span>
```

### 7f. 行内代码（终端感，深色底 + 青字 + 细边框）

```html
<span style="background:#252540;color:#00d4aa;padding:1px 6px;border-radius:4px;font-family:Consolas,Monaco,monospace;font-size:13px;border:1px solid #2d2d50;box-sizing:border-box;max-width:100%!important;"><span leaf="">code</span></span>
```

---

## 组件 8 引用高亮块（4 种变体，暗夜青独有终端气质）

### 8a. 终端输出式（默认，暗夜青独有）—— 青色 `>` 前缀 + 文字，无底色无边框

```html
<p style="font-family:Consolas,Monaco,monospace;font-size:15px;color:#00d4aa;font-weight:700;margin:0 0 24px;line-height:1.8;box-sizing:border-box;max-width:100%!important;"><span leaf="">&gt; {{引用文字，像终端输出行}}</span></p>
```

### 8b. 半透明卡片引用（核心结论，高亮输出块）

```html
<section style="background:#252540;border-radius:8px;padding:16px 20px;margin-bottom:24px;border:1px solid #2d2d50;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:15px;color:#e8e8f0;margin:0;line-height:1.85;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{核心结论引用内容}}</span>
  </p>
</section>
```

### 8c. 青绿左竖条引用（长段引用，经典克制）

```html
<section style="border-left:3px solid #00d4aa;padding:6px 0 6px 12px;margin-bottom:24px;background:transparent;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:14px;color:#d0d0d0;margin:0;line-height:1.85;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{长段引用}}</span>
  </p>
</section>
```

### 8d. 居中金句分隔（章节间的过渡金句，青绿色 + 深紫灰上下细线）

```html
<p style="font-size:15px;margin:0 0 24px;text-align:center;color:#00d4aa;font-weight:700;letter-spacing:1px;border-top:1px solid #2d2d50;border-bottom:1px solid #2d2d50;padding:14px 10px;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">{{居中金句}}</span>
</p>
```

> 选用原则：短金句/代码相关引用用 8a；核心结论用 8b；严肃长引用/长者言论用 8c；章节过渡金句用 8d。同一屏内 8a 与 8b 不同时出现。

---

## 组件 9 提示 / 警示条（IDE info 面板质感）

### 9a. 青色提示条（重要提醒、核心结论，半透明深底 + 青绿左边框）

```html
<section style="background:#252540;border-left:3px solid #00d4aa;border-radius:0 8px 8px 0;padding:10px 14px;margin-bottom:24px;box-sizing:border-box;max-width:100%!important;">
  <p style="margin:0 0 4px;font-size:9px;color:#00d4aa;font-family:Consolas,Monaco,monospace;letter-spacing:2px;box-sizing:border-box;max-width:100%!important;"><span leaf="">INFO</span></p>
  <p style="font-size:13px;color:#d0d0d0;margin:0;line-height:1.75;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{重要提示或核心结论}}</span>
  </p>
</section>
```

### 9b. 踩坑提示（青绿小标签 + 灰字，风险/注意事项）

```html
<section style="padding:6px 0 4px;margin-bottom:16px;box-sizing:border-box;max-width:100%!important;">
  <p style="margin-bottom:6px;font-size:11px;font-weight:700;color:#00d4aa;font-family:Consolas,Monaco,monospace;letter-spacing:1px;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">！踩坑提示</span>
  </p>
  <p style="font-size:14px;color:#d0d0d0;margin:0;line-height:1.7;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{提示内容}}</span>
  </p>
</section>
```

---

## 组件 10 内容标签组（STEP / SKILL / TOOL / CASE）

> 教程用 STEP、盘点用 SKILL/TOOL、案例用 CASE。青绿实底编号标签（等宽字体）+ 近白标题。

### 10a. step-label（教程步骤）

```html
<section style="margin-bottom:22px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;align-items:center;gap:8px;margin-bottom:10px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-block;background:#00d4aa;color:#1a1a2e;font-family:Consolas,Monaco,monospace;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;box-sizing:border-box;max-width:100%!important;"><span leaf="">STEP 01</span></span>
    <span style="font-size:15px;font-weight:800;color:#e8e8f0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{步骤标题}}</span></span>
  </section>
  <p style="font-size:14px;margin:0 0 16px;color:#d0d0d0;line-height:1.85;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{步骤内容}}</span>
  </p>
</section>
```

`STEP 01` 可替换为 `SKILL 1`、`TOOL 摄像机`、`CASE 01`（盘点/案例场景）。

### 10b. tool-card（工具/条目说明卡，暗底）

```html
<section style="background:#252540;border:1px solid #2d2d50;border-radius:8px;padding:16px 20px;margin-bottom:24px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:14px;color:#d0d0d0;margin:0;line-height:1.85;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{条目说明内容}}</span>
  </p>
</section>
```

---

## 组件 11 列表组件

### 11a. ordered-list（青绿镂空圆标数字编号列表，暗底轻盈科技感）

```html
<section style="margin-bottom:24px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:2px solid #00d4aa;color:#00d4aa;font-size:12px;font-weight:700;border-radius:50%;flex-shrink:0;margin-top:2px;font-family:Consolas,Monaco,monospace;box-sizing:border-box;max-width:100%!important;"><span leaf="">1</span></span>
    <p style="font-size:14px;color:#d0d0d0;margin:0;line-height:1.85;flex:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{列表项内容}}</span></p>
  </section>
  <section style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:2px solid #00d4aa;color:#00d4aa;font-size:12px;font-weight:700;border-radius:50%;flex-shrink:0;margin-top:2px;font-family:Consolas,Monaco,monospace;box-sizing:border-box;max-width:100%!important;"><span leaf="">2</span></span>
    <p style="font-size:14px;color:#d0d0d0;margin:0;line-height:1.85;flex:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{列表项内容}}</span></p>
  </section>
  <section style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:2px solid #00d4aa;color:#00d4aa;font-size:12px;font-weight:700;border-radius:50%;flex-shrink:0;margin-top:2px;font-family:Consolas,Monaco,monospace;box-sizing:border-box;max-width:100%!important;"><span leaf="">3</span></span>
    <p style="font-size:14px;color:#d0d0d0;margin:0;line-height:1.85;flex:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{列表项内容}}</span></p>
  </section>
</section>
```

### 11b. pill-list（无序要点，青点前缀 + 说明）

```html
<section style="margin-bottom:14px;box-sizing:border-box;max-width:100%!important;">
  <p style="margin:0 0 6px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-block;font-size:14px;font-weight:700;color:#00d4aa;background:rgba(0,212,170,0.12);padding:3px 10px;border-radius:999px;box-sizing:border-box;max-width:100%!important;"><span style="display:inline-block;width:6px;height:6px;background:#00d4aa;border-radius:50%;margin-right:5px;vertical-align:middle;box-sizing:border-box;max-width:100%!important;"><span leaf=""><br></span></span><span leaf="">{{要点标题}}</span></span>
  </p>
  <p style="font-size:14px;color:#808090;margin:0;line-height:1.7;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{要点说明}}</span>
  </p>
</section>
```

### 11c. timeline（时间线 / 递进脉络，青绿镂空圆点 + 深紫灰竖线）

```html
<section style="display:flex;margin-bottom:24px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;flex-direction:column;align-items:center;margin-right:16px;flex-shrink:0;box-sizing:border-box;max-width:100%!important;">
    <section style="width:14px;height:14px;border-radius:50%;border:3px solid #00d4aa;background:#1a1a2e;margin-top:4px;box-sizing:border-box;max-width:100%!important;"><span leaf=""><br></span></section>
    <section style="width:2px;background:#2d2d50;flex:1;margin-top:4px;min-height:44px;box-sizing:border-box;max-width:100%!important;"><span leaf=""><br></span></section>
  </section>
  <section style="flex:1;padding-bottom:12px;box-sizing:border-box;max-width:100%!important;">
    <p style="margin:0 0 6px;font-size:15px;font-weight:800;color:#e8e8f0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{节点标题}}</span></p>
    <p style="font-size:14px;margin:0;color:#d0d0d0;line-height:1.85;text-align:justify;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{节点内容}}</span></p>
  </section>
</section>
```

最后一个节点去掉竖线段。

---

## 组件 12 数据 / 要点卡片组（青绿大数字，仪表盘质感）

### 两列版

```html
<section style="display:flex;margin-bottom:24px;padding:0;box-sizing:border-box;max-width:100%!important;">
  <section style="flex:1;background:#252540;border-radius:8px;padding:18px 16px;margin-right:8px;text-align:center;border:1px solid #2d2d50;box-sizing:border-box;max-width:100%!important;">
    <p style="font-family:Consolas,Monaco,monospace;font-size:28px;font-weight:900;color:#00d4aa;margin:0 0 4px;line-height:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:12px;color:#808090;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{说明}}</span></p>
  </section>
  <section style="flex:1;background:#252540;border-radius:8px;padding:18px 16px;text-align:center;border:1px solid #2d2d50;box-sizing:border-box;max-width:100%!important;">
    <p style="font-family:Consolas,Monaco,monospace;font-size:28px;font-weight:900;color:#00d4aa;margin:0 0 4px;line-height:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:12px;color:#808090;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{说明}}</span></p>
  </section>
</section>
```

### 三列版

```html
<section style="display:flex;margin-bottom:24px;padding:0;box-sizing:border-box;max-width:100%!important;">
  <section style="flex:1;background:#252540;border-radius:8px;padding:16px 10px;margin-right:8px;text-align:center;border:1px solid #2d2d50;box-sizing:border-box;max-width:100%!important;">
    <p style="font-family:Consolas,Monaco,monospace;font-size:24px;font-weight:900;color:#00d4aa;margin:0 0 4px;line-height:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:11px;color:#808090;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{说明}}</span></p>
  </section>
  <section style="flex:1;background:#252540;border-radius:8px;padding:16px 10px;margin-right:8px;text-align:center;border:1px solid #2d2d50;box-sizing:border-box;max-width:100%!important;">
    <p style="font-family:Consolas,Monaco,monospace;font-size:24px;font-weight:900;color:#00d4aa;margin:0 0 4px;line-height:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:11px;color:#808090;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{说明}}</span></p>
  </section>
  <section style="flex:1;background:#252540;border-radius:8px;padding:16px 10px;text-align:center;border:1px solid #2d2d50;box-sizing:border-box;max-width:100%!important;">
    <p style="font-family:Consolas,Monaco,monospace;font-size:24px;font-weight:900;color:#00d4aa;margin:0 0 4px;line-height:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:11px;color:#808090;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{说明}}</span></p>
  </section>
</section>
```

### 表格（真实数据表用，青绿表头 + 偶数行暗底）

```html
<section style="margin-bottom:24px;overflow-x:auto;box-sizing:border-box;max-width:100%!important;">
  <table style="width:100%;border-collapse:collapse;font-size:14px;box-sizing:border-box;max-width:100%!important;">
    <thead>
      <tr>
        <th style="background:#1a1a2e;color:#00d4aa;font-weight:700;padding:8px 12px;text-align:left;border-bottom:1px solid #2d2d50;font-family:Consolas,Monaco,monospace;letter-spacing:1px;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{列标题}}</span></th>
        <th style="background:#1a1a2e;color:#00d4aa;font-weight:700;padding:8px 12px;text-align:left;border-bottom:1px solid #2d2d50;font-family:Consolas,Monaco,monospace;letter-spacing:1px;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{列标题}}</span></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #2d2d50;color:#d0d0d0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{内容}}</span></td>
        <td style="padding:8px 12px;border-bottom:1px solid #2d2d50;color:#d0d0d0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{内容}}</span></td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #2d2d50;color:#d0d0d0;background:#252540;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{内容}}</span></td>
        <td style="padding:8px 12px;border-bottom:1px solid #2d2d50;color:#d0d0d0;background:#252540;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{内容}}</span></td>
      </tr>
    </tbody>
  </table>
</section>
```

---

## 组件 13 标签胶囊

青绿镂空（默认，暗夜青轻盈科技感）：

```html
<span style="display:inline-block;border:1px solid #00d4aa;color:#00d4aa;font-family:Consolas,Monaco,monospace;font-size:11px;font-weight:600;padding:1px 10px;border-radius:4px;margin-right:6px;box-sizing:border-box;max-width:100%!important;"><span leaf="">标签名</span></span>
```

青绿实底深字（更醒目，用于重点标签）：

```html
<span style="display:inline-block;background:#00d4aa;color:#1a1a2e;font-family:Consolas,Monaco,monospace;font-size:11px;font-weight:700;padding:1px 10px;border-radius:4px;margin-right:6px;box-sizing:border-box;max-width:100%!important;"><span leaf="">标签名</span></span>
```

---

## 组件 14 图片容器（深色查看器质感）

```html
<section style="background:#1a1a2e;border-radius:8px;padding:6px;border:1px solid #2d2d50;margin-bottom:8px;box-sizing:border-box;max-width:100%!important;">
  <section style="margin:0;border-radius:6px;overflow:hidden;box-sizing:border-box;max-width:100%!important;">
    <span leaf=""><img src="{{图片URL}}" style="max-width:100%;height:auto;display:block;margin:0 auto;box-sizing:border-box;max-width:100%!important;"></span>
  </section>
</section>
```

带说明文字时，图片 `margin-bottom` 改 `8px`，其后加：

```html
<p style="font-size:11px;color:#808090;text-align:center;margin:0 0 24px;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">— {{图片说明}}</span>
</p>
```

**多行代码块**（暗夜青灵魂组件）用通用增量库 `common-components.md` 的 **1a 深色代码块**，并将配色替换为暗夜青终端色板：`#16162a`（代码底）/`#0f0f1f`（顶栏）/`#2d2d50`（边框），代码文字 `#d0d0d0`，语法高亮按源主题柔性霓虹色（关键字 `#c678dd`、字符串 `#98c379`、函数 `#e5c07b`、注释 `#5c6370`）。**绝不用浅色代码块**。每行代码一个 `<p style="margin:0">`，不用 `white-space:pre`，缩进用全角空格 `　`。

**GIF 动图角标**（深色版）：

```html
<p style="text-align:center;margin:0 0 24px;box-sizing:border-box;max-width:100%!important;">
  <span style="display:inline-block;background:#252540;color:#00d4aa;font-size:11px;font-weight:700;padding:1px 8px;border-radius:4px;margin-right:6px;border:1px solid #2d2d50;box-sizing:border-box;max-width:100%!important;"><span leaf="">GIF 动图</span></span>
  <span style="font-size:11px;color:#808090;box-sizing:border-box;max-width:100%!important;"><span leaf="">动图说明文字</span></span>
</p>
```

---

## 组件 15 END 结尾分割线（终端登出式）

**样式 A（青绿渐变短线 + END，推荐）**：

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="text-align:center;margin:0 0 32px;box-sizing:border-box;max-width:100%!important;">
    <section style="display:flex;align-items:center;justify-content:center;box-sizing:border-box;max-width:100%!important;">
      <span style="height:1px;width:60px;background:linear-gradient(to right,transparent,#00d4aa);margin-right:12px;box-sizing:border-box;max-width:100%!important;"><span leaf=""><br></span></span>
      <span style="font-size:11px;color:#00d4aa;letter-spacing:3px;font-weight:700;font-family:Consolas,Monaco,monospace;box-sizing:border-box;max-width:100%!important;"><span leaf="">END</span></span>
      <span style="height:1px;width:60px;background:linear-gradient(to left,transparent,#00d4aa);margin-left:12px;box-sizing:border-box;max-width:100%!important;"><span leaf=""><br></span></span>
    </section>
  </section>
</section>
```

**样式 B（终端登出语，暗夜青情感表达）**：

```html
<p style="text-align:center;margin:0 0 32px;font-family:Consolas,Monaco,monospace;font-size:9px;color:#5a5a70;letter-spacing:2px;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">— END OF TRANSMISSION —</span>
</p>
```

---

## 组件 16 尾部作者签名区（终端登出卡片）

> 固定签名文案以正文段落形式呈现；有个人名片/引导图素材才放图，无素材整块删。`点赞、在看、转发` 用青绿加粗做锚点（不在 `<strong>` 上挂 font-size）。

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="text-align:center;margin-bottom:10px;border-radius:8px;overflow:hidden;box-sizing:border-box;max-width:100%!important;">
    <span leaf=""><img src="{{个人名片或引导图URL，无则删本 section}}" style="max-width:100%;height:auto;display:block;margin:0 auto;box-sizing:border-box;max-width:100%!important;"></span>
  </section>
  <p style="margin-bottom:20px;font-size:14px;line-height:1.85;color:#d0d0d0;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">我是 {{作者名}}，{{一句话简介，如：热衷于分享 AI 观察与干货}}。</span>
  </p>
  <p style="margin-bottom:20px;font-size:14px;line-height:1.85;color:#d0d0d0;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">如果你觉得今天这篇有收获，欢迎</span>
    <strong style="color:#00d4aa;"><span leaf="">点赞、在看、转发</span></strong>
    <span leaf="">三连，我们下篇见。</span>
  </p>
</section>
```

---

## 完整文章模板骨架

```html
<section style="max-width:677px;margin:0 auto;background:#1a1a2e;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;color:#d0d0d0;line-height:1.85;letter-spacing:0.3px;overflow-x:hidden;box-sizing:border-box;max-width:100%!important;">

  <!-- 1. 开头引言卡片（组件2，暗底青绿锚点 + 终端提示符） -->

  <!-- 2. 前言正文（组件6 段落 × N，放 0 10px 边距 section，第一章之前的开场白） -->

  <!-- 3. 前言导读（组件3，3+ 章节时生成，精选 3 看点） -->

  <!-- 4. 第一章（组件5 章节标题，margin-top:16px） -->
  <!--    章内：组件6 正文 + 6b 子标题 + 7 行内高亮 + 8 引用 + 9 提示 + 10 标签组 + 11 列表 + 12 数据 + 14 图片 -->

  <!-- 5. 章节分割线（组件4）+ 第二章…第N章（组件5，margin-top:48px） -->

  <!-- 6. 结语章（组件5 变体：编号 ∞，英文 THE END） -->

  <!-- 7. END 分割线（组件15） -->

  <!-- 8. 尾部签名（组件16） -->

</section>
```

**骨架铁律**：引言卡在最前；导读区在前言正文之后、第一章之前；章节之间用组件 4 分割线分隔；一篇只有一个 END + 一个签名区。暗底文章仍需 `max-width:677px` 居中，中文文字仍须 `<span leaf="">` 包裹。

---

## 视觉层级（3 层递进）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **锚点层** | 青绿加粗 7a / 青绿实底编号 / 青绿大数字 / 下划线 7d / 金句终端 `>` 8a | 产品名、关键结论、核心金句、章节编号、数据指标 | 每屏 ≤2 处，全文青色 ≤3% |
| **标记层** | 青绿下划线 7d（默认）/ 青绿镂空标签 7b / 半透明深底 7c | 正文关键词强调、核心概念 | 每段 1~3 处 |
| **容器层** | 左竖条引用 8c / 提示 9x / 标签组 10 / 卡片 11-12 / 图片 14 | 引用、旁注、提示、结构化信息、图片 | 按需 |

**克制原则**：
- 青绿实底标签（`bg:#00d4aa`）**仅在引言卡内与章节编号标签**，正文关键词标签用青绿镂空 7b 或下划线 7d
- 青绿加粗全文 ≤5 处，下划线每屏 ≤2 处
- 引用/提示统一用左竖条 + 暗底 + 类型小标签，**不用四周虚线框**（dashed）
- 渐变青绿仅出现在章节分割线 4 和 END 线 15
- 代码块必须深色终端 `#16162a`，绝不用浅色

---

## 文章类型 → 组件组合配方

按文章气质选配方；核心组件构成本篇排版主旋律，点缀组件按内容出现处使用，一篇文章点缀组件种类 ≤3，避免花哨。暗夜青黄金场景：**技术教程 / 数据报告 / 产品深潜**。

| 文章类型 | 核心组件组合 | 点缀组件 |
|---|---|---|
| 技术教程 | 正文6 + 深色代码块（通用库1a） + step-label 10a | 青色提示9a、tool-card 10b、终端引用8a |
| 数据报告 | 数据卡12（两列/三列）+ 表格12 + 终端引用8a | 青色提示9a、青绿大数字、居中金句8d |
| 产品深潜 | 代码块 + 数据卡12 + step-label 10a + 章节标题5 | 提示9a、表格12、标签胶囊13 |
| 工具测评 | tool-card 10b + 数据卡12 + 图片14 | 青绿镂空标签7b、引用8b |
| 知识整理 | 章节标题5 + 提示9a + timeline 11c（纵向步骤流） | 引用8c、子标题6b |
| 观点分析 | 正文6 + 半透明卡片引用8b + 提示9a | 居中金句8d、分割线4C（灰线） |
| 深度文章 | 章节标题5 + 长引用8c + 正文6 | 分割线4C、终端引用8a（极少） |

所有类型共用固定结构：引言卡 2 + 导读 3（3+ 章节）+ 编号章节 5 + END 15 + 签名 16。深度/观点类文章把青色信号压到全文 3-4 处，让灰阶与深空留白主导节奏。

---

## Markdown → 暗夜青排版 映射规则

| Markdown 元素 | 对应组件 | 说明 |
|---|---|---|
| `# 标题` | 不使用 | 公众号文章标题在平台设置 |
| 文章开头 `> 引言金句` | 组件 2 暗底引言卡（青绿锚点 + 终端提示符） | 视角与外标题错开 |
| `## 章节标题` | 组件 5 章节标题 | 青绿等宽编号 01/02…，末章 ∞ + THE END |
| `### 子标题` | 组件 6b 青绿左竖条小标题 | 不套编号章节样式 |
| 普通段落 | 组件 6 正文段落 | 每段主动标 1~3 处青绿下划线 7d |
| `**加粗文字**` | 组件 7a 普通加粗（默认）/ 青绿加粗（锚点 ≤5） | 普通加粗提亮至 `#e8e8f0` |
| `==高亮文字==` | 组件 7b 青绿镂空标签 | 核心概念（每篇 2~4 个） |
| `<u>下划线</u>` / `++文字++` | 组件 7d 青绿下划线 | 次要强调 |
| `~~删除线~~` | `text-decoration:line-through` + 注释色 `#5a5a70` | 被淘汰概念 |
| 行内 `` `code` `` | 组件 7f 行内代码（深底青字 + 细边框） | 终端感 |
| `> 引用段落`（金句） | 组件 8a 终端 `>` 前缀 / 8b 半透明卡片 | 技术金句用 8a，核心结论用 8b |
| `> 引用段落`（长引用） | 组件 8c 青绿左竖条 | 严肃长引用 |
| 核心金句 | 组件 8a / 8d 居中金句 | 视觉焦点 |
| 操作步骤 | 组件 10a step-label | STEP 01/02… |
| 技能/工具清单 | 组件 10a skill/tool-label + 10b tool-card | 暗底卡片 |
| 案例/经历脉络 | 组件 10a case-label / 11c timeline | |
| Prompt 提示词 | 通用库 1a（长多行，深色终端） | |
| ` ``` 多行代码块 ``` ` | 通用库 1a 深色（配色换 `#16162a`/`#0f0f1f`/`#2d2d50`） | 每行一个 `<p style="margin:0">` |
| 并列要点 | 组件 11b pill-list | 青点前缀 |
| `1. 2. 3.` 编号列表 | 组件 11a ordered-list | 青绿镂空圆标 |
| 数据展示 | 组件 12 数据卡片组 / 表格 | 青绿大号数字（等宽字体） |
| Markdown 表格 | 组件 12 表格 | 青绿表头 + 偶数行 `#252540` |
| 注意/警告 | 组件 9a 青色提示 / 9b 踩坑提示 | IDE info 面板质感 |
| 行内标签 | 组件 13 标签胶囊 | 青绿镂空（默认） |
| `---` | 组件 4 章节分割线 | 终端虚线 / 霓虹 `◆ ◆ ◆` / 青绿细渐变线 |
| `![](图片)` | 组件 14 图片容器 | 深色查看器 + 细边框 |
| 文末 | 组件 15 END + 16 签名 | |

> **排版完成后自检清单**：① 全文底色 `#1a1a2e`（非纯黑）？② 正文 `#d0d0d0`（非纯白）？③ 青色仅出现在锚点、覆盖 ≤3%？④ 每屏青色 ≤2 处？⑤ 卡片 `#252540` + `#2d2d50` 边框？⑥ 代码块 `#16162a` 深色终端？⑦ 章节编号等宽字体？⑧ 图片容器 `#2d2d50` 边框？⑨ 署名/签名区中文 `<span leaf="">` 包裹？⑩ 段落 4-5 行？
