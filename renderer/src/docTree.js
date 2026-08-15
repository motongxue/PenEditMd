/**
 * docTree.js — 文档树（PRD #8）
 *
 * 渲染一个「工作文件夹」的目录树，支持：
 *  - 选择工作文件夹（持久化到 localStorage）
 *  - 懒展开：点文件夹才拉取其子项
 *  - 点击 .md/.txt 等文本文件 → 交给主进程打开（onOpenFile 回调，由 main.js 接入编辑器）
 *  - 右键：新建文件 / 新建文件夹 / 重命名 / 删除（全部走已选 root 内的主进程 IPC，
 *    主进程做路径越界校验，杜绝 ../ 越权读写）
 *
 * 不持有编辑器状态——它只负责「磁盘浏览」，打开/改名/删除的副作用通过回调上抛给 main.js。
 */

import { promptText } from "./prompt.js";

const OPENABLE = /\.(md|markdown|txt|text|mdx)$/i;
// 导入支持、但无法直接当文本编辑的文件：点击后交给后端自动转成 Markdown 打开。
// 这些类型在 MarkItDown 后端 /formats 支持列表内（server.py SUPPORTED_EXTENSIONS），
// 这里只挑「文档/表格/演示/网页/图片」等常见、转换有意义的类型，刻意排除音频(.wav/.mp3)、压缩包(.zip)等。
const CONVERTIBLE = /\.(docx?|pdf|pptx?|xlsx?|csv|html?|htm|rtf|odt|epub|xml|json|png|jpe?g|gif|bmp|webp|svg)$/i;

let rootPaths = []; // 支持多个工作文件夹（#3）：全部并列显示在文档树，除非主动「从列表移除」
let cb = {
  onOpenFile: null, // (filePath:string) => void | Promise<void>
  onOpenConverted: null, // (filePath:string) => void | Promise<void>  可转换文件点击后回调
  onPathRenamed: null, // (oldPath, newPath) => void
  onPathDeleted: null, // (path) => void
  setStatus: () => {},
};
const treeState = new Map(); // folderPath -> { expanded, loaded, children }
let menuEl = null;
let selectedPath = null; // 当前在编辑区打开的文档树路径（用于高亮）

/** 读取全部工作文件夹（数组，持久化在 localStorage） */
function docTreeRoots() {
  try {
    const raw = localStorage.getItem("docTreeRoots");
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v.filter(Boolean) : [];
  } catch (_) {
    return [];
  }
}
function saveDocTreeRoots() {
  try {
    localStorage.setItem("docTreeRoots", JSON.stringify(rootPaths));
  } catch (_) {}
}
/** 给定任意属于某工作文件夹的路径，找出它所属的根（用于 listDir/createFile 等越界校验） */
function rootFor(p) {
  if (!p) return rootPaths[0] || null;
  for (const r of rootPaths) if (r === p) return r; // 精确匹配（根自身）
  let best = null;
  for (const r of rootPaths) {
    if (p.startsWith(r + "/") || p.startsWith(r + "\\")) {
      if (!best || r.length > best.length) best = r; // 取最长前缀匹配
    }
  }
  return best || rootPaths[0] || null;
}

export function initDocTree(opts = {}) {
  cb = { ...cb, ...opts };
  rootPaths = docTreeRoots();
  // 兼容旧版：曾用单个 docTreeRoot 键，升级后并入多根列表，避免已选文件夹丢失
  if (!rootPaths.length) {
    try {
      const old = localStorage.getItem("docTreeRoot");
      if (old) {
        rootPaths = [old];
        saveDocTreeRoots();
      }
    } catch (_) {}
  }
  const selBtn = document.getElementById("btn-select-folder");
  const refBtn = document.getElementById("btn-tree-refresh");
  if (selBtn) selBtn.addEventListener("click", selectFolder);
  if (refBtn) refBtn.addEventListener("click", () => { treeState.clear(); render(); });
  buildContextMenu();
  // 空白区域右键 → 在根目录新建文件/文件夹（行内右键由 row 自身处理，这里只处理非行区域）
  const treeEl = document.getElementById("doc-tree");
  if (treeEl) {
    treeEl.addEventListener("contextmenu", (e) => {
      if (e.target.closest(".tree-row")) return; // 点在文件/文件夹行上：交给行内菜单
      e.preventDefault();
      showRootMenu(e.clientX, e.clientY);
    });
  }
  render();
}

