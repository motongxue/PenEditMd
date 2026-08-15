# 公众号排版组件库 —— 绯红编（crimson-editorial）

> **使用说明**：本组件库为「绯红编」主题（编辑风骨 · 红白张力 · 强结构感），所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：绯红做强锚点（章节编号 / 引言 / 金句），白底 + 灰阶 + 克制红；偏「杂志深度报道」气质，结构清晰、编号章节、案例复盘感。淡红下划线为主标记、左竖条块引用、红色仅在锚点处出现。编号章节 + 引言卡 + 签名区的经典编辑骨架，适合深度评测、案例复盘、行业分析类文章。
>
> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class/id、`position:fixed/absolute`、`float`、`@media`/`@keyframes`、`display:grid`、`var()`/`calc()`/`hsl()`
> - ✅ 支持内联 `style`、`display:flex`（有限）、`linear-gradient`、`border-radius`、`box-shadow`、`<section>/<p>/<span>/<strong>/<em>/<img>` 等基础标签
>
> **WeChat 兼容铁律**（本主题组件全部已按此写好，改动时必须遵守）：
> - 所有"装饰性空元素"（红色渐变分割线、END 短线、光晕竖条、数据卡分隔）**必须在内部放 `<span leaf=""><br></span>` 占位**，否则微信会剥掉样式
> - **不要把 `font-size`/`border-bottom` 打在 `<strong>` 上**，也不要在同一个 `<p>` 里混多个不同 `font-size`——微信编辑器会自动"纠正"导致样式被重写。正确做法：拆成多个 `<p>`，每个 `<p>` 只有一个字号；高亮样式统一挂在外层 `<span>` 上
> - 不用 `position:absolute` 做划线/高亮，删除线用 `text-decoration:line-through`
> - 结构化区域（如引言卡右下署名、图片说明）没有内容时**整块删掉**，不留空 section
> - 本主题编辑风骨：**不用阴影做层次**（用边框 + 底色差异区分），圆角 ≤8px（方正、有理性的边角），**不用纯黑**（`#000` 一律用墨色 `#1a1210`/`#2a2218`），红色是权威编辑标记、全文克制（锚点 ≤5 处）

---

## 设计变量速查表

```
主色调：       #c1292e（绯红 —— 克制使用：章节编号、关键锚点 ≤5 处、左边框。像报纸红标题，少即是权威）
主色调深：     #a32025（深绯红 —— 二级强调、金句/提示文字色、数据次要数字）
主色调浅：     #f4c2c2（淡红 —— 正文关键词下划线、渐变线中段、列表圆点）
主色调背景：   #fef9f7（极浅暖红底 —— 引用块/提示块/数据卡背景，像被红墨水轻浸的纸）
页面底色：     #fefcf7（微暖白 —— 像略微泛黄的新闻纸，比纯白柔和）
暖灰粉边框：   #e8d5d0（卡片描边，有温度的灰）
浅高亮底：     rgba(193,41,46,0.08)（主色 8% —— 行内高亮/浅红标签背景）
标题色：       #1a1210（近墨深棕 —— 标题/数据大数字，比纯黑有温度）
正文色：       #2a2218（深灰棕近墨 —— 正文，模仿报纸铅字）
辅助文字色：   #6e6058（中暖灰 —— 次要说明文字）
注释色：       #9e9088（浅暖灰 —— 日期、来源、最小文字层级、图片说明）
分割线色：     #d8ccc4（暖灰 —— 细线分割，中点缀红色菱形）
行内代码底：   #f5f0ed（浅暖灰底）
正文关键词下划线 CSS：border-bottom:2px solid #f4c2c2;font-weight:600;
正文字号：     14px（不可改）
行高：         1.85
字间距：       0.3px
最大宽度：     677px
内容区边距：   0 10px（左右各 10px）
字体栈：       -apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif
```

---

## 组件 1 全局容器

```html
<section style="max-width:677px;margin:0 auto;background:#fefcf7;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;color:#2a2218;line-height:1.85;letter-spacing:0.3px;overflow-x:hidden;box-sizing:border-box;max-width:100%!important;">

  <!-- 所有组件放在这里 -->

</section>
```

---

## 组件 2 开头引言卡片（暖白底 + 绯红光晕）

