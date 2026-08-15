# 公众号排版组件库 —— 墨金雅（ink-gold）

> **使用说明**：本组件库为「墨金雅」主题（墨色为底、金饰为点缀），所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：墨黑 `#1e1f23` 为底色基因、香槟金 `#c9a96e` 做精致锚点（章节编号 / 细线 / 金句装饰 / 签名），经典比例、留白克制、高端品牌叙事质感。适配人物访谈、品牌叙事、高端内容。
>
> **核心气质**：墨色为底、金饰为点缀；正文/标题用暖灰白 `#d4d0c8`（非纯白），金仅作锚点点缀不铺面（不在大色块上铺金）。编号章节 + 引言卡 + 签名区的经典编辑骨架，适合访谈、叙事、品牌、深度内容。
>
> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class/id、`position:fixed/absolute`、`float`、`@media`/`@keyframes`、`display:grid`、`var()`/`calc()`/`hsl()`
> - ✅ 支持内联 `style`、`display:flex`（有限）、`linear-gradient`、`border-radius`、`<section>/<p>/<span>/<strong>/<em>/<img>/<br>/<h3>` 等基础标签
> - ⚠️ 墨金雅为暗色主题，**禁用阴影**（暗底阴影不可见，且非精装书气质），层次靠明度递进与细线表达
>
> **WeChat 兼容铁律**（本主题组件全部已按此写好，改动时必须遵守）：
> - 所有"装饰性空元素"（金色渐变分割线、END 短线、时间线圆点/竖线、金点）**必须在内部放 `<span leaf=""><br></span>` 占位**，否则微信会剥掉样式
> - **不要把 `font-size`/`border-bottom` 打在 `<strong>` 上**，也不要在同一个 `<p>` 里混多个不同 `font-size`——微信编辑器会自动"纠正"导致样式被重写。正确做法：拆成多个 `<p>`，每个 `<p>` 只有一个字号；高亮样式统一挂在外层 `<span>` 上
> - 不用 `position:absolute` 做划线/高亮，删除线用 `text-decoration:line-through`
> - 结构化区域（如引言卡右下署名、图片说明）没有内容时**整块删掉**，不留空 section
> - 每个元素带 `box-sizing:border-box;max-width:100%!important`

---

## 设计变量速查表

```
主色调（墨黑）：   #1e1f23（墨黑 -- 品牌主色，用于按钮文字/底色基因，非正文色）
点缀色（香槟金）： #c9a96e（香槟金 -- 全文仅做点缀：章节编号、关键引号、极少高亮、细线；金不铺面）
辅色：           #3a3c40（深灰 -- 卡片边框或文字区分的次要色）
浅底：           #252525（卡片/引用块/信息卡底色 -- 比页面底色稍亮一级，在暗色中制造微妙层次）
浅边框：         #333333（暗色卡片边框 -- 极低调，仅在需要明确边界时使用）
金浅底（高亮）： rgba(201,169,110,0.12)（金色 12% 透明底，行内高亮背景色）
标题色：         #d4d0c8（暖灰白 -- 标题，有温度的"白"，不是纯白 #fff）
正文色：         #d4d0c8（暖灰白 -- 正文与标题同色系，靠字号和 weight 区分层级）
辅助文字色：     #9e9a90（中灰 -- 次要信息、说明文字，对比度约 5.5:1）
注释色：         #6e6a62（深灰 -- 日期、编号、最小文字层级，对比度约 4.5:1 仍可读）
分割线色：       #3a3a3a（暗灰 -- 分割线几乎融入底色，仅靠微弱亮度差表达分隔）
页面底色：       #1a1a1a（极深灰底 -- 不是纯黑 #000，带一丝暖意，像精装书内页）
正文字号：       14px（不可改）
行高：           1.9（暗色背景需要更多行间距保持可读性）
字间距：         0.5px
段落间距：       10px（正文段间距；组件间距见各组件）
章节标题字号：   18-22px
章节间距：       36px 上（首章 16px）
最大宽度：       677px
内容区边距：     0 10px（左右各 10px）
正文关键词下划线 CSS：border-bottom:2px solid #c9a96e;font-weight:600;
```

字体栈：`-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif`

**墨金雅设计禁区（务必遵守）**：
- 不要在非暗色背景上使用这套色彩系统（墨金雅的暗底是基因，不是可选参数）
- 不要使用金色做大面积背景——金色只在"点"和"线"层级出现（文字/下划线/编号/细线），不做"面"
- 不要使用纯白 `#fff` 或纯黑 `#000`；正文/标题用 `#d4d0c8`，页面底用 `#1a1a1a`
- 不要使用鲜艳颜色（饱和度 > 30% 的非金色系会在暗底上"跳"得太厉害）
- 不要使用阴影（暗色背景中阴影不可见）
- 不要使用过大圆角（>6px）——精装书是方正的

**金色配额（关键）**：金色是这本书的"金边"，每出现一次都像书页间夹了一片金箔。全文金色出现建议 ≤5 处，优先顺序：章节编号 > 居中金句 > 金色下划线 > 步骤编号 > 金线装饰。编排前先"预算"金用量。

---

## 组件 1 全局容器

