# 公众号排版组件库 —— 暖纸墨（warm-paper）

> **使用说明**：本组件库为「暖纸墨」主题（温度·杂志感·细线分隔），所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：纸色为底、墨色为字、陶土为饰。全文底色 `#fdfaf4`（微黄纸张，非纯白），正文与标题统一深棕 `#4a3728`（不纯黑），主色 `#b8532a`（暖陶土）只出现在锚点——大引号、章节编号、左竖条、重点数字。**1px 暖灰细横线（hairline `#e8d5c4`）是本主题的核心视觉语言**，像杂志栏线，不抢眼但不可或缺；大引号金句是灵魂组件；标签一律用镂空（边框 + 陶土字）而非实心；图片可加极微暖阴影（本系列唯一可接受微妙阴影的主题）；代码块走深棕 `#3d3226` 暗底，像老式铅字盘。
>
> **适用场景**：观点分析、深度文章、人文思考（温度·杂志感·细线分隔）。
>
> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class/id、`position:fixed/absolute`、`float`、`@media`/`@keyframes`、`display:grid`、`var()`/`calc()`/`hsl()`
> - ✅ 支持内联 `style`、`display:flex`（有限）、`linear-gradient`、`border-radius`、`box-shadow`（仅本主题图片可用极微阴影）、`<section>/<p>/<span>/<strong>/<img>` 等基础标签
>
> **WeChat 兼容铁律**（本主题组件全部已按此写好，改动时必须遵守）：
> - 所有"装饰性空元素"（细横线、END 短线、时间轴圆点/竖线、数据卡分隔）**必须在内部放 `<span leaf=""><br></span>` 占位**，否则微信会剥掉样式
> - **不要把 `font-size`/`border-bottom` 打在 `<strong>` 上**，也不要在同一个 `<p>` 里混多个不同 `font-size`——微信编辑器会自动"纠正"导致样式被重写。正确做法：拆成多个 `<p>`，每个 `<p>` 只有一个字号；高亮样式统一挂在外层 `<span>` 上
> - 不用 `position:absolute` 做划线/高亮，删除线用 `text-decoration:line-through`
> - 结构化区域（如引言卡右下署名、图片说明）没有内容时**整块删掉**，不留空 section

---

## 设计变量速查表

```
主色（暖陶土）：   #b8532a（章节编号、左竖条、大引号、重点数字、镂空标签描边）
辅色：            #c97a4a（浅一阶暖橙，二级强调）
暖纸浅底：        #f7f0e6（卡片/引用块背景，模拟米色纸张）
暖边框/分割线色：  #e8d5c4（hairline 细横线、卡片描边、1px 暖灰）
强调点缀（深陶土）：#8b3a1a（深陶土，高亮标签字、数据数字、加粗锚点字）
标题色：          #4a3728（深棕，标题专用，不纯黑以保持温暖感）
正文色：          #4a3728（正文主色，与标题同为深棕，有温度但不刺眼）
中棕（辅助文字）：  #8b7355（二级信息、日期、说明、导语斜体）
浅棕灰（注释色）：  #b8a898（最弱层级：来源、版权、占位、图片说明）
暖纸底色：        #fdfaf4（文章整体底色，模拟微黄纸张，非纯白）
关键词下划线色：   #e8c4a2（暖调下划线，正文关键词标记唯一方式）
代码块底（暗）：   #3d3226（深棕暗底，像翻阅老式印刷厂的铅字盘）
代码块文字：      #e8d5c4（米色文字，比纯白柔和）
卡片圆角：        4px（小圆角，接近直角但柔化边缘，仿杂志页面感）
正文字号：        14px（不可改）
正文行高：        1.85
字间距：          0.3px
最大宽度：        677px
内容区边距：      0 10px（左右各 10px）
```

字体栈：`-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif`

---

## 组件 1 全局容器

```html
<section style="max-width:677px;margin:0 auto;background:#fdfaf4;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;color:#4a3728;font-size:14px;line-height:1.85;letter-spacing:0.3px;overflow-x:hidden;box-sizing:border-box;max-width:100%!important;">

  <!-- 所有组件放在这里 -->

</section>
```

---

## 组件 2 开头引言卡片（暖纸底 + 上下 hairline + 大引号）

> **文案策略（先读，比代码重要）**：
> - 引言卡金句和公众号外标题是**两层**，视角要错开——外标题卖"为什么点开"，引言卡卖"核心观点是什么"
> - 已知外标题时，金句**禁止原样复述**其核心关键词；从文章第一段或核心论点提炼一句有张力的判断句
> - 右下署名按文章实际作者填，未知则整行删掉，**不要固定写"甲木"**
> - 大引号是暖纸墨的**灵魂组件**：引言卡用陶土色大引号 `"` 起头，金句内用暖调下划线 `#e8c4a2` 标出 1~2 个关键词；正文中的关键词标签一律用镂空陶土（组件 13），**不**用实心色块

