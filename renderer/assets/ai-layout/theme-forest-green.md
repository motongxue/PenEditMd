# 公众号排版组件库 —— 森语绿（forest-green）

> **使用说明**：本组件库为「森语绿」主题（自然·侘寂·大留白），所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：森林绿做柔和锚点，米白/浅绿底，呼吸感最强；图片占比高、图文并茂；克制用色，近似单色（绿+灰+纸白）。编号章节 + 引言卡 + 签名区的经典编辑骨架，适合随笔、生活方式、冥想反思类文章。
>
> **气质签名**：自然、侘寂、大留白；森林绿只作章节编号与极少锚点（全文主色曝光面积 ≤1%），其余全是文字本身的质地。
>
> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class/id、`position:fixed/absolute`、`float`、`@media`/`@keyframes`、`display:grid`、`hsl()`/`var()`/`calc()`
> - ✅ 支持内联 `style`、`display:flex`（有限）、`linear-gradient`（克制使用）、`border-radius`（≤8px）、`box-shadow`（**本主题禁用**）、`<section>/<p>/<span>/<strong>/<em>/<img>/<br>/<h3>` 等基础标签
>
> **WeChat 兼容铁律**（本主题组件全部已按此写好，改动时必须遵守）：
> - 所有"装饰性空元素"（分割线、END 短线、时间线圆点/竖条、列表圆点）**必须在内部放 `<span leaf=""><br></span>` 占位**，否则微信会剥掉样式
> - **不要把 `font-size`/`border-bottom` 打在 `<strong>` 上**，也不要在同一个 `<p>` 里混多个不同 `font-size`——微信编辑器会自动"纠正"导致样式被重写。正确做法：拆成多个 `<p>`，每个 `<p>` 只有一个字号；高亮样式统一挂在外层 `<span>` 上
> - 不用 `position:absolute` 做划线/高亮，删除线用 `text-decoration:line-through`
> - 结构化区域（如引言卡右下署名、图片说明）没有内容时**整块删掉**，不留空 section
> - 本主题禁用 `box-shadow`（纸张不需要投影）；圆角不超过 8px，常用 4–6px

---

## 设计变量速查表

```
主色调：       #4a7c59（森林绿——只出现在章节编号、极少锚点，全文主色曝光面积极低 ≤1%）
辅色：         #8ba78a（鼠尾草灰绿——辅助装饰、引号、弱化标记、步骤编号）
强调点缀：     #6b8f6f（苔绿——行内高亮底色、关键锚点）
浅底：         #f5f7f3（卡片/引用块/信息卡底色——极浅，带一丝草木绿意）
浅边框：       #d8ddd4（柔和的灰绿边框——图片描边、卡片边线）
页面底色：     #fafbf8（暖白带极微绿意，像手工棉纸）
标题色：       #2c3a2e（深墨绿——章节标题、重点标题、数据数字）
正文色：       #3a4a3e（深灰绿——不纯黑，像铅字印在手工纸上）
辅助文字色：   #7a857b（中灰绿——次要信息、旁注、提示）
注释色：       #9ca89d（浅灰绿——日期、编号、图说、最弱文字层级）
分割线色：     #dfe3dd（极淡灰绿——分割线几乎消失在底色中，或直接用留白替代）
关键词下划线： #b5c8b0（浅鼠尾草绿——border-bottom:1.5px solid #b5c8b0;font-weight:500）
正文字号：     14px（不可改）
行高：         1.85
字间距：       0.3px
段落间距：     12px（比常规多 50%，大留白是核心特征）
章节标题字号： 18–20px
章节间距：     40px 上（比常规多 25%）
最大宽度：     677px
内容区边距：   0 10px（左右各 10px）
```

字体栈：`-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif`

---

## 组件 1 全局容器

```html
<section style="box-sizing:border-box;max-width:100%!important;max-width:677px;margin:0 auto;background:#fafbf8;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;color:#3a4a3e;font-size:14px;line-height:1.85;letter-spacing:0.3px;overflow-x:hidden;">

  <!-- 所有组件放在这里 -->

</section>
```

---

## 组件 2 开头引言卡片（米白便签 + 森林绿引号）

> **文案策略（先读，比代码重要）**：
> - 引言卡金句和公众号外标题是**两层**，视角要错开——外标题卖"为什么点开"，引言卡卖"核心观点是什么"
> - 已知外标题时，金句**禁止原样复述**其核心关键词；从文章第一段或核心论点提炼一句有张力的判断句
> - 右下署名按文章实际作者填，未知则整行删掉，**不要固定写"甲木"**
> - 森语绿**无主色背景标签**——关键词用浅绿下划线（7d）标记，不用红底白字药丸（那属于红白主题）