> **文案策略（先读，比代码重要）**：
> - 引言卡金句和公众号外标题是**两层**，视角要错开——外标题卖"为什么点开"，引言卡卖"核心观点是什么"
> - 已知外标题时，金句**禁止原样复述**其核心关键词；从文章第一段或核心论点提炼一句有张力的判断句
> - 右下署名按文章实际作者填，未知则整行删掉，**不要固定写"甲木"**
> - 红底白字标签仅在本卡片内使用（视觉焦点），正文中的关键词标签一律用浅红底深红字（组件 7b）

```html
<section style="margin:10px 10px 32px;background:#fefcf7;border-radius:8px;box-shadow:0 4px 24px -4px rgba(193,41,46,0.15);padding:28px 24px 22px;overflow:hidden;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:42px;color:#c1292e;font-weight:900;margin:0;line-height:0.6;">
    <span leaf="">"</span>
  </p>
  <p style="font-size:16px;font-weight:800;color:#1a1210;margin:12px 0 8px;line-height:1.75;padding-left:4px;">
    <span style="background:#c1292e;color:#FFFFFF;padding:2px 8px;border-radius:4px;"><span leaf="">{{高亮关键词}}</span></span>
    <span leaf="">{{金句中段}}</span>
    <span style="background:#c1292e;color:#FFFFFF;padding:2px 8px;border-radius:4px;"><span leaf="">{{高亮关键词}}</span></span>
    <span leaf="">{{金句收尾}}</span>
  </p>
  <p style="text-align:right;font-size:12px;color:#9e9088;margin:8px 0 0;letter-spacing:1px;">
    <span leaf="">—— {{作者名，未知则删整行}}</span>
  </p>
</section>
```

---

## 组件 3 前言导读区域（本文看点，三列目录卡片）

> 3 个及以上章节时生成。绯红编号 + 深色标题；展示**精选 3 个核心看点**，不是全量章节列表。

```html
<section style="padding:0 10px 32px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:14px;color:#9e9088;margin:0 0 14px;letter-spacing:1px;">
    <span leaf="">📌 本文看点</span>
  </p>
  <section style="display:flex;justify-content:space-between;box-sizing:border-box;max-width:100%!important;">
    <section style="flex:1;background:#fef9f7;border-radius:8px;padding:16px 12px;margin-right:8px;text-align:center;border:1px solid #e8d5d0;box-sizing:border-box;max-width:100%!important;">
      <p style="display:inline-block;background:#c1292e;color:#FFFFFF;font-size:12px;font-weight:800;padding:2px 10px;border-radius:4px;margin:0 0 8px;"><span leaf="">01</span></p>
      <p style="font-size:13px;font-weight:700;color:#1a1210;margin:0;"><span leaf="">{{看点一}}</span></p>
    </section>
    <section style="flex:1;background:#fef9f7;border-radius:8px;padding:16px 12px;margin-right:8px;text-align:center;border:1px solid #e8d5d0;box-sizing:border-box;max-width:100%!important;">
      <p style="display:inline-block;background:#c1292e;color:#FFFFFF;font-size:12px;font-weight:800;padding:2px 10px;border-radius:4px;margin:0 0 8px;"><span leaf="">02</span></p>
      <p style="font-size:13px;font-weight:700;color:#1a1210;margin:0;"><span leaf="">{{看点二}}</span></p>
    </section>
    <section style="flex:1;background:#fef9f7;border-radius:8px;padding:16px 12px;text-align:center;border:1px solid #e8d5d0;box-sizing:border-box;max-width:100%!important;">
      <p style="display:inline-block;background:#c1292e;color:#FFFFFF;font-size:12px;font-weight:800;padding:2px 10px;border-radius:4px;margin:0 0 8px;"><span leaf="">03</span></p>
      <p style="font-size:13px;font-weight:700;color:#1a1210;margin:0;"><span leaf="">{{看点三}}</span></p>
    </section>
  </section>
</section>
```

---

## 组件 4 章节分割线（绯红渐变）

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="height:1px;background:linear-gradient(to right,transparent,#f4c2c2,#c1292e,#f4c2c2,transparent);margin:0;box-sizing:border-box;max-width:100%!important;">
    <span leaf=""><br></span>
  </section>