```html
<section style="max-width:677px;margin:0 auto;background:#1a1a1a;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;color:#d4d0c8;line-height:1.9;letter-spacing:0.5px;overflow-x:hidden;box-sizing:border-box;">

  <!-- 所有组件放在这里 -->

</section>
```

---

## 组件 2 开头引言卡片（墨金精致 · 档案扉页式）

> **文案策略（先读，比代码重要）**：
> - 引言卡金句和公众号外标题是**两层**，视角要错开——外标题卖"为什么点开"，引言卡卖"核心观点是什么"
> - 已知外标题时，金句**禁止原样复述**其核心关键词；从文章第一段或核心论点提炼一句有张力的判断句
> - 右下署名按文章实际作者填，未知则整行删掉，**不要固定写"甲木"**
> - 金色在头部仅出现 1-2 次（金竖线 + 金标签文字计为 1 次金色出现）；标签用金色**文字**而非金底药丸，金底药丸仅在尾部点赞按钮出现

```html
<section style="margin:10px 10px 32px;background:#252525;border-left:2px solid #c9a96e;border-radius:0 8px 8px 0;padding:24px 22px 20px;box-sizing:border-box;max-width:100%!important;overflow:hidden;">
  <p style="font-size:34px;color:#c9a96e;font-weight:400;margin:0;line-height:0.6;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">"</span>
  </p>
  <p style="font-size:11px;color:#c9a96e;font-weight:700;letter-spacing:2px;margin:14px 0 10px;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{ENGLISH TAG}}</span>
  </p>
  <p style="font-size:16px;font-weight:500;color:#d4d0c8;margin:0 0 8px;line-height:1.9;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{金句中段}}</span>
    <span style="border-bottom:2px solid #c9a96e;font-weight:600;"><span leaf="">{{高亮关键词}}</span></span>
    <span leaf="">{{金句收尾}}</span>
  </p>
  <p style="text-align:right;font-size:12px;color:#9e9a90;margin:10px 0 0;letter-spacing:1px;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">—— {{作者名，未知则删整行}}</span>
  </p>
</section>
```

---

## 组件 3 前言导读区域（本文看点，三列目录卡）

> 3 个及以上章节时生成。金色文字编号 + 暗色卡片；展示**精选 3 个核心看点**（即前 3 章节的目录卡），不是全量章节列表。编号用金色**文字**而非金底。
>
> 若无英文小标签，把对应 `<p>` 整行删掉。

```html
<section style="padding:0 10px 32px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:13px;color:#c9a96e;font-weight:700;letter-spacing:2px;margin:0 0 14px;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">本文看点</span>
  </p>
  <section style="display:flex;justify-content:space-between;box-sizing:border-box;max-width:100%!important;">
    <section style="flex:1;background:#252525;border-radius:8px;padding:16px 12px;margin-right:8px;text-align:center;border:1px solid #333333;box-sizing:border-box;max-width:100%!important;">
      <p style="display:inline-block;color:#c9a96e;font-size:16px;font-weight:700;margin:0 0 8px;letter-spacing:1px;box-sizing:border-box;max-width:100%!important;"><span leaf="">01</span></p>
      <p style="font-size:13px;font-weight:500;color:#d4d0c8;margin:0;line-height:1.6;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{看点一}}</span></p>
    </section>
    <section style="flex:1;background:#252525;border-radius:8px;padding:16px 12px;margin-right:8px;text-align:center;border:1px solid #333333;box-sizing:border-box;max-width:100%!important;">
      <p style="display:inline-block;color:#c9a96e;font-size:16px;font-weight:700;margin:0 0 8px;letter-spacing:1px;box-sizing:border-box;max-width:100%!important;"><span leaf="">02</span></p>
      <p style="font-size:13px;font-weight:500;color:#d4d0c8;margin:0;line-height:1.6;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{看点二}}</span></p>
    </section>
    <section style="flex:1;background:#252525;border-radius:8px;padding:16px 12px;text-align:center;border:1px solid #333333;box-sizing:border-box;max-width:100%!important;">
      <p style="display:inline-block;color:#c9a96e;font-size:16px;font-weight:700;margin:0 0 8px;letter-spacing:1px;box-sizing:border-box;max-width:100%!important;"><span leaf="">03</span></p>
      <p style="font-size:13px;font-weight:500;color:#d4d0c8;margin:0;line-height:1.6;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{看点三}}</span></p>
    </section>
  </section>
</section>
```

---

## 组件 4 章节分割线（金线渐变 · 暗调）

> 一条极淡的暗灰线，中央透出一缕香槟金——像书页间的纹理变化，读者几乎注意不到但潜意识里感知到分隔。装饰性空元素，内部必须放 `<span leaf=""><br></span>`。
>
> 金色变体（全书级部分切换，全文 ≤1 次）：把渐变中央的金色加粗，或在 `<p>` 中央放一个金色微型菱形 `◆`（金色文字，消耗 1 次金色配额）。

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="height:1px;background:linear-gradient(to right,transparent,#3a3a3a,#c9a96e,#3a3a3a,transparent);margin:0;box-sizing:border-box;max-width:100%!important;">
    <span leaf=""><br></span>
  </section>
</section>
```

**金色菱形变体**（全文 ≤1 次）：

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <p style="text-align:center;font-size:10px;color:#c9a96e;letter-spacing:8px;margin:0;line-height:1;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">— ◆ —</span>
  </p>
</section>
```