```html
<section style="box-sizing:border-box;max-width:100%!important;margin:10px 10px 40px;background:#f5f7f3;border-radius:6px;padding:28px 22px 22px;">
  <p style="box-sizing:border-box;max-width:100%!important;font-size:36px;color:#4a7c59;font-weight:500;margin:0;line-height:0.6;">
    <span leaf="">"</span>
  </p>
  <p style="box-sizing:border-box;max-width:100%!important;font-size:16px;font-weight:500;color:#2c3a2e;margin:12px 0 8px;line-height:1.85;padding-left:4px;text-align:justify;">
    <span leaf="">{{金句中段}}</span>
    <span style="border-bottom:1.5px solid #b5c8b0;font-weight:500;"><span leaf="">{{关键词}}</span></span>
    <span leaf="">{{金句收尾}}</span>
  </p>
  <p style="box-sizing:border-box;max-width:100%!important;text-align:right;font-size:12px;color:#9ca89d;margin:8px 0 0;letter-spacing:1px;">
    <span leaf="">—— {{作者名，未知则删整行}}</span>
  </p>
</section>
```

---

## 组件 3 前言导读区域（本文看点，三列目录卡片）

> 3 个及以上章节时生成。森林绿文字编号 + 浅绿底卡片；展示**精选 3 个核心看点**，不是全量章节列表。编号用主色 `#4a7c59` 文字（非背景药丸），呼应"编号即装饰"。

```html
<section style="box-sizing:border-box;max-width:100%!important;padding:0 10px 40px;">
  <p style="box-sizing:border-box;max-width:100%!important;font-size:14px;color:#9ca89d;margin:0 0 14px;letter-spacing:1px;">
    <span leaf="">🌿 本文看点</span>
  </p>
  <section style="box-sizing:border-box;max-width:100%!important;display:flex;justify-content:space-between;">
    <section style="box-sizing:border-box;max-width:100%!important;flex:1;background:#f5f7f3;border-radius:6px;padding:16px 12px;margin-right:8px;text-align:center;">
      <p style="box-sizing:border-box;max-width:100%!important;font-size:14px;font-weight:800;color:#4a7c59;margin:0 0 8px;letter-spacing:1px;"><span leaf="">01</span></p>
      <p style="box-sizing:border-box;max-width:100%!important;font-size:13px;font-weight:500;color:#2c3a2e;margin:0;"><span leaf="">{{看点一}}</span></p>
    </section>
    <section style="box-sizing:border-box;max-width:100%!important;flex:1;background:#f5f7f3;border-radius:6px;padding:16px 12px;margin-right:8px;text-align:center;">
      <p style="box-sizing:border-box;max-width:100%!important;font-size:14px;font-weight:800;color:#4a7c59;margin:0 0 8px;letter-spacing:1px;"><span leaf="">02</span></p>
      <p style="box-sizing:border-box;max-width:100%!important;font-size:13px;font-weight:500;color:#2c3a2e;margin:0;"><span leaf="">{{看点二}}</span></p>
    </section>
    <section style="box-sizing:border-box;max-width:100%!important;flex:1;background:#f5f7f3;border-radius:6px;padding:16px 12px;text-align:center;">
      <p style="box-sizing:border-box;max-width:100%!important;font-size:14px;font-weight:800;color:#4a7c59;margin:0 0 8px;letter-spacing:1px;"><span leaf="">03</span></p>
      <p style="box-sizing:border-box;max-width:100%!important;font-size:13px;font-weight:500;color:#2c3a2e;margin:0;"><span leaf="">{{看点三}}</span></p>
    </section>
  </section>
</section>
```

---

## 组件 4 章节分割线（极淡灰绿细线 / 点线）

> 森语绿的分割线尽量"消失"。首选用 40px+ 上下间距代替（留白即分割线）；必须用线时，1px 极淡细线，居中，上下各 20px。点线 `· · ·` 作"呼吸暂停"备选。

```html
<section style="box-sizing:border-box;max-width:100%!important;padding:0 10px;">
  <section style="box-sizing:border-box;max-width:100%!important;height:1px;background:#dfe3dd;margin:0;">
    <span leaf=""><br></span>
  </section>
</section>
```

点线变体（不用实线时）：

```html
<section style="box-sizing:border-box;max-width:100%!important;padding:0 10px;">
  <p style="box-sizing:border-box;max-width:100%!important;text-align:center;font-size:12px;color:#9ca89d;letter-spacing:8px;margin:0;">
    <span leaf="">· · ·</span>
  </p>
</section>
```

---

## 组件 5 章节标题（森林绿编号 + 标题，底部极淡线）

> 森林绿文字编号 + 英文小标签 + 中文大标题，底部 1px 极淡线 `#dfe3dd`。编号用主色 `#4a7c59`、不加粗、不套背景药丸；标题用深墨绿 `#2c3a2e`、不加粗（靠字号与留白建立层级）。第一章 `margin-top:16px`，后续章节 `margin-top:40px`。无左边框、无背景色块。

```html
<section style="box-sizing:border-box;max-width:100%!important;margin-top:40px;margin-bottom:28px;padding:0 10px;">
  <section style="box-sizing:border-box;max-width:100%!important;display:flex;align-items:baseline;justify-content:space-between;margin-bottom:14px;border-bottom:1px solid #dfe3dd;padding-bottom:10px;">
    <section style="box-sizing:border-box;max-width:100%!important;display:flex;align-items:baseline;">
      <span style="font-size:20px;font-weight:500;color:#4a7c59;margin-right:14px;line-height:1.3;letter-spacing:1px;"><span leaf="">01</span></span>
      <section>
        <p style="box-sizing:border-box;max-width:100%!important;font-size:10px;color:#8ba78a;font-weight:500;letter-spacing:3px;margin:0 0 2px;text-transform:uppercase;">
          <span leaf="">{{ENGLISH TAG}}</span>
        </p>
        <h3 style="box-sizing:border-box;max-width:100%!important;font-size:18px;font-weight:500;color:#2c3a2e;margin:0;letter-spacing:0.3px;">
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
<span style="font-size:20px;font-weight:500;color:#4a7c59;margin-right:14px;line-height:1.3;letter-spacing:1px;"><span leaf="">∞</span></span>
```