</section>
```

---

## 组件 5 章节标题（绯红编号标签 + 标题）

> 绯红实底编号标签 + 英文小标签 + 中文大标题，底部绯红实线。第一章 `margin-top:16px`，后续章节 `margin-top:48px`。

```html
<section style="margin-top:48px;margin-bottom:28px;padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:14px;border-bottom:3px solid #c1292e;box-sizing:border-box;max-width:100%!important;">
    <section style="display:flex;align-items:center;box-sizing:border-box;max-width:100%!important;">
      <span style="display:inline-block;background:#c1292e;color:#FFFFFF;font-size:18px;font-weight:900;padding:4px 14px;border-radius:6px;margin-right:14px;line-height:1.3;"><span leaf="">01</span></span>
      <section style="box-sizing:border-box;max-width:100%!important;">
        <p style="font-size:10px;color:#c1292e;font-weight:700;letter-spacing:3px;margin:0 0 2px;text-transform:uppercase;">
          <span leaf="">{{ENGLISH TAG}}</span>
        </p>
        <h3 style="font-size:18px;font-weight:800;color:#1a1210;margin:0;letter-spacing:0.3px;">
          <span leaf="">{{中文章节标题}}</span>
        </h3>
      </section>
    </section>
  </section>

  <!-- 本章节正文内容放在这里 -->

</section>
```

**结语章节变体**（编号用 `∞` 替代数字，英文标签用 `THE END` / `EPILOGUE`，竖条/底线灰化表达"编辑注脚"）：

```html
<span style="display:inline-block;background:#c1292e;color:#FFFFFF;font-size:18px;font-weight:900;padding:4px 14px;border-radius:6px;margin-right:14px;line-height:1.3;"><span leaf="">∞</span></span>
```

---

## 组件 6 正文段落

> **关键规则**：每段主动识别 1~3 个关键短语，用**淡红下划线（7d）**标记——这是本风格的核心视觉特征，让读者快速扫到每段重点。

**基础段落**：

```html
<p style="margin-bottom:20px;font-size:14px;line-height:1.85;text-align:justify;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">{{正文内容}}</span>
</p>
```

**带关键词下划线标记的段落**（推荐默认）：

```html
<p style="margin-bottom:20px;font-size:14px;line-height:1.85;text-align:justify;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">{{前半句}}</span>
  <span style="border-bottom:2px solid #f4c2c2;font-weight:600;"><span leaf="">{{需要强调的关键短语}}</span></span>
  <span leaf="">{{后半句}}</span>
</p>
```

**标记原则**：每段选 1~3 个关键短语（4~15 字）加下划线，不要整段都标；优先标核心观点、结论判断、关键数据、专有名词；无重点的段落可不标。

---

## 组件 6b 子标题（`###` 小节标题）

> `###` 子标题用绯红左竖条 + 墨色标题，**不套用组件 5 的编号章节样式**（编号章节只给 `##`）。

```html
<p style="font-size:15px;font-weight:800;color:#1a1210;margin:28px 0 14px;padding-left:10px;border-left:3px solid #c1292e;line-height:1.4;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">{{子标题}}</span>
</p>
```

---

## 组件 7 正文高亮样式（5 种变体 + 使用策略）

> **核心理念**：克制用色，绯红只在真正需要的锚点出现。
>
> **优先级**：① 7d 淡红下划线（正文默认标记）→ ② 7a 普通加粗为主、绯红加粗仅锚点 → ③ 7b 浅红底深红字标签（每篇 2~4 个）→ ④ 7c 浅红背景（次要）→ ⑤ 7e 荧光笔（偶尔长句强调）

### 7a. 加粗强调

普通加粗（默认，绝大部分加粗用这个）：

```html
<strong><span leaf="">普通加粗强调</span></strong>
```

绯红加粗（仅限产品名/步骤/CTA 等锚点，全文 ≤5 处）：

```html
<strong style="color:#c1292e;"><span leaf="">绯红加粗锚点</span></strong>
```

### 7b. 浅红底深红字标签（核心概念，每篇 2~4 个）

```html
<span style="background:rgba(193,41,46,0.08);color:#a32025;padding:2px 6px;border-radius:3px;font-weight:700;"><span leaf="">关键词标签</span></span>
```

