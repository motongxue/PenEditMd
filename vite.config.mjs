import { defineConfig } from 'vite';

// 渲染进程（renderer/）使用 Vite 打包为静态资源，由 Electron 主进程 loadFile 加载。
// base 设为相对路径，保证打包后资源引用在 file:// 协议下也能正常解析。
export default defineConfig({
  root: 'renderer',
  base: './',
  build: {
    outDir: '../dist/renderer',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
