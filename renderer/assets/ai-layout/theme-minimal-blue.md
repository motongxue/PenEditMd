# 公众号排版组件库 —— 极简蓝（minimal-blue）

> **使用说明**：本组件库为「极简蓝」主题（克制·理性·呼吸感），所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：蓝色做锚点（章节编号 / 左侧竖条 / 按钮 / 链接下划线），灰阶做支撑，白底做呼吸。全文 95% 像素是灰阶，蓝色占比 <3%；克制、理性、秩序、效率。深色终端代码块是唯一暗色区。适合技术教程、工具测评、知识整理类文章。
>
> **气质签名**：白底做呼吸、灰阶做支撑、蓝色做锚点；无阴影、统一 6px 圆角；文字装饰型分割线 `· · ·`；极简文字链尾部。蓝色不是装饰，是信号。

---

## 设计变量速查表

> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class/id、`position:fixed/absolute`、`float`、`@media`/`@keyframes`、`display:grid`、`var()`/`calc()`/`hsl()`
> - ✅ 支持内联 `style`、`display:flex`（有限）、`border-radius`、`border`、`<section>/<p>/<span>/<strong>/<em>/<img>/<br>/<h3>` 等基础标签
>
> **WeChat 兼容铁律**（本主题组件全部已按此写好，改动时必须遵守）：
> - 所有"装饰性空元素"（分割线、END 短线、竖条、圆点等）**必须在内部放 `<span leaf=""><br></span>` 占位**，否则微信会剥掉样式
> - **不要把 `font-size`/`border-bottom` 打在 `<strong>` 上**，也不要在同一个 `<p>` 里混多个不同 `font-size`——微信编辑器会自动"纠正"导致样式被重写。正确做法：拆成多个 `<p>`，每个 `<p>` 只有一个字号；高亮样式统一挂在外层 `<span>` 上
> - 不用 `position:absolute` 做划线/高亮，删除线用 `text-decoration:line-through`
> - 极简蓝**全程禁用 `box-shadow`**（用 `border:1px solid #e2e8f0` 创建层次），圆角统一 `6px`，保持理性克制
> - 结构化区域没有内容时**整块删掉**，不留空 section

```
主色调：       #2563eb（经典蓝，仅做锚点：章节编号/左竖条/按钮/链接下划线）
辅色：         #3b82f6（浅一阶蓝，hover/二级强调，极少用）
浅蓝（下划线）： #93c5fd（正文关键词下划线、轻柔装饰竖条）
深蓝强调：     #1d4ed8（高亮数字、数据、重点标签字）
浅底：         #f5f7fa（极浅蓝灰，卡片/引用块背景）
浅边框：       #e2e8f0（冷灰边框，卡片描边、分割线）
标题色：       #1a1a2e（接近黑，标题专用）
正文色：       #333333（正文主色，不作纯黑降低对比疲劳）
辅助文字色：   #666666（二级信息、日期、说明）
注释色：       #999999（最弱层级：来源、版权、占位）
分割线色：     #e2e8f0（与浅边框同色，克制）
正文字号：     14px（不可改）
行高：         1.85
字间距：       0.3px
章节标题字号： 18-20px
最大宽度：     677px
内容区边距：   0 10px（左右各 10px）
卡片圆角：     6px（统一圆角，保持理性感；禁用大圆角）
代码块底：     #1e293b（深色终端，与蓝白形成对比层次，唯一暗色区）
```

字体栈：`-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif`

---

## 组件 1 全局容器

```html
<section style="max-width:677px;margin:0 auto;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;color:#333333;line-height:1.85;letter-spacing:0.3px;overflow-x:hidden;box-sizing:border-box;max-width:100%!important;">

  <!-- 所有组件放在这里 -->

</section>
```

---

## 组件 2 开头引言卡片（浅蓝底 + 左侧蓝色竖条）

> **文案策略（先读，比代码重要）**：
> - 引言卡金句和公众号外标题是**两层**，视角要错开——外标题卖"为什么点开"，引言卡卖"核心观点是什么"
> - 已知外标题时，金句**禁止原样复述**其核心关键词；从文章第一段或核心论点提炼一句有张力的判断句
> - 顶部 3-5 个话题标签：蓝底白字（`bg:#2563eb`）做锚点，其余用灰边框标签；右下署名按实际作者填，未知则整行删掉
> - 极简蓝无阴影、圆角 6px；蓝底白字标签仅在本卡片与章节编号处作为锚点