### 7c. 浅红背景高亮（次要关键词）

```html
<span style="background:rgba(193,41,46,0.08);padding:1px 6px;border-radius:3px;font-weight:600;color:#a32025;"><span leaf="">浅红背景关键词</span></span>
```

### 7d. 淡红下划线（最常用，本风格标志性标记）

```html
<span style="border-bottom:2px solid #f4c2c2;font-weight:600;"><span leaf="">淡红下划线关键词</span></span>
```

### 7e. 荧光笔效果（偶尔用于长句强调）

```html
<span style="background:linear-gradient(180deg,transparent 60%,#f4c2c2 60%);font-weight:700;color:#1a1210;"><span leaf="">荧光笔效果的重要长句</span></span>
```

### 7f. 行内代码

```html
<span style="background:#f5f0ed;color:#1a1210;padding:2px 6px;border-radius:4px;font-size:13px;font-weight:600;"><span leaf="">code</span></span>
```

---

## 组件 8 引用高亮块（3 种变体）

### 8a. 暖红底左竖条金句引用（视觉焦点最强，核心金句）

```html
<section style="background:#fef9f7;border-radius:0 8px 8px 0;border-left:4px solid #c1292e;padding:18px 22px;margin-bottom:24px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:16px;font-weight:800;color:#a32025;margin:0;line-height:1.8;">
    <span leaf="">「{{核心观点或关键金句}}」</span>
  </p>
</section>
```

### 8b. 浅红背景引用块（Prompt / 引用内容）

```html
<section style="background:#fef9f7;border-radius:8px;padding:18px 20px;margin-bottom:24px;border:1px solid #f4c2c2;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:14px;color:#2a2218;margin:0;line-height:1.85;text-align:justify;">
    {{引用内容，可含 7d 下划线等内联样式}}
  </p>
</section>
```

### 8c. 灰色左竖条引用（轻量旁注、个人吐槽）

```html
<section style="border-left:4px solid #e8d5d0;padding:14px 20px;margin-bottom:24px;background:#fdfaf8;border-radius:0 8px 8px 0;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:14px;color:#2a2218;margin:0;line-height:1.85;text-align:justify;">
    <span leaf="">{{轻量旁注内容}}</span>
  </p>
</section>
```

### 8d. 居中金句分隔（章节间的过渡金句）

```html
<p style="font-size:15px;margin:0 0 24px;text-align:center;color:#c1292e;font-weight:700;letter-spacing:1px;border-top:1px solid #fef9f7;border-bottom:1px solid #fef9f7;padding:14px 10px;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">{{居中金句}}</span>
</p>
```

---

## 组件 9 提示 / 警示条

### 9a. 绯红提示条（重要提醒、核心结论）

```html
<section style="background:#fef9f7;border-left:4px solid #c1292e;border-radius:0 8px 8px 0;padding:14px 20px;margin-bottom:24px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:14px;font-weight:700;color:#a32025;margin:0;line-height:1.8;">
    <span leaf="">💡 {{重要提示或核心结论}}</span>
  </p>
</section>
```

### 9b. 踩坑提示（灰底，风险/注意事项）

```html
<section style="padding:6px 0 4px;margin-bottom:16px;box-sizing:border-box;max-width:100%!important;">
  <p style="margin-bottom:6px;font-size:12px;font-weight:700;color:#9e9088;letter-spacing:1px;box-sizing:border-box;max-width:100%!important;">
    <span style="color:#c1292e;"><span leaf="">！踩坑提示 🕳</span></span>
  </p>
  <p style="font-size:14px;color:#2a2218;margin:0;line-height:1.7;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{提示内容}}</span>
  </p>
</section>
```

---

## 组件 10 内容标签组（STEP / SKILL / TOOL / CASE）

> 教程用 STEP、盘点用 SKILL/TOOL、案例用 CASE。绯红实底白字编号标签 + 标题。

### 10a. step-label（教程步骤）

```html
<section style="margin-bottom:22px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;align-items:center;gap:8px;margin-bottom:10px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-block;background:#c1292e;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;"><span leaf="">STEP 01</span></span>
    <span style="font-size:15px;font-weight:800;color:#1a1210;"><span leaf="">{{步骤标题}}</span></span>
  </section>
  <p style="font-size:14px;margin:0 0 16px;color:#2a2218;line-height:1.85;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    {{步骤内容}}
  </p>
</section>
```

