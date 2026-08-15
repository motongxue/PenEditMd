; ============================================================
; PenEditMd 自定义 NSIS 片段
; 只使用 electron-builder 提供的官方扩展点（custom* 宏）与标准 NSIS API，
; 不覆盖任何内置宏，不依赖任何外部 NSIS 插件。
; ============================================================

; 1) 运行中检测（官方扩展点：CHECK_APP_RUNNING 会先调用本宏）
;    安装/卸载时强制结束 PenEditMd 主进程与 Python 后端子进程，
;    避免进程残留 / 变僵尸导致文件被占用，进而弹出「请手动关闭」。
;    要点：
;      - 先杀 Python 后端（它持有 resources 目录的锁，且最易变僵尸）；
;      - 用 /t 杀掉整个进程树（含子进程）；
;      - 杀完 Sleep，等操作系统释放文件锁后再继续解压。
!macro customCheckAppRunning
  nsExec::Exec `taskkill /f /t /im "markitdown-server.exe"`
  nsExec::Exec `taskkill /f /t /im "PenEditMd.exe"`
  Sleep 2000
  ; 二次兜底（应对僵尸/时序问题）
  nsExec::Exec `taskkill /f /t /im "markitdown-server.exe"`
  nsExec::Exec `taskkill /f /t /im "PenEditMd.exe"`
  Sleep 1000
!macroend

; 2) 安装后处理（官方扩展点：在 electron-builder 建好快捷方式之后执行）
;    a. 把桌面 / 开始菜单快捷方式的悬停提示（备注）改为「安装位置：$INSTDIR」；
;       使用 CreateShortCut 的备注参数即可，无需任何插件。
;    b. 在开始菜单程序组额外放一个「卸载 PenEditMd」快捷方式，方便用户找到卸载入口。
!macro customInstall
  ${if} ${FileExists} "$newDesktopLink"
    CreateShortCut "$newDesktopLink" "$appExe" "" "$appExe" 0 "" "" "安装位置：$INSTDIR"
  ${endIf}
  ${if} ${FileExists} "$newStartMenuLink"
    CreateShortCut "$newStartMenuLink" "$appExe" "" "$appExe" 0 "" "" "安装位置：$INSTDIR"
  ${endIf}
  ; 通知资源管理器刷新图标缓存，使悬停提示立即生效
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'

  !ifdef MENU_FILENAME
    StrCpy $0 "$SMPROGRAMS\${MENU_FILENAME}"
  !else
    StrCpy $0 "$SMPROGRAMS"
  !endif
  CreateShortCut "$0\卸载 ${PRODUCT_FILENAME}.lnk" \
    "$INSTDIR\${UNINSTALL_FILENAME}" "" "$INSTDIR\${UNINSTALL_FILENAME}" 0 \
    "" "" "卸载 ${PRODUCT_FILENAME}（安装位置：$INSTDIR）"
!macroend

; 3) 卸载前兜底（官方扩展点）：先强杀残留进程释放文件锁，再交由 electron-builder 标准卸载流程清理。
!macro customUnInstall
  nsExec::Exec `taskkill /f /t /im "markitdown-server.exe"`
  nsExec::Exec `taskkill /f /t /im "PenEditMd.exe"`
  Sleep 2000
  nsExec::Exec `taskkill /f /t /im "markitdown-server.exe"`
  nsExec::Exec `taskkill /f /t /im "PenEditMd.exe"`
  Sleep 1000
!macroend