---

## 组件 5 章节标题（金色编号 + 墨黑标题，含 ∞ 末章变体）

> **招牌特性①**：章节**自动编号** `01 / 02 / 03 …`，末章用 `∞`。金色编号独占一行（字号 22px，weight 400，金本身就足够，不加粗），下方标题与编号同色系（暖灰白 `#d4d0c8`，18-20px，weight 500）。
>
> 编号不使用圆形/药丸包裹、不加粗、不用左边框——金色数字在暗色页面上已足够夺目。第一章 `margin-top:16px`，后续章节 `margin-top:48px`。

```html
<section style="margin-top:48px;margin-bottom:28px;padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:22px;color:#c9a96e;font-weight:400;letter-spacing:2px;margin:0 0 6px;line-height:1.2;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">01</span>
  </p>
  <h3 style="font-size:19px;font-weight:500;color:#d4d0c8;margin:0;letter-spacing:0.5px;line-height:1.5;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{中文章节标题}}</span>
  </h3>
</section>
```

**结语章节变体**（编号用 `∞` 替代数字，英文标签用 `THE END` / `EPILOGUE`）：

```html
<section style="margin-top:48px;margin-bottom:28px;padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:28px;color:#c9a96e;font-weight:400;letter-spacing:2px;margin:0 0 6px;line-height:1.2;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">∞</span>
  </p>
  <h3 style="font-size:19px;font-weight:500;color:#d4d0c8;margin:0;letter-spacing:0.5px;line-height:1.5;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{结语章标题}}</span>
  </h3>
</section>
```

---

## 组件 6 正文段落（含金下划线）

> **招牌特性②**：每段主动识别 1~3 个关键短语，用**香槟金下划线**标记——这是本风格的核心视觉特征，让读者快速扫到每段重点。
>
> 正文基准：`14px / 1.9 行高 / 0.5px 字间距 / 正文色 #d4d0c8 / margin:0 0 10px / text-align:justify`。首段字号可升至 15px、weight 400（像精装书正文第一段稍大但不喧哗）。

**基础段落**：

```html
<p style="margin-bottom:10px;font-size:14px;line-height:1.9;letter-spacing:0.5px;text-align:justify;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">{{正文内容}}</span>
</p>
```

**带关键词下划线标记的段落**（推荐默认）：

```html
<p style="margin-bottom:10px;font-size:14px;line-height:1.9;letter-spacing:0.5px;text-align:justify;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">{{前半句}}</span>
  <span style="border-bottom:2px solid #c9a96e;font-weight:600;"><span leaf="">{{需要强调的关键短语}}</span></span>
  <span leaf="">{{后半句}}</span>
</p>
```

**标记原则**：每段选 1~3 个关键短语（4~15 字）加下划线，不要整段都标；优先标核心观点、结论判断、关键数据、专有名词；无重点的段落可不标。金色下划线计入金色总配额。

---

## 组件 6b 子标题（`###` 小节标题）

> `###` 子标题用**金色细左竖条** + 暖灰白标题，**不套用组件 5 的编号章节样式**（编号章节只给 `##`）。金色仅作 2px 细线锚点，不做编号。

```html
<p style="font-size:16px;font-weight:500;color:#d4d0c8;margin:28px 0 14px;padding-left:10px;border-left:2px solid #c9a96e;line-height:1.5;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">{{子标题}}</span>
</p>
```

---

## 组件 7 行内高亮样式（6 种变体 + 使用策略）

> **核心理念**：克制用色，香槟金只在真正需要的锚点出现。
>
> **优先级**：① 7d 金色下划线（正文默认标记）→ ② 7a 普通加粗为主、金色加粗仅锚点 → ③ 7b 浅金底标签（每篇 2~4 个）→ ④ 7c 浅金背景（次要）→ ⑤ 7e 荧光笔（偶尔长句强调）→ ⑥ 7f 行内代码。

### 7a. 加粗强调

普通加粗（默认，绝大部分加粗用这个）：

```html
<strong><span leaf="">普通加粗强调</span></strong>
```

金色加粗（仅限品牌名/步骤/CTA 等锚点，全文 ≤5 处，计入金色配额）：

```html
<strong style="color:#c9a96e;"><span leaf="">金色加粗锚点</span></strong>
```

### 7b. 浅金底标签（核心概念，每篇 2~4 个）

```html
<span style="background:rgba(201,169,110,0.12);color:#c9a96e;padding:2px 6px;border-radius:3px;font-weight:600;box-sizing:border-box;max-width:100%!important;"><span leaf="">关键词标签</span></span>
```

### 7c. 浅金背景高亮（次要关键词）

```html
<span style="background:rgba(201,169,110,0.12);padding:1px 6px;border-radius:3px;font-weight:600;color:#d4d0c8;box-sizing:border-box;max-width:100%!important;"><span leaf="">浅金背景关键词</span></span>
```

### 7d. 金色下划线（最常用，本风格标志性标记）

```html
<span style="border-bottom:2px solid #c9a96e;font-weight:600;box-sizing:border-box;max-width:100%!important;"><span leaf="">金色下划线关键词</span></span>
```

