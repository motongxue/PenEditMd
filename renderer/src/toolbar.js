/**
 * toolbar.js — 极简工具栏（从零实现）
 *
 * 一条紧凑的工具栏：左侧应用操作(打开/复制/导出/主题)在 main.js 绑定，
 * 本文件只负责中间的「格式按钮组」。每个按钮触发 editor 的对应命令，
 * 往 textarea 插入标准 Markdown 语法。按钮以小图标为主，省空间。
 * 下拉菜单（标题/表格）挂 document.body，fixed 定位，不被工具栏遮挡。
 */

import { positionMenuUnder } from "./bodyMenu.js";

const FORMATS = [
  { type: "heading", title: "标题 (H1–H6)，点击展开选择" },
  { sep: true },
  { label: "B", cmd: "wrap", arg: ["**", "**", "粗体"], title: "加粗 (Ctrl+B)" },
  { label: "I", cmd: "wrap", arg: ["*", "*", "斜体"], title: "斜体 (Ctrl+I)" },
  { label: "S", cmd: "wrap", arg: ["~~", "~~", "删除线"], title: "删除线" },
  { label: "“”", cmd: "wrap", arg: ["“", "”", "引用文字"], title: "引号包裹" },
  { sep: true },
  { label: "❝", cmd: "linePrefix", arg: "> ", title: "引用块" },
  { label: "</>", cmd: "toggleCode", title: "行内代码 (Ctrl+`)" },
  { label: "▤", cmd: "codeblock", title: "代码块" },
  { sep: true },
  { label: "Σ", cmd: "mathblock", title: "块级公式 $$…$$（也可在空行输入 $$ 后回车）" },
  { label: "𝑥", cmd: "mathinline", title: "行内公式 $…$" },
  { sep: true },
  { label: "🔗", cmd: "insertLink", title: "链接 (Ctrl+K)" },
  { label: "🖼", cmd: "insertImage", title: "图片" },
  { label: "―", cmd: "hr", title: "分割线" },
  { sep: true },
  { label: "•", cmd: "linePrefix", arg: "- ", title: "无序列表" },
  { label: "1.", cmd: "linePrefix", arg: "1. ", title: "有序列表" },
  { label: "☑", cmd: "task", title: "任务列表" },
  { type: "table", title: "表格：插入 / 增删行列 / 格式化" },
];

/** 表格下拉里的操作项；op 直接透传给 editor.tableOp */
const TABLE_ITEMS = [
  { label: "插入表格", op: "insert" },
  { sep: true },
  { label: "上方插入行", op: "rowAbove" },
  { label: "下方插入行", op: "rowBelow" },
  { label: "左侧插入列", op: "colLeft" },
  { label: "右侧插入列", op: "colRight" },
  { sep: true },
  { label: "删除当前行", op: "delRow" },
  { label: "删除当前列", op: "delCol" },
  { label: "删除整个表格", op: "delTable" },
  { sep: true },
  { label: "自动格式化表格", op: "format" },
];

function runCmd(editor, f) {
  switch (f.cmd) {
    case "wrap":
      editor.wrap(f.arg[0], f.arg[1], f.arg[2]);
      break;
    case "linePrefix":
      editor.linePrefix(f.arg);
      break;
    case "toggleCode":
      editor.toggleCode();
      break;
    case "insertLink":
      editor.insertLink();
      break;
    case "insertImage":
      editor.insertImage();
      break;
    case "hr":
      editor.insertBlock("---");
      break;
    case "codeblock":
      editor.insertCodeBlock ? editor.insertCodeBlock() : editor.insertBlock("```\n\n```");
      break;
    // 富文本模式插入可视化公式节点；源码模式退化为插入 LaTeX 文本
    case "mathblock":
      editor.insertMathBlock ? editor.insertMathBlock() : editor.insertBlock("$$\n\n$$");
      break;
    case "mathinline":
      editor.insertMathInline ? editor.insertMathInline() : editor.wrap("$", "$", "x^2");
      break;
    case "task":
      editor.linePrefix("- [ ] ");
      break;
  }
}

