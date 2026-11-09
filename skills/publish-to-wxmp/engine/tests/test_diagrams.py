"""Diagram publishing exercises the installed CLI, not a mocked renderer."""
import json
import os
import select
import shutil
import socket
import struct
import subprocess
import urllib.request
import zlib
from pathlib import Path

import test_artifacts
from test_rendering import Document

FLOW = "flowchart TD\n image[中文开始] --> img{成功?}\n img -- 是 --> C[发布]"


def png_pixels(data):
    """Decode 8-bit RGB/RGBA PNG filters independently of the renderer."""
    assert data[:8] == b"\x89PNG\r\n\x1a\n"
    pos, compressed = 8, b""
    while pos < len(data):
        size = struct.unpack(">I", data[pos:pos + 4])[0]
        kind, chunk = data[pos + 4:pos + 8], data[pos + 8:pos + 8 + size]
        assert zlib.crc32(kind + chunk) == struct.unpack(">I", data[pos + 8 + size:pos + 12 + size])[0]
        if kind == b"IHDR":
            width, height, depth, color, _, _, interlace = struct.unpack(">IIBBBBB", chunk)
            assert depth == 8 and color in (2, 6) and interlace == 0
        if kind == b"IDAT":
            compressed += chunk
        pos += size + 12
    channels = 4 if color == 6 else 3
    raw, stride = zlib.decompress(compressed), width * channels
    assert len(raw) == height * (stride + 1)
    previous, pixels = bytearray(stride), bytearray()
    for y in range(height):
        offset = y * (stride + 1)
        mode = raw[offset]
        row = bytearray(raw[offset + 1:offset + 1 + stride])
        for x in range(stride):
            a, b = row[x - channels] if x >= channels else 0, previous[x]
            c = previous[x - channels] if x >= channels else 0
            p = a + b - c
            paeth = min((a, b, c), key=lambda value: abs(p - value))
            predictor = (0, a, b, (a + b) // 2, paeth)[mode]
            row[x] = (row[x] + predictor) & 255
        pixels.extend(row)
        previous = row
    return width, height, channels, pixels


class DiagramTests(test_artifacts.CLIEnvironment):
    def test_chinese_flowchart_is_a_real_image_uploaded_into_the_draft(self):
        source = f"# 图表发布\n\n```mermaid\n{FLOW}\n```\n\n![封面](cover.png)\n"
        self.note.write_text(source)
        self.cli("build")
        html = (self.run_dir / "article.html").read_text()
        document = Document(html)
        image = document.first("img").attrs["src"]
        self.assertNotIn("<pre", html)
        self.assertNotIn("<svg", html)
        width, height, channels, pixels = png_pixels((self.run_dir / image).read_bytes())
        self.assertGreater(width, 100)
        self.assertGreater(height, 100)
        dark = sum(max(pixels[i:i + 3]) < 150 for i in range(0, len(pixels), channels))
        self.assertGreater(dark, 200)
        svg = next(self.run_dir.glob("diagrams/*.svg")).read_text()
        for label in ("中文开始", "成功?", "发布", "是"):
            self.assertIn(label, svg)
        self.assertNotIn("var(", svg)
        self.cli("upload")
        self.cli("push")
        self.assertEqual(sum(path == "/publish/img" for path, _ in self.requests), 2)
        draft = json.loads(self.requests[-1][1])["content"]
        self.assertTrue(all(e.attrs["src"].startswith("https://mmbiz.qpic.cn/") for e in Document(draft).elements if e.tag == "img"))
        self.assertEqual(self.note.read_text(), source)

    def test_mixed_types_rebuild_stably_and_preserve_code_examples(self):
        charts = [FLOW,
                  "sequenceDiagram\n participant A as 用户\n participant B as 系统\n A->>B: 登录",
                  "mindmap\n root((中心))\n  工作\n  生活",
                  "stateDiagram-v2\n [*] --> Ready\n Ready --> Done",
                  "classDiagram\n class User {\n +String name\n }",
                  "erDiagram\n USER ||--o{ NOTE : writes",
                  'pie\n "完成": 70\n "待办": 30',
                  "gantt\n dateFormat YYYY-MM-DD\n section 发布\n 工作 :2026-01-01, 2d"]
        source = "# 多图\n\n" + "\n\n".join(f"```mermaid\n{chart}\n```" for chart in charts)
        source += "\n\n```text\n保留原样输出\n```\n\n````markdown\n```mermaid\nflowchart TD\n A --> B\n```\n````\n"
        self.note.write_text(source)
        self.cli("build")
        html = (self.run_dir / "article.html").read_text()
        self.assertEqual(len([e for e in Document(html).elements if e.tag == "img"]), len(charts))
        self.assertIn("保留原样输出", Document(html).elements[0].text)
        before = {p.name: p.read_bytes() for p in self.run_dir.glob("diagrams/*.png")}
        self.assertEqual(len(before), len(charts))
        self.cli("build")
        after = {p.name: p.read_bytes() for p in self.run_dir.glob("diagrams/*.png")}
        self.assertEqual(before, after)
        for image in after.values():
            width, height, _, _ = png_pixels(image)
            self.assertGreater(width * height, 1000)

    def test_nested_diagrams_and_url_references_keep_their_meaning(self):
        self.note.write_text('---\nwechat:\n  cover: cover.png\n---\n# 引用\n\n> ```mermaid\n> flowchart TD\n>  A[文档] --> B[发布]\n>  click A "https://example.com/docs" "官方文档"\n>  click B "https://example.com/docs" "发布记录"\n> ```\n')
        self.cli("build")
        html = (self.run_dir / "article.html").read_text()
        document = Document(html)
        self.assertEqual(len([e for e in document.elements if e.tag == "img"]), 1)
        self.assertIn("https://example.com/docs", document.elements[0].text)
        self.assertIn("引用链接", document.elements[0].text)
        self.cli("upload")
        self.cli("push")
        published = Document(json.loads(self.requests[-1][1])["content"]).elements[0].text
        self.assertIn("文档：官方文档", published)
        self.assertIn("发布：发布记录", published)
        self.assertEqual(published.count("https://example.com/docs"), 1)

    def test_unsupported_or_broken_diagrams_fail_before_upload(self):
        bad = {
            "syntax": "flowchart TD\n A[broken",
            "image": 'flowchart TD\n A@{ img: "https://example.com/private.png", label: "外图" }',
            "icon": 'flowchart TD\n A@{ icon: "fa:fa-user", label: "用户" }',
            "math": 'flowchart TD\n A["$$x^2$$"] --> B[完成]',
            "glyph": 'flowchart TD\n A[🦄] --> B[完成]',
            "limit": 'flowchart TD\n A[' + '中' * 50001 + ']',
        }
        for reason, chart in bad.items():
            with self.subTest(reason=reason):
                self.note.write_text(f"# 失败检查\n\n```mermaid\n{FLOW}\n```\n\n```mermaid\n{chart}\n```\n")
                result = self.cli("build", success=False)
                self.assertIn("diagram 2", result.stderr)
                self.assertIn("line", result.stderr)
                self.cli("upload", success=False)
                self.cli("push", success=False)
        self.assertEqual(self.requests, [])

    def test_adapted_article_keeps_code_and_references_through_draft_submission(self):
        fixtures = Path(__file__).parent / "fixtures"
        original = (fixtures / "diagram-note.source.md").read_text()
        source_note = self.directory / "original.md"
        source_note.write_text(original)
        self.note.write_text((fixtures / "diagram-note.adapted.md").read_text())
        self.cli("build")
        svg = "\n".join(p.read_text() for p in self.run_dir.glob("diagrams/*.svg"))
        for label in ("输入笔记", "校验内容", "预览确认", "推入草稿箱", "笔记工作", "写作", "记录", "整理", "发布", "预览", "确认"):
            self.assertIn(label, svg)
        self.cli("upload")
        self.cli("push")
        html = json.loads(self.requests[-1][1])["content"]
        text = Document(html).elements[0].text.replace("\u00a0", " ")
        self.assertIn('const status = "ready";', text)
        self.assertIn("INFO awaiting human confirmation", text)
        self.assertIn("https://example.com/publishing", text)
        self.assertNotIn("[[检查清单]]", text)
        self.assertEqual(len([e for e in Document(html).elements if e.tag == "img"]), 3)
        self.assertEqual(source_note.read_text(), original)

    def test_local_preview_serves_the_generated_png(self):
        self.note.write_text(f"# 本地预览\n\n```mermaid\n{FLOW}\n```\n")
        self.cli("build")
        image = next(self.run_dir.glob("diagrams/*.png"))
        with socket.socket() as listener:
            listener.bind(("127.0.0.1", 0))
            port = listener.getsockname()[1]
        commands = self.directory / "commands"
        commands.mkdir()
        for command in ("open", "xdg-open"):
            opener = commands / command
            opener.write_text("#!/bin/sh\nexit 0\n")
            opener.chmod(0o755)
        process = subprocess.Popen([shutil.which("node"), str(test_artifacts.ROOT / "scripts/wxpush.mts"),
                                    "preview", str(self.note), "--port", str(port)],
                                   env={**self.env, "PATH": f"{commands}{os.pathsep}{os.environ['PATH']}"},
                                   stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        try:
            self.assertTrue(select.select([process.stdout], [], [], 15)[0], "preview did not start")
            self.assertIn("preview:", process.stdout.readline())
            with urllib.request.urlopen(f"http://127.0.0.1:{port}/", timeout=10) as response:
                self.assertEqual(response.read().decode(), (self.run_dir / "article.html").read_text())
            with urllib.request.urlopen(f"http://127.0.0.1:{port}/diagrams/{image.name}", timeout=10) as response:
                self.assertEqual(response.read(), image.read_bytes())
        finally:
            process.terminate()
            process.wait(timeout=10)
            process.stdout.close()
            process.stderr.close()

    def test_installed_skill_renders_offline_without_packages_or_system_fonts(self):
        installed = self.directory / "installed"
        root = test_artifacts.ROOT
        shutil.copytree(root / "scripts", installed / "scripts")
        (installed / "engine").mkdir()
        for name in ("engine.mjs", "diagrams.bundle.mjs"):
            shutil.copy2(root / "engine" / name, installed / "engine" / name)
        shutil.copytree(root / "engine/diagram-assets", installed / "engine/diagram-assets")
        self.cli_path = installed / "scripts/wxpush.mts"
        guard = self.directory / "no-network.cjs"
        guard.write_text("globalThis.fetch = () => { throw Error('network forbidden during build'); };\n")
        self.env["NODE_OPTIONS"] = f"--require={guard}"
        self.note.write_text(f"# 离线图表\n\n```mermaid\n{FLOW}\n```\n")
        self.cli("build")
        image = next(self.run_dir.glob("diagrams/*.png"))
        self.assertGreater(png_pixels(image.read_bytes())[0], 100)
        font = installed / "engine/diagram-assets/NotoSansCJKsc-Regular.otf"
        font.write_bytes(b"corrupt font")
        result = self.cli("build", success=False)
        self.assertIn("corrupt diagram asset", result.stderr)
        self.cli("upload", success=False)
        self.assertEqual(self.requests, [])
