/**
 * 预加载脚本：在隔离环境中向渲染进程暴露安全接口。
 * 渲染进程只能通过这里声明的白名单调用主进程能力，不直接接触 Node。
 */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // 打开文件选择对话框，返回绝对路径数组
  openFile: (extensions) => ipcRenderer.invoke("dialog:openFile", extensions),
  // 后端服务基础地址
  backendBaseUrl: () => ipcRenderer.invoke("backend:baseUrl"),
  // 在文件管理器中定位文件
  showInFolder: (p) => ipcRenderer.invoke("shell:showItemInFolder", p),
  // 导出：弹出“保存为”对话框并写入文件，返回保存路径或 null
  saveFile: (defaultName, content, ext) =>
    ipcRenderer.invoke("dialog:saveFile", { defaultName, content, ext }),
  // 仅弹出“另存为”对话框返回路径（不写文件），手动保存（Ctrl+S）选路径用
  choosePath: (defaultName, ext) =>
    ipcRenderer.invoke("dialog:choosePath", { defaultName, ext }),
  // 导出 PDF：主进程用隐藏窗口打印为 PDF 并保存，返回路径或 null
  exportPdf: (html, defaultName) =>
    ipcRenderer.invoke("export:pdf", { html, defaultName }),
  // 导出 PNG 长图：主进程用隐藏窗口整页截图，返回路径或 null
  exportPng: (html, defaultName, width, scale) =>
    ipcRenderer.invoke("export:png", { html, defaultName, width, scale }),
  // 导出 ZIP 容器（DOCX / EPUB）：渲染进程给部件列表，主进程打包落盘
  exportZip: (defaultName, ext, entries) =>
    ipcRenderer.invoke("export:zip", { defaultName, ext, entries }),

  // 剪贴板（右键菜单的粘贴 / 复制图片用；比渲染进程的 clipboard API 可靠）
  clipboardReadText: () => ipcRenderer.invoke("clipboard:readText"),
  clipboardWriteText: (text) => ipcRenderer.invoke("clipboard:writeText", text),
  clipboardReadImage: () => ipcRenderer.invoke("clipboard:readImage"),
  clipboardWriteImage: (dataUrl) => ipcRenderer.invoke("clipboard:writeImage", dataUrl),
  // 图片另存为，返回保存路径或 null
  saveImage: (dataUrl, defaultName) =>
    ipcRenderer.invoke("dialog:saveImage", { dataUrl, defaultName }),

  // ---- 手动保存（Ctrl+S）与关闭确认 ----
  // 直接写文本到指定路径（保存过一次后「写回原文件」不再弹对话框）
  writeTextFile: (filePath, content) =>
    ipcRenderer.invoke("fs:writeText", { path: filePath, content }),
  // 保存时把 base64 图片归档到 dir/assets/ 下，返回成功写入的张数
  archiveAssets: (dir, files) =>
    ipcRenderer.invoke("fs:archiveAssets", { dir, files }),
  // 主进程点了「保存」后通知渲染进程执行保存（成功后回执 replyClose('save')）
  onSaveAndClose: (cb) =>
    ipcRenderer.on("app:saveAndClose", () => cb()),
  // 回执给主进程：'save' | 'nosave' | 'cancel'
  replyClose: (choice) => ipcRenderer.invoke("app:replyClose", choice),
  // 原生菜单栏动作（文件/编辑/视图/设置 等菜单项）
  onMenuAction: (cb) => ipcRenderer.on("menu:action", (_e, action) => cb(action)),
  // 操作系统「用本应用打开文件」时，主进程把双击的文件绝对路径推给渲染进程
  onOpenPath: (cb) => ipcRenderer.on("app:openPath", (_e, p) => cb(p)),

  // ---- 文档树（PRD #8）：工作文件夹浏览 / 读写 ----
  // 选择工作文件夹，返回绝对路径或 null
  selectFolder: () => ipcRenderer.invoke("dialog:selectFolder"),
  // 列目录：返回 root 内 dir 的直接子项 [{ name, path, isDir, size, mtime }]
  listDir: (root, dir) => ipcRenderer.invoke("fs:listDir", { root, dir }),
  // 读取文本文件，越界/失败返回 null
  readTextFile: (root, target) => ipcRenderer.invoke("fs:readText", { root, target }),
  // 新建目录，返回新目录路径或 null
  createDir: (root, parent, folderName) =>
    ipcRenderer.invoke("fs:mkdir", { root, parent, folderName }),
  // 新建空文件，返回新文件路径或 null
  createFile: (root, parent, fileName, content) =>
    ipcRenderer.invoke("fs:createFile", { root, parent, fileName, content }),
  // 重命名（文件或目录），返回新路径或 null
  renamePath: (root, target, newName) =>
    ipcRenderer.invoke("fs:rename", { root, target, newName }),
  // 删除（文件或目录，递归），返回是否成功
  removePath: (root, target) => ipcRenderer.invoke("fs:remove", { root, target }),
  // 读取二进制文件为 base64（文档树点击图片时内联显示）
  readBinary: (root, target) => ipcRenderer.invoke("fs:readBinary", { root, target }),
  // 读取用户选择的媒体文件为 base64 data URI（音频/视频组件上传用）
  readMedia: (filePath) => ipcRenderer.invoke("fs:readMedia", filePath),

  // ---- 会话自动保存/恢复（#7）：把当前会话文档持久化到主进程 userData，下次启动恢复 ----
  // 保存会话：files 为 {id,name,markdown,path,dirty,savedMd} 数组
  sessionSave: (files) => ipcRenderer.invoke("session:save", files),
  // 读取会话：返回数组（无则空数组）
  sessionLoad: () => ipcRenderer.invoke("session:load"),

  // ---- 桌面便签（PRD #10）：独立置顶透明窗口 ----
  // 取全部便签（主窗口列表 / 便签窗口渲染都用）
  notesGetAll: () => ipcRenderer.invoke("notes:getAll"),
  // 新增/更新一条便签（fromNotes=true 表示来自便签窗口自身，主进程不再回广播给便签窗口以免打断输入）
  notesUpsert: (note, fromNotes) => ipcRenderer.invoke("notes:upsert", { note, fromNotes }),
  // 删除一条便签
  notesRemove: (id) => ipcRenderer.invoke("notes:remove", { id }),
  // 便签窗口：切换鼠标穿透（true=穿透，false=可交互）
  notesSetIgnore: (ignore) => ipcRenderer.send("notes:setIgnore", ignore),
  // 主窗口请求打开/确保便签窗口存在并显示
  notesEnsureWindow: () => ipcRenderer.invoke("notes:ensureWindow"),
  // 便签窗口收到主进程广播的便签变更
  onNotesChanged: (cb) => ipcRenderer.on("notes:changed", (_e, store) => cb(store)),

  // ---- 便签开机自启 + 轻量模式（#3）----
  // 读取「开机自动显示便签」偏好
  getAutoLaunch: () => ipcRenderer.invoke("app:getAutoLaunch"),
  // 设置「开机自动显示便签」（true/false）
  setAutoLaunch: (v) => ipcRenderer.invoke("app:setAutoLaunch", v),
  // ---- 通用偏好读写（如「关闭应用显示便签」）----
  getPrefs: () => ipcRenderer.invoke("app:getPrefs"),
  setPref: (key, val) => ipcRenderer.invoke("app:setPref", key, val),
  // 便签窗口「打开编辑器」：聚焦/创建主窗口并启动后端
  openMainApp: () => ipcRenderer.invoke("app:openMain"),

  // ---- AI 对话（OpenAI 兼容 chat/completions）：渲染进程把配置+消息发主进程，主进程代发请求
  //      （避开浏览器 CORS，且 API Key 不进入页面脚本上下文）----
  aiChat: (payload) => ipcRenderer.invoke("ai:chat", payload),
  // AI 调试日志：写入 <userData> 下指定文件（默认 ai-debug.log；AI 排版详细流程用 ai-layout.log）
  debugLog: (msg, file) => ipcRenderer.invoke("debug:log", { msg, file }),

  // ---- 微信公众号：凭证校验 / 推送草稿箱（网络请求全在主进程，AppSecret 不进页面上下文）----
  wechatTest: (payload) => ipcRenderer.invoke("wechat:test", payload),
  wechatPush: (payload) => ipcRenderer.invoke("wechat:push", payload),
});