async function selectFolder() {
  let p = null;
  try {
    p = await window.api.selectFolder();
  } catch (_) {
    p = null;
  }
  if (!p) return;
  // #3：改为「追加」而非「替换」——之前选的文件夹仍在列表里
  if (!rootPaths.includes(p)) {
    rootPaths.push(p);
    saveDocTreeRoots();
  }
  treeState.clear();
  render();
  cb.setStatus("已添加工作文件夹：" + p);
}

/* ---------------- 渲染 ---------------- */

function render() {
  const c = document.getElementById("doc-tree");
  if (!c) return;
  c.innerHTML = "";
  if (!rootPaths.length) {
    const hint = document.createElement("div");
    hint.className = "tree-hint";
    hint.textContent = "点击「添加文件夹」把工作目录加入列表";
    c.appendChild(hint);
    return;
  }
  // #3：所有工作文件夹并列显示，互不替换
  rootPaths.forEach((p) => c.appendChild(buildRootNode(p)));
}

/** 构建一个工作文件夹（根）节点 */
function buildRootNode(p) {
  const rootLi = document.createElement("div");
  rootLi.className = "tree-node";

  const caret = document.createElement("span");
  caret.className = "tree-caret";

  const row = document.createElement("div");
  row.className = "tree-row tree-folder";
  row.dataset.path = p;
  const ico = document.createElement("span");
  ico.className = "tree-ico";
  ico.textContent = "📁";
  const name = document.createElement("span");
  name.className = "tree-name";
  name.textContent = rootName(p) + "  (" + p + ")";
  row.append(caret, ico, name);

  const childBox = document.createElement("div");
  childBox.className = "tree-children";

  rootLi.append(row, childBox);

  const st = ensureState(p, true); // 根目录默认展开
  if (st.expanded) {
    caret.textContent = "▾";
    loadChildren(p, childBox, row);
  } else {
    caret.textContent = "▸";
    childBox.classList.add("hidden");
  }
  caret.addEventListener("click", (e) => { e.stopPropagation(); toggleFolder(p, childBox, caret, row); });
  row.addEventListener("click", () => toggleFolder(p, childBox, caret, row));
  row.addEventListener("contextmenu", (e) => { e.preventDefault(); showMenu(e, p, true); });
  return rootLi;
}

function rootName(p) {
  return p ? (p.split(/[\\/]/).pop() || p) : "";
}

function ensureState(p, defaultExpanded = false) {
  let s = treeState.get(p);
  if (!s) {
    s = { expanded: defaultExpanded, loaded: false, children: [] };
    treeState.set(p, s);
  }
  return s;
}

function toggleFolder(p, childBox, caret, row) {
  const st = ensureState(p);
  st.expanded = !st.expanded;
  if (st.expanded) {
    caret.textContent = "▾";
    childBox.classList.remove("hidden");
    loadChildren(p, childBox, row);
  } else {
    caret.textContent = "▸";
    childBox.classList.add("hidden");
  }
}

async function loadChildren(parentPath, childBox, parentRow) {
  const st = ensureState(parentPath);
  if (st.loaded) {
    renderChildren(st.children, childBox);
    return;
  }
  parentRow.classList.add("loading");
  let entries = [];
  try {
    entries = (await window.api.listDir(rootFor(parentPath), parentPath)) || [];
  } catch (_) {
    entries = [];
  }
  parentRow.classList.remove("loading");
  st.children = entries;
  st.loaded = true;
  renderChildren(st.children, childBox);
}

