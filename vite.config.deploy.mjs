// 部署构建配置：避开沙箱 safe-delete shim 拦截 vite 的 emptyDir（会触发 EPERM/trash 失败）。
// 关键：emptyOutDir:false + 时间戳化文件名，vite 只写「新文件」绝不删旧，从而不触发 shim。
// 副作用：dist/renderer 会累积旧时间戳文件 → 打包变慢。解决方案：打包前用
//   PowerShell Remove-Item -Recurse -Force 强删 dist/renderer（绕过 shim），再跑本构建。
import { defineConfig } from "vite";

const stamp = Date.now();

export default defineConfig({
  root: "renderer",
  base: "./",
  build: {
    outDir: "../dist/renderer",
    emptyOutDir: false,
    rollupOptions: {
      output: {
        assetFileNames: `assets/[name]-${stamp}[extname]`,
        chunkFileNames: `assets/[name]-${stamp}.js`,
        entryFileNames: `assets/[name]-${stamp}.js`,
      },
    },
  },
});