`STEP 01` 可替换为 `SKILL 1`、`TOOL 摄像机`、`CASE 01`（盘点/案例场景）；盘点场景标签底色可改灰 `#e8d5d0`+字 `#a32025` 做次级层次。

### 10b. tool-card（工具/条目说明卡）

```html
<section style="background:#fff;border-radius:8px;padding:16px 20px;box-shadow:0 4px 16px rgba(193,41,46,0.08);margin-bottom:24px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:14px;color:#2a2218;margin:0;line-height:1.85;box-sizing:border-box;max-width:100%!important;">
    {{条目说明内容}}
  </p>
</section>
```

---

## 组件 11 列表组件

### 11a. ordered-list（绯红圆标数字编号列表）

```html
<section style="margin-bottom:24px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:#c1292e;color:#fff;font-size:12px;font-weight:700;border-radius:50%;flex-shrink:0;margin-top:2px;"><span leaf="">1</span></span>
    <p style="font-size:14px;color:#2a2218;margin:0;line-height:1.85;flex:1;"><span leaf="">{{列表项内容}}</span></p>
  </section>
  <section style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:#c1292e;color:#fff;font-size:12px;font-weight:700;border-radius:50%;flex-shrink:0;margin-top:2px;"><span leaf="">2</span></span>
    <p style="font-size:14px;color:#2a2218;margin:0;line-height:1.85;flex:1;"><span leaf="">{{列表项内容}}</span></p>
  </section>
  <section style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:#c1292e;color:#fff;font-size:12px;font-weight:700;border-radius:50%;flex-shrink:0;margin-top:2px;"><span leaf="">3</span></span>
    <p style="font-size:14px;color:#2a2218;margin:0;line-height:1.85;flex:1;"><span leaf="">{{列表项内容}}</span></p>
  </section>
</section>
```

### 11b. pill-list（无序要点，绯红点前缀 + 说明）

```html
<section style="margin-bottom:14px;box-sizing:border-box;max-width:100%!important;">
  <p style="margin:0 0 6px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-block;font-size:14px;font-weight:700;color:#a32025;background:rgba(193,41,46,0.08);padding:3px 10px;border-radius:999px;"><span style="display:inline-block;width:6px;height:6px;background:#c1292e;border-radius:50%;margin-right:5px;vertical-align:middle;"><span leaf=""><br></span></span><span leaf="">{{要点标题}}</span></span>
  </p>
  <p style="font-size:14px;color:#6e6058;margin:0;line-height:1.75;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{要点说明}}</span>
  </p>
</section>
```

### 11c. timeline（时间线 / 递进脉络，访谈经历、案例演进）

```html
<section style="display:flex;margin-bottom:24px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;flex-direction:column;align-items:center;margin-right:16px;flex-shrink:0;box-sizing:border-box;max-width:100%!important;">
    <section style="width:14px;height:14px;border-radius:50%;border:3px solid #c1292e;background:#fefcf7;margin-top:4px;"><span leaf=""><br></span></section>
    <section style="width:2px;background:#f4c2c2;flex:1;margin-top:4px;min-height:44px;"><span leaf=""><br></span></section>
  </section>
  <section style="flex:1;padding-bottom:12px;box-sizing:border-box;max-width:100%!important;">
    <p style="margin:0 0 6px;font-size:15px;font-weight:800;color:#1a1210;"><span leaf="">{{节点标题}}</span></p>
    <p style="font-size:14px;margin:0;color:#2a2218;line-height:1.85;text-align:justify;">{{节点内容}}</p>
  </section>
</section>
```

最后一个节点去掉竖线段。

---

## 组件 12 数据 / 要点卡片组

> **绯红编铁律**：数据大数字用墨色 `#1a1210`（不用主色），绯红只做顶部 2px 装饰线 / 编号圆——主色留给编辑锚点。

### 两列版

