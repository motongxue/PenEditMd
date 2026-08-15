/* 笔削 PenEditMd - 渲染进程逻辑 */

const state = {
  baseUrl: "http://127.0.0.1:8765",
  files: [], // { id, name, markdown, error }
  activeId: null,
  mode: "preview", // preview | raw
  formats: [],
};

const els = {
  dropzone: document.getElementById("dropzone"),
  result: document.getElementById("result"),
  files: document.getElementById("files"),
  fileCount: document.getElementById("file-count"),
  preview: document.getElementById("preview"),
  raw: document.getElementById("raw"),
  currentName: document.getElementById("current-name"),
  charCount: document.getElementById("char-count"),
  btnOpen: document.getElementById("btn-open"),
  btnOpen2: document.getElementById("btn-open-2"),
  btnCopy: document.getElementById("btn-copy"),
  btnExport: document.getElementById("btn-export"),
  btnClear: document.getElementById("btn-clear"),
  btnTheme: document.getElementById("btn-theme"),
  status: document.getElementById("status"),
  backendStatus: document.getElementById("backend-status"),
  overlay: document.getElementById("overlay"),
  overlayText: document.getElementById("overlay-text"),
  statusHint: document.getElementById("status-hint"),
};

// ---- 初始化 ----
async function init() {
  state.baseUrl = (await window.api.backendBaseUrl()) || state.baseUrl;
  await checkBackend();
  bindEvents();
}

async function checkBackend() {
  try {
    const res = await fetch(`${state.baseUrl}/health`);
    const data = await res.json();
    if (data.status === "ok") {
      els.backendStatus.className = "dot green";
      els.statusHint.textContent = "后端已连接 ✓";
      // 拉取支持格式
      const f = await fetch(`${state.baseUrl}/formats`);
      state.formats = (await f.json()).extensions || [];
      return;
    }
  } catch (_) {}
  els.backendStatus.className = "dot red";
  els.statusHint.textContent = "后端未连接，请检查 Python 环境";
}

// ---- 事件绑定 ----
function bindEvents() {
  els.btnOpen.addEventListener("click", openFiles);
  els.btnOpen2.addEventListener("click", openFiles);
  els.btnCopy.addEventListener("click", copyMarkdown);
  els.btnExport.addEventListener("click", exportMarkdown);
  els.btnClear.addEventListener("click", clearAll);
  els.btnTheme.addEventListener("click", toggleTheme);

  document.querySelectorAll(".seg").forEach((seg) => {
    seg.addEventListener("click", () => {
      state.mode = seg.dataset.mode;
      document.querySelectorAll(".seg").forEach((s) => s.classList.remove("active"));
      seg.classList.add("active");
      renderPreview();
    });
  });

  // 拖拽
  const dz = els.dropzone;
  ["dragenter", "dragover"].forEach((ev) =>
    dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add("dragover"); })
  );
  ["dragleave", "drop"].forEach((ev) =>
    dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove("dragover"); })
  );
  dz.addEventListener("drop", (e) => {
    const files = [...e.dataTransfer.files];
    if (files.length) handleFileObjects(files);
  });

  // 主题恢复
  if (localStorage.getItem("theme") === "light") {
    document.documentElement.classList.add("light");
  }
}

// ---- 打开文件（走主进程对话框，拿到真实路径）----
async function openFiles() {
  const paths = await window.api.openFile(state.formats);
  if (!paths || !paths.length) return;
  await convertByPaths(paths);
}

async function convertByPaths(paths) {
  showOverlay(`转换中 (0/${paths.length})`);
  for (let i = 0; i < paths.length; i++) {
    const p = paths[i];
    els.overlayText.textContent = `转换中 (${i + 1}/${paths.length})`;
    try {
      const res = await fetch(`${state.baseUrl}/convert_path`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: p }),
      });
      const data = await res.json();
      addResult(p.split(/[\\/]/).pop(), data.markdown, data.error);
    } catch (err) {
      addResult(p.split(/[\\/]/).pop(), null, err.message);
    }
  }
  hideOverlay();
  switchToResult();
}