```html
<section style="margin:10px 10px 32px;background:#f7f0e6;border-top:1px solid #e8d5c4;border-bottom:1px solid #e8d5c4;padding:28px 22px 20px;overflow:hidden;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:40px;color:#b8532a;font-weight:900;margin:0;line-height:0.5;">
    <span leaf="">"</span>
  </p>
  <p style="font-size:15px;font-weight:800;color:#4a3728;margin:14px 0 8px;line-height:1.85;padding-left:4px;letter-spacing:0.3px;">
    <span leaf="">{{金句前半}}</span>
    <span style="border-bottom:2px solid #e8c4a2;font-weight:600;"><span leaf="">{{需要强调的关键短语}}</span></span>
    <span leaf="">{{金句收尾}}</span>
  </p>
  <p style="text-align:right;font-size:12px;color:#8b7355;margin:10px 0 0;letter-spacing:1px;">
    <span leaf="">—— {{作者名，未知则删整行}}</span>
  </p>
</section>
```

---

## 组件 3 前言导读区域（本文看点，三列目录卡片）

> 3 个及以上章节时生成。镂空陶土编号 + 暖纸底卡片；展示**精选 3 个核心看点**，不是全量章节列表。编号用镂空（边框 + 陶土字），这是暖纸墨标签的招牌写法。

```html
<section style="padding:0 10px 32px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:13px;color:#8b7355;margin:0 0 14px;letter-spacing:2px;">
    <span leaf="">本文看点</span>
  </p>
  <section style="display:flex;justify-content:space-between;">
    <section style="flex:1;background:#fdfaf4;border-radius:4px;padding:16px 12px;margin-right:8px;text-align:center;border:1px solid #e8d5c4;box-sizing:border-box;max-width:100%!important;">
      <p style="display:inline-block;background:transparent;border:1px solid #b8532a;color:#b8532a;font-size:12px;font-weight:800;padding:2px 10px;border-radius:4px;margin:0 0 8px;box-sizing:border-box;max-width:100%!important;"><span leaf="">01</span></p>
      <p style="font-size:13px;font-weight:700;color:#4a3728;margin:0;"><span leaf="">{{看点一}}</span></p>
    </section>
    <section style="flex:1;background:#fdfaf4;border-radius:4px;padding:16px 12px;margin-right:8px;text-align:center;border:1px solid #e8d5c4;box-sizing:border-box;max-width:100%!important;">
      <p style="display:inline-block;background:transparent;border:1px solid #b8532a;color:#b8532a;font-size:12px;font-weight:800;padding:2px 10px;border-radius:4px;margin:0 0 8px;box-sizing:border-box;max-width:100%!important;"><span leaf="">02</span></p>
      <p style="font-size:13px;font-weight:700;color:#4a3728;margin:0;"><span leaf="">{{看点二}}</span></p>
    </section>
    <section style="flex:1;background:#fdfaf4;border-radius:4px;padding:16px 12px;text-align:center;border:1px solid #e8d5c4;box-sizing:border-box;max-width:100%!important;">
      <p style="display:inline-block;background:transparent;border:1px solid #b8532a;color:#b8532a;font-size:12px;font-weight:800;padding:2px 10px;border-radius:4px;margin:0 0 8px;box-sizing:border-box;max-width:100%!important;"><span leaf="">03</span></p>
      <p style="font-size:13px;font-weight:700;color:#4a3728;margin:0;"><span leaf="">{{看点三}}</span></p>
    </section>
  </section>
</section>
```

---

## 组件 4 章节分割线（1px 暖灰 hairline）

> 暖纸墨的**核心视觉语言**：一条 1px `#e8d5c4` 全宽细横线，像杂志栏线。占位 span 不可省。

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="height:1px;background:#e8d5c4;margin:0;">
    <span leaf=""><br></span>
  </section>
</section>
```

**小节级短线段变体**（居中 60% 宽，用于小节间）：

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="height:1px;width:60%;background:#e8d5c4;margin:0 auto;">
    <span leaf=""><br></span>
  </section>
</section>
```

---

## 组件 5 章节标题（顶部 hairline + 镂空陶土编号 + 标题）

> 顶部 1px `#e8d5c4` 细横线 + 镂空陶土编号 `01` + 英文小标签 + 中文大标题（深棕 `#4a3728`）。第一章 `margin-top:16px`，后续章节 `margin-top:48px`。编号用镂空（边框 + 陶土字），不套用红白主题的实心色块。

