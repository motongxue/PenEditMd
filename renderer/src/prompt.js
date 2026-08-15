/**
 * prompt.js — 渲染层弹窗工具集
 *
 * 导出：
 *  - showPrompt({title, value, placeholder})  文本输入弹窗 → Promise<string|null>
 *  - showChoiceModal({title, options})        选项弹窗 → Promise<key|null>
 *  - openLocalImageFile(cb)                   本地图片选择 → cb(dataUrl)
 *  - promptText(title, defaultValue, placeholder)  轻量文本输入（便签/文档树用）→ Promise<string|null>
 *
 * 全部基于已有的 .modal-overlay / .modal CSS，不触碰原生 window.prompt（失焦/样式不可控）。
 */

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]),
  );
}
function escapeAttr(s) {
  return escapeHtml(s);
}

/** 文本输入弹窗：点确定返回输入文本（去空则 null），取消/关闭/Esc 返回 null */
export function showPrompt({ title = "", value = "", placeholder = "" } = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">${escapeHtml(title)}</div>
        <input class="modal-input" type="text" value="${escapeAttr(value)}" placeholder="${escapeAttr(placeholder)}" />
        <div class="modal-actions">
          <button class="modal-btn" data-act="cancel" type="button">取消</button>
          <button class="modal-btn ok primary" data-act="ok" type="button">确定</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const input = overlay.querySelector(".modal-input");
    const done = (v) => {
      overlay.remove();
      resolve(v);
    };
    requestAnimationFrame(() => input.focus());
    if (value) input.select();
    overlay.querySelector('[data-act="cancel"]').addEventListener("click", () => done(null));
    overlay.querySelector('[data-act="ok"]').addEventListener("click", () => done(input.value.trim() || null));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        done(input.value.trim() || null);
      } else if (e.key === "Escape") {
        e.preventDefault();
        done(null);
      }
    });
    overlay.addEventListener("mousedown", (e) => {
      if (e.target === overlay) done(null);
    });
  });
}

/** 选项弹窗：返回被选中的 option.key，取消返回 null */
export function showChoiceModal({ title = "", options = [] } = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    const opts = options
      .map(
        (o) =>
          `<button class="modal-btn choice ${o.primary ? "ok primary" : ""}" data-key="${escapeAttr(o.key)}" type="button">${escapeHtml(o.label)}</button>`,
      )
      .join("");
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">${escapeHtml(title)}</div>
        <div class="modal-choices">${opts}</div>
        <div class="modal-actions">
          <button class="modal-btn" data-act="cancel" type="button">取消</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const done = (v) => {
      overlay.remove();
      resolve(v);
    };
    overlay.querySelectorAll(".modal-btn.choice").forEach((b) => {
      b.addEventListener("click", () => done(b.dataset.key || null));
    });
    overlay.querySelector('[data-act="cancel"]').addEventListener("click", () => done(null));
    overlay.addEventListener("mousedown", (e) => {
      if (e.target === overlay) done(null);
    });
  });
}

/** 打开本地图片文件选择器，选中后通过 cb(dataUrl) 回传 base64；取消/出错回传 null */
export function openLocalImageFile(cb) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.style.display = "none";
  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (!file) {
      cb(null);
      input.remove();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      cb(reader.result);
      input.remove();
    };
    reader.onerror = () => {
      cb(null);
      input.remove();
    };
    reader.readAsDataURL(file);
  });
  document.body.appendChild(input);
  input.click();
  // 用户取消对话框（无 change 事件）时兜底移除隐藏的 input，避免残留
  window.addEventListener(
    "focus",
    () => {
      setTimeout(() => {
        if (document.body.contains(input) && !input.files.length) input.remove();
      }, 300);
    },
    { once: true },
  );
}

/** 轻量文本输入（便签/文档树的新建文件/重命名等）。返回 Promise<string|null> */
export function promptText(title, defaultValue = "", placeholder = "") {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal prompt-modal">
        <div class="modal-title">${escapeAttr(title)}</div>
        <input class="prompt-input" type="text" value="${escapeAttr(defaultValue)}" placeholder="${escapeAttr(placeholder)}" />
        <div class="modal-actions">
          <button class="btn ghost prompt-cancel" type="button">取消</button>
          <button class="btn prompt-ok" type="button">确定</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const input = overlay.querySelector(".prompt-input");
    const done = (val) => {
      overlay.remove();
      resolve(val);
    };
    requestAnimationFrame(() => input.focus());
    input.select();
    overlay.querySelector(".prompt-cancel").addEventListener("click", () => done(null));
    overlay.querySelector(".prompt-ok").addEventListener("click", () => {
      const v = input.value.trim();
      done(v || null);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        done(input.value.trim() || null);
      } else if (e.key === "Escape") {
        e.preventDefault();
        done(null);
      }
    });
    overlay.addEventListener("mousedown", (e) => {
      if (e.target === overlay) done(null);
    });
  });
}