### 7e. 荧光笔效果（偶尔用于长句强调）

```html
<span style="background:linear-gradient(180deg,transparent 60%,rgba(201,169,110,0.28) 60%);font-weight:700;color:#d4d0c8;box-sizing:border-box;max-width:100%!important;"><span leaf="">荧光笔效果的重要长句</span></span>
```

### 7f. 行内代码

```html
<span style="background:#222225;color:#d4d0c8;padding:1px 5px;border-radius:3px;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;box-sizing:border-box;max-width:100%!important;"><span leaf="">code</span></span>
```

---

## 组件 8 引用高亮块（3 种变体）

### 8a. 居中金句（视觉焦点最强，核心金句，消耗 1 次金色配额）

> 文字居中，上方金色左引号（40px 金饰悬挂）。适合全文最重要的 1-2 句金句。不要放入超过 25 字的内容。

```html
<section style="margin:0 0 24px;padding:20px 16px;text-align:center;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:34px;color:#c9a96e;font-weight:400;margin:0 0 6px;line-height:0.6;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">"</span>
  </p>
  <p style="font-size:16px;font-weight:500;color:#d4d0c8;margin:0;line-height:1.9;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{核心观点或关键金句}}</span>
  </p>
</section>
```

### 8b. 暗色卡片引用（资料引用，消耗 1 次金色配额：左竖线）

```html
<section style="background:#252525;border-left:2px solid #c9a96e;border-radius:0 8px 8px 0;padding:14px 18px;margin:0 0 24px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:14px;color:#d4d0c8;margin:0;line-height:1.85;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{引用内容，可含 7d 金色下划线等内联样式}}</span>
  </p>
</section>
```

### 8c. 金色小标引用（要点提取，消耗 1 次金色配额：标签文字）

```html
<section style="background:#252525;border-radius:8px;padding:14px 18px;margin:0 0 24px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:9px;color:#c9a96e;font-weight:700;letter-spacing:2px;margin:0 0 8px;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">EXCERPT</span>
  </p>
  <p style="font-size:14px;color:#d4d0c8;margin:0;line-height:1.85;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{要点提取}}</span>
  </p>
</section>
```

---

## 组件 9 提示 / 旁注条

### 9a. 金色提示条（重要提醒、核心结论，消耗 1 次金色配额：标签文字）

```html
<section style="background:#252525;border-radius:8px;padding:14px 18px;margin:0 0 24px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:9px;color:#c9a96e;font-weight:700;letter-spacing:2px;margin:0 0 8px;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">NOTE</span>
  </p>
  <p style="font-size:13px;color:#9e9a90;margin:0;line-height:1.75;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{重要提示或核心结论}}</span>
  </p>
</section>
```

### 9b. 无金旁注（普通提示，不消耗金色配额，不限次数）

```html
<section style="background:#252525;border-radius:8px;padding:14px 18px;margin:0 0 24px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:13px;color:#9e9a90;margin:0;line-height:1.75;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{提示内容}}</span>
  </p>
</section>
```

---

## 组件 10 内容标签组（STEP / SKILL / TOOL / CASE）

> 教程用 STEP、盘点用 SKILL/TOOL、案例用 CASE。金色**文字**标签 + 暖灰白标题（不套金底药丸）。
>
> `STEP 01` 可替换为 `SKILL 1`、`TOOL 摄像机`、`CASE 01`；一组步骤编号计为 1 次金色配额。

### 10a. step-label（教程步骤）

```html
<section style="margin-bottom:22px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;align-items:center;gap:8px;margin-bottom:10px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-block;color:#c9a96e;font-size:11px;font-weight:700;letter-spacing:2px;box-sizing:border-box;max-width:100%!important;"><span leaf="">STEP 01</span></span>
    <span style="font-size:16px;font-weight:500;color:#d4d0c8;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{步骤标题}}</span></span>
  </section>
  <p style="font-size:14px;margin:0 0 16px;color:#d4d0c8;line-height:1.9;letter-spacing:0.5px;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{步骤内容}}</span>
  </p>
</section>
```

### 10b. tool-card（工具/条目说明卡）

```html
<section style="background:#252525;border-radius:8px;padding:16px 20px;border:1px solid #333333;margin-bottom:24px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:14px;color:#d4d0c8;margin:0;line-height:1.9;letter-spacing:0.5px;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{条目说明内容}}</span>
  </p>
</section>
```

---

## 组件 11 列表组件

### 11a. ordered-list（金色细环数字编号列表）

> 金色细环（1px 金边 + 金字）替代红底圆标——金仅作细线锚点。

```html
<section style="margin-bottom:24px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:1px solid #c9a96e;color:#c9a96e;font-size:12px;font-weight:700;border-radius:50%;flex-shrink:0;margin-top:2px;box-sizing:border-box;max-width:100%!important;"><span leaf="">1</span></span>
    <p style="font-size:14px;color:#d4d0c8;margin:0;line-height:1.9;letter-spacing:0.5px;flex:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{列表项内容}}</span></p>
  </section>
  <section style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:1px solid #c9a96e;color:#c9a96e;font-size:12px;font-weight:700;border-radius:50%;flex-shrink:0;margin-top:2px;box-sizing:border-box;max-width:100%!important;"><span leaf="">2</span></span>
    <p style="font-size:14px;color:#d4d0c8;margin:0;line-height:1.9;letter-spacing:0.5px;flex:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{列表项内容}}</span></p>
  </section>
  <section style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:1px solid #c9a96e;color:#c9a96e;font-size:12px;font-weight:700;border-radius:50%;flex-shrink:0;margin-top:2px;box-sizing:border-box;max-width:100%!important;"><span leaf="">3</span></span>
    <p style="font-size:14px;color:#d4d0c8;margin:0;line-height:1.9;letter-spacing:0.5px;flex:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{列表项内容}}</span></p>
  </section>
</section>
```

