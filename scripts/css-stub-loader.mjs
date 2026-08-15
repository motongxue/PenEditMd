/** Node ESM loader：把 .css / ?raw 之类 Vite 专属导入处理掉，
 *  让渲染进程模块能在纯 Node 环境里被测试脚本直接 import。
 *
 *  - `import "./x.css"`      → 空模块（副作用导入，测试里无意义）
 *  - `import s from "./x.css?raw"` → 真读文件内容
 *    （themeCss.js 靠 ?raw 拿组件样式，stub 成空串会让导出相关断言失去意义） */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const RAW_MARK = "?raw";

export async function resolve(specifier, context, next) {
  if (specifier.includes(RAW_MARK)) {
    const clean = specifier.slice(0, specifier.indexOf(RAW_MARK));
    const url = new URL(clean, context.parentURL).href;
    return { url: url + RAW_MARK, format: "module", shortCircuit: true };
  }
  if (specifier.endsWith(".css")) {
    return { url: "data:text/javascript,export default ''", shortCircuit: true };
  }
  return next(specifier, context);
}

export async function load(url, context, next) {
  if (url.includes(RAW_MARK)) {
    const filePath = fileURLToPath(url.slice(0, url.indexOf(RAW_MARK)));
    let text = "";
    try {
      text = readFileSync(filePath, "utf8");
    } catch (_) {
      // 读不到就退化成空串，不让测试因为一个装饰性资源整体崩掉
    }
    return { format: "module", shortCircuit: true, source: `export default ${JSON.stringify(text)};` };
  }
  return next(url, context);
}