```html
<section style="margin-top:48px;margin-bottom:28px;padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="border-top:1px solid #e8d5c4;margin-bottom:18px;padding-top:16px;">
    <section style="display:flex;align-items:center;">
      <span style="display:inline-block;background:transparent;border:1px solid #b8532a;color:#b8532a;font-size:16px;font-weight:800;padding:3px 12px;border-radius:4px;margin-right:14px;line-height:1.2;box-sizing:border-box;max-width:100%!important;"><span leaf="">01</span></span>
      <section>
        <p style="font-size:10px;color:#b8532a;font-weight:700;letter-spacing:3px;margin:0 0 2px;text-transform:uppercase;">
          <span leaf="">{{ENGLISH TAG}}</span>
        </p>
        <h3 style="font-size:18px;font-weight:800;color:#4a3728;margin:0;letter-spacing:0.3px;">
          <span leaf="">{{中文章节标题}}</span>
        </h3>
      </section>
    </section>
  </section>

  <!-- 本章节正文内容放在这里 -->

</section>
```

**结语章节变体**（编号用 `∞` 替代数字，英文标签用 `THE END` / `EPILOGUE`）：

```html
<span style="display:inline-block;background:transparent;border:1px solid #b8532a;color:#b8532a;font-size:16px;font-weight:800;padding:3px 12px;border-radius:4px;margin-right:14px;line-height:1.2;box-sizing:border-box;max-width:100%!important;"><span leaf="">∞</span></span>
```

---

## 组件 6 正文段落

> **关键规则**：每段主动识别 1~3 个关键短语，用**暖调下划线（7d）**标记——这是本风格的核心视觉特征，让读者快速扫到每段重点。正文字号固定 14px，行高 1.85，深棕 `#4a3728`，两端对齐。

**基础段落**：

```html
<p style="margin-bottom:16px;font-size:14px;line-height:1.85;text-align:justify;letter-spacing:0.3px;color:#4a3728;">
  <span leaf="">{{正文内容}}</span>
</p>
```

**带关键词下划线标记的段落**（推荐默认）：

```html
<p style="margin-bottom:16px;font-size:14px;line-height:1.85;text-align:justify;letter-spacing:0.3px;color:#4a3728;">
  <span leaf="">{{前半句}}</span>
  <span style="border-bottom:2px solid #e8c4a2;font-weight:600;"><span leaf="">{{需要强调的关键短语}}</span></span>
  <span leaf="">{{后半句}}</span>
</p>
```

**首段斜体导语变体**（文章开场，定调用，深浅棕 `#8b7355` 斜体）：

```html
<p style="margin-bottom:18px;font-size:15px;line-height:1.85;text-align:justify;letter-spacing:0.3px;color:#8b7355;font-style:italic;">
  <span leaf="">{{倾斜导语，一句导入整篇文章的调性}}</span>
</p>
```

**标记原则**：每段选 1~3 个关键短语（4~15 字）加下划线，不要整段都标；优先标核心观点、结论判断、关键数据、专有名词；无重点的段落可不标。

---

## 组件 6b 子标题（`###` 小节标题）

> `###` 子标题用陶土色左竖条 + 深棕标题，**不套用组件 5 的编号章节样式**（编号章节只给 `##`）。

```html
<p style="font-size:15px;font-weight:800;color:#4a3728;margin:26px 0 14px;padding-left:10px;border-left:3px solid #b8532a;line-height:1.4;letter-spacing:0.3px;">
  <span leaf="">{{子标题}}</span>
</p>
```

---

## 组件 7 正文高亮样式（5 种变体 + 使用策略）

> **核心理念**：克制用色，陶土色只在真正需要的锚点出现。
>
> **优先级**：① 7d 暖调下划线（正文默认标记）→ ② 7a 普通加粗为主、陶土加粗仅锚点 → ③ 7b 暖底深陶土字标签（每篇 2~4 个）→ ④ 7c 暖底背景（次要）→ ⑤ 7e 暖荧光笔（偶尔长句强调）

### 7a. 加粗强调

普通加粗（默认，绝大部分加粗用这个）：

```html
<strong><span leaf="">普通加粗强调</span></strong>
```

陶土色加粗（仅限产品名/步骤/CTA 等锚点，全文 ≤5 处）：

```html
<strong style="color:#b8532a;"><span leaf="">陶土色加粗锚点</span></strong>
```

### 7b. 暖底深陶土字标签（核心概念，每篇 2~4 个）

```html
<span style="background:#f7f0e6;color:#8b3a1a;padding:2px 6px;border-radius:3px;font-weight:700;border:1px solid #e8d5c4;"><span leaf="">关键词标签</span></span>
```

### 7c. 暖底背景高亮（次要关键词）