/**
 * 在 groupEl 内构建格式按钮组。
 * @param {HTMLElement} groupEl
 * @param {ReturnType<typeof import('./editor.js').createEditor>} editor
 */
export function buildToolbar(groupEl, editor) {
  groupEl.innerHTML = "";
  FORMATS.forEach((f) => {
    if (f.sep) {
      const s = document.createElement("span");
      s.className = "tb-sep";
      groupEl.appendChild(s);
      return;
    }
    if (f.type === "heading") {
      groupEl.appendChild(buildHeadingDropdown(editor));
      return;
    }
    if (f.type === "table") {
      groupEl.appendChild(
        buildDropdown("▦ 表格", f.title, TABLE_ITEMS, (it) => editor.tableOp(it.op))
      );
      return;
    }
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tbtn";
    b.textContent = f.label;
    b.title = f.title || f.label;
    // 关键：阻止 mousedown 默认行为，避免点击按钮时编辑区(contenteditable/textarea)
    // 失焦、选区丢失，否则 document.execCommand 会失效（加粗/标题等点了没反应）。
    b.addEventListener("mousedown", (e) => e.preventDefault());
    b.addEventListener("click", (e) => {
      e.preventDefault();
      runCmd(editor, f);
    });
    groupEl.appendChild(b);
  });
}

/** 启用/禁用整组格式按钮 */
export function setToolbarEnabled(groupEl, on) {
  groupEl.querySelectorAll("button").forEach((b) => (b.disabled = !on));
}

/**
 * 通用下拉按钮（标题 / 表格共用）。
 * 菜单挂 document.body（fixed 定位），避免被工具栏的 overflow:hidden / hover 展开遮挡。
 * 所有按钮都拦截 mousedown 默认行为，避免编辑区失焦导致选区/光标丢失。
 * @param {string} label 按钮文字
 * @param {string} title 悬浮提示
 * @param {Array<{label?:string,sep?:boolean}>} items 菜单项（sep:true 为分隔线）
 * @param {(item:any)=>void} onPick 点击回调
 */
function buildDropdown(label, title, items, onPick) {
  const wrap = document.createElement("div");
  wrap.className = "dropdown";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "tbtn";
  btn.textContent = label;
  btn.title = title || label;
  btn.addEventListener("mousedown", (e) => e.preventDefault());

  const menu = document.createElement("div");
  menu.className = "menu hidden";

  items.forEach((it) => {
    if (it.sep) {
      const s = document.createElement("div");
      s.className = "mi-sep";
      menu.appendChild(s);
      return;
    }
    const mi = document.createElement("button");
    mi.type = "button";
    mi.textContent = it.label;
    mi.addEventListener("mousedown", (e) => e.preventDefault());
    mi.addEventListener("click", (e) => {
      e.preventDefault();
      closeMenu();
      onPick(it);
    });
    menu.appendChild(mi);
  });

  let visible = false;
  const closeMenu = () => {
    visible = false;
    menu.classList.add("hidden");
  };

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (visible) {
      closeMenu();
      return;
    }
    // 先收起页面上其他已展开的菜单，避免多个下拉同时打开
    document.querySelectorAll(".menu:not(.hidden)").forEach((m) => {
      if (m !== menu) m.classList.add("hidden");
    });
    positionMenuUnder(menu, btn);
    visible = true;
  });

  document.addEventListener("click", (e) => {
    if (visible && !e.target.closest(".dropdown") && !menu.contains(e.target)) {
      closeMenu();
    }
  });
  window.addEventListener("blur", closeMenu);

  wrap.appendChild(btn);
  return wrap;
}

/** 标题下拉：正文 + H1–H6（PRD L1 要求支持 6 级标题） */
function buildHeadingDropdown(editor) {
  const items = [
    { label: "正文（取消标题）", level: 0 },
    { label: "H1　一级标题", level: 1 },
    { label: "H2　二级标题", level: 2 },
    { label: "H3　三级标题", level: 3 },
    { label: "H4　四级标题", level: 4 },
    { label: "H5　五级标题", level: 5 },
    { label: "H6　六级标题", level: 6 },
  ];
  return buildDropdown("标题", "标题 (H1–H6)", items, (it) => editor.setHeading(it.level));
}