```html
<section style="margin:10px 10px 32px;background:#f5f7fa;border-radius:6px;padding:24px 20px;overflow:hidden;box-sizing:border-box;max-width:100%!important;">
  <p style="margin:0 0 12px;font-size:9px;letter-spacing:1px;">
    <span style="display:inline-block;background:#2563eb;color:#FFFFFF;padding:2px 8px;border-radius:4px;margin-right:6px;font-weight:600;box-sizing:border-box;"><span leaf="">{{话题标签}}</span></span>
    <span style="display:inline-block;border:1px solid #e2e8f0;color:#666;padding:1px 8px;border-radius:4px;margin-right:6px;box-sizing:border-box;"><span leaf="">{{标签}}</span></span>
  </p>
  <p style="font-size:16px;font-weight:700;color:#1a1a2e;margin:0 0 8px;line-height:1.85;padding-left:12px;border-left:3px solid #2563eb;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{金句前半}}</span>
    <span style="border-bottom:2px solid #93c5fd;font-weight:600;"><span leaf="">{{核心关键词}}</span></span>
    <span leaf="">{{金句后半}}</span>
  </p>
  <p style="text-align:right;font-size:12px;color:#999;margin:8px 0 0;letter-spacing:0.5px;box-sizing:border-box;">
    <span leaf="">—— {{作者名，未知则删整行}}</span>
  </p>
</section>
```

---

## 组件 3 前言导读区域（本文看点，三列目录卡片）

> 3 个及以上章节时生成。蓝底白字编号 + 深色标题；展示**精选 3 个核心看点**，不是全量章节列表。

```html
<section style="padding:0 10px 32px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:14px;color:#999;margin:0 0 14px;letter-spacing:1px;box-sizing:border-box;">
    <span leaf="">本文看点</span>
  </p>
  <section style="display:flex;justify-content:space-between;box-sizing:border-box;max-width:100%!important;">
    <section style="flex:1;background:#f5f7fa;border-radius:6px;padding:16px 12px;margin-right:8px;text-align:center;border:1px solid #e2e8f0;box-sizing:border-box;max-width:100%!important;">
      <p style="display:inline-block;background:#2563eb;color:#FFFFFF;font-size:12px;font-weight:800;padding:2px 10px;border-radius:4px;margin:0 0 8px;box-sizing:border-box;"><span leaf="">01</span></p>
      <p style="font-size:13px;font-weight:700;color:#1a1a2e;margin:0;box-sizing:border-box;"><span leaf="">{{看点一}}</span></p>
    </section>
    <section style="flex:1;background:#f5f7fa;border-radius:6px;padding:16px 12px;margin-right:8px;text-align:center;border:1px solid #e2e8f0;box-sizing:border-box;max-width:100%!important;">
      <p style="display:inline-block;background:#2563eb;color:#FFFFFF;font-size:12px;font-weight:800;padding:2px 10px;border-radius:4px;margin:0 0 8px;box-sizing:border-box;"><span leaf="">02</span></p>
      <p style="font-size:13px;font-weight:700;color:#1a1a2e;margin:0;box-sizing:border-box;"><span leaf="">{{看点二}}</span></p>
    </section>
    <section style="flex:1;background:#f5f7fa;border-radius:6px;padding:16px 12px;text-align:center;border:1px solid #e2e8f0;box-sizing:border-box;max-width:100%!important;">
      <p style="display:inline-block;background:#2563eb;color:#FFFFFF;font-size:12px;font-weight:800;padding:2px 10px;border-radius:4px;margin:0 0 8px;box-sizing:border-box;"><span leaf="">03</span></p>
      <p style="font-size:13px;font-weight:700;color:#1a1a2e;margin:0;box-sizing:border-box;"><span leaf="">{{看点三}}</span></p>
    </section>
  </section>
</section>
```

---

## 组件 4 章节分割线（文字装饰型 `· · ·`）

> 极简蓝签名组件：灰色文字装饰 `· · ·`（或 `— — —`），颜色不深于 `#e2e8f0`；不使用深色实线。

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <p style="text-align:center;font-size:13px;color:#d0d0d0;letter-spacing:6px;margin:24px 0;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">· · ·</span>
  </p>
</section>
```

变体（仅章节间特殊场景可用纯 1px 细线）：

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="height:1px;background:#e2e8f0;margin:0;box-sizing:border-box;max-width:100%!important;">
    <span leaf=""><br></span>
  </section>
</section>
```

---

## 组件 5 章节标题（蓝底编号标签 + 标题）

> 蓝色实底编号标签 + 英文小标签 + 中文大标题，底部蓝色实线。第一章 `margin-top:16px`，后续章节 `margin-top:48px`。