```html
<span style="background:#f7f0e6;padding:1px 6px;border-radius:3px;font-weight:600;color:#8b3a1a;"><span leaf="">暖底背景关键词</span></span>
```

### 7d. 暖调下划线（最常用，本风格标志性标记）

```html
<span style="border-bottom:2px solid #e8c4a2;font-weight:600;"><span leaf="">暖调下划线关键词</span></span>
```

### 7e. 暖荧光笔效果（偶尔用于长句强调）

```html
<span style="background:linear-gradient(180deg,transparent 60%,#e8c4a2 60%);font-weight:700;color:#4a3728;"><span leaf="">暖荧光笔效果的重要长句</span></span>
```

### 7f. 行内代码

```html
<span style="background:#f7f0e6;color:#b8532a;padding:2px 6px;border-radius:4px;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;border:1px solid #e8d5c4;"><span leaf="">code</span></span>
```

---

## 组件 8 引用高亮块（3 种变体，含大引号灵魂款）

### 8a. 大引号金句（默认，暖纸墨灵魂组件）

> 无底色、无边框、无竖条——就一个大号陶土色引号 + 文字。像翻开杂志时被标记出来的金句。全文大引号（变体 A）不超过 3 处。

```html
<section style="margin:0 0 24px;padding:8px 4px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:36px;color:#b8532a;font-weight:900;margin:0 0 4px;line-height:0.6;">
    <span leaf="">"</span>
  </p>
  <p style="font-size:15px;font-weight:700;color:#4a3728;margin:0;line-height:1.85;letter-spacing:0.3px;">
    <span leaf="">{{核心观点或关键金句}}</span>
  </p>
</section>
```

### 8b. 暖底卡片引用（强调包裹，核心结论）

```html
<section style="background:#f7f0e6;border-radius:4px;padding:16px 18px;margin:0 0 24px;border:1px solid #e8d5c4;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:14px;color:#4a3728;margin:0;line-height:1.85;text-align:justify;letter-spacing:0.3px;">
    {{引用内容，可含 7d 下划线等内联样式}}
  </p>
</section>
```

### 8c. 左侧竖条引用（经典克制，长者言论/书籍引用）

```html
<section style="border-left:3px solid #b8532a;padding:6px 0 6px 14px;background:transparent;margin:0 0 24px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:14px;color:#4a3728;margin:0;line-height:1.85;text-align:justify;letter-spacing:0.3px;">
    <span leaf="">{{长者言论或书籍引用}}</span>
  </p>
</section>
```

### 8d. 居中金句分隔（章节间的过渡金句）

```html
<p style="font-size:15px;margin:0 0 24px;text-align:center;color:#b8532a;font-weight:700;letter-spacing:1px;border-top:1px solid #e8d5c4;border-bottom:1px solid #e8d5c4;padding:14px 10px;">
  <span leaf="">{{居中金句}}</span>
</p>
```

---

## 组件 9 提示 / 旁注条

### 9a. 暖底提示条（重要提醒、核心结论）

```html
<section style="background:#f7f0e6;border-left:4px solid #b8532a;border-radius:0 4px 4px 0;padding:14px 18px;margin:0 0 24px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:14px;font-weight:700;color:#8b3a1a;margin:0;line-height:1.85;letter-spacing:0.3px;">
    <span leaf="">💡 {{重要提示或核心结论}}</span>
  </p>
</section>
```

### 9b. 旁注（镂空小标签 + 中棕说明，轻量）

```html
<section style="padding:6px 0 4px;margin:0 0 16px;box-sizing:border-box;max-width:100%!important;">
  <p style="margin-bottom:6px;font-size:11px;font-weight:700;letter-spacing:1px;">
    <span style="display:inline-block;border:1px solid #b8532a;color:#b8532a;padding:1px 8px;border-radius:4px;"><span leaf="">旁注 NOTE</span></span>
  </p>
  <p style="font-size:14px;color:#8b7355;margin:0;line-height:1.8;letter-spacing:0.3px;">
    <span leaf="">{{提示内容}}</span>
  </p>
</section>
```

---

## 组件 10 内容标签组（STEP / SKILL / TOOL / CASE）

> 教程用 STEP、盘点用 SKILL/TOOL、案例用 CASE。暖纸墨用**镂空陶土标签**（边框 + 陶土字），保持轻盈通透——不用实心色块。

### 10a. step-label（教程步骤）

```html
<section style="margin:0 0 22px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
    <span style="display:inline-block;background:transparent;border:1px solid #b8532a;color:#b8532a;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;box-sizing:border-box;max-width:100%!important;"><span leaf="">STEP 01</span></span>
    <span style="font-size:15px;font-weight:800;color:#4a3728;"><span leaf="">{{步骤标题}}</span></span>
  </section>
  <p style="font-size:14px;margin:0 0 16px;color:#4a3728;line-height:1.85;text-align:justify;letter-spacing:0.3px;">
    {{步骤内容}}
  </p>
</section>
```

