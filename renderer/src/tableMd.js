/**
 * tableMd.js — Markdown 表格：定位 / 解析 / 增删行列 / 自动格式化
 *
 * 源码模式下表格就是纯文本，用户想「在下面加一行」「删掉这一列」只能手敲竖线，
 * 极易把表格敲坏。这里提供一套纯函数，把光标所在的表格块解析成二维数组，
 * 做完增删后再统一按显示宽度对齐竖线（CJK 字符按 2 列宽计算）重新输出。
 *
 * 所有函数都不碰 DOM，方便单独测试。
 */

const ROW_RE = /^\s*\|.*\|\s*$/;

/** 这一行看起来像不像表格行（首尾都有竖线） */
export function isTableRow(line) {
  return ROW_RE.test(line);
}

/** 拆分一行为单元格数组；去掉首尾竖线，`\|` 视为普通字符 */
export function splitRow(line) {
  let s = String(line).trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|") && !s.endsWith("\\|")) s = s.slice(0, -1);
  const cells = [];
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "\\" && s[i + 1] === "|") {
      cur += "\\|";
      i++;
      continue;
    }
    if (c === "|") {
      cells.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  cells.push(cur.trim());
  return cells;
}

/** 是不是 |---|:---:| 这种分隔行 */
export function isDelimRow(line) {
  if (!isTableRow(line)) return false;
  const cells = splitRow(line);
  return cells.length > 0 && cells.every((c) => /^:?-{1,}:?$/.test(c));
}

function isWide(c) {
  return (
    (c >= 0x1100 && c <= 0x115f) ||
    (c >= 0x2e80 && c <= 0x303e) ||
    (c >= 0x3041 && c <= 0x33ff) ||
    (c >= 0x3400 && c <= 0x4dbf) ||
    (c >= 0x4e00 && c <= 0x9fff) ||
    (c >= 0xa000 && c <= 0xa4cf) ||
    (c >= 0xac00 && c <= 0xd7a3) ||
    (c >= 0xf900 && c <= 0xfaff) ||
    (c >= 0xfe30 && c <= 0xfe6f) ||
    (c >= 0xff00 && c <= 0xff60) ||
    (c >= 0xffe0 && c <= 0xffe6) ||
    (c >= 0x1f300 && c <= 0x1faff)
  );
}

/** 等宽字体下的显示宽度：中日韩/全角算 2，其余算 1 */
export function dispWidth(s) {
  let w = 0;
  for (const ch of String(s)) w += isWide(ch.codePointAt(0)) ? 2 : 1;
  return w;
}

function alignOf(cell) {
  const l = cell.startsWith(":");
  const r = cell.endsWith(":");
  return l && r ? "center" : r ? "right" : l ? "left" : "";
}

/** 把表格块（字符串数组）解析成 { rows(二维), delim(分隔行下标), cols, aligns } */
export function parseTable(lines) {
  const rows = lines.map(splitRow);
  const delim = lines.findIndex(isDelimRow);
  const cols = rows.reduce((m, r) => Math.max(m, r.length), 0);
  rows.forEach((r) => {
    while (r.length < cols) r.push("");
  });
  const aligns = delim >= 0 ? rows[delim].map(alignOf) : [];
  while (aligns.length < cols) aligns.push("");
  return { rows, delim, cols, aligns };
}

function delimCell(align, width) {
  const w = Math.max(3, width);
  if (align === "center") return ":" + "-".repeat(Math.max(1, w - 2)) + ":";
  if (align === "right") return "-".repeat(Math.max(2, w - 1)) + ":";
  if (align === "left") return ":" + "-".repeat(Math.max(2, w - 1));
  return "-".repeat(w);
}

function pad(text, width, align) {
  const gap = Math.max(0, width - dispWidth(text));
  if (align === "right") return " ".repeat(gap) + text;
  if (align === "center") {
    const l = Math.floor(gap / 2);
    return " ".repeat(l) + text + " ".repeat(gap - l);
  }
  return text + " ".repeat(gap);
}

/**
 * 自动格式化表格：补齐缺失单元格、按最宽内容对齐竖线、规范分隔行。
 * @param {string[]} lines 表格块的每一行
 * @returns {string[]} 格式化后的行
 */
export function formatTable(lines) {
  const t = parseTable(lines);
  if (!t.cols) return lines.slice();
  const widths = new Array(t.cols).fill(3);
  t.rows.forEach((r, i) => {
    if (i === t.delim) return;
    r.forEach((c, j) => {
      widths[j] = Math.max(widths[j], dispWidth(c));
    });
  });
  const delimLine = "| " + widths.map((w, j) => delimCell(t.aligns[j], w)).join(" | ") + " |";
  const out = t.rows.map((r, i) =>
    i === t.delim
      ? delimLine
      : "| " + r.map((c, j) => pad(c, widths[j], t.aligns[j])).join(" | ") + " |"
  );
  // 缺分隔行的话补一行，否则不是合法 GFM 表格
  if (t.delim < 0) out.splice(1, 0, delimLine);
  return out;
}

