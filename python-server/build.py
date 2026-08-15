"""
PyInstaller 打包脚本：把 python-server/server.py 打包成单文件可执行程序。

打包后的 exe 会被 Electron（electron-builder 的 extraResources）拷贝到应用资源目录，
由 main.js 在运行时以子进程方式拉起。

用法（在 python-server 目录下）：
    python build.py            # 打包当前平台的二进制
    python build.py --clean    # 先清理再打包
"""

import os
import sys
import shutil
import subprocess
import argparse

HERE = os.path.dirname(os.path.abspath(__file__))
SERVER = os.path.join(HERE, "server.py")
DIST = os.path.join(HERE, "dist")
BUILD = os.path.join(HERE, "build")
SPEC = os.path.join(HERE, "markitdown_server.spec")


def build(clean: bool):
    if clean:
        for d in (DIST, BUILD):
            if os.path.isdir(d):
                shutil.rmtree(d)
        if os.path.isfile(SPEC):
            os.remove(SPEC)

    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--name", "markitdown-server",
        "--onefile",
        "--noconsole",          # 无黑框，作为后台服务
        "--hidden-import", "markitdown",
        "--collect-all", "markitdown",
        "--collect-all", "magika",
        "--paths", HERE,
        SERVER,
    ]
    print("Running:", " ".join(cmd))
    subprocess.check_call(cmd)

    # 单文件产物（PyInstaller --onefile 输出）
    built = os.path.join(DIST, "markitdown-server" + (".exe" if os.name == "nt" else ""))

    # 中转子目录：extraResources.from 指向整个目录，由 electron-builder 原样拷进
    # resources/markitdown-server/，运行时 main.js 解析为
    # resources/markitdown-server/markitdown-server(.exe)
    stage_dir = os.path.join(DIST, "markitdown-server")
    os.makedirs(stage_dir, exist_ok=True)
    stage = os.path.join(stage_dir, os.path.basename(built))
    if os.path.abspath(built) != os.path.abspath(stage):
        shutil.move(built, stage)

    print(f"\n[OK] 打包完成 -> {stage}")
    print("提示：electron-builder 的 extraResources 会把这个目录拷进应用资源目录。")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--clean", action="store_true", help="打包前清理构建产物")
    args = ap.parse_args()
    build(args.clean)