`STEP 01` 可替换为 `SKILL 1`、`TOOL 摄像机`、`CASE 01`（盘点/案例场景）。

### 10b. tool-card（工具/条目说明卡，暖底 + hairline）

```html
<section style="background:#f7f0e6;border-radius:4px;padding:16px 20px;border:1px solid #e8d5c4;margin:0 0 24px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:14px;color:#4a3728;margin:0;line-height:1.85;letter-spacing:0.3px;">
    {{条目说明内容}}
  </p>
</section>
```

---

## 组件 11 列表组件

### 11a. ordered-list（镂空陶土圆标数字编号列表）

```html
<section style="margin:0 0 24px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:2px solid #b8532a;color:#b8532a;font-size:12px;font-weight:700;border-radius:50%;flex-shrink:0;margin-top:2px;box-sizing:border-box;max-width:100%!important;"><span leaf="">1</span></span>
    <p style="font-size:14px;color:#4a3728;margin:0;line-height:1.85;flex:1;letter-spacing:0.3px;"><span leaf="">{{列表项内容}}</span></p>
  </section>
  <section style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:2px solid #b8532a;color:#b8532a;font-size:12px;font-weight:700;border-radius:50%;flex-shrink:0;margin-top:2px;box-sizing:border-box;max-width:100%!important;"><span leaf="">2</span></span>
    <p style="font-size:14px;color:#4a3728;margin:0;line-height:1.85;flex:1;letter-spacing:0.3px;"><span leaf="">{{列表项内容}}</span></p>
  </section>
  <section style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:2px solid #b8532a;color:#b8532a;font-size:12px;font-weight:700;border-radius:50%;flex-shrink:0;margin-top:2px;box-sizing:border-box;max-width:100%!important;"><span leaf="">3</span></span>
    <p style="font-size:14px;color:#4a3728;margin:0;line-height:1.85;flex:1;letter-spacing:0.3px;"><span leaf="">{{列表项内容}}</span></p>
  </section>
</section>
```

### 11b. pill-list（无序要点，镂空陶土点前缀 + 说明）

```html
<section style="margin:0 0 14px;box-sizing:border-box;max-width:100%!important;">
  <p style="margin:0 0 6px;">
    <span style="display:inline-block;font-size:14px;font-weight:700;color:#8b3a1a;background:#f7f0e6;padding:3px 10px;border-radius:4px;border:1px solid #e8d5c4;"><span style="display:inline-block;width:6px;height:6px;background:#b8532a;border-radius:50%;margin-right:5px;vertical-align:middle;"><span leaf=""><br></span></span><span leaf="">{{要点标题}}</span></span>
  </p>
  <p style="font-size:14px;color:#8b7355;margin:0;line-height:1.8;text-align:justify;letter-spacing:0.3px;">
    <span leaf="">{{要点说明}}</span>
  </p>
</section>
```

### 11c. timeline（时间线 / 递进脉络，访谈经历、案例演进）

```html
<section style="display:flex;margin:0 0 24px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;flex-direction:column;align-items:center;margin-right:16px;flex-shrink:0;">
    <section style="width:14px;height:14px;border-radius:50%;border:3px solid #b8532a;background:#fdfaf4;margin-top:4px;box-sizing:border-box;max-width:100%!important;"><span leaf=""><br></span></section>
    <section style="width:1px;background:#e8d5c4;flex:1;margin-top:4px;min-height:44px;box-sizing:border-box;max-width:100%!important;"><span leaf=""><br></span></section>
  </section>
  <section style="flex:1;padding-bottom:12px;">
    <p style="margin:0 0 6px;font-size:15px;font-weight:800;color:#4a3728;"><span leaf="">{{节点标题}}</span></p>
    <p style="font-size:14px;margin:0;color:#4a3728;line-height:1.85;text-align:justify;letter-spacing:0.3px;">{{节点内容}}</p>
  </section>
</section>
```

最后一个节点去掉竖线段。

---

## 组件 12 数据 / 要点卡片组

### 两列版

```html
<section style="display:flex;margin:0 0 24px;padding:0;box-sizing:border-box;max-width:100%!important;">
  <section style="flex:1;background:#f7f0e6;border-radius:4px;padding:18px 16px;margin-right:8px;text-align:center;border:1px solid #e8d5c4;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:28px;font-weight:900;color:#b8532a;margin:0 0 4px;line-height:1;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:12px;color:#b8a898;margin:0;"><span leaf="">{{说明}}</span></p>
  </section>
  <section style="flex:1;background:#f7f0e6;border-radius:4px;padding:18px 16px;text-align:center;border:1px solid #e8d5c4;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:28px;font-weight:900;color:#b8532a;margin:0 0 4px;line-height:1;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:12px;color:#b8a898;margin:0;"><span leaf="">{{说明}}</span></p>
  </section>
</section>
```

