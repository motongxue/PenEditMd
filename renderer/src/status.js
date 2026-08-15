/**
 * status.js — 极简状态栏消息总线
 *
 * editor.js / richtext.js 这些底层模块需要给用户反馈（例如「请把光标放到表格内」），
 * 但它们拿不到 main.js 里的 setStatus。这里用一个可注入的回调打通，避免挂 window 全局。
 */

let sink = null;

/** main.js 启动时注入真正的状态栏写入函数 */
export function setStatusSink(fn) {
  sink = typeof fn === "function" ? fn : null;
}

/** 任意模块调用：往状态栏写一句话（未注入时静默丢弃） */
export function status(msg) {
  if (sink) sink(msg);
}
