/**
 * editorMenu.js — 编辑区右键菜单（对齐 Typora 的菜单结构）
 *
 * Typora 的右键菜单大致是：
 *   剪切 / 复制 / 粘贴 / 复制为纯文本 / 粘贴为纯文本
 *   ───
 *   段落 ▸   （标题 1-6、段落、表格、代码块、引用、有序/无序/任务列表、分割线）
 *   格式 ▸   （加粗、斜体、下划线、删除线、行内代码、高亮、清除格式、超链接、图片）
 *   ───
 *   （光标在表格里时）表格 ▸ 增删行列 / 格式化
 *   ───
 *   全选 / 选中当前行
 *   查找替换
 *
 * 本文件只负责「按当前上下文组装菜单项」，菜单的绘制交给 contextmenu.js。
 */

import { showContextMenu } from "./contextmenu.js";

/**
 * 给编辑区绑定右键菜单。
 * @param {object} opt
 * @param {HTMLElement[]} opt.targets 需要绑定的元素（源码 textarea + 富文本 div）
 * @param {() => object} opt.getEditor 取当前 editor 实例（切换模式后会换对象，所以用 getter）
 * @param {() => void} opt.onFind 打开查找面板
 * @param {(msg: string) => void} opt.onStatus 写状态栏
 */
export function bindEditorContextMenu({ targets, getEditor, onFind, onStatus, onUndo, onRedo, onReplaceImage, onZoomImage }) {
  targets.forEach((el) => {
    if (!el) return;
    el.addEventListener("contextmenu", async (e) => {
      e.preventDefault();
      const editor = getEditor();
      if (!editor) return;

      // contenteditable 右键不会自动移动光标，先把 caret 落到点击处，
      // 否则「粘贴」会插到上一次光标的位置。
      editor.caretFromPoint?.(e.clientX, e.clientY);

      const img = e.target.closest?.("img");
      const items = img
        ? buildImageMenu(img, editor, onStatus, onReplaceImage, onZoomImage)
        : await buildMainMenu(editor, onFind, onStatus);

      showContextMenu(items, e.clientX, e.clientY);
    });
  });
}

/** 主菜单（在正文上右键） */
async function buildMainMenu(editor, onFind, onStatus) {
  const selText = editor.getSelectionText?.() || "";
  const hasSel = selText.length > 0;
  // 剪贴板里有没有东西，决定「粘贴」是否置灰
  let clipText = "";
  let clipHasImage = false;
  try {
    clipText = (await window.api.clipboardReadText()) || "";
    clipHasImage = !!(await window.api.clipboardReadImage());
  } catch (_) {
    /* 剪贴板不可用时按空处理，粘贴项置灰 */
  }
  const canPaste = !!clipText || clipHasImage;
  const inTable = !!editor.inTable?.();

  const items = [
    {
      label: "撤销",
      accel: "Ctrl+Z",
      action: () => (onUndo ? onUndo() : editor.undo?.()),
    },
    {
      label: "重做",
      accel: "Ctrl+Y",
      action: () => (onRedo ? onRedo() : editor.redo?.()),
    },
    { sep: true },
    {
      label: "剪切",
      accel: "Ctrl+X",
      disabled: !hasSel,
      action: () => cut(editor, selText, onStatus),
    },
    {
      label: "复制",
      accel: "Ctrl+C",
      disabled: !hasSel,
      action: () => copy(selText, onStatus),
    },
    {
      label: "粘贴",
      accel: "Ctrl+V",
      disabled: !canPaste,
      action: () => paste(editor, { plain: false }),
    },
    {
      label: "粘贴为纯文本",
      accel: "Ctrl+Shift+V",
      disabled: !clipText,
      action: () => paste(editor, { plain: true }),
    },
    { sep: true },
    { label: "段落", sub: paragraphItems(editor) },
    { label: "格式", sub: formatItems(editor) },
  ];

  // 只有光标真的在表格里才出现表格操作，跟 Typora 一致
  if (inTable) {
    items.push({ label: "表格", sub: tableItems(editor) });
  }

  items.push(
    { sep: true },
    { label: "插入表格", action: () => editor.tableOp("insert") },
    { label: "插入链接", accel: "Ctrl+K", action: () => editor.insertLink() },
    { label: "插入图片", action: () => editor.insertImage() },
    { sep: true },
    { label: "全选", accel: "Ctrl+A", action: () => editor.selectAll?.() },
    { label: "选中当前行", action: () => editor.selectLine?.() },
    { sep: true },
    { label: "查找和替换", accel: "Ctrl+F", action: () => onFind?.() }
  );

  return items;
}