---

## 组件 6 正文段落

> **关键规则**：每段主动识别 1~3 个关键短语，用**浅绿下划线（7d）**标记——这是本风格的核心视觉特征，让读者在留白中快速扫到每段重点。段落间距 12px（常规 1.5 倍），两端对齐。

**首段（开场白，偏诗意时采用）**：

```html
<p style="box-sizing:border-box;max-width:100%!important;margin-bottom:12px;font-size:15px;font-weight:500;line-height:1.85;text-align:justify;color:#2c3a2e;">
  <span leaf="">{{首段正文}}</span>
</p>
```

**基础段落**：

```html
<p style="box-sizing:border-box;max-width:100%!important;margin-bottom:12px;font-size:14px;line-height:1.85;text-align:justify;color:#3a4a3e;">
  <span leaf="">{{正文内容}}</span>
</p>
```

**带关键词下划线标记的段落**（推荐默认）：

```html
<p style="box-sizing:border-box;max-width:100%!important;margin-bottom:12px;font-size:14px;line-height:1.85;text-align:justify;color:#3a4a3e;">
  <span leaf="">{{前半句}}</span>
  <span style="border-bottom:1.5px solid #b5c8b0;font-weight:500;"><span leaf="">{{需要强调的关键短语}}</span></span>
  <span leaf="">{{后半句}}</span>
</p>
```

**标记原则**：每段选 1~3 个关键短语（4~15 字）加下划线，不要整段都标；优先标核心观点、结论判断、关键数据、专有名词；无重点的段落可不标。

---

## 组件 6b 子标题（`###` 小节标题）

> `###` 子标题用森林绿细左竖条 + 深墨绿标题，**不套用组件 5 的编号章节样式**（编号章节只给 `##`）。左竖条收紧为 3px 鼠尾草绿，贴合侘寂克制气质。

```html
<p style="box-sizing:border-box;max-width:100%!important;font-size:16px;font-weight:500;color:#2c3a2e;margin:28px 0 14px;padding-left:10px;border-left:3px solid #8ba78a;line-height:1.5;">
  <span leaf="">{{子标题}}</span>
</p>
```

---

## 组件 7 正文高亮样式（6 种变体 + 使用策略）

> **核心理念**：克制用色，森林绿只在真正需要的锚点出现（全文 ≤3 处）。主色只属于锚点层，不用于行内标记。
>
> **优先级**：① 7d 浅绿下划线（正文默认标记）→ ② 7a 普通加粗为主、森林绿加粗仅锚点（≤3）→ ③ 7b 浅绿底深绿字标签（每篇 2~4 个）→ ④ 7c 浅绿背景（次要）→ ⑤ 7e 荧光笔（偶尔长句强调）

### 7a. 加粗强调

普通加粗（默认，绝大部分加粗用这个）：

```html
<strong><span leaf="">普通加粗强调</span></strong>
```

森林绿加粗锚点（仅金句/产品名/CTA 等锚点，全文 ≤3 处）：

```html
<strong style="color:#4a7c59;"><span leaf="">森林绿加粗锚点</span></strong>
```

### 7b. 浅绿底深绿字标签（核心概念，每篇 2~4 个）

```html
<span style="background:#eef1ec;color:#4a7c59;padding:2px 6px;border-radius:3px;font-weight:500;"><span leaf="">关键词标签</span></span>
```

### 7c. 浅绿背景高亮（次要关键词）

```html
<span style="background:#eef1ec;padding:1px 6px;border-radius:3px;font-weight:500;color:#2c3a2e;"><span leaf="">浅绿背景关键词</span></span>
```

### 7d. 浅绿下划线（最常用，本风格标志性标记）

```html
<span style="border-bottom:1.5px solid #b5c8b0;font-weight:500;"><span leaf="">浅绿下划线关键词</span></span>
```

### 7e. 荧光笔效果（偶尔用于长句强调）

```html
<span style="background:linear-gradient(180deg,transparent 60%,#b5c8b0 60%);font-weight:500;color:#2c3a2e;"><span leaf="">荧光笔效果的重要长句</span></span>
```

### 7f. 行内代码

```html
<span style="background:#eef1ec;color:#3a4a3e;padding:1px 5px;border-radius:3px;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:14px;"><span leaf="">code</span></span>
```

---

## 组件 8 引用高亮块（3 种变体）

### 8a. 大引号金句（视觉重量：轻。首选，文艺静谧）

> 大号引号（辅色 `#8ba78a`）悬在文字上方，金句用正文色。适合散文中最有诗意的那句话，全文 1~2 次。

