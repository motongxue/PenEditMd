/**
 * settings.js — 设置面板：快捷键自定义 + 图片保存策略（PRD L2「全套快捷键可自定义」「图片绝对/相对路径切换」）
 *
 * - 快捷键：动作 → 组合键 配置表，localStorage 持久化；面板内点击某项进入「录制」，
 *   按下新组合键即生效，带冲突检测；一键恢复默认。
 * - 图片保存策略：保存时对 base64 图片的处理方式
 *   "archive"（默认）= 提取到 <md目录>/assets/ 并改为相对路径（文件夹移动不失效）
 *   "inline"         = 保持 base64 内嵌（单文件自包含）
 */

const LS_KEY = "settings";
const DEFAULT_SHORTCUTS = {
  save: "ctrl+s",
  undo: "ctrl+z",
  redo: "ctrl+y",
  find: "ctrl+f",
  newDoc: "ctrl+n",
  bold: "ctrl+b",
  italic: "ctrl+i",
  link: "ctrl+k",
  inlineCode: "ctrl+`",
  pastePlain: "ctrl+shift+v",
  heading1: "ctrl+1",
  heading2: "ctrl+2",
  heading3: "ctrl+3",
  heading4: "ctrl+4",
  heading5: "ctrl+5",
  heading6: "ctrl+6",
  paragraph: "ctrl+0",
};

const ACTION_LABELS = {
  save: "保存文档",
  undo: "撤销",
  redo: "重做",
  find: "查找 / 替换",
  newDoc: "新建文档",
  bold: "加粗",
  italic: "斜体",
  link: "插入链接",
  inlineCode: "行内代码",
  pastePlain: "粘贴为纯文本",
  heading1: "标题 1",
  heading2: "标题 2",
  heading3: "标题 3",
  heading4: "标题 4",
  heading5: "标题 5",
  heading6: "标题 6",
  paragraph: "正文段落",
};

/** 把键盘事件归一成 "ctrl+shift+x" 形式（顺序固定：ctrl/alt/shift/键） */
export function eventToKey(e) {
  const parts = [];
  if (e.ctrlKey || e.metaKey) parts.push("ctrl");
  if (e.altKey) parts.push("alt");
  if (e.shiftKey) parts.push("shift");
  let k = e.key.toLowerCase();
  if (k === " ") k = "space";
  parts.push(k);
  return parts.join("+");
}

function loadAll() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {};
}
function saveAll(data) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch (_) {}
}

/** 读取当前快捷键配置（缺失项用默认值） */
export function loadShortcuts() {
  const data = loadAll();
  return { ...DEFAULT_SHORTCUTS, ...(data.shortcuts || {}) };
}
export function saveShortcuts(map) {
  const data = loadAll();
  data.shortcuts = map;
  saveAll(data);
}
export function resetShortcuts() {
  const data = loadAll();
  delete data.shortcuts;
  saveAll(data);
}

/** 当前事件命中了哪个动作（返回动作名或 null）；redo 兼容 ctrl+shift+z 别名 */
export function actionForEvent(e) {
  const key = eventToKey(e);
  const map = loadShortcuts();
  for (const [action, k] of Object.entries(map)) {
    if (k === key) return action;
  }
  // 别名：Ctrl+Shift+Z 也视为重做
  if (key === "ctrl+shift+z" && map.redo) return "redo";
  return null;
}

/** 事件是否命中指定动作（编辑器内部快捷键判断用） */
export function matchAction(e, action) {
  return actionForEvent(e) === action;
}

/** 图片保存策略："archive" | "inline" */
export function loadImgStrategy() {
  const data = loadAll();
  return data.imgStrategy || "archive";
}
export function saveImgStrategy(v) {
  const data = loadAll();
  data.imgStrategy = v === "inline" ? "inline" : "archive";
  saveAll(data);
}

/* ---------------- AI 模型配置（支持多模型 / 多厂商，可设默认 + 随时切换） ----------------
   存储结构：localStorage.settings.ai = { models:[{id,name,vendor,baseURL,apiKey,model}], defaultId, activeId }
   - 一个厂商可以配多个模型（如 DeepSeek 同时配 deepseek-chat 与 deepseek-v4-flash）
   - 多个厂商也可以各自配多个模型
   - defaultId：默认模型（首次/重置时选中）；activeId：当前正在使用的模型（可被顶栏随时切换，持久化）
   网络请求统一由主进程代发（preload 的 aiChat），Key 不进页面上下文。 */