function renderChildren(entries, childBox) {
  childBox.innerHTML = "";
  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "tree-empty";
    empty.textContent = "（空）";
    childBox.appendChild(empty);
    return;
  }
  for (const e of entries) {
    const node = document.createElement("div");
    node.className = "tree-node";
    const row = document.createElement("div");
    row.className = "tree-row " + (e.isDir ? "tree-folder" : "tree-file");
    row.dataset.path = e.path;

    if (e.isDir) {
      const caret = document.createElement("span");
      caret.className = "tree-caret";
      caret.textContent = "▸";
      const ico = document.createElement("span");
      ico.className = "tree-ico";
      ico.textContent = "📁";
      const name = document.createElement("span");
      name.className = "tree-name";
      name.textContent = e.name;
      row.append(caret, ico, name);
      const subBox = document.createElement("div");
      subBox.className = "tree-children hidden";
      node.append(row, subBox);
      childBox.appendChild(node);

      const st = ensureState(e.path);
      if (st.expanded) {
        caret.textContent = "▾";
        subBox.classList.remove("hidden");
        loadChildren(e.path, subBox, row);
      }
      caret.addEventListener("click", (ev) => { ev.stopPropagation(); toggleFolder(e.path, subBox, caret, row); });
      row.addEventListener("click", () => toggleFolder(e.path, subBox, caret, row));
      row.addEventListener("contextmenu", (ev) => { ev.preventDefault(); showMenu(ev, e.path, true); });
    } else {
      // 过滤掉「导入不支持」的类型：既不文本可编辑、也无法转换的文件不显示在目录树里。
      if (!isOpenable(e.name) && !isConvertible(e.name)) return;
      const convertible = !isOpenable(e.name) && isConvertible(e.name);
      const ico = document.createElement("span");
      ico.className = "tree-ico";
      ico.textContent = convertible ? "🔄" : "📄";
      const name = document.createElement("span");
      name.className = "tree-name";
      name.textContent = e.name;
      row.append(ico, name);
      // 选中高亮：当前打开的文档树文件
      if (e.path === selectedPath) row.classList.add("active");
      if (convertible) {
        row.classList.add("tree-file", "tree-convertible");
        row.title = "点击后自动转换为 Markdown 打开";
        row.addEventListener("click", () => { setSelected(e.path); if (cb.onOpenConverted) cb.onOpenConverted(e.path); });
      } else {
        row.classList.add("tree-file");
        row.addEventListener("click", () => openFile(e.path));
      }
      row.addEventListener("contextmenu", (ev) => { ev.preventDefault(); showMenu(ev, e.path, false); });
      node.append(row);
      childBox.appendChild(node);
    }
  }
}

function isOpenable(name) {
  return OPENABLE.test(name);
}

function isConvertible(name) {
  return CONVERTIBLE.test(name);
}

/** 高亮当前在编辑区打开的文档树文件，并清除其它行的选中态 */
function setSelected(path) {
  selectedPath = path || null;
  document.querySelectorAll("#doc-tree .tree-row").forEach((r) => {
    r.classList.toggle("active", !!path && r.dataset.path === path);
  });
}

async function openFile(path) {
  setSelected(path);
  if (cb.onOpenFile) {
    try {
      await cb.onOpenFile(path);
    } catch (e) {
      console.error("openFile", e);
    }
  }
}

/* ---------------- 右键菜单 ---------------- */

function buildContextMenu() {
  if (menuEl) return;
  menuEl = document.createElement("div");
  menuEl.className = "ctx-menu hidden";
  document.body.appendChild(menuEl);
  document.addEventListener("click", hideContextMenu);
  window.addEventListener("blur", hideContextMenu);
}

function showContextMenu(x, y, items) {
  menuEl.innerHTML = "";
  for (const it of items) {
    const b = document.createElement("div");
    b.className = "ctx-item" + (it.danger ? " danger" : "");
    b.textContent = it.label;
    b.addEventListener("click", (ev) => {
      ev.stopPropagation();
      hideContextMenu();
      try { it.onClick(); } catch (e) { console.error(e); }
    });
    menuEl.appendChild(b);
  }
  menuEl.classList.remove("hidden");
  const w = menuEl.offsetWidth;
  const h = menuEl.offsetHeight;
  const px = Math.min(x, window.innerWidth - w - 8);
  const py = Math.min(y, window.innerHeight - h - 8);
  menuEl.style.left = px + "px";
  menuEl.style.top = py + "px";
}

function hideContextMenu() {
  if (menuEl) menuEl.classList.add("hidden");
}

function showMenu(e, path, isDir) {
  e.preventDefault();
  hideContextMenu();
  const items = [];
  if (isDir) {
    items.push({ label: "新建文件", onClick: () => newFileIn(path) });
    items.push({ label: "新建文件夹", onClick: () => newFolderIn(path) });
    // 根工作文件夹：仅提供「从列表移除」（不动本地文件），不提供删除/改名
    if (rootPaths.includes(path)) {
      items.push({ label: "从列表移除", onClick: () => removeFromList(path) });
    } else {
      // 普通子文件夹：重命名 / 删除（删除会真的删本地文件，需谨慎）
      items.push({ label: "重命名", onClick: () => renameItem(path, true) });
      items.push({ label: "删除", danger: true, onClick: () => removeItem(path, true) });
    }
  } else {
    items.push({ label: "重命名", onClick: () => renameItem(path, false) });
    items.push({ label: "删除", danger: true, onClick: () => removeItem(path, false) });
  }
  showContextMenu(e.clientX, e.clientY, items);
}