```html
<section style="box-sizing:border-box;max-width:100%!important;margin:0 0 24px;padding:0 10px;">
  <p style="box-sizing:border-box;max-width:100%!important;font-size:36px;color:#8ba78a;font-weight:500;margin:0;line-height:0.6;">
    <span leaf="">"</span>
  </p>
  <p style="box-sizing:border-box;max-width:100%!important;font-size:15px;color:#3a4a3e;margin:0;line-height:1.85;text-align:justify;">
    <span leaf="">{{金句}}</span>
  </p>
</section>
```

### 8b. 浅底左竖条引用（视觉重量：中。温和引用 / 资料性引用）

> 浅底 `#f5f7f3` + 左竖条 2px 辅色 `#8ba78a`。可在下方用注释色 10px 标注出处。不限制次数。

```html
<section style="box-sizing:border-box;max-width:100%!important;background:#f5f7f3;border-left:2px solid #8ba78a;padding:14px 16px;margin:0 0 24px;border-radius:0 4px 4px 0;">
  <p style="box-sizing:border-box;max-width:100%!important;font-size:14px;color:#3a4a3e;margin:0;line-height:1.85;text-align:justify;">
    <span leaf="">{{引用内容}}</span>
  </p>
  <p style="box-sizing:border-box;max-width:100%!important;font-size:10px;color:#9ca89d;margin:8px 0 0;">
    <span leaf="">—— {{出处}}</span>
  </p>
</section>
```

### 8c. 留白居中金句（视觉重量：极轻。极简诗意）

> 无引号、无边框、无底色。15px 正文色居中，上下各 24px 留白。靠"空"标记这句话的特别。适合短句（≤15 字）、哲思型句子。

```html
<p style="box-sizing:border-box;max-width:100%!important;font-size:15px;color:#3a4a3e;margin:24px 0;line-height:1.85;text-align:center;">
  <span leaf="">{{哲思短句}}</span>
</p>
```

### 8d. 居中金句分隔（章节间的过渡金句）

```html
<p style="box-sizing:border-box;max-width:100%!important;font-size:14px;color:#4a7c59;margin:0 0 24px;text-align:center;letter-spacing:1px;">
  <span leaf="">{{居中金句}}</span>
</p>
```

---

## 组件 9 提示 / 旁注块

### 9a. 旁注条（辅色左竖条 + 浅绿底，森语绿标准提示）

> 左竖条 3px 辅色 `#8ba78a` + 浅底 `#f5f7f3`，**不用顶部"提示/注意"标签**（在森语绿中过于吵闹，竖条本身就是标记）。文字用辅助文字色 `#7a857b`，13px。像正文旁轻声说的一句话。

```html
<section style="box-sizing:border-box;max-width:100%!important;background:#f5f7f3;border-left:3px solid #8ba78a;padding:12px 14px;margin:0 0 24px;border-radius:0 4px 4px 0;">
  <p style="box-sizing:border-box;max-width:100%!important;font-size:13px;color:#7a857b;margin:0;line-height:1.75;text-align:justify;">
    <span leaf="">{{旁注 / 温和提醒}}</span>
  </p>
</section>
```

### 9b. 温和留白提示（更轻，无底色）

```html
<section style="box-sizing:border-box;max-width:100%!important;padding:6px 0 4px;margin:0 0 16px;">
  <p style="box-sizing:border-box;max-width:100%!important;margin:0;font-size:13px;color:#7a857b;line-height:1.75;text-align:justify;">
    <span leaf="">{{温和提示}}</span>
  </p>
</section>
```

---

## 组件 10 内容标签组（STEP / SKILL / TOOL / CASE）

> 教程用 STEP、盘点用 SKILL/TOOL、案例用 CASE。森语绿**不用药丸编号、不用主色背景**——编号用辅色 `#8ba78a` 文字形式（`STEP 01` / `01`）。

### 10a. step-label（教程步骤 / 清单条目）

```html
<section style="box-sizing:border-box;max-width:100%!important;margin-bottom:22px;">
  <section style="box-sizing:border-box;max-width:100%!important;display:flex;align-items:center;gap:8px;margin-bottom:10px;">
    <span style="font-size:13px;font-weight:500;color:#8ba78a;letter-spacing:1px;"><span leaf="">STEP 01</span></span>
    <span style="font-size:15px;font-weight:500;color:#2c3a2e;"><span leaf="">{{步骤标题}}</span></span>
  </section>
  <p style="box-sizing:border-box;max-width:100%!important;font-size:14px;margin:0 0 16px;color:#3a4a3e;line-height:1.85;text-align:justify;">
    <span leaf="">{{步骤内容}}</span>
  </p>
</section>
```

`STEP 01` 可替换为 `SKILL 1`、`TOOL 摄像机`、`CASE 01`（盘点/案例场景）；盘点场景文字编号可改深墨绿 `#2c3a2e` 做次级层次。

### 10b. tool-card（工具 / 条目说明卡，轻卡片）

```html
<section style="box-sizing:border-box;max-width:100%!important;background:#f5f7f3;border-radius:6px;padding:16px 20px;margin:0 0 24px;">
  <p style="box-sizing:border-box;max-width:100%!important;font-size:14px;color:#3a4a3e;margin:0;line-height:1.85;text-align:justify;">
    <span leaf="">{{条目说明内容}}</span>
  </p>
</section>
```