```html
<section style="display:flex;margin-bottom:24px;padding:0;box-sizing:border-box;max-width:100%!important;">
  <section style="flex:1;background:#fef9f7;border-radius:8px;padding:18px 16px;margin-right:8px;text-align:center;border:1px solid #e8d5d0;border-top:2px solid #c1292e;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:28px;font-weight:900;color:#1a1210;margin:0 0 4px;line-height:1;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:12px;color:#9e9088;margin:0;"><span leaf="">{{说明}}</span></p>
  </section>
  <section style="flex:1;background:#fef9f7;border-radius:8px;padding:18px 16px;text-align:center;border:1px solid #e8d5d0;border-top:2px solid #c1292e;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:28px;font-weight:900;color:#1a1210;margin:0 0 4px;line-height:1;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:12px;color:#9e9088;margin:0;"><span leaf="">{{说明}}</span></p>
  </section>
</section>
```

### 三列版

```html
<section style="display:flex;margin-bottom:24px;padding:0;box-sizing:border-box;max-width:100%!important;">
  <section style="flex:1;background:#fef9f7;border-radius:8px;padding:16px 10px;margin-right:8px;text-align:center;border:1px solid #e8d5d0;border-top:2px solid #c1292e;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:24px;font-weight:900;color:#1a1210;margin:0 0 4px;line-height:1;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:11px;color:#9e9088;margin:0;"><span leaf="">{{说明}}</span></p>
  </section>
  <section style="flex:1;background:#fef9f7;border-radius:8px;padding:16px 10px;margin-right:8px;text-align:center;border:1px solid #e8d5d0;border-top:2px solid #c1292e;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:24px;font-weight:900;color:#1a1210;margin:0 0 4px;line-height:1;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:11px;color:#9e9088;margin:0;"><span leaf="">{{说明}}</span></p>
  </section>
  <section style="flex:1;background:#fef9f7;border-radius:8px;padding:16px 10px;text-align:center;border:1px solid #e8d5d0;border-top:2px solid #c1292e;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:24px;font-weight:900;color:#1a1210;margin:0 0 4px;line-height:1;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:11px;color:#9e9088;margin:0;"><span leaf="">{{说明}}</span></p>
  </section>
</section>
```

### 表格（真实数据表用）

```html
<section style="margin-bottom:24px;overflow-x:auto;box-sizing:border-box;max-width:100%!important;">
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <thead>
      <tr>
        <th style="background:#fef9f7;color:#1a1210;font-weight:700;padding:8px 12px;text-align:left;border-bottom:1px solid #c1292e;"><span leaf="">{{列标题}}</span></th>
        <th style="background:#fef9f7;color:#1a1210;font-weight:700;padding:8px 12px;text-align:left;border-bottom:1px solid #c1292e;"><span leaf="">{{列标题}}</span></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e8d5d0;color:#2a2218;"><span leaf="">{{内容}}</span></td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8d5d0;color:#2a2218;"><span leaf="">{{内容}}</span></td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e8d5d0;color:#2a2218;background:#fdfaf8;"><span leaf="">{{内容}}</span></td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8d5d0;color:#2a2218;background:#fdfaf8;"><span leaf="">{{内容}}</span></td>
      </tr>
    </tbody>
  </table>
</section>
```

---

## 组件 13 标签胶囊

浅红底深红字（默认）：

```html
<span style="display:inline-block;background:rgba(193,41,46,0.08);color:#a32025;font-size:12px;font-weight:700;padding:2px 10px;border-radius:4px;margin-right:6px;"><span leaf="">标签名</span></span>
```

绯红描边（轻量）：

```html
<span style="display:inline-block;border:1px solid #c1292e;color:#c1292e;font-size:12px;font-weight:600;padding:1px 10px;border-radius:4px;margin-right:6px;"><span leaf="">标签名</span></span>
```

---

## 组件 14 图片容器

```html
<section style="background:#fefcf7;border-radius:8px;padding:6px;border:1px solid #e8d5d0;box-shadow:0 4px 12px -2px rgba(0,0,0,0.08);margin-bottom:10px;box-sizing:border-box;max-width:100%!important;">
  <section style="margin:0;border-radius:8px;overflow:hidden;box-sizing:border-box;max-width:100%!important;">
    <span leaf=""><img src="{{图片URL}}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span>
  </section>
</section>
```

带说明文字时，图片 `margin-bottom` 改 `8px`，其后加：

