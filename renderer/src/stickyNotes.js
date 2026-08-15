/**
 * stickyNotes.js — 便签管理（PRD #10）
 *
 * 便签的「浮窗」现在由独立置顶透明窗口（notes.html）承载，可停留在桌面，
 * 不受主窗口最小化影响（见 main.js ensureNotesWindow + 本目录 notes.html）。
 * 本模块只负责主窗口「便签」标签页的「管理列表」：
 *   - 列出所有便签（片段 + 显示/隐藏 + 删除）
 *   - 新建便签（创建数据并打开桌面浮窗）
 *   - 与桌面浮窗通过主进程 notes IPC 同步（notes:changed 广播刷新列表）
 * 便签内容持久化在主进程（userData/sticky-notes.json），跨会话不丢失。
 */

import { promptText } from "./prompt.js";

const COLORS = ["#fff7c2", "#c8f0d8", "#ffe0c2", "#cfe3ff", "#f0c8ef"];

let notes = [];
let cbStatus = () => {};

function newId() {
  return "n" + Date.now() + Math.random().toString(36).slice(2, 6);
}

export async function initStickyNotes(opts = {}) {
  cbStatus = opts.setStatus || (() => {});
  try {
    notes = (await window.api.notesGetAll()) || [];
    if (!Array.isArray(notes)) notes = [];
  } catch (_) {
    notes = [];
  }
  renderList();
  const newBtn = document.getElementById("btn-new-note");
  if (newBtn) newBtn.addEventListener("click", createNote);
  // 「关闭应用时显示便签」开关：从主进程偏好读取初值，变更时写回
  const keepChk = document.getElementById("keep-notes-on-close");
  if (keepChk) {
    try {
      const prefs = (await window.api.getPrefs()) || {};
      keepChk.checked = !!prefs.keepNotesOnClose;
    } catch (_) {}
    keepChk.addEventListener("change", async () => {
      try {
        await window.api.setPref("keepNotesOnClose", keepChk.checked);
        cbStatus(keepChk.checked ? "已开启：关闭应用后便签仍显示" : "已关闭：关闭应用会一并关闭便签");
      } catch (_) {}
    });
  }
  // 主进程广播（来自桌面浮窗的增删改也会触发，保持列表与浮窗一致）
  try {
    window.api.onNotesChanged((store) => {
      notes = store || [];
      renderList();
    });
  } catch (_) {}
}

/** 单条便签右键菜单：切换「开机启动」 */
let noteMenuEl = null;
function buildNoteMenu() {
  if (noteMenuEl) return;
  noteMenuEl = document.createElement("div");
  noteMenuEl.className = "ctx-menu hidden";
  document.body.appendChild(noteMenuEl);
  document.addEventListener("click", hideNoteMenu);
  window.addEventListener("blur", hideNoteMenu);
}
function hideNoteMenu() {
  if (noteMenuEl) noteMenuEl.classList.add("hidden");
}
function showNoteMenu(x, y, n) {
  if (!noteMenuEl) buildNoteMenu();
  noteMenuEl.innerHTML = "";

  // 重命名（#6）
  const renameItem = document.createElement("div");
  renameItem.className = "ctx-item";
  renameItem.textContent = "重命名";
  renameItem.addEventListener("click", (ev) => {
    ev.stopPropagation();
    hideNoteMenu();
    renameNote(n);
  });
  noteMenuEl.appendChild(renameItem);

  // 置顶 / 取消置顶（#2：仅本便签窗口置顶）
  const pinLabel = n.pinned ? "取消置顶" : "置顶显示";
  const pinItem = document.createElement("div");
  pinItem.className = "ctx-item";
  pinItem.textContent = pinLabel;
  pinItem.addEventListener("click", (ev) => {
    ev.stopPropagation();
    hideNoteMenu();
    n.pinned = !n.pinned;
    try { window.api.notesUpsert(n, false); } catch (_) {}
    renderList();
    cbStatus(n.pinned ? "已置顶该便签" : "已取消该便签置顶");
  });
  noteMenuEl.appendChild(pinItem);

  // 开机启动 / 取消（原功能保留）
  const label = n.launchAtLogin ? "取消开机启动" : "开机启动";
  const item = document.createElement("div");
  item.className = "ctx-item";
  item.textContent = label;
  item.addEventListener("click", (ev) => {
    ev.stopPropagation();
    hideNoteMenu();
    toggleLaunch(n);
  });
  noteMenuEl.appendChild(item);

  noteMenuEl.classList.remove("hidden");
  const w = noteMenuEl.offsetWidth;
  const h = noteMenuEl.offsetHeight;
  const px = Math.min(x, window.innerWidth - w - 8);
  const py = Math.min(y, window.innerHeight - h - 8);
  noteMenuEl.style.left = px + "px";
  noteMenuEl.style.top = py + "px";
}

