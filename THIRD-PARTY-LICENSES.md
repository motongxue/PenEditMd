# 第三方许可声明 / Third-Party Licenses

本文件列出「笔削 PenEditMd」所使用之第三方开源组件的许可证与版权信息。
本软件自身以 **GNU Affero General Public License v3 (AGPL-3.0)** 协议发布（见 `LICENSE`）。

---

## 1. Microsoft markitdown（转换内核）

- 仓库：https://github.com/microsoft/markitdown
- 协议：**MIT License**
- 版权：© Microsoft Corporation

```
MIT License

Copyright (c) Microsoft Corporation.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

> 商标提示：markitdown 为 Microsoft 商标。本软件仅以「基于微软开源 markitdown」
> 作指名式合理使用（nominative use）署名，不代表 Microsoft 的背书或赞助。

---

## 2. gzh-design-skill（AI 排版组件库 / 主题素材来源）

> 本组件以 **AGPL-3.0** 授权，与本项目根目录的 AGPL-3.0 声明一致。
> PenEditMd 实际内置并使用了该组件的排版主题库（即 `renderer/assets/ai-layout/` 下的各主题文件）。
> 依据 AGPL-3.0 第 13 条（Remote Network Interaction），本项目公开仓库即作为对应源码的提供渠道：
> https://github.com/motongxue/PenEditMd 。

- 来源：WorkBuddy 内置 `gzh-design-skill`（微信公众号排版引擎）
- 协议：**GNU Affero General Public License v3 (AGPL-3.0)**
- 版权：© 甲木 (Jiamu) × 摸鱼小李 (Moyu Xiaoli)
- 完整许可证文本：`licenses/gzh-design-skill-LICENSE`

---

## 2b. gzh-AI-Design-skill（AI 排版方法论 / 推送引擎）

- 来源：WorkBuddy 内置 `gzh-AI-Design-skill`（仓库 https://github.com/Patrick-mufeng/gzh-AI-Design-skill）
- 协议：**MIT License（README 中声明）**
- 版权：© Patrick-mufeng（README 未单独列出版权行，以仓库所有人为准）

> 注：该组件上游未提供独立的 `LICENSE` 文件，仅在 README 「协议」章节声明为 MIT License。
> 该声明已构成有效授权；若上游后续补充带版权行的 LICENSE，应同步替换本节引用。

```
MIT License

Copyright (c) Patrick-mufeng

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---



---

## 3. 前端 npm 依赖

以下依赖通过 `package.json` 引入，均为宽松协议（MIT / ISC / BSD-3-Clause）：

| 包名 | 版本 | 协议 | 版权方 |
| --- | --- | --- | --- |
| marked | ^12.0.0 | MIT | © 2014+ Christopher Jeffrey (marked) |
| dompurify | ^3.1.6 | MIT | © Cure53 / Mario Heiderich |
| katex | ^0.16.47 | MIT | © Khan Academy |
| mermaid | ^11.16.1 | MIT | © Knut Sveidqvist and contributors |
| highlight.js | ^11.9.0 | BSD-3-Clause | © 2006+ Ivan Sagalaev et al. |
| turndown | ^7.2.0 | MIT | © Dom Christie |
| turndown-plugin-gfm | ^1.0.2 | MIT | © Dom Christie |

### 3.1 MIT 文本（marked / DOMPurify / KaTeX / Mermaid / Turndown / turndown-plugin-gfm）

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 3.2 highlight.js —— BSD-3-Clause

```
Copyright (c) 2006, Ivan Sagalaev
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.
  * Neither the name of the author nor the names of its contributors may be
    used to endorse or promote products derived from this software without
    specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

---

## 4. 运行时 / 打包依赖

| 组件 | 协议 | 说明 |
| --- | --- | --- |
| Electron | MIT | 应用外壳，安装包内已含 `LICENSE.electron.txt` |
| Chromium（随 Electron） | BSD-3-Clause / 多协议 | 见安装包内 `LICENSES.chromium.html` |
| Python 运行时（markitdown 依赖） | PSF License (Python-2.0) | 仅打包分发时随附 |

以上组件在安装包内均已附带各自的许可文件，本软件不对其实质内容另行修改。