---

## 组件 11 列表组件

### 11a. ordered-list（辅色圆标数字编号列表）

```html
<section style="box-sizing:border-box;max-width:100%!important;margin-bottom:24px;">
  <section style="box-sizing:border-box;max-width:100%!important;display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:#f5f7f3;color:#4a7c59;font-size:12px;font-weight:500;border-radius:50%;flex-shrink:0;margin-top:2px;"><span leaf="">1</span></span>
    <p style="box-sizing:border-box;max-width:100%!important;font-size:14px;color:#3a4a3e;margin:0;line-height:1.85;flex:1;"><span leaf="">{{列表项内容}}</span></p>
  </section>
  <section style="box-sizing:border-box;max-width:100%!important;display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:#f5f7f3;color:#4a7c59;font-size:12px;font-weight:500;border-radius:50%;flex-shrink:0;margin-top:2px;"><span leaf="">2</span></span>
    <p style="box-sizing:border-box;max-width:100%!important;font-size:14px;color:#3a4a3e;margin:0;line-height:1.85;flex:1;"><span leaf="">{{列表项内容}}</span></p>
  </section>
  <section style="box-sizing:border-box;max-width:100%!important;display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:#f5f7f3;color:#4a7c59;font-size:12px;font-weight:500;border-radius:50%;flex-shrink:0;margin-top:2px;"><span leaf="">3</span></span>
    <p style="box-sizing:border-box;max-width:100%!important;font-size:14px;color:#3a4a3e;margin:0;line-height:1.85;flex:1;"><span leaf="">{{列表项内容}}</span></p>
  </section>
</section>
```

### 11b. pill-list（无序要点，浅绿点前缀 + 说明）

```html
<section style="box-sizing:border-box;max-width:100%!important;margin-bottom:14px;">
  <p style="box-sizing:border-box;max-width:100%!important;margin:0 0 6px;">
    <span style="display:inline-block;font-size:14px;font-weight:500;color:#4a7c59;background:#eef1ec;padding:3px 10px;border-radius:999px;"><span style="display:inline-block;width:6px;height:6px;background:#8ba78a;border-radius:50%;margin-right:5px;vertical-align:middle;"><span leaf=""><br></span></span><span leaf="">{{要点标题}}</span></span>
  </p>
  <p style="box-sizing:border-box;max-width:100%!important;font-size:14px;color:#3a4a3e;margin:0;line-height:1.75;text-align:justify;">
    <span leaf="">{{要点说明}}</span>
  </p>
</section>
```

### 11c. timeline（时间线 / 递进脉络，访谈经历、案例演进）

```html
<section style="box-sizing:border-box;max-width:100%!important;display:flex;margin-bottom:24px;">
  <section style="box-sizing:border-box;max-width:100%!important;display:flex;flex-direction:column;align-items:center;margin-right:16px;flex-shrink:0;">
    <section style="box-sizing:border-box;max-width:100%!important;width:14px;height:14px;border-radius:50%;border:3px solid #8ba78a;background:#fafbf8;margin-top:4px;"><span leaf=""><br></span></section>
    <section style="box-sizing:border-box;max-width:100%!important;width:2px;background:#dfe3dd;flex:1;margin-top:4px;min-height:44px;"><span leaf=""><br></span></section>
  </section>
  <section style="box-sizing:border-box;max-width:100%!important;flex:1;padding-bottom:12px;">
    <p style="box-sizing:border-box;max-width:100%!important;margin:0 0 6px;font-size:15px;font-weight:500;color:#2c3a2e;"><span leaf="">{{节点标题}}</span></p>
    <p style="box-sizing:border-box;max-width:100%!important;font-size:14px;margin:0;color:#3a4a3e;line-height:1.85;text-align:justify;"><span leaf="">{{节点内容}}</span></p>
  </section>
</section>
```

最后一个节点去掉竖线段（删除内层第二个 `<section>` 竖条）。

---

## 组件 12 数据 / 要点卡片组

> 数字用深墨绿 `#2c3a2e`（**不用主色**——主色只用于章节编号），字号 24–28px weight 600。标签用注释色。卡片用浅底 `#f5f7f3`，靠留白区分，不用分割线。森语绿中"展示"不是"炫耀"。

### 两列版

```html
<section style="box-sizing:border-box;max-width:100%!important;display:flex;margin-bottom:24px;padding:0;">
  <section style="box-sizing:border-box;max-width:100%!important;flex:1;background:#f5f7f3;border-radius:6px;padding:18px 16px;margin-right:8px;text-align:center;">
    <p style="box-sizing:border-box;max-width:100%!important;font-size:28px;font-weight:600;color:#2c3a2e;margin:0 0 4px;line-height:1;"><span leaf="">{{数字}}</span></p>
    <p style="box-sizing:border-box;max-width:100%!important;font-size:12px;color:#9ca89d;margin:0;"><span leaf="">{{说明}}</span></p>
  </section>
  <section style="box-sizing:border-box;max-width:100%!important;flex:1;background:#f5f7f3;border-radius:6px;padding:18px 16px;text-align:center;">
    <p style="box-sizing:border-box;max-width:100%!important;font-size:28px;font-weight:600;color:#2c3a2e;margin:0 0 4px;line-height:1;"><span leaf="">{{数字}}</span></p>
    <p style="box-sizing:border-box;max-width:100%!important;font-size:12px;color:#9ca89d;margin:0;"><span leaf="">{{说明}}</span></p>
  </section>
</section>
```

