"""
笔削 PenEditMd - Python 后端转换服务

使用 FastAPI 封装 markitdown 核心引擎，为 Electron 前端提供本地转换 API。
Electron 主进程会在应用启动时以子进程方式拉起本服务（默认端口 8765）。

接口：
  GET  /health       健康检查
  GET  /formats      返回支持的文件扩展名列表
  POST /convert      接收上传文件，返回 Markdown 文本
  POST /convert_path 接收本地绝对路径，返回 Markdown 文本（拖拽场景）
"""

import os
import re
import sys
import json
import base64
import mimetypes
import tempfile
import traceback
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# 兼容两种环境：
# 1) 开发态：markitdown 已 pip install 到当前环境
# 2) 打包态：PyInstaller 把依赖塞进了 _internal 目录
try:
    from markitdown import MarkItDown
except ImportError:  # pragma: no cover
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "_internal"))
    from markitdown import MarkItDown

# ---- 应用配置 ----
APP_TITLE = "笔削 PenEditMd Backend"
DEFAULT_PORT = int(os.environ.get("MARKITDOWN_PORT", "8765"))

app = FastAPI(title=APP_TITLE, version="0.1.0")

# Electron 渲染进程通过本地 HTTP 调用，放开 CORS 限制（仅本机）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- 支持的格式（仅用于 UI 提示，实际转换由 markitdown 内部决定）----
SUPPORTED_EXTENSIONS = [
    ".pdf", ".docx", ".doc", ".pptx", ".ppt", ".xlsx", ".xls",
    ".html", ".htm", ".csv", ".json", ".xml", ".epub", ".msg",
    ".zip", ".txt", ".md", ".jpg", ".jpeg", ".png", ".gif", ".bmp",
    ".wav", ".mp3", ".rtf", ".odt",
]

# ---- 图片内嵌配置 ----
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 单张图片最大 5MB
TOTAL_IMAGE_BUDGET = 20 * 1024 * 1024  # 单文档图片 base64 总预算 20MB

_IMAGE_PLACEHOLDER_RE = re.compile(r"@image#\d+:\s*(\S+)", re.IGNORECASE)
_MD_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")