### 三列版

```html
<section style="display:flex;margin:0 0 24px;padding:0;box-sizing:border-box;max-width:100%!important;">
  <section style="flex:1;background:#f7f0e6;border-radius:4px;padding:16px 10px;margin-right:8px;text-align:center;border:1px solid #e8d5c4;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:24px;font-weight:900;color:#b8532a;margin:0 0 4px;line-height:1;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:11px;color:#b8a898;margin:0;"><span leaf="">{{说明}}</span></p>
  </section>
  <section style="flex:1;background:#f7f0e6;border-radius:4px;padding:16px 10px;margin-right:8px;text-align:center;border:1px solid #e8d5c4;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:24px;font-weight:900;color:#b8532a;margin:0 0 4px;line-height:1;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:11px;color:#b8a898;margin:0;"><span leaf="">{{说明}}</span></p>
  </section>
  <section style="flex:1;background:#f7f0e6;border-radius:4px;padding:16px 10px;text-align:center;border:1px solid #e8d5c4;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:24px;font-weight:900;color:#b8532a;margin:0 0 4px;line-height:1;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:11px;color:#b8a898;margin:0;"><span leaf="">{{说明}}</span></p>
  </section>
</section>
```

### 表格（真实数据表用）

```html
<section style="margin:0 0 24px;overflow-x:auto;box-sizing:border-box;max-width:100%!important;">
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <thead>
      <tr>
        <th style="background:#f7f0e6;color:#b8532a;font-weight:700;padding:8px 12px;text-align:left;border-bottom:2px solid #e8d5c4;"><span leaf="">{{列标题}}</span></th>
        <th style="background:#f7f0e6;color:#b8532a;font-weight:700;padding:8px 12px;text-align:left;border-bottom:2px solid #e8d5c4;"><span leaf="">{{列标题}}</span></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e8d5c4;color:#4a3728;"><span leaf="">{{内容}}</span></td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8d5c4;color:#4a3728;"><span leaf="">{{内容}}</span></td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e8d5c4;color:#4a3728;background:#fdfaf4;"><span leaf="">{{内容}}</span></td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8d5c4;color:#4a3728;background:#fdfaf4;"><span leaf="">{{内容}}</span></td>
      </tr>
    </tbody>
  </table>
</section>
```

---

## 组件 13 标签胶囊

镂空陶土（默认，暖纸墨招牌写法）：

```html
<span style="display:inline-block;background:transparent;border:1px solid #b8532a;color:#b8532a;font-size:12px;font-weight:600;padding:2px 10px;border-radius:4px;margin-right:6px;box-sizing:border-box;max-width:100%!important;"><span leaf="">标签名</span></span>
```

暖底深陶土字（次级层次）：

```html
<span style="display:inline-block;background:#f7f0e6;color:#8b3a1a;font-size:12px;font-weight:700;padding:2px 10px;border-radius:4px;margin-right:6px;border:1px solid #e8d5c4;box-sizing:border-box;max-width:100%!important;"><span leaf="">标签名</span></span>
```

---

## 组件 14 图片容器（暖纸底 + hairline 边框 + 极微暖阴影）

> 暖纸墨是**唯一可接受微妙阴影**的主题：暖纸底容器 + 1px `#e8d5c4` 细边框 + 极微暖阴影（透明度 ≤0.08），像相册里浮在纸面上的照片。圆角 4px。

```html
<section style="background:#fdfaf4;border-radius:4px;padding:6px;border:1px solid #e8d5c4;box-shadow:rgba(0,0,0,0.06) 1px 1px 6px 0px;margin:0 0 8px;box-sizing:border-box;max-width:100%!important;">
  <section style="margin:0;border-radius:4px;overflow:hidden;box-sizing:border-box;max-width:100%!important;">
    <span leaf=""><img src="图片URL" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span>
  </section>
</section>
```

带说明文字时，图片 `margin-bottom` 改 `8px`，其后加（斜体浅棕灰，更有杂志编辑感）：

```html
<p style="font-size:11px;color:#b8a898;text-align:center;margin:0 0 24px;font-style:italic;letter-spacing:0.3px;">
  <span leaf="">— {{图片说明}}</span>
</p>
```

多行代码块用通用增量库 `common-components.md` 的 1a 深色（底改 `#3d3226`、顶栏 `#2c241b`、文字 `#e8d5c4`）/ 1b 浅色（底改 `#f7f0e6`、左竖条换 `#b8532a`），禁 `white-space:pre`。