### 三列版

```html
<section style="box-sizing:border-box;max-width:100%!important;display:flex;margin-bottom:24px;padding:0;">
  <section style="box-sizing:border-box;max-width:100%!important;flex:1;background:#f5f7f3;border-radius:6px;padding:16px 10px;margin-right:8px;text-align:center;">
    <p style="box-sizing:border-box;max-width:100%!important;font-size:24px;font-weight:600;color:#2c3a2e;margin:0 0 4px;line-height:1;"><span leaf="">{{数字}}</span></p>
    <p style="box-sizing:border-box;max-width:100%!important;font-size:11px;color:#9ca89d;margin:0;"><span leaf="">{{说明}}</span></p>
  </section>
  <section style="box-sizing:border-box;max-width:100%!important;flex:1;background:#f5f7f3;border-radius:6px;padding:16px 10px;margin-right:8px;text-align:center;">
    <p style="box-sizing:border-box;max-width:100%!important;font-size:24px;font-weight:600;color:#2c3a2e;margin:0 0 4px;line-height:1;"><span leaf="">{{数字}}</span></p>
    <p style="box-sizing:border-box;max-width:100%!important;font-size:11px;color:#9ca89d;margin:0;"><span leaf="">{{说明}}</span></p>
  </section>
  <section style="box-sizing:border-box;max-width:100%!important;flex:1;background:#f5f7f3;border-radius:6px;padding:16px 10px;text-align:center;">
    <p style="box-sizing:border-box;max-width:100%!important;font-size:24px;font-weight:600;color:#2c3a2e;margin:0 0 4px;line-height:1;"><span leaf="">{{数字}}</span></p>
    <p style="box-sizing:border-box;max-width:100%!important;font-size:11px;color:#9ca89d;margin:0;"><span leaf="">{{说明}}</span></p>
  </section>
</section>
```

### 表格（真实数据表，转 flex 行，禁止 `<table>`）

```html
<section style="box-sizing:border-box;max-width:100%!important;margin-bottom:24px;">
  <section style="box-sizing:border-box;max-width:100%!important;display:flex;background:#f5f7f3;border-radius:4px 4px 0 0;">
    <p style="box-sizing:border-box;max-width:100%!important;flex:1;font-size:13px;font-weight:500;color:#2c3a2e;padding:10px 12px;margin:0;"><span leaf="">{{列标题}}</span></p>
    <p style="box-sizing:border-box;max-width:100%!important;flex:1;font-size:13px;font-weight:500;color:#2c3a2e;padding:10px 12px;margin:0;"><span leaf="">{{列标题}}</span></p>
  </section>
  <section style="box-sizing:border-box;max-width:100%!important;display:flex;border-top:1px solid #d8ddd4;">
    <p style="box-sizing:border-box;max-width:100%!important;flex:1;font-size:14px;color:#3a4a3e;padding:10px 12px;margin:0;"><span leaf="">{{内容}}</span></p>
    <p style="box-sizing:border-box;max-width:100%!important;flex:1;font-size:14px;color:#3a4a3e;padding:10px 12px;margin:0;"><span leaf="">{{内容}}</span></p>
  </section>
</section>
```

---

## 组件 13 标签胶囊

浅绿底深绿字（默认）：

```html
<span style="display:inline-block;background:#eef1ec;color:#4a7c59;font-size:12px;font-weight:500;padding:2px 10px;border-radius:4px;margin-right:6px;"><span leaf="">标签名</span></span>
```

森林绿描边（轻量）：

```html
<span style="display:inline-block;border:1px solid #8ba78a;color:#4a7c59;font-size:12px;font-weight:500;padding:1px 10px;border-radius:4px;margin-right:6px;"><span leaf="">标签名</span></span>
```

---

## 组件 14 图片容器

> 白底 + 极淡浅边框 `#d8ddd4`，圆角 4px，**无阴影**（森语绿不用投影）；`display:block;margin:16px auto` 居中。图片占比高、图文并茂是森语绿特征。

```html
<section style="box-sizing:border-box;max-width:100%!important;background:#ffffff;border-radius:4px;padding:6px;border:1px solid #d8ddd4;margin-bottom:8px;">
  <section style="box-sizing:border-box;max-width:100%!important;margin:0;border-radius:4px;overflow:hidden;">
    <span leaf=""><img src="{{图片URL}}" style="box-sizing:border-box;max-width:100%!important;height:auto;display:block;margin:0 auto;"></span>
  </section>
</section>
```

带说明文字时，图片 `margin-bottom` 改 `8px`，其后加：

```html
<p style="box-sizing:border-box;max-width:100%!important;font-size:11px;color:#9ca89d;text-align:center;margin:0 0 24px;">
  <span leaf="">— {{图片说明}}</span>
</p>
```