def _mime_for(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()
    if ext == ".svg":
        return "image/svg+xml"
    return mimetypes.guess_type(path)[0] or "application/octet-stream"


def _is_safe_image_path(base_dir: str, rel: str) -> bool:
    """校验图片相对路径是否位于源文件目录内，且为允许的图片类型。"""
    try:
        target = os.path.realpath(os.path.join(base_dir, rel))
        base = os.path.realpath(base_dir)
        # 必须落在 base_dir 内部（含自身），防止 .. 等目录遍历
        if not (target == base or target.startswith(base + os.sep)):
            return False
        ext = os.path.splitext(target)[1].lower()
        if ext not in IMAGE_EXTS:
            return False
        return os.path.isfile(target)
    except Exception:
        return False


def _read_image_base64(path: str) -> str | None:
    """读取图片文件并返回 base64 data URI；过大或失败返回 None。"""
    try:
        size = os.path.getsize(path)
        if size > MAX_IMAGE_SIZE:
            return None
        with open(path, "rb") as f:
            data = f.read()
        mime = _mime_for(path)
        encoded = base64.b64encode(data).decode("ascii")
        return f"data:{mime};base64,{encoded}"
    except Exception:
        return None


def _inline_images(markdown: str, base_dir: str) -> str:
    """将 markitdown 的 @image#N:filename 占位符和相对路径图片内嵌为 base64。

    markitdown 处理 Word/PDF 等文件时，通常会把内嵌图片提取到源文件同目录，
    并在 Markdown 中留下占位符或相对路径。本函数把它们解析为自包含的 data URI，
    让前端 WYSIWYG 编辑器能直接渲染，导出的 .md 也能独立带走图片。
    """
    if not base_dir or not os.path.isdir(base_dir):
        return markdown

    total_used = 0

    def replace_placeholder(m: re.Match) -> str:
        nonlocal total_used
        rel = m.group(1)
        if not _is_safe_image_path(base_dir, rel):
            return m.group(0)
        b64 = _read_image_base64(os.path.join(base_dir, rel))
        if not b64:
            return m.group(0)
        total_used += len(b64.encode("utf-8"))
        if total_used > TOTAL_IMAGE_BUDGET:
            return m.group(0)
        return f"![{os.path.basename(rel)}]({b64})"

    markdown = _IMAGE_PLACEHOLDER_RE.sub(replace_placeholder, markdown)

    def replace_md_image(m: re.Match) -> str:
        nonlocal total_used
        alt = m.group(1)
        src = m.group(2).strip()
        # 跳过已经是 URL、data URI、绝对路径或锚点的图片
        if re.match(r"^(https?://|data:|#|/|[a-zA-Z]:[\\\\/])", src):
            return m.group(0)
        if not _is_safe_image_path(base_dir, src):
            return m.group(0)
        b64 = _read_image_base64(os.path.join(base_dir, src))
        if not b64:
            return m.group(0)
        total_used += len(b64.encode("utf-8"))
        if total_used > TOTAL_IMAGE_BUDGET:
            return m.group(0)
        return f"![{alt}]({b64})"

    return _MD_IMAGE_RE.sub(replace_md_image, markdown)


class PathRequest(BaseModel):
    path: str


def _build_converter() -> MarkItDown:
    """构建转换引擎。

    生产环境中可在此读取本地存储的 API Key（OpenAI / Azure Document Intelligence），
    注入到 MarkItDown 中以支持图片 OCR / 云端高精度转换。
    """
    # TODO(MVP 之后): 从加密配置读取 llm_client / docintel_endpoint 等
    return MarkItDown(enable_plugins=False)


def _is_path_allowed(p: str) -> bool:
    """拒绝访问系统敏感目录与凭据文件，降低本地信息泄露风险。

    桌面应用虽为本地运行，但 /convert_path 可接受任意绝对路径，
    若不加限制可能被诱导读取本机敏感文件。这里做最小化黑名单防护。
    """
    try:
        ap = os.path.abspath(os.path.normpath(p))
    except Exception:  # pragma: no cover
        return False
    lower = ap.lower()
    sensitive_dirs = [
        "/etc", "/proc", "/sys", "/boot", "/root",
        "c:\\windows", "c:\\program files", "c:\\programdata",
    ]
    for d in sensitive_dirs:
        if lower.startswith(d + os.sep) or lower == d:
            return False
    name = os.path.basename(lower)
    if name in {
        ".env", "id_rsa", "id_dsa", "id_ecdsa", "id_ed25519",
        ".git-credentials", "credentials.json", "token.txt", "secrets.json",
    }:
        return False
    return True


def _convert_file(file_path: str) -> str:
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"文件不存在: {file_path}")
    converter = _build_converter()
    # keep_data_uris=True：保留图片的 base64 数据。markitdown 默认会主动截断
    # data URI（见 converters/_markdownify.py convert_img），导致 Word/PDF 中的
    # 内嵌图片变成无效地址、无法渲染。开启后图片以 data:image/*;base64 内嵌，
    # 让导出的 .md 自包含、可直接显示。
    #
    # 兼容性：该参数在不同 markitdown 版本里位置不一致——有的版本在 convert()
    # 上以 **kwargs 形式静默吸收（0.1.6），有的版本要求放在 MarkItDown(__init__)，
    # 还有的版本 convert() 签名严格、传入会直接 TypeError 导致转换失败。
    # 因此这里先尝试带参数，捕获 TypeError 再回退到不带参数，保证各版本都能转换成功。
    try:
        result = converter.convert(file_path, keep_data_uris=True)
    except TypeError:
        result = converter.convert(file_path)
    markdown = result.text_content or ""
    # 兜底：若转换结果里仍出现相对路径图片或 @image# 占位符，尝试内嵌同目录图片。
    base_dir = os.path.dirname(file_path)
    return _inline_images(markdown, base_dir)


@app.get("/health")
def health():
    return {"status": "ok", "service": APP_TITLE}


@app.get("/formats")
def formats():
    return {"extensions": SUPPORTED_EXTENSIONS}


@app.post("/convert")
async def convert_upload(file: UploadFile = File(...)):
    """接收上传文件，写入临时目录后转换。"""
    try:
        suffix = Path(file.filename or "blob").suffix or ".bin"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        try:
            markdown = _convert_file(tmp_path)
        finally:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
        return {"filename": file.filename, "markdown": markdown}
    except Exception as exc:  # noqa: BLE001
        traceback.print_exc()
        return JSONResponse(
            status_code=400,
            content={"error": str(exc)},
        )


@app.post("/convert_path")
def convert_path(req: PathRequest):
    """接收本地绝对路径直接转换（拖拽文件到窗口时更省内存）。"""
    if not _is_path_allowed(req.path):
        raise HTTPException(status_code=403, detail="拒绝访问受限路径")
    try:
        markdown = _convert_file(req.path)
        return {"path": req.path, "markdown": markdown}
    except Exception as exc:  # noqa: BLE001
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(exc))


def main():
    import uvicorn

    print(f"[markitdown-backend] listening on http://127.0.0.1:{DEFAULT_PORT}")
    uvicorn.run(app, host="127.0.0.1", port=DEFAULT_PORT, log_level="info")


if __name__ == "__main__":
    main()