/** 切换单条便签是否开机启动：开启时同时标记为「显示」，并据全局是否有开机项注册/注销登录项 */
async function toggleLaunch(n) {
  n.launchAtLogin = !n.launchAtLogin;
  if (n.launchAtLogin) n.open = true; // 开机启动的便签也应显示
  try {
    await window.api.notesUpsert(n, false);
    const any = notes.some((x) => x.launchAtLogin);
    await window.api.setAutoLaunch(any);
  } catch (_) {}
  renderList();
  cbStatus(n.launchAtLogin ? "已设为开机启动便签" : "已取消该便签的开机启动");
}

async function createNote() {
  const n = {
    id: newId(),
    name: "便签 " + (notes.length + 1),
    text: "",
    x: 120 + (notes.length % 6) * 28,
    y: 120 + (notes.length % 6) * 28,
    w: 220,
    h: 160,
    color: COLORS[notes.length % COLORS.length],
    open: true,
  };
  notes.push(n);
  renderList(); // 立即本地渲染，保证列表立刻出现新便签
  try {
    // notesUpsert 返回主进程权威 store，用它刷新列表，避免本地/远端不一致
    const store = await window.api.notesUpsert(n, false);
    if (Array.isArray(store)) notes = store;
    await window.api.notesEnsureWindow(); // 打开/显示桌面便签窗口
  } catch (_) {}
  renderList();
  cbStatus("已新建便签（桌面浮窗）");
}

function toggleNote(n) {
  n.open = !n.open;
  try {
    window.api.notesUpsert(n, false);
    if (n.open) window.api.notesEnsureWindow();
  } catch (_) {}
  renderList();
}

function deleteNote(n) {
  notes = notes.filter((x) => x.id !== n.id);
  try {
    window.api.notesRemove(n.id);
  } catch (_) {}
  renderList();
  cbStatus("已删除便签");
}

/** 重命名便签：双击列表名称触发，弹窗输入新名称并持久化（浮窗标题也会同步） */
async function renameNote(n) {
  const v = await promptText("便签名称", n.name || "", "给便签起个名字");
  if (v == null) return;
  n.name = v;
  try {
    await window.api.notesUpsert(n, false);
  } catch (_) {}
  renderList();
}

function snippetOf(n) {
  const tasks = Array.isArray(n.tasks) ? n.tasks : [];
  if (tasks.length) {
    const done = tasks.filter((t) => t.done).length;
    const firstUndone = tasks.find((t) => !t.done);
    const head = `✓ ${done}/${tasks.length}`;
    const extra = firstUndone && firstUndone.text ? "  " + firstUndone.text.slice(0, 24) : "";
    return head + extra;
  }
  const first = (n.text || "").split("\n")[0];
  return (first || "（空便签）").slice(0, 40);
}

function renderList() {
  const list = document.getElementById("notes-list");
  if (!list) return;
  list.innerHTML = "";
  if (!notes.length) {
    const li = document.createElement("li");
    li.className = "notes-empty";
    li.textContent = "还没有便签，点「新建便签」试试（会显示在桌面浮窗）";
    list.appendChild(li);
    return;
  }
  notes.forEach((n) => {
    const li = document.createElement("li");
    li.dataset.id = n.id;
    li.className = "note-item" + (n.open ? " open" : "") + (n.launchAtLogin ? " launch" : "");

    const main = document.createElement("div");
    main.className = "note-main";

    const nameEl = document.createElement("span");
    nameEl.className = "note-name";
    nameEl.textContent = n.name || "未命名便签";
    nameEl.title = "双击重命名";
    nameEl.addEventListener("click", () => toggleNote(n));
    nameEl.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      renameNote(n);
    });

    const snip = document.createElement("span");
    snip.className = "note-snippet";
    snip.textContent = snippetOf(n);
    snip.title = snippetOf(n);

    main.append(nameEl, snip);

    const launchTag = document.createElement("span");
    launchTag.className = "note-launch-tag";
    launchTag.textContent = n.launchAtLogin ? "开机" : "";
    launchTag.title = n.launchAtLogin
      ? "已设为开机启动便签（右键可取消）"
      : "右键可设为开机启动便签";

    const toggle = document.createElement("button");
    toggle.className = "note-toggle";
    toggle.textContent = n.open ? "隐藏" : "显示";
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleNote(n);
    });

    const del = document.createElement("button");
    del.className = "file-del";
    del.textContent = "✕";
    del.title = "删除便签";
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteNote(n);
    });

    li.append(main, launchTag, toggle, del);
    li.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      showNoteMenu(e.clientX, e.clientY, n);
    });
    list.appendChild(li);
  });
}