GIF 动图（加浅绿角标，无主色）：

```html
<section style="box-sizing:border-box;max-width:100%!important;background:#ffffff;border-radius:4px;padding:6px;border:1px solid #d8ddd4;margin-bottom:8px;">
  <section style="box-sizing:border-box;max-width:100%!important;margin:0;border-radius:4px;overflow:hidden;">
    <span leaf=""><img src="{{动图URL.gif}}" style="box-sizing:border-box;max-width:100%!important;height:auto;display:block;margin:0 auto;"></span>
  </section>
</section>
<p style="box-sizing:border-box;max-width:100%!important;text-align:center;margin:0 0 24px;">
  <span style="display:inline-block;background:#f5f7f3;color:#8ba78a;font-size:11px;font-weight:500;padding:1px 8px;border-radius:4px;margin-right:6px;"><span leaf="">GIF 动图</span></span>
  <span style="box-sizing:border-box;max-width:100%!important;font-size:11px;color:#9ca89d;"><span leaf="">{{动图说明}}</span></span>
</p>
```

多行代码块用通用增量库 `common-components.md` 的 1a 深色 / 1b 浅色（左竖条换 `#8ba78a`，浅色版用 `#f5f7f3` 底），禁 `white-space:pre`。

---

## 组件 15 END 结尾分割线

> 极淡灰绿细线 + 森林绿 `END` 小字，无红色渐变（森语绿分割线趋近于零）。

```html
<section style="box-sizing:border-box;max-width:100%!important;padding:0 10px;">
  <section style="box-sizing:border-box;max-width:100%!important;text-align:center;margin:0 0 32px;">
    <section style="box-sizing:border-box;max-width:100%!important;display:flex;align-items:center;justify-content:center;">
      <span style="height:1px;width:60px;background:#dfe3dd;margin-right:12px;"><span leaf=""><br></span></span>
      <span style="font-size:11px;color:#4a7c59;letter-spacing:3px;font-weight:500;"><span leaf="">END</span></span>
      <span style="height:1px;width:60px;background:#dfe3dd;margin-left:12px;"><span leaf=""><br></span></span>
    </section>
  </section>
</section>
```

---

## 组件 16 尾部作者签名区

> 固定签名文案以正文段落形式呈现；有个人名片/引导图素材才放图，无素材整块删。语气温暖但不热烈（"祝你今天平静"一类），不写"求点赞"。

```html
<section style="box-sizing:border-box;max-width:100%!important;padding:0 10px;">
  <section style="box-sizing:border-box;max-width:100%!important;text-align:center;margin-bottom:10px;border-radius:6px;overflow:hidden;">
    <span leaf=""><img src="{{个人名片或引导图URL，无则删本 section}}" style="box-sizing:border-box;max-width:100%!important;height:auto;display:block;margin:0 auto;"></span>
  </section>
  <p style="box-sizing:border-box;max-width:100%!important;margin-bottom:20px;font-size:14px;line-height:1.85;text-align:justify;color:#3a4a3e;">
    <span leaf="">我是 {{作者名}}，{{一句话简介，如：在自然里写字的人}}。</span>
  </p>
  <p style="box-sizing:border-box;max-width:100%!important;margin-bottom:20px;font-size:14px;line-height:1.85;text-align:justify;color:#3a4a3e;">
    <span leaf="">如果你觉得今天这篇有收获，欢迎</span>
    <strong style="color:#4a7c59;"><span leaf="">点赞、在看、转发</span></strong>
    <span leaf="">三连，我们下篇见。</span>
  </p>
</section>
```

---

## 完整文章模板骨架

```html
<section style="box-sizing:border-box;max-width:100%!important;max-width:677px;margin:0 auto;background:#fafbf8;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;color:#3a4a3e;font-size:14px;line-height:1.85;letter-spacing:0.3px;overflow-x:hidden;">

  <!-- 1. 开头引言卡片（组件2，米白便签 + 森林绿引号） -->

  <!-- 2. 前言正文（组件6 段落 × N，放 0 10px 边距 section，第一章之前的开场白） -->

  <!-- 3. 前言导读（组件3，3+ 章节时生成，精选 3 看点） -->

  <!-- 4. 第一章（组件5 章节标题，margin-top:16px） -->
  <!--    章内：组件6 正文 + 6b 子标题 + 7 行内高亮 + 8 引用 + 9 提示 + 10 标签组 + 11 列表 + 12 数据 + 14 图片 -->

  <!-- 5. 章节分割线（组件4 极淡细线 / 点线）+ 第二章…第N章（组件5，margin-top:40px） -->

  <!-- 6. 结语章（组件5 变体：编号 ∞，英文 THE END） -->

  <!-- 7. END 分割线（组件15） -->

  <!-- 8. 尾部签名（组件16） -->

</section>
```

**骨架铁律**：引言卡在最前；导读区在前言正文之后、第一章之前；章节之间用组件 4 极淡细线分隔；一篇只有一个 END + 一个签名区。

---