### 11b. pill-list（无序要点，金点 + 金描边胶囊）

```html
<section style="margin-bottom:14px;box-sizing:border-box;max-width:100%!important;">
  <p style="margin:0 0 6px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-block;font-size:14px;font-weight:500;color:#c9a96e;border:1px solid #c9a96e;padding:3px 10px;border-radius:999px;box-sizing:border-box;max-width:100%!important;"><span style="display:inline-block;width:6px;height:6px;background:#c9a96e;border-radius:50%;margin-right:5px;vertical-align:middle;box-sizing:border-box;max-width:100%!important;"><span leaf=""><br></span></span><span leaf="">{{要点标题}}</span></span>
  </p>
  <p style="font-size:14px;color:#9e9a90;margin:0;line-height:1.7;letter-spacing:0.5px;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{要点说明}}</span>
  </p>
</section>
```

### 11c. timeline（时间线 / 递进脉络，访谈经历、案例演进）

> 金色细环节点 + 金色细竖线（薄线锚点）。最后一个节点去掉竖线段。

```html
<section style="display:flex;margin-bottom:24px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;flex-direction:column;align-items:center;margin-right:16px;flex-shrink:0;box-sizing:border-box;max-width:100%!important;">
    <section style="width:14px;height:14px;border-radius:50%;border:2px solid #c9a96e;background:#1a1a1a;margin-top:4px;box-sizing:border-box;max-width:100%!important;"><span leaf=""><br></span></section>
    <section style="width:1px;background:#c9a96e;flex:1;margin-top:4px;min-height:44px;box-sizing:border-box;max-width:100%!important;"><span leaf=""><br></span></section>
  </section>
  <section style="flex:1;padding-bottom:12px;box-sizing:border-box;max-width:100%!important;">
    <p style="margin:0 0 6px;font-size:16px;font-weight:500;color:#d4d0c8;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{节点标题}}</span></p>
    <p style="font-size:14px;margin:0;color:#d4d0c8;line-height:1.9;letter-spacing:0.5px;text-align:justify;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{节点内容}}</span></p>
  </section>
</section>
```

---

## 组件 12 数据 / 要点卡片组

> **墨金雅关键规则**：数据数字**不用金色**（金太珍贵），用暖灰白 `#d4d0c8` 28px；标签用注释色 `#6e6a62`。金色在数据区只出现在：步骤编号组（计 1 次）、可选单列数据卡标签（计 1 次）。若金色配额已用完，所有金色降为标题色/注释色。

### 两列版

```html
<section style="display:flex;margin-bottom:24px;padding:0;box-sizing:border-box;max-width:100%!important;">
  <section style="flex:1;background:#252525;border-radius:8px;padding:18px 16px;margin-right:8px;text-align:center;border:1px solid #333333;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:28px;font-weight:600;color:#d4d0c8;margin:0 0 4px;line-height:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:11px;color:#6e6a62;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{说明}}</span></p>
  </section>
  <section style="flex:1;background:#252525;border-radius:8px;padding:18px 16px;text-align:center;border:1px solid #333333;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:28px;font-weight:600;color:#d4d0c8;margin:0 0 4px;line-height:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:11px;color:#6e6a62;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{说明}}</span></p>
  </section>
</section>
```

### 三列版

```html
<section style="display:flex;margin-bottom:24px;padding:0;box-sizing:border-box;max-width:100%!important;">
  <section style="flex:1;background:#252525;border-radius:8px;padding:16px 10px;margin-right:8px;text-align:center;border:1px solid #333333;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:24px;font-weight:600;color:#d4d0c8;margin:0 0 4px;line-height:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:10px;color:#6e6a62;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{说明}}</span></p>
  </section>
  <section style="flex:1;background:#252525;border-radius:8px;padding:16px 10px;margin-right:8px;text-align:center;border:1px solid #333333;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:24px;font-weight:600;color:#d4d0c8;margin:0 0 4px;line-height:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:10px;color:#6e6a62;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{说明}}</span></p>
  </section>
  <section style="flex:1;background:#252525;border-radius:8px;padding:16px 10px;text-align:center;border:1px solid #333333;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:24px;font-weight:600;color:#d4d0c8;margin:0 0 4px;line-height:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:10px;color:#6e6a62;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{说明}}</span></p>
  </section>
</section>
```

### 表格（真实数据表用，flex 模拟，禁 `<table>`）

> 表头金色文字（消耗 1 次金色配额），偶数行 `#252525`、奇数行 `#1a1a1a`。