```html
<section style="margin-top:48px;margin-bottom:28px;padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:14px;border-bottom:3px solid #2563eb;box-sizing:border-box;max-width:100%!important;">
    <section style="display:flex;align-items:center;box-sizing:border-box;max-width:100%!important;">
      <span style="display:inline-block;background:#2563eb;color:#FFFFFF;font-size:18px;font-weight:900;padding:4px 14px;border-radius:6px;margin-right:14px;line-height:1.3;box-sizing:border-box;"><span leaf="">01</span></span>
      <section style="box-sizing:border-box;max-width:100%!important;">
        <p style="font-size:10px;color:#2563eb;font-weight:700;letter-spacing:3px;margin:0 0 2px;text-transform:uppercase;box-sizing:border-box;">
          <span leaf="">{{ENGLISH TAG}}</span>
        </p>
        <h3 style="font-size:18px;font-weight:800;color:#1a1a2e;margin:0;letter-spacing:0.3px;box-sizing:border-box;max-width:100%!important;">
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
<span style="display:inline-block;background:#2563eb;color:#FFFFFF;font-size:18px;font-weight:900;padding:4px 14px;border-radius:6px;margin-right:14px;line-height:1.3;box-sizing:border-box;"><span leaf="">∞</span></span>
```

---

## 组件 6 正文段落

> **关键规则**：每段主动识别 1~3 个关键短语，用**淡蓝下划线（7d）**标记——这是本风格的核心视觉特征，让读者快速扫到每段重点。

**基础段落**：

```html
<p style="margin-bottom:20px;font-size:14px;line-height:1.85;color:#333333;text-align:justify;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">{{正文内容}}</span>
</p>
```

**带关键词下划线标记的段落**（推荐默认）：

```html
<p style="margin-bottom:20px;font-size:14px;line-height:1.85;color:#333333;text-align:justify;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">{{前半句}}</span>
  <span style="border-bottom:2px solid #93c5fd;font-weight:600;"><span leaf="">{{需要强调的关键短语}}</span></span>
  <span leaf="">{{后半句}}</span>
</p>
```

**标记原则**：每段选 1~3 个关键短语（4~15 字）加下划线，不要整段都标；优先标核心观点、结论判断、关键数据、专有名词；无重点的段落可不标。

---

## 组件 6b 子标题（`###` 小节标题）

> `###` 子标题用蓝色左竖条 + 深色标题，**不套用组件 5 的编号章节样式**（编号章节只给 `##`）。

```html
<p style="font-size:15px;font-weight:800;color:#1a1a2e;margin:28px 0 14px;padding-left:10px;border-left:3px solid #2563eb;line-height:1.4;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">{{子标题}}</span>
</p>
```

---

## 组件 7 正文高亮样式（5 种变体 + 行内代码）

> **核心理念**：克制用色，蓝色只在真正需要的锚点出现。
>
> **优先级**：① 7d 淡蓝下划线（正文默认标记）→ ② 7a 普通加粗为主、蓝色加粗仅锚点 → ③ 7b 浅蓝底深蓝字标签（每篇 2~4 个）→ ④ 7c 浅蓝背景（次要）→ ⑤ 7e 浅蓝高亮（偶尔长句强调）

### 7a. 加粗强调

普通加粗（默认，绝大部分加粗用这个）：

```html
<strong><span leaf="">普通加粗强调</span></strong>
```

蓝色加粗（仅限产品名/步骤/CTA 等锚点，全文 ≤5 处）：

```html
<strong style="color:#2563eb;"><span leaf="">蓝色加粗锚点</span></strong>
```

### 7b. 浅蓝底深蓝字标签（核心概念，每篇 2~4 个）

```html
<span style="background:#f5f7fa;color:#1d4ed8;padding:2px 6px;border-radius:3px;font-weight:700;border:1px solid #e2e8f0;box-sizing:border-box;"><span leaf="">关键词标签</span></span>
```

### 7c. 浅蓝背景高亮（次要关键词）

```html
<span style="background:#f5f7fa;padding:1px 6px;border-radius:3px;font-weight:600;color:#2563eb;box-sizing:border-box;"><span leaf="">浅蓝背景关键词</span></span>
```

### 7d. 淡蓝下划线（最常用，本风格标志性标记）

```html
<span style="border-bottom:2px solid #93c5fd;font-weight:600;"><span leaf="">淡蓝下划线关键词</span></span>
```

### 7e. 浅蓝高亮（偶尔用于长句强调，无渐变无阴影）

```html
<span style="background:rgba(37,99,235,0.10);font-weight:700;color:#1a1a2e;box-sizing:border-box;"><span leaf="">浅蓝高亮的重要长句</span></span>
```

### 7f. 行内代码

```html
<span style="background:#f1f5f9;color:#2563eb;padding:1px 6px;border-radius:4px;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;box-sizing:border-box;"><span leaf="">code</span></span>
```

---

## 组件 8 引用块（4 种变体）

### 8a. 左侧蓝色竖条金句（默认，最克制，核心金句）