/** 右键空白区域：在根工作目录新建文件/文件夹（多根时默认建在第一个工作文件夹） */
function showRootMenu(x, y) {
  if (!rootPaths.length) {
    cb.setStatus("请先点「添加文件夹」再新建");
    return;
  }
  const target = rootPaths[0];
  hideContextMenu();
  showContextMenu(x, y, [
    { label: "新建文件（" + rootName(target) + "）", onClick: () => newFileIn(target) },
    { label: "新建文件夹（" + rootName(target) + "）", onClick: () => newFolderIn(target) },
  ]);
}

/* ---------------- 操作 ---------------- */

function parentOf(p) {
  return p.replace(/[\\/][^\\/]*$/, "");
}

function invalidate(p) {
  treeState.delete(p);
}

async function newFileIn(dir) {
  const name = await promptText("新建文件", "未命名.md", "文件名（未带扩展名会自动补 .md）");
  if (!name) return;
  // 未带扩展名时自动补 .md，保证新建的是可编辑的 Markdown 文件
  const fileName = /\.[^.]+$/.test(name) ? name : name + ".md";
  let p = null;
  try {
    p = await window.api.createFile(rootFor(dir), dir, fileName, "");
  } catch (_) {
    p = null;
  }
  if (!p) {
    cb.setStatus("新建文件失败（路径无效或已存在）");
    return;
  }
  invalidate(dir);
  render();
  cb.setStatus("已新建 " + p);
  // 创建后直接打开该文件，并切到「会话」标签页、选中对应会话（用户要求）
  if (cb.onOpenFile) {
    try {
      await cb.onOpenFile(p);
      const tab = document.querySelector('.sidebar-tabs .tab[data-tab="session"]');
      if (tab) tab.click();
    } catch (_) {}
  }
}

async function newFolderIn(dir) {
  const name = await promptText("新建文件夹", "新建文件夹");
  if (!name) return;
  let p = null;
  try {
    p = await window.api.createDir(rootFor(dir), dir, name);
  } catch (_) {
    p = null;
  }
  if (!p) {
    cb.setStatus("新建文件夹失败（路径无效或已存在）");
    return;
  }
  invalidate(dir);
  render();
  cb.setStatus("已新建文件夹 " + p);
}

async function renameItem(path, isDir) {
  const old = path.split(/[\\/]/).pop();
  const nn = await promptText("重命名", old);
  if (!nn || nn === old) return;
  let np = null;
  try {
    np = await window.api.renamePath(rootFor(path), path, nn);
  } catch (_) {
    np = null;
  }
  if (!np) {
    cb.setStatus("重命名失败（名称无效或已存在）");
    return;
  }
  if (cb.onPathRenamed) cb.onPathRenamed(path, np);
  invalidate(parentOf(path));
  invalidate(path);
  render();
  cb.setStatus("已重命名为 " + np);
}

async function removeItem(path, isDir) {
  let ok = false;
  try {
    ok = await window.api.removePath(rootFor(path), path);
  } catch (_) {
    ok = false;
  }
  if (!ok) {
    cb.setStatus("删除失败");
    return;
  }
  if (cb.onPathDeleted) cb.onPathDeleted(path);
  invalidate(parentOf(path));
  invalidate(path);
  render();
  cb.setStatus("已删除 " + path);
}

/** #4：仅从文档树列表移除工作文件夹，不删除本地磁盘文件 */
async function removeFromList(p) {
  rootPaths = rootPaths.filter((r) => r !== p);
  saveDocTreeRoots();
  // 清除该根下的展开/加载缓存，再重渲染
  for (const key of [...treeState.keys()]) {
    if (key === p || key.startsWith(p + "/") || key.startsWith(p + "\\")) treeState.delete(key);
  }
  render();
  cb.setStatus("已从列表移除：" + p + "（本地文件未删除）");
}