/** 「段落」子菜单 */
function paragraphItems(editor) {
  const headings = [1, 2, 3, 4, 5, 6].map((n) => ({
    label: `${n} 级标题`,
    accel: `Ctrl+${n}`,
    action: () => editor.setHeading(n),
  }));
  return [
    ...headings,
    { label: "正文段落", accel: "Ctrl+0", action: () => editor.setHeading(0) },
    { sep: true },
    { label: "无序列表", action: () => editor.linePrefix("- ") },
    { label: "有序列表", action: () => editor.linePrefix("1. ") },
    { label: "任务列表", action: () => editor.linePrefix("- [ ] ") },
    { sep: true },
    { label: "引用块", action: () => editor.linePrefix("> ") },
    { label: "代码块", action: () => (editor.insertCodeBlock ? editor.insertCodeBlock() : editor.insertBlock("```\n\n```")) },
    { label: "公式块", action: () => (editor.insertMathBlock ? editor.insertMathBlock() : editor.insertBlock("$$\n\n$$")) },
    { label: "分割线", action: () => editor.insertBlock("---") },
    { sep: true },
    { label: "增加缩进", accel: "Tab", action: () => editor.indent(true) },
    { label: "减少缩进", accel: "Shift+Tab", action: () => editor.indent(false) },
  ];
}

/** 「格式」子菜单 */
function formatItems(editor) {
  return [
    { label: "加粗", accel: "Ctrl+B", action: () => editor.wrap("**", "**", "粗体") },
    { label: "斜体", accel: "Ctrl+I", action: () => editor.wrap("*", "*", "斜体") },
    { label: "删除线", action: () => editor.wrap("~~", "~~", "删除线") },
    { label: "行内代码", accel: "Ctrl+`", action: () => editor.toggleCode() },
    { label: "行内公式", action: () => (editor.insertMathInline ? editor.insertMathInline() : editor.wrap("$", "$", "x^2")) },
    { sep: true },
    { label: "超链接", accel: "Ctrl+K", action: () => editor.insertLink() },
    { label: "图片", action: () => editor.insertImage() },
    { sep: true },
    { label: "引号包裹", action: () => editor.wrap("“", "”", "引用文字") },
  ];
}

/** 「表格」子菜单——直接复用 editor.tableOp */
function tableItems(editor) {
  return [
    { label: "上方插入行", action: () => editor.tableOp("rowAbove") },
    { label: "下方插入行", action: () => editor.tableOp("rowBelow") },
    { label: "左侧插入列", action: () => editor.tableOp("colLeft") },
    { label: "右侧插入列", action: () => editor.tableOp("colRight") },
    { sep: true },
    { label: "删除当前行", danger: true, action: () => editor.tableOp("delRow") },
    { label: "删除当前列", danger: true, action: () => editor.tableOp("delCol") },
    { label: "删除整个表格", danger: true, action: () => editor.tableOp("delTable") },
    { sep: true },
    { label: "自动格式化表格", action: () => editor.tableOp("format") },
  ];
}

/** 在图片上右键（富文本模式） */
function buildImageMenu(img, editor, onStatus, onReplaceImage, onZoomImage) {
  const src = img.getAttribute("src") || "";
  const name = (img.getAttribute("alt") || "image").replace(/[\\/:*?"<>|]/g, "_");
  const isData = src.startsWith("data:image/");
  const items = [];
  // 放大查看 / 替换图片：由主进程侧传入回调实现（#190）
  if (isData && onZoomImage) items.push({ label: "放大查看", action: () => onZoomImage(img) });
  if (onReplaceImage) items.push({ label: "替换图片", action: () => onReplaceImage(img) });
  if (items.length) items.push({ sep: true });
  items.push(
    {
      label: "复制图片",
      disabled: !isData,
      action: async () => {
        const ok = await window.api.clipboardWriteImage(src);
        onStatus?.(ok ? "图片已复制到剪贴板" : "复制失败：图片格式不支持");
      },
    },
    {
      label: "复制图片地址",
      action: () => {
        window.api.clipboardWriteText(src);
        onStatus?.(isData ? "已复制图片的 base64 地址" : "已复制图片地址");
      },
    },
    {
      label: "图片另存为…",
      disabled: !isData,
      action: async () => {
        const p = await window.api.saveImage(src, `${name}.png`);
        if (p) onStatus?.(`图片已保存：${p}`);
      },
    },
    { sep: true },
    {
      label: "删除图片",
      danger: true,
      action: () => {
        img.remove();
        editor.el?.dispatchEvent(new Event("input", { bubbles: true }));
        onStatus?.("已删除图片");
      },
    },
  );
  return items;
}

/* ---------- 剪贴板动作 ---------- */

function copy(text, onStatus) {
  window.api.clipboardWriteText(text);
  onStatus?.(`已复制 ${text.length} 个字符`);
}

function cut(editor, text, onStatus) {
  window.api.clipboardWriteText(text);
  editor.deleteSelection?.();
  onStatus?.(`已剪切 ${text.length} 个字符`);
}

/**
 * 粘贴。
 * - plain=true：只取纯文本，且在富文本模式下不做 Markdown 解析（对齐 Typora 的「粘贴为纯文本」）
 * - plain=false：优先图片，其次文本
 */
async function paste(editor, { plain }) {
  if (!plain) {
    const dataUrl = await window.api.clipboardReadImage();
    if (dataUrl) {
      if (editor.insertHTML) {
        editor.insertHTML(`<img src="${dataUrl}" alt="image" />`);
      } else {
        editor.insertText(`![image](${dataUrl})`);
      }
      return;
    }
  }
  const text = await window.api.clipboardReadText();
  if (text) editor.insertText(text);
}