/**
 * 对表格块执行增删操作，返回格式化后的新行。
 * @param {string[]} lines 表格块
 * @param {'rowAbove'|'rowBelow'|'colLeft'|'colRight'|'delRow'|'delCol'} op
 * @param {number} rowIdx 光标所在行（块内下标）
 * @param {number} colIdx 光标所在列
 * @returns {{lines:string[],rowIdx:number,colIdx:number}|{error:string}}
 */
export function tableOp(lines, op, rowIdx, colIdx) {
  const t = parseTable(lines);
  const rows = t.rows.map((r) => r.slice());
  const aligns = t.aligns.slice();
  const delim = t.delim;
  let nr = rowIdx;
  let nc = colIdx;

  switch (op) {
    case "rowAbove":
    case "rowBelow": {
      let at = op === "rowAbove" ? rowIdx : rowIdx + 1;
      // 新行只能落在分隔行之后（表头与分隔行必须相邻，否则表格结构失效）
      const minAt = delim >= 0 ? delim + 1 : 1;
      if (at < minAt) at = minAt;
      rows.splice(at, 0, new Array(t.cols).fill(""));
      nr = at;
      break;
    }
    case "colLeft":
    case "colRight": {
      const at = op === "colLeft" ? colIdx : colIdx + 1;
      rows.forEach((r, i) => r.splice(at, 0, i === delim ? "---" : i === 0 ? "新列" : ""));
      aligns.splice(at, 0, "");
      nc = at;
      break;
    }
    case "delRow": {
      if (rowIdx === 0 || rowIdx === delim) return { error: "表头行 / 分隔行不可删除" };
      const dataRows = rows.length - (delim >= 0 ? delim + 1 : 1);
      if (dataRows <= 1) return { error: "表格至少保留一行数据（可用「删除表格」）" };
      rows.splice(rowIdx, 1);
      nr = Math.min(rowIdx, rows.length - 1);
      if (nr === delim) nr = Math.min(delim + 1, rows.length - 1);
      break;
    }
    case "delCol": {
      if (t.cols <= 1) return { error: "表格至少保留一列（可用「删除表格」）" };
      rows.forEach((r) => r.splice(colIdx, 1));
      aligns.splice(colIdx, 1);
      nc = Math.max(0, Math.min(colIdx, t.cols - 2));
      break;
    }
    default:
      return { error: "未知的表格操作" };
  }

  const rebuilt = rows.map(
    (r, i) => "| " + r.map((c) => (i === delim ? c || "---" : c)).join(" | ") + " |"
  );
  return { lines: formatTable(rebuilt), rowIdx: nr, colIdx: nc };
}

/**
 * 从整篇文本中定位光标所在的表格块。
 * @param {string} text 全文
 * @param {number} pos 光标字符下标
 * @returns {{start:number,end:number,lines:string[],rowIdx:number,colIdx:number}|null}
 */
export function locateTable(text, pos) {
  const lineStart = text.lastIndexOf("\n", Math.max(0, pos - 1)) + 1;
  let lineEnd = text.indexOf("\n", pos);
  if (lineEnd === -1) lineEnd = text.length;
  const lineText = text.slice(lineStart, lineEnd);
  if (!isTableRow(lineText)) return null;

  // 向上找连续表格行
  let start = lineStart;
  while (start > 0) {
    const prevEnd = start - 1;
    const prevStart = text.lastIndexOf("\n", prevEnd - 1) + 1;
    if (prevEnd <= prevStart) break;
    if (!isTableRow(text.slice(prevStart, prevEnd))) break;
    start = prevStart;
  }
  // 向下找连续表格行
  let end = lineEnd;
  while (end < text.length) {
    const nextStart = end + 1;
    let nextEnd = text.indexOf("\n", nextStart);
    if (nextEnd === -1) nextEnd = text.length;
    if (nextStart >= text.length) break;
    if (!isTableRow(text.slice(nextStart, nextEnd))) break;
    end = nextEnd;
  }

  const lines = text.slice(start, end).split("\n");
  const rowIdx = text.slice(start, lineStart).split("\n").length - 1;

  // 光标在第几列：数它前面有几根未转义的竖线
  const inLine = Math.max(0, pos - lineStart);
  let pipes = 0;
  for (let i = 0; i < inLine && i < lineText.length; i++) {
    if (lineText[i] === "|" && lineText[i - 1] !== "\\") pipes++;
  }
  const cols = splitRow(lineText).length;
  let colIdx = lineText.trimStart().startsWith("|") ? pipes - 1 : pipes;
  colIdx = Math.max(0, Math.min(colIdx, cols - 1));

  return { start, end, lines, rowIdx, colIdx };
}

/** 格式化后的某一行里，第 colIdx 个单元格内容起始位置（用于把光标放回单元格） */
export function cellCaretOffset(line, colIdx) {
  let n = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === "|" && line[i - 1] !== "\\") {
      n++;
      if (n === colIdx + 1) return Math.min(line.length, i + 2);
    }
  }
  return line.length;
}
