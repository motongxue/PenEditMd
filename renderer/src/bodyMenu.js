/**
 * bodyMenu.js — 把下拉菜单定位到按钮下方（菜单挂 document.body，fixed 定位）。
 *
 * 为什么必须挂 body：工具栏有 overflow:hidden（折叠动画用），且 hover 会展开第二行，
 * 若菜单是 toolbar 的子元素，向下弹出的菜单会被 overflow 裁剪 / 被第二行按钮遮挡。
 * 挂到 body 后菜单浮在最上层，永不被工具栏内部结构遮挡。
 */

/** 把已显示的菜单定位到锚点按钮正下方（下方放不下则弹到上方） */
export function positionMenuUnder(menu, anchor) {
  menu.classList.remove("hidden");
  // 先确保在 body 中（工具栏下拉首次点击时移入）
  if (menu.parentNode !== document.body) document.body.appendChild(menu);
  const r = anchor.getBoundingClientRect();
  const mw = menu.offsetWidth || 150;
  const mh = menu.offsetHeight || 120;
  let left = r.left;
  if (left + mw > window.innerWidth - 8) left = Math.max(8, window.innerWidth - mw - 8);
  let top = r.bottom + 4;
  if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 4); // 下方放不下 → 上方
  menu.style.left = left + "px";
  menu.style.top = top + "px";
}

/** 收起页面上所有已展开的 .menu（含右键菜单外的下拉） */
export function closeAllMenus() {
  document.querySelectorAll(".menu:not(.hidden)").forEach((m) => m.classList.add("hidden"));
}