```html
<section style="border-left:3px solid #2563eb;padding:8px 0 8px 12px;background:transparent;margin-bottom:24px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:15px;font-weight:700;color:#1a1a2e;margin:0;line-height:1.85;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">「{{核心观点或关键金句}}」</span>
  </p>
</section>
```

### 8b. 浅蓝底卡片（核心结论，突出强调）

```html
<section style="background:#f5f7fa;border-radius:6px;padding:14px 16px;margin-bottom:24px;border:1px solid #e2e8f0;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:15px;font-weight:700;color:#1a1a2e;margin:0;line-height:1.85;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{核心结论或金句}}</span>
  </p>
</section>
```

### 8c. 大引号变体（短金句，<25 字，无底色无边框）

```html
<section style="margin-bottom:24px;padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:36px;color:#93c5fd;font-weight:900;line-height:0.8;margin:0 0 4px;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">"</span>
  </p>
  <p style="font-size:15px;font-weight:600;color:#1a1a2e;margin:0;line-height:1.85;text-align:center;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{短金句（25字以内）}}</span>
  </p>
</section>
```

### 8d. 居中金句分隔（章节间的过渡金句）

```html
<p style="font-size:15px;margin:0 0 24px;text-align:center;color:#2563eb;font-weight:700;letter-spacing:1px;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;padding:14px 10px;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">{{居中金句}}</span>
</p>
```

---

## 组件 9 提示 / 旁注条

### 9a. 蓝色提示条（重要提醒、核心结论）

```html
<section style="background:#f5f7fa;border-left:3px solid #2563eb;border-radius:0 6px 6px 0;padding:10px 14px;margin-bottom:24px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:13px;color:#555;margin:0;line-height:1.75;box-sizing:border-box;max-width:100%!important;">
    <span style="color:#2563eb;font-weight:700;"><span leaf="">提示：</span></span>
    <span leaf="">{{重要提示或核心结论}}</span>
  </p>
</section>
```

### 9b. 踩坑提示（灰底，风险/注意事项）

```html
<section style="padding:6px 0 4px;margin-bottom:16px;box-sizing:border-box;max-width:100%!important;">
  <p style="margin-bottom:6px;font-size:12px;font-weight:700;color:#999;letter-spacing:1px;box-sizing:border-box;max-width:100%!important;">
    <span style="color:#2563eb;"><span leaf="">！踩坑提示</span></span>
  </p>
  <p style="font-size:14px;color:#333;margin:0;line-height:1.7;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{提示内容}}</span>
  </p>
</section>
```

---

## 组件 10 内容标签组（STEP / SKILL / TOOL / CASE）

> 教程用 STEP、盘点用 SKILL/TOOL、案例用 CASE。蓝底白字编号标签 + 标题。

### 10a. step-label（教程步骤）

```html
<section style="margin-bottom:22px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;align-items:center;gap:8px;margin-bottom:10px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-block;background:#2563eb;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;box-sizing:border-box;"><span leaf="">STEP 01</span></span>
    <span style="font-size:15px;font-weight:800;color:#1a1a2e;box-sizing:border-box;"><span leaf="">{{步骤标题}}</span></span>
  </section>
  <p style="font-size:14px;margin:0 0 16px;color:#333;line-height:1.85;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{步骤内容}}</span>
  </p>
</section>
```

`STEP 01` 可替换为 `SKILL 1`、`TOOL 摄像机`、`CASE 01`（盘点/案例场景）；盘点场景标签底色可改灰 `#e2e8f0` + 字 `#1d4ed8` 做次级层次。

### 10b. tool-card（工具/条目说明卡）

```html
<section style="background:#fff;border-radius:6px;padding:16px 20px;border:1px solid #e2e8f0;margin-bottom:24px;box-sizing:border-box;max-width:100%!important;">
  <p style="font-size:14px;color:#333;margin:0;line-height:1.85;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{条目说明内容}}</span>
  </p>
</section>
```

---

## 组件 11 列表组件

### 11a. ordered-list（蓝色圆标数字编号列表）

```html
<section style="margin-bottom:24px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:#2563eb;color:#fff;font-size:12px;font-weight:700;border-radius:50%;flex-shrink:0;margin-top:2px;box-sizing:border-box;"><span leaf="">1</span></span>
    <p style="font-size:14px;color:#333;margin:0;line-height:1.85;flex:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{列表项内容}}</span></p>
  </section>
  <section style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:#2563eb;color:#fff;font-size:12px;font-weight:700;border-radius:50%;flex-shrink:0;margin-top:2px;box-sizing:border-box;"><span leaf="">2</span></span>
    <p style="font-size:14px;color:#333;margin:0;line-height:1.85;flex:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{列表项内容}}</span></p>
  </section>
  <section style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:#2563eb;color:#fff;font-size:12px;font-weight:700;border-radius:50%;flex-shrink:0;margin-top:2px;box-sizing:border-box;"><span leaf="">3</span></span>
    <p style="font-size:14px;color:#333;margin:0;line-height:1.85;flex:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{列表项内容}}</span></p>
  </section>
</section>
```

