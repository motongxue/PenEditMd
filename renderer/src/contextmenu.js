/**
 * contextmenu.js — 通用层级右键菜单组件（零依赖，自绘）
 *
 * 为什么自绘而不用 Electron 原生 Menu：
 *   原生菜单在主进程构建，样式无法跟随应用主题（深/浅色），
 *   且每个菜单项都要走一次 IPC，做「段落 ▸ 标题1-6」这种深层结构很啰嗦。
 *   自绘菜单可以直接复用渲染进程里的 editor 命令，样式也统一。
 *
 * 菜单项格式：
 *   { label, action, accel?, disabled?, checked?, danger? }  普通项
 *   { label, sub: [ ...items ] }                              子菜单
 *   { sep: true }                                             分隔线
 *
 * 用法：
 *   showContextMenu(items, event.clientX, event.clientY);
 */

let rootMenu = null; // 当前打开的顶层菜单元素
let onDocDown = null; // 点击外部关闭的监听器
let onKey = null;

/** 关闭当前右键菜单（含所有子菜单） */
export function closeContextMenu() {
  // 子菜单为了不被父面板的 overflow 裁剪，是挂在 body 上的，
  // 所以不能只 remove(rootMenu)，否则子菜单会残留在页面上。
  document.querySelectorAll(".ctx-menu").forEach((el) => el.remove());
  rootMenu = null;
  if (onDocDown) {
    document.removeEventListener("mousedown", onDocDown, true);
    onDocDown = null;
  }
  if (onKey) {
    document.removeEventListener("keydown", onKey, true);
    onKey = null;
  }
}

/**
 * 在 (x, y) 处弹出右键菜单。
 * @param {Array} items 菜单项
 * @param {number} x 视口坐标
 * @param {number} y 视口坐标
 */
export function showContextMenu(items, x, y) {
  closeContextMenu();
  if (!items || !items.length) return;

  rootMenu = buildPanel(items, 0);
  document.body.appendChild(rootMenu);
  placePanel(rootMenu, x, y);

  // 点菜单外部 / 按 Esc 关闭。用捕获阶段，避免被编辑器的监听吞掉。
  onDocDown = (e) => {
    if (rootMenu && !e.target.closest(".ctx-menu")) closeContextMenu();
  };
  onKey = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeContextMenu();
    }
  };
  document.addEventListener("mousedown", onDocDown, true);
  document.addEventListener("keydown", onKey, true);
}

/** 构建一层菜单面板 */
function buildPanel(items, depth) {
  const panel = document.createElement("div");
  panel.className = "ctx-menu";
  panel.dataset.depth = String(depth);
  // 关键：菜单上的 mousedown 一律 preventDefault，
  // 否则会让编辑区失焦、选区丢失，execCommand 类命令就全废了。
  panel.addEventListener("mousedown", (e) => e.preventDefault());

  items.forEach((it) => {
    if (it.sep) {
      const s = document.createElement("div");
      s.className = "ctx-sep";
      panel.appendChild(s);
      return;
    }

    const row = document.createElement("div");
    row.className = "ctx-item";
    if (it.disabled) row.classList.add("disabled");
    if (it.danger) row.classList.add("danger");
    if (it.checked) row.classList.add("checked");

    const label = document.createElement("span");
    label.className = "ctx-label";
    label.textContent = it.label;
    row.appendChild(label);

    if (it.sub && it.sub.length) {
      const arrow = document.createElement("span");
      arrow.className = "ctx-arrow";
      arrow.textContent = "›";
      row.appendChild(arrow);
      bindSubmenu(row, panel, it.sub, depth);
    } else {
      if (it.accel) {
        const a = document.createElement("span");
        a.className = "ctx-accel";
        a.textContent = it.accel;
        row.appendChild(a);
      }
      // 悬停到无子菜单的项上时，延迟收掉同级已展开的子菜单（见 scheduleCloseChildren）
      row.addEventListener("mouseenter", () => scheduleCloseChildren(panel));
      if (!it.disabled) {
        row.addEventListener("click", () => {
          closeContextMenu();
          // 让菜单先消失再执行命令，避免命令里弹模态时菜单还挂着
          setTimeout(() => {
            try {
              it.action && it.action();
            } catch (err) {
              console.error("[contextmenu] 命令执行失败:", err);
            }
          }, 0);
        });
      }
    }

    panel.appendChild(row);
  });

  return panel;
}

/** 给带子菜单的行绑定悬停展开 */
function bindSubmenu(row, parentPanel, subItems, depth) {
  row.addEventListener("mouseenter", () => {
    cancelPendingClose(parentPanel);
    // 已经展开的就别重建，否则鼠标在父项上抖一下菜单就闪
    if (row.classList.contains("open")) return;
    closeChildrenOf(parentPanel);

    const r = row.getBoundingClientRect();
    const pr = parentPanel.getBoundingClientRect();

    const sub = buildPanel(subItems, depth + 1);
    sub.classList.add("ctx-sub");
    // 挂到 body 而不是父面板：父面板有 overflow-y:auto，
    // 挂在里面会被裁掉右侧溢出的子菜单。
    document.body.appendChild(sub);
    placePanel(sub, pr.right - 2, r.top - 4, { flipX: pr.left, preferRight: true });

    // 鼠标真正进入子菜单后，取消父级挂起的关闭
    sub.addEventListener("mouseenter", () => cancelPendingClose(parentPanel));

    row.classList.add("open");
    parentPanel._children = parentPanel._children || [];
    parentPanel._children.push({ el: sub, row });
  });
}

/**
 * 延迟收起子菜单。
 * 直接收起会有「对角线问题」：鼠标从「段落」斜着移向它的子菜单时，
 * 会先扫过父菜单的下一行「格式」，导致刚展开的子菜单被瞬间关掉。
 * 给 220ms 缓冲，鼠标只要在此期间进入子菜单就取消关闭。
 */
function scheduleCloseChildren(panel) {
  cancelPendingClose(panel);
  if (!(panel._children || []).length) return;
  panel._closeTimer = setTimeout(() => closeChildrenOf(panel), 220);
}

function cancelPendingClose(panel) {
  if (panel._closeTimer) {
    clearTimeout(panel._closeTimer);
    panel._closeTimer = null;
  }
}

/** 收起某层面板下已展开的所有子菜单 */
function closeChildrenOf(panel) {
  cancelPendingClose(panel);
  const kids = panel._children || [];
  kids.forEach(({ el, row }) => {
    closeChildrenOf(el); // 递归收起孙子菜单
    el.remove();
    row.classList.remove("open");
  });
  panel._children = [];
}

/**
 * 定位面板，保证不超出视口。
 * @param {object} opt flipX: 翻转时的参考左边界；preferRight: 是否优先右侧展开
 */
function placePanel(panel, x, y, opt = {}) {
  panel.style.visibility = "hidden";
  panel.style.left = "0px";
  panel.style.top = "0px";
  const w = panel.offsetWidth;
  const h = panel.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = 6;

  let left = x;
  if (left + w > vw - pad) {
    // 子菜单：翻到父面板左侧；顶层菜单：贴着光标左展开
    left = opt.preferRight && opt.flipX != null ? opt.flipX - w + 2 : x - w;
  }
  left = Math.max(pad, Math.min(left, vw - w - pad));

  let top = y;
  if (top + h > vh - pad) top = Math.max(pad, vh - h - pad);
  top = Math.max(pad, top);

  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
  panel.style.visibility = "";
}