```html
<section style="margin-bottom:24px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;background:#252525;border-bottom:1px solid #333333;box-sizing:border-box;max-width:100%!important;">
    <p style="flex:1;font-size:13px;font-weight:700;color:#c9a96e;padding:10px 12px;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{列标题}}</span></p>
    <p style="flex:1;font-size:13px;font-weight:700;color:#c9a96e;padding:10px 12px;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{列标题}}</span></p>
  </section>
  <section style="display:flex;background:#1a1a1a;border-bottom:1px solid #333333;box-sizing:border-box;max-width:100%!important;">
    <p style="flex:1;font-size:14px;color:#d4d0c8;padding:10px 12px;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{内容}}</span></p>
    <p style="flex:1;font-size:14px;color:#d4d0c8;padding:10px 12px;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{内容}}</span></p>
  </section>
  <section style="display:flex;background:#252525;border-bottom:1px solid #333333;box-sizing:border-box;max-width:100%!important;">
    <p style="flex:1;font-size:14px;color:#d4d0c8;padding:10px 12px;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{内容}}</span></p>
    <p style="flex:1;font-size:14px;color:#d4d0c8;padding:10px 12px;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{内容}}</span></p>
  </section>
</section>
```

---

## 组件 13 标签胶囊（金描边）

金描边（默认，轻量锚点）：

```html
<span style="display:inline-block;border:1px solid #c9a96e;color:#c9a96e;font-size:12px;font-weight:600;padding:1px 10px;border-radius:4px;margin-right:6px;box-sizing:border-box;max-width:100%!important;"><span leaf="">标签名</span></span>
```

金底墨字（强锚点，仅尾部点赞按钮等极少数处使用，不铺面）：

```html
<span style="display:inline-block;background:#c9a96e;color:#1e1f23;font-size:12px;font-weight:700;padding:2px 10px;border-radius:4px;margin-right:6px;box-sizing:border-box;max-width:100%!important;"><span leaf="">标签名</span></span>
```

---

## 组件 14 图片容器

> 暗色页面中**不加白底分区**（白底容器像一块"补丁"），用透明或继承底色 + 4px 圆角柔化图片边缘。说明用注释色 `#6e6a62`，前可加金色微型菱形 `◆`（消耗配额，可选）。

```html
<section style="margin-bottom:10px;box-sizing:border-box;max-width:100%!important;">
  <span leaf=""><img src="图片URL" style="max-width:100%;height:auto;display:block;margin:0 auto;border-radius:4px;box-sizing:border-box;"></span>
</section>
```

带说明文字时，图片 `margin-bottom` 改 `8px`，其后加：

```html
<p style="font-size:11px;color:#6e6a62;text-align:center;margin:0 0 24px;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">— {{图片说明}}</span>
</p>
```

**GIF 动图**（同图片，加"GIF 动图"角标，不用金色）：

```html
<section style="margin-bottom:8px;box-sizing:border-box;max-width:100%!important;">
  <span leaf=""><img src="动图URL.gif" style="max-width:100%;height:auto;display:block;margin:0 auto;border-radius:4px;box-sizing:border-box;"></span>
</section>
<p style="text-align:center;margin:0 0 24px;box-sizing:border-box;max-width:100%!important;">
  <span style="display:inline-block;background:#252525;color:#d4d0c8;font-size:11px;font-weight:700;padding:1px 8px;border-radius:2px;margin-right:6px;box-sizing:border-box;max-width:100%!important;"><span leaf="">GIF 动图</span></span>
  <span style="font-size:11px;color:#6e6a62;box-sizing:border-box;max-width:100%!important;"><span leaf="">动图说明文字</span></span>
</p>
```

**待补素材占位**（居中板块，唯一允许虚线框的场景）：

```html
<section style="margin:0 0 24px;padding:30px 20px;border:1.5px dashed #333333;border-radius:14px;background:#1a1a1a;text-align:center;box-sizing:border-box;max-width:100%!important;">
  <p style="margin:0 0 10px;font-size:26px;line-height:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">🎬</span></p>
  <p style="margin:0;font-size:14px;font-weight:700;color:#9e9a90;letter-spacing:1px;box-sizing:border-box;max-width:100%!important;"><span leaf="">待补素材</span></p>
  <p style="margin:8px 0 0;font-size:13px;color:#6e6a62;line-height:1.7;box-sizing:border-box;max-width:100%!important;"><span leaf="">此处插入：创建 skill 的录屏演示</span></p>
</section>
```

---

## 组件 14b 多行代码块（墨金深色终端）

> **招牌特性⑤**：深色终端，底色 `#0d0d0f` 比页面 `#1a1a1a` 更深——深度差是唯一层次手段。**每行一个 `<p style="margin:0">`，绝不用 `white-space:pre`**；需要缩进时在 span 文字里用全角空格 `　`，不靠源码空格。代码块在墨金雅中**不使用任何金色装饰**（金不属于代码区）。