### 11b. pill-list（无序要点，蓝点前缀 + 说明）

```html
<section style="margin-bottom:14px;box-sizing:border-box;max-width:100%!important;">
  <p style="margin:0 0 6px;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-block;font-size:13px;font-weight:700;color:#1d4ed8;background:#f5f7fa;padding:3px 10px;border-radius:999px;border:1px solid #e2e8f0;box-sizing:border-box;"><span style="display:inline-block;width:6px;height:6px;background:#2563eb;border-radius:50%;margin-right:5px;vertical-align:middle;box-sizing:border-box;"><span leaf=""><br></span></span><span leaf="">{{要点标题}}</span></span>
  </p>
  <p style="font-size:14px;color:#666;margin:0;line-height:1.7;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">{{要点说明}}</span>
  </p>
</section>
```

### 11c. timeline（时间线 / 递进脉络，访谈经历、案例演进）

```html
<section style="display:flex;margin-bottom:24px;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;flex-direction:column;align-items:center;margin-right:16px;flex-shrink:0;box-sizing:border-box;max-width:100%!important;">
    <section style="width:14px;height:14px;border-radius:50%;border:3px solid #2563eb;background:#fff;margin-top:4px;box-sizing:border-box;max-width:100%!important;"><span leaf=""><br></span></section>
    <section style="width:2px;background:#e2e8f0;flex:1;margin-top:4px;min-height:44px;box-sizing:border-box;max-width:100%!important;"><span leaf=""><br></span></section>
  </section>
  <section style="flex:1;padding-bottom:12px;box-sizing:border-box;max-width:100%!important;">
    <p style="margin:0 0 6px;font-size:15px;font-weight:800;color:#1a1a2e;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{节点标题}}</span></p>
    <p style="font-size:14px;margin:0;color:#333;line-height:1.85;text-align:justify;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{节点内容}}</span></p>
  </section>
</section>
```

最后一个节点去掉竖线段。

---

## 组件 12 数据 / 要点卡片组

### 两列版

```html
<section style="display:flex;margin-bottom:24px;padding:0;box-sizing:border-box;max-width:100%!important;">
  <section style="flex:1;background:#f5f7fa;border-radius:6px;padding:18px 16px;margin-right:8px;text-align:center;border:1px solid #e2e8f0;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:28px;font-weight:900;color:#2563eb;margin:0 0 4px;line-height:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:12px;color:#999;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{说明}}</span></p>
  </section>
  <section style="flex:1;background:#f5f7fa;border-radius:6px;padding:18px 16px;text-align:center;border:1px solid #e2e8f0;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:28px;font-weight:900;color:#2563eb;margin:0 0 4px;line-height:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:12px;color:#999;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{说明}}</span></p>
  </section>
</section>
```

### 三列版

```html
<section style="display:flex;margin-bottom:24px;padding:0;box-sizing:border-box;max-width:100%!important;">
  <section style="flex:1;background:#f5f7fa;border-radius:6px;padding:16px 10px;margin-right:8px;text-align:center;border:1px solid #e2e8f0;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:24px;font-weight:900;color:#2563eb;margin:0 0 4px;line-height:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:11px;color:#999;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{说明}}</span></p>
  </section>
  <section style="flex:1;background:#f5f7fa;border-radius:6px;padding:16px 10px;margin-right:8px;text-align:center;border:1px solid #e2e8f0;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:24px;font-weight:900;color:#2563eb;margin:0 0 4px;line-height:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:11px;color:#999;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{说明}}</span></p>
  </section>
  <section style="flex:1;background:#f5f7fa;border-radius:6px;padding:16px 10px;text-align:center;border:1px solid #e2e8f0;box-sizing:border-box;max-width:100%!important;">
    <p style="font-size:24px;font-weight:900;color:#2563eb;margin:0 0 4px;line-height:1;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{数字}}</span></p>
    <p style="font-size:11px;color:#999;margin:0;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{说明}}</span></p>
  </section>
</section>
```

### 表格（真实数据表用）