## 视觉层级（3 层递进）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **锚点层** | 森林绿加粗 7a2 / 章节编号（组件5）/ 大引号金句 8a | 金句、核心锚点、章节数字 | 全文 ≤3 处主色 |
| **标记层** | 浅绿下划线 7d（默认）/ 浅绿底标签 7b | 正文关键词强调 | 每段 1~3 处 |
| **容器层** | 左竖条引用 8b / 旁注 9a / 标签组 10 / 卡片 11-12 | 引用、旁注、提示、结构化信息 | 按需 |

**克制原则**：
- 森林绿主色 `#4a7c59` **仅作章节编号与 ≤3 处锚点**，全文曝光面积 ≤1%——这是森语绿区别于所有主题的核心数字
- 主色背景药丸**绝不使用**；正文关键词标签用浅绿底深绿字 7b（与引言卡的浅绿下划线呼应）
- 引用/提示统一用左竖条 + 浅底，**不用四周虚线框**（dashed，待补素材占位除外）
- 禁用 `box-shadow`；圆角 ≤8px；渐变仅极少量用于荧光笔 7e，分割线用纯色极淡线

---

## 文章类型 → 组件组合配方

按 SKILL.md 第 3 步判定的文章类型选配方；核心组件构成本篇排版主旋律，点缀组件按内容出现处使用，一篇文章点缀组件种类 ≤3，避免花哨。

| 文章类型 | 核心组件组合 | 点缀组件 |
|---|---|---|
| 随笔/叙事/冥想 | 正文6（首段加大）+ 大引号金句8a + 留白居中8c | 浅底引用8b、旁注9a |
| 生活方式/图文 | 正文6 + 图片14（高占比）+ 留白居中8c | 大引号8a、数据卡12 |
| 观点/议论 | 正文6 + 留白居中金句8c + 浅底引用8b | 旁注9a、浅绿下划线7d |
| 教程/方法 | step-label 10a + 代码块（通用库1b浅色）+ ordered-list 11a | 旁注9a、tool-card 10b |
| 盘点/清单 | skill/tool-label 10a + tool-card 10b + pill-list 11b | 数据卡12、标签胶囊13 |
| 访谈/人物 | 正文6 + 大引号金句8a（引语）+ timeline 11c（经历脉络） | 留白居中8c、浅底引用8b |
| 数据/复盘 | 数据卡12（两列/三列）+ flex表格12 + ordered-list 11a | 旁注9a、荧光笔7e |

所有类型共用固定结构：引言卡 2 + 导读 3（3+ 章节）+ 编号章节 5 + END 15 + 签名 16。

---

## Markdown → 森语绿排版 映射规则

| Markdown 元素 | 对应组件 | 说明 |
|---|---|---|
| `# 标题` | 不使用 | 公众号文章标题在平台设置 |
| 文章开头 `> 引言金句` | 组件 2 米白便签引言卡 | 视角与外标题错开 |
| `## 章节标题` | 组件 5 章节标题 | 森林绿编号 01/02…，末章 ∞ + THE END |
| `### 子标题` | 组件 6b 森林绿左竖条小标题 | 不套编号章节样式 |
| 普通段落 | 组件 6 正文段落 | 每段主动标 1~3 处浅绿下划线 7d |
| `**加粗文字**` | 组件 7a 普通加粗（默认）/ 森林绿加粗（锚点 ≤3） | 普通加粗为主 |
| `==高亮文字==` | 组件 7b 浅绿底深绿字标签 | 核心概念 |
| `<u>下划线</u>` / `++文字++` | 组件 7d 浅绿下划线 | 次要强调 |
| `~~删除线~~` | `text-decoration:line-through` + 注释色 `#9ca89d` | 被轻划的念头 |
| 行内 `` `code` `` | 组件 7f 行内代码 | 浅绿底 |
| `> 引用段落`（金句） | 组件 8a 大引号 / 8c 留白居中 | 核心金句 |
| `> 引用段落`（资料） | 组件 8b 浅底左竖条 | 资料性引用 |
| 核心金句 | 组件 8a / 8d 居中金句 | 视觉焦点 |
| 操作步骤 | 组件 10a step-label | STEP 01/02… 辅色文字编号 |
| 技能/工具清单 | 组件 10a skill/tool-label + 10b tool-card | |
| 案例/经历脉络 | 组件 10a case-label / 11c timeline | |
| Prompt 提示词 | 组件 8b 浅底引用 / 通用库 1b（长多行，左竖条换 `#8ba78a`） | |
| ` ``` 多行代码块 ``` ` | 通用库 1a 深色 / 1b 浅色（左竖条换 `#8ba78a`） | 每行一个 `<p style="margin:0">` |
| 并列要点 | 组件 11b pill-list | 浅绿点 |
| `1. 2. 3.` 编号列表 | 组件 11a ordered-list | 辅色圆标 |
| 数据展示 | 组件 12 数据卡片组 / flex表格 | 深墨绿数字（非主色） |
| 注意/温和提醒 | 组件 9a 旁注条 / 9b 留白提示 | 无吵闹标签 |
| 行内标签 | 组件 13 标签胶囊 | 浅绿底默认 |
| `---` | 组件 4 章节分割线（极淡细线 / 点线） | 优先用留白替代 |
| `![](图片)` | 组件 14 图片容器 | 白底浅边 + 说明，无阴影 |
| 文末 | 组件 15 END + 16 签名 | |