```html
<section style="margin:0 0 20px;border-radius:8px;overflow:hidden;background:#0d0d0f;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;align-items:center;padding:9px 14px;background:#16161a;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FF5F56;margin-right:7px;font-size:0;line-height:0;overflow:hidden;box-sizing:border-box;max-width:100%!important;">.</span>
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FFBD2E;margin-right:7px;font-size:0;line-height:0;overflow:hidden;box-sizing:border-box;max-width:100%!important;">.</span>
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#27C93F;font-size:0;line-height:0;overflow:hidden;box-sizing:border-box;max-width:100%!important;">.</span>
    <span style="margin-left:12px;font-size:11px;color:#6e6a62;font-family:Consolas,Monaco,monospace;letter-spacing:1px;box-sizing:border-box;max-width:100%!important;"><span leaf="">python</span></span>
  </section>
  <section style="padding:11px 14px;box-sizing:border-box;max-width:100%!important;">
    <p style="margin:0;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:12px;line-height:1.6;color:#c8ccd0;box-sizing:border-box;max-width:100%!important;"><span leaf="">def make_skill(name):</span></p>
    <p style="margin:0;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:12px;line-height:1.6;color:#c8ccd0;box-sizing:border-box;max-width:100%!important;"><span leaf="">　　return f"已生成 {name}"</span></p>
    <p style="margin:0;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:12px;line-height:1.6;color:#c8ccd0;box-sizing:border-box;max-width:100%!important;"><span leaf="">print(make_skill("gzh-design"))</span></p>
  </section>
</section>
```

无顶栏版本（短代码 ≤10 行更简洁）：删掉顶栏 `<section>`，仅保留深底 `#0d0d0f` + padding。

---

## 组件 15 END 结尾分割线（金）

> 左右两条金色渐短线夹 `END` 金字。装饰性短线内部必须放 `<span leaf=""><br></span>`。

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="text-align:center;margin:0 0 32px;box-sizing:border-box;max-width:100%!important;">
    <section style="display:flex;align-items:center;justify-content:center;box-sizing:border-box;max-width:100%!important;">
      <span style="height:1px;width:60px;background:linear-gradient(to right,transparent,#c9a96e);margin-right:12px;box-sizing:border-box;max-width:100%!important;"><span leaf=""><br></span></span>
      <span style="font-size:11px;color:#c9a96e;letter-spacing:3px;font-weight:700;box-sizing:border-box;max-width:100%!important;"><span leaf="">END</span></span>
      <span style="height:1px;width:60px;background:linear-gradient(to left,transparent,#c9a96e);margin-left:12px;box-sizing:border-box;max-width:100%!important;"><span leaf=""><br></span></span>
    </section>
  </section>
</section>
```

---

## 组件 16 尾部作者签名区

> **招牌特性⑥**：固定签名文案以正文段落形式呈现，占位 `{{作者名}}` / `{{一句话简介}}`；有个人名片/引导图素材才放图，无素材整块删。点赞引导用金色加粗（计入金色配额，已是尾部唯一金）。

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="text-align:center;margin-bottom:10px;border-radius:8px;overflow:hidden;box-sizing:border-box;max-width:100%!important;">
    <span leaf=""><img src="个人名片或引导图URL，无则删本 section" style="max-width:100%;height:auto;display:block;margin:0 auto;box-sizing:border-box;"></span>
  </section>
  <p style="margin-bottom:20px;font-size:14px;line-height:1.9;letter-spacing:0.5px;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">我是 {{作者名}}，{{一句话简介，如：专注于品牌叙事与人物访谈}}。</span>
  </p>
  <p style="margin-bottom:20px;font-size:14px;line-height:1.9;letter-spacing:0.5px;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">如果你觉得今天这篇有收获，欢迎</span>
    <strong style="color:#c9a96e;"><span leaf="">点赞、在看、转发</span></strong>
    <span leaf="">三连，我们下篇见。</span>
  </p>
</section>
```

---

## 完整文章模板骨架

```html
<section style="max-width:677px;margin:0 auto;background:#1a1a1a;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;color:#d4d0c8;line-height:1.9;letter-spacing:0.5px;overflow-x:hidden;box-sizing:border-box;">

  <!-- 1. 开头引言卡片（组件2，墨金精致扉页） -->

  <!-- 2. 前言正文（组件6 段落 × N，放 0 10px 边距 section，第一章之前的开场白） -->

  <!-- 3. 前言导读（组件3，3+ 章节时生成，精选前 3 看点） -->

  <!-- 4. 第一章（组件5 章节标题，margin-top:16px） -->
  <!--    章内：组件6 正文 + 6b 子标题 + 7 行内高亮 + 8 引用 + 9 提示 + 10 标签组 + 11 列表 + 12 数据 + 14 图片 + 14b 代码 -->

  <!-- 5. 章节分割线（组件4）+ 第二章…第N章（组件5，margin-top:48px） -->

  <!-- 6. 结语章（组件5 变体：编号 ∞，英文 THE END） -->

  <!-- 7. END 分割线（组件15） -->

  <!-- 8. 尾部签名（组件16） -->

</section>
```

**骨架铁律**：引言卡在最前；导读区在前言正文之后、第一章之前；章节之间用组件 4 金线分割；一篇只有一个 END + 一个签名区。

---

## 视觉层级（3 层递进）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **锚点层** | 金色编号（组件5）/ 金色加粗 7a / 居中金句 8a / 金色下划线 7d | 章节编号、品牌名、核心金句、关键短语 | 全文金色 ≤5 处（编号优先） |
| **标记层** | 金色下划线 7d（默认）/ 浅金底标签 7b / 金描边胶囊 13 | 正文关键词强调、核心概念 | 每段 1~3 处下划线；标签每篇 2~4 个 |
| **容器层** | 暗色卡片 8b/9/10b/12 / 左竖条引用 8b / 时间线 11c | 引用、旁注、提示、结构化信息、数据 | 按需 |