```html
<section style="margin-bottom:24px;overflow-x:auto;box-sizing:border-box;max-width:100%!important;">
  <table style="width:100%;border-collapse:collapse;font-size:14px;box-sizing:border-box;max-width:100%!important;">
    <thead>
      <tr>
        <th style="background:#2563eb;color:#fff;font-weight:700;padding:8px 12px;text-align:left;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{列标题}}</span></th>
        <th style="background:#2563eb;color:#fff;font-weight:700;padding:8px 12px;text-align:left;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{列标题}}</span></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#333;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{内容}}</span></td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#333;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{内容}}</span></td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#333;background:#f5f7fa;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{内容}}</span></td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#333;background:#f5f7fa;box-sizing:border-box;max-width:100%!important;"><span leaf="">{{内容}}</span></td>
      </tr>
    </tbody>
  </table>
</section>
```

---

## 组件 13 标签胶囊

浅蓝底深蓝字（默认）：

```html
<span style="display:inline-block;background:#f5f7fa;color:#1d4ed8;font-size:12px;font-weight:700;padding:2px 10px;border-radius:4px;margin-right:6px;border:1px solid #e2e8f0;box-sizing:border-box;"><span leaf="">标签名</span></span>
```

蓝色描边（轻量）：

```html
<span style="display:inline-block;border:1px solid #2563eb;color:#2563eb;font-size:12px;font-weight:600;padding:1px 10px;border-radius:4px;margin-right:6px;box-sizing:border-box;"><span leaf="">标签名</span></span>
```

---

## 组件 14 图片容器 + 代码块

### 14a. 标准图片（白底 + 冷灰边框，无阴影）

```html
<section style="background:#FFF;border-radius:6px;padding:6px;border:1px solid #e2e8f0;margin-bottom:8px;box-sizing:border-box;max-width:100%!important;">
  <section style="margin:0;border-radius:4px;overflow:hidden;box-sizing:border-box;max-width:100%!important;">
    <span leaf=""><img src="{{图片URL}}" style="max-width:100%;height:auto;display:block;margin:0 auto;box-sizing:border-box;"></span>
  </section>
</section>
```

带说明文字时，图片 `margin-bottom` 改 `8px`，其后加：

```html
<p style="font-size:12px;color:#999;text-align:center;margin:0 0 24px;box-sizing:border-box;max-width:100%!important;">
  <span leaf="">— {{图片说明}}</span>
</p>
```

无说明文字时删掉下方 `<p>`，并把图片容器 `margin-bottom` 改回 `10px`。

### 14b. GIF 动图（同图片，加"GIF 动图"角标）

```html
<section style="background:#FFF;border-radius:6px;padding:6px;border:1px solid #e2e8f0;margin-bottom:8px;box-sizing:border-box;max-width:100%!important;">
  <section style="margin:0;border-radius:4px;overflow:hidden;box-sizing:border-box;max-width:100%!important;">
    <span leaf=""><img src="动图URL.gif" style="max-width:100%;height:auto;display:block;margin:0 auto;box-sizing:border-box;"></span>
  </section>
</section>
<p style="text-align:center;margin:0 0 24px;box-sizing:border-box;max-width:100%!important;">
  <span style="display:inline-block;background:#f5f7fa;color:#2563eb;font-size:11px;font-weight:700;padding:1px 8px;border-radius:4px;margin-right:6px;border:1px solid #e2e8f0;box-sizing:border-box;"><span leaf="">GIF 动图</span></span>
  <span style="font-size:12px;color:#999;box-sizing:border-box;"><span leaf="">动图说明文字</span></span>
</p>
```

### 14c. 代码块（深色终端，极简蓝唯一暗色区）

> 遵循通用增量库 `common-components.md` 的 1a 深色写法；极简蓝去掉 `box-shadow`，左竖条（1b 浅色版）换成 `#2563eb`。**每行一个 `<p style="margin:0">`，绝不用 `white-space:pre`**；缩进用全角空格 `　`，长行自动换行。

```html
<section style="margin:0 0 20px;border-radius:6px;overflow:hidden;background:#1e293b;box-sizing:border-box;max-width:100%!important;">
  <section style="display:flex;align-items:center;padding:9px 14px;background:#0f172a;box-sizing:border-box;max-width:100%!important;">
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FF5F56;margin-right:7px;font-size:0;line-height:0;overflow:hidden;box-sizing:border-box;">.</span>
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FFBD2E;margin-right:7px;font-size:0;line-height:0;overflow:hidden;box-sizing:border-box;">.</span>
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#27C93F;font-size:0;line-height:0;overflow:hidden;box-sizing:border-box;">.</span>
    <span style="margin-left:12px;font-size:12px;color:#64748B;font-family:Consolas,Monaco,monospace;letter-spacing:1px;box-sizing:border-box;"><span leaf="">python</span></span>
  </section>
  <section style="padding:11px 14px;box-sizing:border-box;max-width:100%!important;">
    <p style="margin:0;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;line-height:1.6;color:#E2E8F0;box-sizing:border-box;max-width:100%!important;"><span leaf="">def make_skill(name):</span></p>
    <p style="margin:0;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;line-height:1.6;color:#E2E8F0;box-sizing:border-box;max-width:100%!important;"><span leaf="">　　return f"已生成 {name}"</span></p>
    <p style="margin:0;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;line-height:1.6;color:#E2E8F0;box-sizing:border-box;max-width:100%!important;"><span leaf="">print(make_skill("gzh-design"))</span></p>
  </section>
</section>
```