// ---- 拖拽文件对象（浏览器 File，走上传接口）----
async function handleFileObjects(fileList) {
  showOverlay(`转换中 (0/${fileList.length})`);
  for (let i = 0; i < fileList.length; i++) {
    const f = fileList[i];
    els.overlayText.textContent = `转换中 (${i + 1}/${fileList.length})`;
    const fd = new FormData();
    fd.append("file", f);
    try {
      const res = await fetch(`${state.baseUrl}/convert`, { method: "POST", body: fd });
      const data = await res.json();
      addResult(f.name, data.markdown, data.error);
    } catch (err) {
      addResult(f.name, null, err.message);
    }
  }
  hideOverlay();
  switchToResult();
}

// ---- 结果管理 ----
function addResult(name, markdown, error) {
  const id = Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  state.files.push({ id, name, markdown, error });
  renderList();
  if (!state.activeId) selectFile(id);
}

function renderList() {
  els.files.innerHTML = "";
  state.files.forEach((f) => {
    const li = document.createElement("li");
    li.dataset.id = f.id;
    if (f.id === state.activeId) li.classList.add("active");
    if (f.error) li.classList.add("error");
    const chars = f.error ? "✗" : `${(f.markdown || "").length}字`;
    li.innerHTML = `<span class="name" title="${f.name}">${f.name}</span><span class="badge">${chars}</span>`;
    li.addEventListener("click", () => selectFile(f.id));
    els.files.appendChild(li);
  });
  els.fileCount.textContent = `${state.files.length} 个文件`;
}

function selectFile(id) {
  state.activeId = id;
  renderList();
  renderPreview();
}

function renderPreview() {
  const f = state.files.find((x) => x.id === state.activeId);
  if (!f) {
    els.currentName.textContent = "—";
    els.charCount.textContent = "0 字符";
    els.preview.innerHTML = "";
    els.raw.textContent = "";
    setActionsEnabled(false);
    return;
  }
  els.currentName.textContent = f.name;
  setActionsEnabled(!f.error);

  if (f.error) {
    els.preview.innerHTML = `<p style="color:var(--danger)">转换失败：${f.error}</p>`;
    els.raw.textContent = f.error;
    els.charCount.textContent = "转换失败";
    return;
  }

  if (state.mode === "raw") {
    els.preview.classList.add("hidden");
    els.raw.classList.remove("hidden");
    els.raw.textContent = f.markdown;
  } else {
    els.raw.classList.add("hidden");
    els.preview.classList.remove("hidden");
    try {
      els.preview.innerHTML = window.marked
        ? window.marked.parse(f.markdown)
        : `<pre>${escapeHtml(f.markdown)}</pre>`;
    } catch (_) {
      els.preview.innerHTML = `<pre>${escapeHtml(f.markdown)}</pre>`;
    }
  }
  els.charCount.textContent = `${(f.markdown || "").length} 字符`;
}

function setActionsEnabled(on) {
  els.btnCopy.disabled = !on;
  els.btnExport.disabled = !on;
}

function switchToResult() {
  els.dropzone.classList.add("hidden");
  els.result.classList.remove("hidden");
}

// ---- 复制 / 导出 ----
async function copyMarkdown() {
  const f = state.files.find((x) => x.id === state.activeId);
  if (!f || f.error) return;
  try {
    await navigator.clipboard.writeText(f.markdown);
    setStatus("已复制到剪贴板");
  } catch (_) {
    setStatus("复制失败（剪贴板不可用）");
  }
}

async function exportMarkdown() {
  const f = state.files.find((x) => x.id === state.activeId);
  if (!f || f.error) return;
  const base = f.name.replace(/\.[^.]+$/, "");
  const blob = new Blob([f.markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${base}.md`;
  a.click();
  URL.revokeObjectURL(url);
  setStatus(`已导出 ${base}.md`);
}

function clearAll() {
  state.files = [];
  state.activeId = null;
  renderList();
  els.dropzone.classList.remove("hidden");
  els.result.classList.add("hidden");
  setStatus("已清空");
}

function toggleTheme() {
  document.documentElement.classList.toggle("light");
  const isLight = document.documentElement.classList.contains("light");
  localStorage.setItem("theme", isLight ? "light" : "dark");
}

// ---- 工具 ----
function showOverlay(text) {
  els.overlayText.textContent = text;
  els.overlay.classList.remove("hidden");
}
function hideOverlay() {
  els.overlay.classList.add("hidden");
}
function setStatus(text) {
  els.status.textContent = text;
}
function escapeHtml(s) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

init();