---

## 组件 15 END 结尾分割线

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="text-align:center;margin:0 0 32px;box-sizing:border-box;max-width:100%!important;">
    <section style="display:flex;align-items:center;justify-content:center;box-sizing:border-box;max-width:100%!important;">
      <span style="height:1px;width:60px;background:#e8d5c4;margin-right:12px;"><span leaf=""><br></span></span>
      <span style="font-size:11px;color:#b8532a;letter-spacing:3px;font-weight:700;"><span leaf="">END</span></span>
      <span style="height:1px;width:60px;background:#e8d5c4;margin-left:12px;"><span leaf=""><br></span></span>
    </section>
  </section>
</section>
```

---

## 组件 16 尾部作者签名区

> 固定签名文案以正文段落形式呈现；有个人名片/引导图素材才放图，无素材整块删。

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="text-align:center;margin:0 0 10px;border-radius:4px;overflow:hidden;box-sizing:border-box;max-width:100%!important;">
    <span leaf=""><img src="{{个人名片或引导图URL，无则删本 section}}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span>
  </section>
  <p style="margin:0 0 16px;font-size:14px;line-height:1.85;text-align:justify;letter-spacing:0.3px;color:#4a3728;">
    <span leaf="">我是 {{作者名}}，{{一句话简介，如：热衷于记录城市里被忽略的温度}}。</span>
  </p>
  <p style="margin:0 0 20px;font-size:14px;line-height:1.85;text-align:justify;letter-spacing:0.3px;color:#4a3728;">
    <span leaf="">如果今天的文字曾让你心头一暖，欢迎</span>
    <strong style="color:#b8532a;"><span leaf="">点赞、在看、转发</span></strong>
    <span leaf="">，我们下篇见。</span>
  </p>
</section>
```

---

## 完整文章模板骨架

```html
<section style="max-width:677px;margin:0 auto;background:#fdfaf4;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;color:#4a3728;font-size:14px;line-height:1.85;letter-spacing:0.3px;overflow-x:hidden;box-sizing:border-box;max-width:100%!important;">

  <!-- 1. 开头引言卡片（组件2，暖纸底 + 上下 hairline + 大引号） -->

  <!-- 2. 前言正文（组件6 段落 × N，放 0 10px 边距 section，第一章之前的开场白；首段可用斜体导语） -->

  <!-- 3. 前言导读（组件3，3+ 章节时生成，精选 3 看点，镂空陶土编号） -->

  <!-- 4. 第一章（组件5 章节标题，顶部 hairline + 镂空编号 01，margin-top:16px） -->
  <!--    章内：组件6 正文 + 6b 子标题 + 7 行内高亮 + 8 引用(大引号A/暖底B/竖条C) + 9 提示 + 10 标签组 + 11 列表 + 12 数据 + 14 图片 -->

  <!-- 5. 章节分割线（组件4 1px hairline）+ 第二章…第N章（组件5，margin-top:48px） -->

  <!-- 6. 结语章（组件5 变体：编号 ∞，英文 THE END） -->

  <!-- 7. END 分割线（组件15） -->

  <!-- 8. 尾部签名（组件16） -->

</section>
```

**骨架铁律**：引言卡在最前；导读区在前言正文之后、第一章之前；章节之间用组件 4 的 1px hairline 细横线分隔；一篇只有一个 END + 一个签名区。

---

## 视觉层级（3 层递进）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **锚点层** | 陶土加粗 7a / 大引号金句 8a / 镂空陶土编号 / 重点数字（数据卡） | 产品名、关键结论、核心金句、章节锚点 | 全文大引号 ≤3 处；陶土加粗 ≤5 处 |
| **标记层** | 暖调下划线 7d（默认）/ 暖底深陶土字标签 7b | 正文关键词强调 | 每段 1~3 处 |
| **容器层** | 左竖条引用 8c / 暖底提示 9 / 标签组 10 / 卡片 11-12 / hairline 细线 | 引用、旁注、提示、结构化信息 | 按需 |

**克制原则**：
- 实心陶土色块**仅**出现在大引号、重点数字等强锚点；正文关键词标签一律**镂空**（边框 + 陶土字，组件 13），不用实心药丸
- 陶土加粗全文 ≤5 处；大引号（变体 A）全文 ≤3 处
- 引用/提示统一用左竖条 + 暖底 + 类型小标签，**不用四周虚线框**（dashed）
- 细横线（hairline `#e8d5c4`）是全文结构骨架，至少章节标题处必须出现；**不使用渐变**（暖纸墨靠实色细线与留白分层，而非红白主题的渐变）

---

## 文章类型 → 组件组合配方