---

## 组件 15 END 结尾分割线

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="text-align:center;margin:0 0 32px;box-sizing:border-box;max-width:100%!important;">
    <section style="display:flex;align-items:center;justify-content:center;box-sizing:border-box;max-width:100%!important;">
      <span style="height:1px;width:60px;background:#e2e8f0;margin-right:12px;box-sizing:border-box;max-width:100%!important;"><span leaf=""><br></span></span>
      <span style="font-size:11px;color:#2563eb;letter-spacing:3px;font-weight:700;box-sizing:border-box;max-width:100%!important;"><span leaf="">END</span></span>
      <span style="height:1px;width:60px;background:#e2e8f0;margin-left:12px;box-sizing:border-box;max-width:100%!important;"><span leaf=""><br></span></span>
    </section>
  </section>
</section>
```

---

## 组件 16 尾部作者签名区

> 固定签名文案以正文段落形式呈现；有个人名片/引导图素材才放图，无素材整块删。

```html
<section style="padding:0 10px;box-sizing:border-box;max-width:100%!important;">
  <section style="text-align:center;margin-bottom:10px;border-radius:6px;overflow:hidden;box-sizing:border-box;max-width:100%!important;">
    <span leaf=""><img src="{{个人名片或引导图URL，无则删本 section}}" style="max-width:100%;height:auto;display:block;margin:0 auto;box-sizing:border-box;"></span>
  </section>
  <p style="margin-bottom:20px;font-size:14px;line-height:1.85;color:#333;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">我是 {{作者名}}，{{一句话简介，如：热衷于分享 AI 工具与效率方法}}。</span>
  </p>
  <p style="margin-bottom:20px;font-size:14px;line-height:1.85;color:#333;text-align:justify;box-sizing:border-box;max-width:100%!important;">
    <span leaf="">如果你觉得今天这篇有收获，欢迎</span>
    <strong style="color:#2563eb;"><span leaf="">点赞、在看、转发</span></strong>
    <span leaf="">三连，我们下篇见。</span>
  </p>
</section>
```

---

## 完整文章模板骨架

```html
<section style="max-width:677px;margin:0 auto;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;color:#333333;line-height:1.85;letter-spacing:0.3px;overflow-x:hidden;box-sizing:border-box;max-width:100%!important;">

  <!-- 1. 开头引言卡片（组件2，浅蓝底 + 左蓝竖条） -->

  <!-- 2. 前言正文（组件6 段落 × N，放 0 10px 边距 section，第一章之前的开场白） -->

  <!-- 3. 前言导读（组件3，3+ 章节时生成，精选 3 看点目录卡） -->

  <!-- 4. 第一章（组件5 章节标题，margin-top:16px） -->
  <!--    章内：组件6 正文 + 6b 子标题 + 7 行内高亮 + 8 引用 + 9 提示 + 10 标签组 + 11 列表 + 12 数据 + 14 图片/代码 -->

  <!-- 5. 章节分割线（组件4）+ 第二章…第N章（组件5，margin-top:48px） -->

  <!-- 6. 结语章（组件5 变体：编号 ∞，英文 THE END） -->

  <!-- 7. END 分割线（组件15） -->

  <!-- 8. 尾部签名（组件16） -->

</section>
```

**骨架铁律**：引言卡在最前；导读区在前言正文之后、第一章之前；章节之间用组件 4 文字装饰线 `· · ·` 分隔；一篇只有一个 END + 一个签名区。极简蓝全程无 `box-shadow`、圆角统一 `6px`。

---

## 视觉层级（3 层递进）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **锚点层** | 蓝色加粗 7a / 蓝底白字编号（仅引言卡+章节编号）/ 金句引用 8a | 产品名、关键结论、核心金句 | 全文 ≤5 处 |
| **标记层** | 淡蓝下划线 7d（默认）/ 浅蓝底标签 7b | 正文关键词强调 | 每段 1~3 处 |
| **容器层** | 左竖条引用 8a / 提示 9x / 标签组 10 / 卡片 11-12 | 引用、旁注、提示、结构化信息 | 按需 |

**克制原则**：
- 蓝底白字标签（`bg:#2563eb`）**仅在引言卡与章节编号锚点**；正文关键词标签用浅蓝底深蓝字 7b
- 蓝色加粗全文 ≤5 处；蓝色占比全篇 <3%
- 引用/提示统一用左竖条 + 浅底 `#f5f7fa` + 类型小标签，**不用四周虚线框**（dashed）
- 全程无 `box-shadow`，圆角统一 `6px`；分割线用文字装饰 `· · ·`（非实线）
- 深色代码块是唯一暗色区，提供视觉节奏切换