/** 厂商快捷预设：在「添加模型」时按厂商自动填入接口地址/模型默认值；custom 为空需手填 */
export const AI_VENDORS = [
  { id: "deepseek", name: "DeepSeek", baseURL: "https://api.deepseek.com/v1", model: "deepseek-chat" },
  { id: "siliconflow", name: "硅基流动", baseURL: "https://api.siliconflow.cn/v1", model: "deepseek-ai/DeepSeek-V3" },
  { id: "openai", name: "OpenAI", baseURL: "https://api.openai.com/v1", model: "gpt-4o-mini" },
  { id: "anthropic", name: "Anthropic", baseURL: "https://api.anthropic.com/v1", model: "claude-3-5-sonnet-latest" },
  { id: "zhipu", name: "智谱 GLM", baseURL: "https://open.bigmodel.cn/api/paas/v4", model: "glm-4-flash" },
  { id: "moonshot", name: "Kimi", baseURL: "https://api.moonshot.cn/v1", model: "moonshot-v1-8k" },
  { id: "custom", name: "自定义", baseURL: "", model: "" },
];
// 兼容旧导入名
export const AI_PROVIDERS = AI_VENDORS;

function genId() {
  return "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** 读取（必要时迁移）ai 配置对象；旧的单配置 {provider,baseURL,apiKey,model} 自动转成 1 个模型 */
function getAiData() {
  const d = loadAll();
  if (!d.ai) d.ai = {};
  if (!Array.isArray(d.ai.models)) {
    if (d.ai.provider || d.ai.baseURL || d.ai.apiKey || d.ai.model) {
      const vendor = AI_VENDORS.find((v) => v.id === d.ai.provider);
      const m = {
        id: genId(),
        name: vendor ? vendor.name : d.ai.model || "我的模型",
        vendor: vendor ? vendor.name : "自定义",
        baseURL: d.ai.baseURL || "",
        apiKey: d.ai.apiKey || "",
        model: d.ai.model || "",
      };
      d.ai = { models: [m], defaultId: m.id, activeId: m.id };
      saveAll(d);
    } else {
      d.ai = { models: [] };
    }
  }
  return d.ai;
}

export function loadAiModels() {
  return (getAiData().models || []).slice();
}

/** 当前激活模型（activeId → defaultId → 第一个）；无则返回 null */
export function getActiveModel() {
  const ai = getAiData();
  const models = ai.models || [];
  if (!models.length) return null;
  return models.find((m) => m.id === ai.activeId) || models.find((m) => m.id === ai.defaultId) || models[0];
}

export function setAiActiveId(id) {
  const d = loadAll();
  if (!d.ai) d.ai = {};
  d.ai.activeId = id;
  saveAll(d);
}
export function loadAiDefaultId() {
  return (loadAll().ai || {}).defaultId || null;
}
export function setAiDefaultId(id) {
  const d = loadAll();
  if (!d.ai) d.ai = {};
  d.ai.defaultId = id;
  d.ai.activeId = id; // 设默认同时设为当前
  saveAll(d);
}

/** 新增或更新模型（按 id 判定）；返回该模型 id。首个模型自动成为默认+当前。 */
export function saveAiModel(m) {
  const data = loadAll();
  if (!data.ai) data.ai = {};
  if (!Array.isArray(data.ai.models)) data.ai.models = [];
  const rec = { ...m };
  if (!rec.id) rec.id = genId();
  const idx = data.ai.models.findIndex((x) => x.id === rec.id);
  if (idx >= 0) data.ai.models[idx] = { ...data.ai.models[idx], ...rec };
  else data.ai.models.push(rec);
  if (!data.ai.defaultId) data.ai.defaultId = rec.id;
  if (!data.ai.activeId) data.ai.activeId = rec.id;
  saveAll(data);
  return rec.id;
}

export function deleteAiModel(id) {
  const data = loadAll();
  if (!data.ai || !data.ai.models) return;
  data.ai.models = data.ai.models.filter((m) => m.id !== id);
  if (data.ai.defaultId === id) data.ai.defaultId = data.ai.models[0] ? data.ai.models[0].id : null;
  if (data.ai.activeId === id) data.ai.activeId = data.ai.models[0] ? data.ai.models[0].id : null;
  saveAll(data);
}

/** 兼容旧接口：返回当前激活模型的可解析配置（askAI 直接消费） */
export function loadAiSettings() {
  const m = getActiveModel();
  if (!m) return { provider: "", baseURL: "", apiKey: "", model: "" };
  return {
    provider: m.vendor || "",
    baseURL: m.baseURL || "",
    apiKey: m.apiKey || "",
    model: m.model || "",
    name: m.name || "",
    id: m.id,
    timeout: typeof m.timeout === "number" ? m.timeout : undefined,
  };
}

/* ---------------- 自定义导出模板（L3） ----------------
   HTML / PDF / PNG 导出统一走这个模板。占位符：
   {{title}} 文档标题 · {{content}} 正文 HTML · {{style}} 内置样式（含 KaTeX）
   · {{script}} 运行时脚本（Mermaid，仅在需要时非空）· {{date}} 导出日期
   留空表示使用内置默认模板。 */
export const DEFAULT_EXPORT_TEMPLATE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{{title}}</title>
<style>{{style}}</style>
{{script}}
</head>
<body class="markdown-body">{{content}}</body>
</html>`;

export function loadExportTemplate() {
  const data = loadAll();
  return typeof data.exportTemplate === "string" ? data.exportTemplate : "";
}
export function saveExportTemplate(tpl) {
  const data = loadAll();
  if (tpl && tpl.trim()) data.exportTemplate = tpl;
  else delete data.exportTemplate;
  saveAll(data);
}

/** 用模板渲染导出 HTML；模板缺少 {{content}} 时自动回落到默认模板，避免导出空白文件 */
export function renderExportTemplate(vars) {
  let tpl = loadExportTemplate();
  if (!tpl || !tpl.includes("{{content}}")) tpl = DEFAULT_EXPORT_TEMPLATE;
  return tpl.replace(/\{\{\s*(title|content|style|script|date)\s*\}\}/g, (_m, k) =>
    vars[k] == null ? "" : String(vars[k]),
  );
}

/* ---------------- 设置面板（模态） ---------------- */
function escHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function keyToDisplay(k) {
  return String(k || "").replace(/ctrl/gi, "Ctrl").replace(/alt/gi, "Alt").replace(/shift/gi, "Shift");
}

/** 通用：创建弹窗遮罩并写入内容，避免重复打开 */
function createOverlay(innerHtml) {
  document.querySelectorAll(".modal-overlay").forEach((el) => el.remove());
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `<div class="modal settings-modal">${innerHtml}</div>`;
  return overlay;
}

/** 通用：绑定「关闭 / 点击遮罩关闭」 */
function bindClose(overlay) {
  const doClose = () => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    try { window.__refreshAiModelBtn && window.__refreshAiModelBtn(); } catch (_) {}
  };
  // 取最后一个 .cancel（弹窗右下角的主关闭按钮），避免被表单内的取消按钮抢先匹配
  const cancels = overlay.querySelectorAll(".cancel");
  const closeBtn = cancels.length ? cancels[cancels.length - 1] : null;
  if (closeBtn) closeBtn.addEventListener("click", doClose);
  overlay.addEventListener("mousedown", (e) => {
    if (e.target === overlay) doClose();
  });
}

/** 通用：渲染并绑定快捷键录制列表 */
function bindShortcuts(overlay) {
  const listEl = overlay.querySelector(".shortcut-list");
  let recordingAction = null;
  const render = () => {
    const map = loadShortcuts();
    listEl.innerHTML = "";
    for (const [action, label] of Object.entries(ACTION_LABELS)) {
      const row = document.createElement("div");
      row.className = "shortcut-row";
      row.innerHTML = `<span class="shortcut-label">${escHtml(label)}</span>` +
        `<button type="button" class="shortcut-key" data-action="${action}">${escHtml(keyToDisplay(map[action]))}</button>`;
      row.querySelector(".shortcut-key").addEventListener("click", (e) => {
        e.stopPropagation();
        startRecord(action, row.querySelector(".shortcut-key"));
      });
      listEl.appendChild(row);
    }
  };
  function startRecord(action, btn) {
    if (recordingAction) return;
    recordingAction = action;
    btn.classList.add("recording");
    btn.textContent = "按下新组合键…（Esc 取消）";
    const onKey = (e) => {
      if (e.key === "Escape") { finishRecord(null); return; }
      if (e.key === "Tab") return;
      e.preventDefault();
      e.stopPropagation();
      finishRecord(eventToKey(e));
    };
    const finishRecord = (newKey) => {
      recordingAction = null;
      btn.classList.remove("recording");
      window.removeEventListener("keydown", onKey, true);
      if (newKey) {
        const map = loadShortcuts();
        const conflict = Object.entries(map).find(([a, k]) => a !== action && k === newKey);
        map[action] = newKey;
        saveShortcuts(map);
        render();
        if (conflict) {
          const other = ACTION_LABELS[conflict[0]] || conflict[0];
          listEl.insertAdjacentHTML("beforebegin", `<div class="settings-warn">⚠️ 该组合键原属于「${escHtml(other)}」，已被覆盖</div>`);
          setTimeout(() => { const w = overlay.querySelector(".settings-warn"); if (w) w.remove(); }, 3000);
        }
      } else {
        render();
      }
    };
    window.addEventListener("keydown", onKey, true);
  }
  render();
  overlay.querySelector(".reset").addEventListener("click", () => { resetShortcuts(); render(); });
}

/** 通用：绑定 AI 模型配置（多模型列表：添加 / 编辑 / 删除 / 设默认 / 设当前） */
function bindAiModels(overlay) {
  const list = overlay.querySelector("#ai-model-list");
  const form = overlay.querySelector("#ai-model-form");
  const formTitle = overlay.querySelector("#ai-form-title");

  function renderList() {
    const models = loadAiModels();
    const ai = getAiData();
    const activeId = ai.activeId || ai.defaultId;
    list.innerHTML = "";
    if (!models.length) {
      list.innerHTML = `<div class="ai-empty">还没有配置任何模型，点击下方「添加模型」。</div>`;
      return;
    }
    models.forEach((m) => {
      const isDefault = ai.defaultId === m.id;
      const isActive = activeId === m.id;
      const row = document.createElement("div");
      row.className = "ai-model-row";
      row.innerHTML =
        `<div class="ai-model-info">` +
          `<div class="ai-model-name">${escHtml(m.name || m.model || "未命名")}` +
            (isDefault ? ` <span class="badge badge-default">默认</span>` : ``) +
            (isActive ? ` <span class="badge badge-active">当前</span>` : ``) +
          `</div>` +
          `<div class="ai-model-meta">${escHtml(m.vendor || "")} · ${escHtml(m.model || "")}</div>` +
        `</div>` +
        `<div class="ai-model-ops">` +
          (isActive ? `` : `<button type="button" class="modal-btn tiny" data-act="use">使用</button>`) +
          (isDefault ? `` : `<button type="button" class="modal-btn tiny" data-act="default">设默认</button>`) +
          `<button type="button" class="modal-btn tiny" data-act="edit">编辑</button>` +
          `<button type="button" class="modal-btn tiny danger" data-act="del">删除</button>` +
        `</div>`;
      const useBtn = row.querySelector('[data-act="use"]');
      if (useBtn) useBtn.addEventListener("click", () => { setAiActiveId(m.id); renderList(); });
      const defBtn = row.querySelector('[data-act="default"]');
      if (defBtn) defBtn.addEventListener("click", () => { setAiDefaultId(m.id); renderList(); });
      row.querySelector('[data-act="edit"]').addEventListener("click", () => showForm(m));
      row.querySelector('[data-act="del"]').addEventListener("click", () => {
        if (confirm(`确定删除模型「${m.name || m.model}」？`)) { deleteAiModel(m.id); renderList(); }
      });
      list.appendChild(row);
    });
  }

  function showForm(model) {
    const editing = !!model;
    const m = model || {};
    formTitle.textContent = editing ? "编辑模型" : "添加模型";
    const vendorSel = form.querySelector(".ai-vendor");
    vendorSel.innerHTML = "";
    AI_VENDORS.forEach((v) => {
      const o = document.createElement("option");
      o.value = v.id;
      o.textContent = v.name;
      vendorSel.appendChild(o);
    });
    // 编辑时按名称回选厂商；新增默认 custom
    const matched = AI_VENDORS.find((v) => v.name === m.vendor);
    vendorSel.value = matched ? matched.id : "custom";
    const nameI = form.querySelector(".ai-f-name");
    const baseI = form.querySelector(".ai-f-base");
    const keyI = form.querySelector(".ai-f-key");
    const modelI = form.querySelector(".ai-f-model");
    const timeoutI = form.querySelector(".ai-f-timeout");
    nameI.value = m.name || "";
    baseI.value = m.baseURL || "";
    keyI.value = m.apiKey || "";
    modelI.value = m.model || "";
    timeoutI.value = m.timeout != null ? m.timeout : "";
    vendorSel.onchange = () => {
      const v = AI_VENDORS.find((x) => x.id === vendorSel.value);
      if (v && v.id !== "custom") {
        if (!baseI.value.trim()) baseI.value = v.baseURL;
        if (!modelI.value.trim()) modelI.value = v.model;
        if (!nameI.value.trim()) nameI.value = v.name;
      }
    };
    list.classList.add("hidden");
    form.classList.remove("hidden");
    nameI.focus();

    form.querySelector("#ai-form-save").onclick = () => {
      const vendor = AI_VENDORS.find((v) => v.id === vendorSel.value);
      const rec = {
        id: m.id,
        name: nameI.value.trim() || modelI.value.trim() || "未命名模型",
        vendor: vendor ? vendor.name : "自定义",
        baseURL: baseI.value.trim(),
        apiKey: keyI.value.trim(),
        model: modelI.value.trim(),
        timeout: timeoutI.value.trim() ? Number(timeoutI.value.trim()) : undefined,
      };
      if (!rec.baseURL || !rec.apiKey || !rec.model) {
        alert("接口地址、API Key、模型 都必须填写");
        return;
      }
      saveAiModel(rec);
      form.classList.add("hidden");
      list.classList.remove("hidden");
      renderList();
    };
    form.querySelector("#ai-form-cancel").onclick = () => {
      form.classList.add("hidden");
      list.classList.remove("hidden");
    };
  }

  overlay.querySelector("#ai-add").addEventListener("click", () => showForm(null));
  renderList();
}

/**
 * 打开「通用设置」弹窗（图片保存策略 / 导出模板 / 快捷键）。
 */
export function openSettingsModal() {
  const overlay = createOverlay(`
    <div class="modal-title">通用设置</div>
    <div class="settings-group">
      <div class="settings-group-title">图片保存策略</div>
      <div class="settings-radios">
        <label class="settings-radio-card">
          <input type="radio" name="img-strategy" value="archive" />
          <span class="radio-title">归档为相对路径</span>
          <span class="radio-desc">图片存入 <span class="mono">assets/</span>，文件夹整体迁移不失效</span>
        </label>
        <label class="settings-radio-card">
          <input type="radio" name="img-strategy" value="inline" />
          <span class="radio-title">保持 base64 内嵌</span>
          <span class="radio-desc">单文件自包含，便于单独分发</span>
        </label>
      </div>
    </div>
    <div class="settings-group">
      <div class="settings-group-title">自定义导出模板</div>
      <div class="settings-desc">HTML / PDF / PNG 共用；占位符 <span class="mono">{{title}} {{content}} {{style}} {{script}} {{date}}</span>；留空用内置模板</div>
      <textarea class="export-tpl ap-css" spellcheck="false" rows="6" placeholder="留空 = 使用内置默认模板"></textarea>
      <div class="settings-row-btns">
        <button type="button" class="modal-btn tpl-load-default">载入默认模板</button>
        <button type="button" class="modal-btn tpl-clear">清空（用内置）</button>
      </div>
    </div>
    <div class="settings-group">
      <div class="settings-group-title">快捷键</div>
      <div class="settings-desc">点击组合键可重新录制</div>
      <div class="shortcut-list"></div>
    </div>
    <div class="modal-actions">
      <button type="button" class="modal-btn reset">恢复默认快捷键</button>
      <button type="button" class="modal-btn cancel primary">关闭</button>
    </div>`);

  const strategy = loadImgStrategy();
  overlay.querySelector(`input[name="img-strategy"][value="${strategy}"]`).checked = true;
  overlay.querySelectorAll('input[name="img-strategy"]').forEach((r) =>
    r.addEventListener("change", () => saveImgStrategy(r.value))
  );

  const tplEl = overlay.querySelector(".export-tpl");
  tplEl.value = loadExportTemplate();
  tplEl.addEventListener("change", () => saveExportTemplate(tplEl.value));
  tplEl.addEventListener("blur", () => saveExportTemplate(tplEl.value));
  overlay.querySelector(".tpl-load-default").addEventListener("click", () => {
    tplEl.value = DEFAULT_EXPORT_TEMPLATE;
    saveExportTemplate(tplEl.value);
  });
  overlay.querySelector(".tpl-clear").addEventListener("click", () => {
    tplEl.value = "";
    saveExportTemplate("");
  });

  bindShortcuts(overlay);
  bindClose(overlay);
  document.body.appendChild(overlay);
}

/**
 * 打开「AI 模型」弹窗（多模型管理，独立于通用设置）。
 */
export function openAiSettingsModal() {
  const overlay = createOverlay(`
    <div class="modal-title">AI 模型</div>
    <div class="settings-desc settings-ai-lead">可配置多个模型（同一厂商也能配多个，也支持多厂商），设一个默认；顶栏「AI 模型」可随时切换当前使用。</div>
    <div id="ai-model-list" class="ai-model-list"></div>
    <div id="ai-model-form" class="ai-model-form hidden">
      <div id="ai-form-title" class="settings-group-title">添加模型</div>
      <div class="settings-form">
        <label class="settings-field">
          <span class="settings-field-label">厂商</span>
          <select class="ai-vendor settings-input"></select>
        </label>
        <label class="settings-field">
          <span class="settings-field-label">名称</span>
          <input type="text" class="ai-f-name settings-input" placeholder="如：DeepSeek 主力" spellcheck="false" />
        </label>
        <label class="settings-field">
          <span class="settings-field-label">接口地址</span>
          <input type="text" class="ai-f-base mono settings-input" placeholder="https://api.xxx.com/v1" spellcheck="false" />
        </label>
        <label class="settings-field">
          <span class="settings-field-label">模型</span>
          <input type="text" class="ai-f-model mono settings-input" placeholder="deepseek-chat" spellcheck="false" />
        </label>
        <label class="settings-field">
          <span class="settings-field-label">API Key</span>
          <input type="password" class="ai-f-key mono settings-input" placeholder="sk-..." spellcheck="false" />
        </label>
        <label class="settings-field">
          <span class="settings-field-label">请求超时(秒)</span>
          <input type="number" min="5" step="5" class="ai-f-timeout mono settings-input" placeholder="默认 60（AI 排版建议 ≥300）" spellcheck="false" />
        </label>
      </div>
      <div class="modal-actions">
        <button type="button" class="modal-btn primary" id="ai-form-save">保存</button>
        <button type="button" class="modal-btn cancel" id="ai-form-cancel">取消</button>
      </div>
    </div>
    <div class="modal-actions">
      <button type="button" class="modal-btn add" id="ai-add">+ 添加模型</button>
      <button type="button" class="modal-btn cancel primary">关闭</button>
    </div>`);

  bindAiModels(overlay);
  bindClose(overlay);
  document.body.appendChild(overlay);
}

/* ---------------- 微信公众号推送配置 ----------------
   存储结构：localStorage.settings.wechat = { appid, appsecret, author, digest, coverMode }
   - appid / appsecret：公众号后台「设置与开发 → 基本配置」获取；调接口的机器公网 IP 需加白名单
   - author：草稿作者署名；digest：默认摘要（留空则微信自动取正文开头）
   - coverMode："auto" 自动生成占位封面（视频类文章带播放按钮）| "pick" 每次手动选图
   AppSecret 只存本机 localStorage，网络请求一律由主进程代发。 */
const WECHAT_DEFAULTS = { appid: "", appsecret: "", author: "", digest: "", coverMode: "auto" };

export function loadWechatCfg() {
  const w = loadAll().wechat || {};
  return { ...WECHAT_DEFAULTS, ...w };
}
export function saveWechatCfg(cfg) {
  const data = loadAll();
  data.wechat = { ...loadWechatCfg(), ...(cfg || {}) };
  saveAll(data);
}
/** 是否已具备推送条件（AppID + AppSecret 齐全） */
export function isWechatReady() {
  const c = loadWechatCfg();
  return !!(c.appid && c.appsecret);
}

/**
 * 打开「公众号推送」设置弹窗（顶部菜单 设置 → 公众号推送）。
 */
export function openWechatSettingsModal() {
  const c = loadWechatCfg();
  const overlay = createOverlay(`
    <div class="modal-title">公众号推送</div>
    <div class="settings-desc settings-ai-lead">填入公众号的 AppID / AppSecret 后，AI 排版预览页即可一键推送到公众号草稿箱。凭证只保存在本机，网络请求由主进程代发。</div>
    <div class="settings-group">
      <div class="settings-group-title">接口凭证</div>
      <div class="settings-form">
        <label class="settings-field">
          <span class="settings-field-label">AppID</span>
          <input type="text" class="wx-appid mono settings-input" placeholder="wx1234567890abcdef" spellcheck="false" />
        </label>
        <label class="settings-field">
          <span class="settings-field-label">AppSecret</span>
          <input type="password" class="wx-secret mono settings-input" placeholder="公众号后台 → 设置与开发 → 基本配置" spellcheck="false" />
        </label>
      </div>
      <div class="settings-desc">调用接口的本机公网 IP 必须加入公众号「IP 白名单」，否则会报 40164。</div>
      <div class="settings-row-btns">
        <button type="button" class="modal-btn wx-test">测试连接</button>
        <span class="wx-test-result settings-desc"></span>
      </div>
    </div>
    <div class="settings-group">
      <div class="settings-group-title">草稿默认值</div>
      <div class="settings-form">
        <label class="settings-field">
          <span class="settings-field-label">作者署名</span>
          <input type="text" class="wx-author settings-input" placeholder="推送时还可以改" spellcheck="false" />
        </label>
        <label class="settings-field">
          <span class="settings-field-label">默认摘要</span>
          <input type="text" class="wx-digest settings-input" placeholder="留空 = 微信自动取正文开头" spellcheck="false" />
        </label>
      </div>
    </div>
    <div class="settings-group">
      <div class="settings-group-title">封面图</div>
      <div class="settings-radios">
        <label class="settings-radio-card">
          <input type="radio" name="wx-cover" value="auto" />
          <span class="radio-title">自动生成占位封面</span>
          <span class="radio-desc">按标题生成 900×383 封面；文章涉及视频时自动带播放按钮标记</span>
        </label>
        <label class="settings-radio-card">
          <input type="radio" name="wx-cover" value="pick" />
          <span class="radio-title">每次手动选图</span>
          <span class="radio-desc">推送时从本地挑一张图片作为封面</span>
        </label>
      </div>
    </div>
    <div class="modal-actions">
      <button type="button" class="modal-btn cancel primary">关闭</button>
    </div>`);

  const appidI = overlay.querySelector(".wx-appid");
  const secretI = overlay.querySelector(".wx-secret");
  const authorI = overlay.querySelector(".wx-author");
  const digestI = overlay.querySelector(".wx-digest");
  appidI.value = c.appid;
  secretI.value = c.appsecret;
  authorI.value = c.author;
  digestI.value = c.digest;
  overlay.querySelector(`input[name="wx-cover"][value="${c.coverMode}"]`).checked = true;

  // 逐字段即时持久化（与通用设置一致，不额外设「保存」按钮）
  const persist = () =>
    saveWechatCfg({
      appid: appidI.value.trim(),
      appsecret: secretI.value.trim(),
      author: authorI.value.trim(),
      digest: digestI.value.trim(),
    });
  [appidI, secretI, authorI, digestI].forEach((el) => {
    el.addEventListener("change", persist);
    el.addEventListener("blur", persist);
  });
  overlay.querySelectorAll('input[name="wx-cover"]').forEach((r) =>
    r.addEventListener("change", () => saveWechatCfg({ coverMode: r.value })),
  );

  const testBtn = overlay.querySelector(".wx-test");
  const testOut = overlay.querySelector(".wx-test-result");
  testBtn.addEventListener("click", async () => {
    persist();
    const appid = appidI.value.trim();
    const appsecret = secretI.value.trim();
    if (!appid || !appsecret) {
      testOut.textContent = "请先填写 AppID 与 AppSecret";
      return;
    }
    testBtn.disabled = true;
    testOut.textContent = "正在换取 access_token…";
    try {
      const r = await window.api.wechatTest({ appid, appsecret });
      testOut.textContent = r && r.ok ? "✅ 连接正常，凭证有效" : "❌ " + ((r && r.error) || "未知错误");
    } catch (e) {
      testOut.textContent = "❌ " + ((e && e.message) || String(e));
    } finally {
      testBtn.disabled = false;
    }
  });

  bindClose(overlay);
  document.body.appendChild(overlay);
}

/**
 * 打开「推送到公众号草稿箱」确认弹窗：确认标题/作者/摘要与封面来源。
 * @param {{title:string, video:boolean}} init 初始值（标题取自文档，video 表示检测到视频类内容）
 * @param {(payload:{title:string,author:string,digest:string,coverMode:string,video:boolean})=>void} onConfirm
 */
export function openWechatPushModal(init, onConfirm) {
  const c = loadWechatCfg();
  const overlay = createOverlay(`
    <div class="modal-title">推送到公众号草稿箱</div>
    <div class="settings-desc settings-ai-lead">推送后在公众号后台「草稿箱」里可直接编辑发布。正文里的本地图片会自动上传到微信 CDN。</div>
    <div class="settings-form">
      <label class="settings-field">
        <span class="settings-field-label">标题</span>
        <input type="text" class="wxp-title settings-input" placeholder="草稿标题" spellcheck="false" />
      </label>
      <label class="settings-field">
        <span class="settings-field-label">作者</span>
        <input type="text" class="wxp-author settings-input" placeholder="作者署名（可留空）" spellcheck="false" />
      </label>
      <label class="settings-field">
        <span class="settings-field-label">摘要</span>
        <input type="text" class="wxp-digest settings-input" placeholder="留空 = 微信自动取正文开头" spellcheck="false" />
      </label>
      <label class="settings-field">
        <span class="settings-field-label">封面</span>
        <select class="wxp-cover settings-input">
          <option value="auto">自动生成占位封面</option>
          <option value="auto-video">自动生成「视频」占位封面</option>
          <option value="pick">从本地选一张图</option>
        </select>
      </label>
    </div>
    <div class="modal-actions">
      <button type="button" class="modal-btn primary wxp-ok">推送</button>
      <button type="button" class="modal-btn cancel">取消</button>
    </div>`);

  const titleI = overlay.querySelector(".wxp-title");
  const authorI = overlay.querySelector(".wxp-author");
  const digestI = overlay.querySelector(".wxp-digest");
  const coverS = overlay.querySelector(".wxp-cover");
  titleI.value = (init && init.title) || "";
  authorI.value = c.author || "";
  digestI.value = c.digest || "";
  coverS.value = c.coverMode === "pick" ? "pick" : init && init.video ? "auto-video" : "auto";

  overlay.querySelector(".wxp-ok").addEventListener("click", () => {
    const title = titleI.value.trim();
    if (!title) {
      titleI.focus();
      return;
    }
    // 记住作者/摘要，下次推送直接带出
    saveWechatCfg({ author: authorI.value.trim(), digest: digestI.value.trim() });
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    onConfirm({
      title,
      author: authorI.value.trim(),
      digest: digestI.value.trim(),
      coverMode: coverS.value === "pick" ? "pick" : "auto",
      video: coverS.value === "auto-video",
    });
  });

  bindClose(overlay);
  document.body.appendChild(overlay);
  titleI.focus();
  titleI.select();
}