按 SKILL.md 第 3 步判定的文章类型选配方；核心组件构成本篇排版主旋律，点缀组件按内容出现处使用，一篇文章点缀组件种类 ≤3，避免花哨。

| 文章类型 | 核心组件组合 | 点缀组件 |
|---|---|---|
| 观点分析（黄金场景） | 正文6 + 大引号金句8a + 居中金句8d + 首段斜体导语 | 暖底引用8b、旁注9b |
| 深度文章 | 正文6 + 大引号8a + 左竖条引用8c + 章节标题5 | 暖底引用8b、hairline 4 |
| 人文思考（天然主场） | 正文6 + 大引号8a（可多次） + 图片14 + 首段导语 | 暖底引用8b、旁注9b |
| 教程/操作指南 | step-label 10a + 代码块（通用库1a深色/1b浅色）+ ordered-list 11a | 暖底提示9a、tool-card 10b |
| 盘点/工具清单 | skill/tool-label 10a + tool-card 10b + pill-list 11b | 数据卡12、镂空标签13 |
| 访谈/人物特稿 | 正文6 + 大引号8a（引语）+ timeline 11c（经历脉络） | 居中金句8d、左竖条引用8c |
| 数据复盘/报告 | 数据卡12（两列/三列）+ 表格12 + ordered-list 11a | 暖底提示9a、暖荧光笔7e |
| 案例实战 | case-label 10a / timeline 11c + step-label 10a | 暖底引用8b、旁注9b |

所有类型共用固定结构：引言卡 2 + 导读 3（3+ 章节）+ 编号章节 5（末章 ∞）+ END 15 + 签名 16。

---

## Markdown → 暖纸墨排版 映射规则

| Markdown 元素 | 对应组件 | 说明 |
|---|---|---|
| `# 标题` | 不使用 | 公众号文章标题在平台设置 |
| 文章开头 `> 引言金句` | 组件 2 暖纸底大引号引言卡 | 视角与外标题错开 |
| `## 章节标题` | 组件 5 章节标题 | 顶部 hairline + 镂空编号 01/02…，末章 ∞ + THE END |
| `### 子标题` | 组件 6b 陶土左竖条小标题 | 不套编号章节样式 |
| 普通段落 | 组件 6 正文段落 | 每段主动标 1~3 处暖调下划线 7d（`#e8c4a2`） |
| `**加粗文字**` | 组件 7a 普通加粗（默认）/ 陶土加粗（锚点 ≤5） | 普通加粗为主 |
| `==高亮文字==` | 组件 7b 暖底深陶土字标签 | 核心概念 |
| `<u>下划线</u>` / `++文字++` | 组件 7d 暖调下划线 | 次要强调 |
| `~~删除线~~` | `text-decoration:line-through` + 浅棕灰字 `#b8a898` | 被淘汰概念 |
| 行内 `` `code` `` | 组件 7f 行内代码 | 暖底 `#f7f0e6` + 陶土字 `#b8532a` |
| `> 引用段落`（金句） | 组件 8a 大引号（灵魂款，≤3 处） | 核心金句 |
| `> 引用段落`（长者言论） | 组件 8c 左竖条引用 | 长段引用 |
| `> 引用段落`（核心结论） | 组件 8b 暖底卡片引用 | 论证核心 |
| 操作步骤 | 组件 10a step-label | STEP 01/02…（镂空陶土） |
| 技能/工具清单 | 组件 10a skill/tool-label + 10b tool-card | 镂空标签 |
| 案例/经历脉络 | 组件 10a case-label / 11c timeline | |
| Prompt 提示词 | 组件 8b 暖底引用块 / 通用库 1a（长多行） | |
| ` ``` 多行代码块 ``` ` | 通用库 1a 深色（底 `#3d3226`）/ 1b 浅色（底 `#f7f0e6`、左竖条 `#b8532a`） | 每行一个 `<p style="margin:0">` |
| 并列要点 | 组件 11b pill-list | 镂空陶土点 |
| `1. 2. 3.` 编号列表 | 组件 11a ordered-list | 镂空陶土圆标 |
| 数据展示 | 组件 12 数据卡片组 / 表格 | 陶土大号数字 |
| Markdown 表格 | 组件 12 表格 | 表头陶土字 `#b8532a`、偶数行 `#fdfaf4` |
| 注意/警告 | 组件 9a 暖底提示 / 9b 旁注 | |
| 行内标签 | 组件 13 标签胶囊 | 镂空陶土默认 |
| `---` | 组件 4 章节分割线 | 1px hairline `#e8d5c4` |
| `![](图片)` | 组件 14 图片容器 | 暖底 + 细边框 + 极微暖阴影 |
| 文末 | 组件 15 END + 16 签名 | |