**克制原则**：
- 金色是"金边"——金底药丸/`background:#c9a96e` **仅在尾部点赞按钮（组件16 强变体）与极个别金描边标签出现**；正文关键词标签用浅金底 7b 或金描边 13，不铺金面
- 金色加粗全文 ≤5 处，且计入金色总配额
- 引用/提示统一用暗色卡片 `#252525` + 金色细线/金小标，**不用四周虚线框**（dashed，仅待补素材例外）
- 渐变金仅出现在章节分割线 4、END 线 15 与章节标题编号/细线处；数据数字**不用金**

---

## 文章类型 → 组件组合配方

按 SKILL.md 第 3 步判定的文章类型选配方；核心组件构成本篇排版主旋律，点缀组件按内容出现处使用，一篇文章点缀组件种类 ≤3，避免花哨。

| 文章类型 | 核心组件组合 | 点缀组件 |
|---|---|---|
| 人物访谈/品牌叙事 | 正文6 + 金句引用8a（引语）+ timeline 11c（经历脉络） | 居中金句8a、暗卡旁注8b、金描边胶囊13 |
| 观点/深度分析 | 正文6 + 金句引用8a + 居中金句8a | 暗卡引用8b、无金旁注9b |
| 教程/操作指南 | step-label 10a + 代码块14b + ordered-list 11a | 金提示9a、tool-card 10b |
| 盘点/工具清单 | skill/tool-label 10a + tool-card 10b + pill-list 11b | 数据卡12、金描边胶囊13 |
| 数据复盘/报告 | 数据卡12（两列/三列）+ flex表格12 + ordered-list 11a | 金提示9a、荧光笔7e |
| 品牌叙事/高端随笔 | 正文6 + 居中金句8a + 暗卡旁注8b | 金句引用8a（少量）、灰注9b |
| 案例实战 | case-label 10a / timeline 11c + step-label 10a | 暗卡引用8b、金提示9a |

所有类型共用固定结构：引言卡 2 + 导读 3（3+ 章节）+ 编号章节 5（金色编号，末章 ∞）+ END 15 + 签名 16。墨金雅专属：金仅作锚点，暗色卡片承载结构信息。

---

## Markdown → 墨金雅排版 映射规则

| Markdown 元素 | 对应组件 | 说明 |
|---|---|---|
| `# 标题` | 不使用 | 公众号文章标题在平台设置 |
| 文章开头 `> 引言金句` | 组件 2 墨金引言卡 | 视角与外标题错开；金竖线 + 金标签文字 |
| `## 章节标题` | 组件 5 章节标题 | 金色编号 01/02…，末章 ∞ + THE END |
| `### 子标题` | 组件 6b 金色细左竖条小标题 | 不套编号章节样式 |
| 普通段落 | 组件 6 正文段落 | 每段主动标 1~3 处金色下划线 7d |
| `**加粗文字**` | 组件 7a 普通加粗（默认）/ 金色加粗（锚点 ≤5） | 普通加粗为主 |
| `==高亮文字==` | 组件 7b 浅金底标签 | 核心概念 |
| `<u>下划线</u>` / `++文字++` | 组件 7d 金色下划线 | 次要强调 |
| `~~删除线~~` | `text-decoration:line-through` + 注释色 `#6e6a62` | 被淘汰概念 |
| 行内 `` `code` `` | 组件 7f 行内代码 | 深灰底 `#222225` |
| `> 引用段落`（金句） | 组件 8a 居中金句 | 核心金句，金色引号 |
| `> 引用段落`（资料/旁注） | 组件 8b 暗卡金竖条 / 8c 金小标 | 轻量旁注 |
| 核心金句 | 组件 8a 居中金句 | 视觉焦点 |
| 操作步骤 | 组件 10a step-label | STEP 01/02…（金色文字） |
| 技能/工具清单 | 组件 10a skill/tool-label + 10b tool-card | 暗色卡片 |
| 案例/经历脉络 | 组件 10a case-label / 11c timeline | 金色细线节点 |
| Prompt 提示词 / 长代码 | 组件 14b 墨金深色终端 | 每行一个 `<p style="margin:0">` |
| 并列要点 | 组件 11b pill-list | 金描边胶囊 |
| `1. 2. 3.` 编号列表 | 组件 11a ordered-list | 金色细环 |
| 数据展示 | 组件 12 数据卡片组 / flex 表格 | 暖灰白大号数字，不用金 |
| Markdown 表格 | 组件 12 flex 表格 | 偶数行 `#252525`、表头金字 |
| 注意/提示 | 组件 9a 金提示 / 9b 无金旁注 | |
| 行内标签 | 组件 13 金描边胶囊 | 浅金底默认 |
| `---` | 组件 4 金线渐变分割线 | 金色菱形变体全文 ≤1 次 |
| `![](图片)` | 组件 14 图片容器 | 透明容器 + 4px 圆角 + 说明 |
| 文末 | 组件 15 END + 16 签名 | 尾部唯一金（点赞引导） |