---

## 文章类型 → 组件组合配方

按 SKILL.md 第 3 步判定的文章类型选配方；核心组件构成本篇排版主旋律，点缀组件按内容出现处使用，一篇文章点缀组件种类 ≤3，避免花哨。

| 文章类型 | 核心组件组合 | 点缀组件 |
|---|---|---|
| 技术教程 | 章节标题5 + 代码块14c（深色）+ step-label 10a + 行内代码7f | 蓝色提示9a、tool-card 10b、ordered-list 11a |
| 工具测评 | 数据卡12 + tool-card 10b + 标签胶囊13 | 金句引用8b、pill-list 11b、图片14a |
| 知识整理 | 章节标题5 + 提示9(b) + 纵向步骤流10a + 引用8a | 灰底旁注8c、timeline 11c |
| 观点分析 | 金句引用8b + 居中金句8d + 引言卡2 | 灰底旁注8c、踩坑提示9b |
| 深度文章 | 章节标题5 + 大引号引用8c + 提示9b | 图片14a、分割线4 |
| 产品深潜 | 数据卡12 + 代码块14c + 章节标题5 + 标签组10 | 标签胶囊13、tool-card 10b |

所有类型共用固定结构：引言卡 2 + 导读 3（3+ 章节）+ 编号章节 5 + END 15 + 签名 16。

---

## Markdown → 极简蓝排版 映射规则

| Markdown 元素 | 对应组件 | 说明 |
|---|---|---|
| `# 标题` | 不使用 | 公众号文章标题在平台设置 |
| 文章开头 `> 引言金句` | 组件 2 浅蓝底引言卡 | 视角与外标题错开 |
| `## 章节标题` | 组件 5 章节标题 | 蓝底编号 01/02…，末章 ∞ + THE END |
| `### 子标题` | 组件 6b 蓝色左竖条小标题 | 不套编号章节样式 |
| 普通段落 | 组件 6 正文段落 | 每段主动标 1~3 处淡蓝下划线 7d |
| `**加粗文字**` | 组件 7a 普通加粗（默认）/ 蓝色加粗（锚点 ≤5） | 普通加粗为主 |
| `==高亮文字==` | 组件 7b 浅蓝底深蓝字标签 | 核心概念 |
| `<u>下划线</u>` / `++文字++` | 组件 7d 淡蓝下划线 | 次要强调 |
| `~~删除线~~` | `text-decoration:line-through` + 灰字 `#999` | 被淘汰概念 |
| 行内 `` `code` `` | 组件 7f 行内代码 | 浅灰底 `#f1f5f9` + 蓝字 |
| `> 引用段落`（金句） | 组件 8a 蓝竖条 / 8b 浅蓝底 | 核心金句 |
| `> 引用段落`（旁注） | 组件 8c 大引号 / 灰底旁注 | 轻量旁注 |
| 核心金句 | 组件 8a / 8d 居中金句 / 8c 大引号 | 视觉焦点 |
| 操作步骤 | 组件 10a step-label | STEP 01/02… |
| 技能/工具清单 | 组件 10a skill/tool-label + 10b tool-card | |
| 案例/经历脉络 | 组件 10a case-label / 11c timeline | |
| Prompt 提示词 | 组件 8b 浅蓝引用块 / 14c 深色代码块（长多行） | |
| ` ``` 多行代码块 ``` ` | 通用库 1a 深色（本主题默认，去阴影）/ 1b 浅色（左竖条 #2563eb） | 每行一个 `<p style="margin:0">` |
| 并列要点 | 组件 11b pill-list | |
| `1. 2. 3.` 编号列表 | 组件 11a ordered-list | 蓝色圆标 |
| 数据展示 | 组件 12 数据卡片组 / 表格 | 蓝色大号数字 |
| Markdown 表格 | 组件 12 表格 | 偶数行浅蓝底 |
| 注意/警告 | 组件 9a 蓝色提示 / 9b 踩坑提示 | |
| 行内标签 | 组件 13 标签胶囊 | 浅蓝底默认 |
| `---` | 组件 4 章节分割线 | 文字装饰 `· · ·` |
| `![](图片)` | 组件 14 图片容器 | 圆角卡片 + 说明，无阴影 |
| 文末 | 组件 15 END + 16 签名 | |