```html
<p style="font-size:12px;color:#9e9088;text-align:center;margin:0 0 24px;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">— {{图片说明}}</span>
</p>
```

GIF 动图角标（辅色语义用深绯红 `#a32025`，编辑标记用主色）：

```html
<p style="text-align:center;margin:0 0 24px;box-sizing:border-box;max-width:100%!important;">
  <span style="display:inline-block;background:#a32025;color:#FFFFFF;font-size:11px;font-weight:700;padding:1px 8px;border-radius:4px;margin-right:6px;"><span leaf="">GIF 动图</span></span>
  <span style="font-size:12px;color:#9e9088;"><span leaf="">动图说明文字</span></span>
</p>
```

多行代码块用通用增量库 `common-components.md` 的 1a 深色 / 1b 浅色（左竖条换 `#c1292e`），禁 `white-space:pre`。

---

## 组件 15 END 结尾分割线

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="text-align:center;margin:0 0 32px;box-sizing:border-box;max-width:100%!important;">
    <section style="display:flex;align-items:center;justify-content:center;box-sizing:border-box;max-width:100%!important;">
      <span style="height:2px;width:60px;background:linear-gradient(to right,transparent,#c1292e);margin-right:12px;"><span leaf=""><br></span></span>
      <span style="font-size:11px;color:#c1292e;letter-spacing:3px;font-weight:700;"><span leaf="">END</span></span>
      <span style="height:2px;width:60px;background:linear-gradient(to left,transparent,#c1292e);margin-left:12px;"><span leaf=""><br></span></span>
    </section>
  </section>
</section>
```

---

## 组件 16 尾部作者签名区

> 固定签名文案以正文段落形式呈现；有个人名片/引导图素材才放图，无素材整块删。

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="text-align:center;margin-bottom:10px;border-radius:8px;overflow:hidden;box-sizing:border-box;max-width:100%!important;">
    <span leaf=""><img src="{{个人名片或引导图URL，无则删本 section}}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span>
  </section>
  <p style="margin-bottom:20px;font-size:14px;line-height:1.85;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">我是 {{作者名}}，{{一句话简介，如：热衷于分享 AI 观察与干货}}。</span>
  </p>
  <p style="margin-bottom:20px;font-size:14px;line-height:1.85;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">如果你觉得今天这篇有收获，欢迎</span>
    <strong style="color:#c1292e;"><span leaf="">点赞、在看、转发</span></strong>
    <span leaf="">三连，我们下篇见。</span>
  </p>
</section>
```

---

## 完整文章模板骨架

```html
<section style="max-width:677px;margin:0 auto;background:#fefcf7;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;color:#2a2218;line-height:1.85;letter-spacing:0.3px;overflow-x:hidden;box-sizing:border-box;max-width:100%!important;">

  <!-- 1. 开头引言卡片（组件2，暖白底绯红光晕） -->

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

**骨架铁律**：引言卡在最前；导读区在前言正文之后、第一章之前；章节之间用组件 4 绯红渐变线分隔；一篇只有一个 END + 一个签名区。

---

## 视觉层级（3 层递进）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **锚点层** | 绯红加粗 7a / 绯红实底白字（仅引言卡）/ 金句引用 8a | 产品名、关键结论、核心金句 | 全文 ≤5 处 |
| **标记层** | 淡红下划线 7d（默认）/ 浅红底标签 7b | 正文关键词强调 | 每段 1~3 处 |
| **容器层** | 左竖条引用 8x / 提示 9x / 标签组 10 / 卡片 11-12 | 引用、旁注、提示、结构化信息 | 按需 |

**克制原则**：
- 绯红实底白字标签（`bg:#c1292e`）**仅在引言卡内**，正文关键词标签用浅红底深红字 7b（背景 `rgba(193,41,46,0.08)`）
- 绯红加粗全文 ≤5 处
- 引用/提示统一用左竖条 + 浅底 + 类型小标签，**不用四周虚线框**（dashed）
- 渐变红仅出现在章节分割线 4 和 END 线 15
- **数据大数字用墨色 `#1a1210`**，绯红只做装饰线/编号圆（绯红编铁律）
- 圆角 ≤8px，不用纯黑（`#000` → 用墨色），不用阴影做层次

---

## 文章类型 → 组件组合配方

按 SKILL.md 第 3 步判定的文章类型选配方；核心组件构成本篇排版主旋律，点缀组件按内容出现处使用，一篇文章点缀组件种类 ≤3，避免花哨。

| 文章类型 | 核心组件组合 | 点缀组件 |
|---|---|---|
| 深度评测/行业分析 | 正文6 + 金句引用8a + 居中金句8d | 浅红引用8b、踩坑提示9b |
| 案例复盘 | 章节标题5 + 左竖条引用8a + 数据卡12 + 金句8a | 提示9a、timeline 11c |
| 教程/操作指南 | step-label 10a + 代码块（通用库1a）+ ordered-list 11a | 绯红提示9a、tool-card 10b |
| 盘点/工具清单 | skill/tool-label 10a + tool-card 10b + pill-list 11b | 数据卡12、标签胶囊13 |
| 访谈/人物特稿 | 正文6 + 金句引用8a（引语）+ timeline 11c（经历脉络） | 居中金句8d、灰底旁注8c |
| 数据复盘/报告 | 数据卡12（两列/三列）+ 表格12 + ordered-list 11a | 绯红提示9a、荧光笔7e |
| 观点/深度议论 | 金句引用8a + 报纸引号旁注8c + 行内加粗7a | 浅红引用8b、踩坑提示9b |

所有类型共用固定结构：引言卡 2 + 导读 3（3+ 章节）+ 编号章节 5 + END 15 + 签名 16。

---

## Markdown → 绯红排版 映射规则

| Markdown 元素 | 对应组件 | 说明 |
|---|---|---|
| `# 标题` | 不使用 | 公众号文章标题在平台设置 |
| 文章开头 `> 引言金句` | 组件 2 暖白底绯红光晕引言卡 | 视角与外标题错开 |
| `## 章节标题` | 组件 5 章节标题 | 绯红实底编号 01/02…，末章 ∞ + THE END |
| `### 子标题` | 组件 6b 绯红左竖条小标题 | 不套编号章节样式 |
| 普通段落 | 组件 6 正文段落 | 每段主动标 1~3 处淡红下划线 7d |
| `**加粗文字**` | 组件 7a 普通加粗（默认）/ 绯红加粗（锚点 ≤5） | 普通加粗为主 |
| `==高亮文字==` | 组件 7b 浅红底深红字标签 | 核心概念 |
| `<u>下划线</u>` / `++文字++` | 组件 7d 淡红下划线 | 次要强调 |
| `~~删除线~~` | `text-decoration:line-through` + 灰字 | 被淘汰概念 |
| 行内 `` `code` `` | 组件 7f 行内代码 | 浅暖灰底 |
| `> 引用段落`（金句） | 组件 8a 暖红底左竖条 | 核心金句 |
| `> 引用段落`（旁注） | 组件 8c 灰底左竖条 | 轻量旁注 |
| 核心金句 | 组件 8a / 8d 居中金句 | 视觉焦点 |
| 操作步骤 | 组件 10a step-label | STEP 01/02… |
| 技能/工具清单 | 组件 10a skill/tool-label + 10b tool-card | |
| 案例/经历脉络 | 组件 10a case-label / 11c timeline | |
| Prompt 提示词 | 组件 8b 浅红引用块 / 通用库 1a（长多行） | |
| ` ``` 多行代码块 ``` ` | 通用库 1a 深色 / 1b 浅色（左竖条换 #c1292e） | 每行一个 `<p style="margin:0">` |
| 并列要点 | 组件 11b pill-list | |
| `1. 2. 3.` 编号列表 | 组件 11a ordered-list | 绯红圆标 |
| 数据展示 | 组件 12 数据卡片组 / 表格（大数字墨色） | 顶部 2px 绯红线 |
| Markdown 表格 | 组件 12 表格 | 表头浅底+底部 1px 绯红线，偶数行 `#fdfaf8` |
| 注意/警告 | 组件 9a 绯红提示 / 9b 踩坑提示 | |
| 行内标签 | 组件 13 标签胶囊 | 浅红底默认 |
| `---` | 组件 4 章节分割线 | 绯红渐变 |
| `![](图片)` | 组件 14 图片容器 | 圆角卡片 + 说明 |
| 文末 | 组件 15 END + 16 签名 | |
