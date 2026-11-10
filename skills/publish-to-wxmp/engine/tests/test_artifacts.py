"""Build/upload/push contract through the real CLI and a local HTTP adapter."""
import json
import os
import subprocess
import tempfile
import threading
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

from test_rendering import Document, ROOT


class CLIEnvironment(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="wxmp-artifacts-")
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name)
        self.note = self.directory / "note.md"
        self.note.write_text("# 发布测试\n\n![配图](cover.png)\n\n```text\ncover.png 是日志中的路径\n```\n", encoding="utf-8")
        (self.directory / "cover.png").write_bytes(b"cover-bytes")
        self.requests = []
        requests = self.requests

        class API(BaseHTTPRequestHandler):
            def do_PUT(self):
                data = self.rfile.read(int(self.headers["Content-Length"]))
                requests.append((self.path, data))
                response = {"url": "https://mmbiz.qpic.cn/image.png?x=1&y=2"} if self.path == "/publish/img" else {"media_id": "draft-test"}
                body = json.dumps(response).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def log_message(self, *_):
                pass

        self.api = HTTPServer(("127.0.0.1", 0), API)
        self.worker = threading.Thread(target=self.api.serve_forever, daemon=True)
        self.worker.start()
        self.addCleanup(self.close_api)
        self.env = {**os.environ, "WXMP_API_BASE": f"http://127.0.0.1:{self.api.server_port}",
                    "WXMP_STATE_DIR": str(self.directory / "state"),
                    "HOME": str(self.directory)}

    def close_api(self):
        self.api.shutdown()
        self.api.server_close()
        self.worker.join(timeout=5)

    def cli(self, command, note=None, *args, success=True):
        result = subprocess.run(["node", str(getattr(self, "cli_path", ROOT / "scripts/wxpush.mts")), command,
                                 str(note or self.note), *args], env=self.env,
                                capture_output=True, text=True, timeout=30)
        if success:
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        else:
            self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
        return result

    @property
    def run_dir(self):
        return (self.directory / "state/output/latest").resolve()


class ArtifactTests(CLIEnvironment):
    def test_explicit_output_upload_and_push_use_the_built_article(self):
        out = self.directory / "explicit"
        self.cli("build", self.note, "--out", str(out))
        self.cli("upload")
        self.cli("upload")
        self.cli("push")
        self.assertEqual([path for path, _ in self.requests], ["/publish/img", "/publish"])
        html = (out / "article.html").read_text()
        self.assertEqual(Document(html).first("img").attrs["src"], "https://mmbiz.qpic.cn/image.png?x=1&y=2")
        self.assertEqual(json.loads(self.requests[-1][1])["content"], html)
        self.assertIn("![配图](cover.png)", self.note.read_text())
        self.assertIn("cover.png 是日志中的路径", (out / "article.md").read_text())

    def test_upload_preserves_image_captions_and_encoded_html_urls(self):
        self.note.write_text('# 标题\n\n![cover.png](cover.png)\n\n<img alt="其他" src="image&#38;name.png">\n')
        (self.directory / "image&name.png").write_bytes(b"other-image")
        self.cli("build")
        self.cli("upload")
        markdown = (self.run_dir / "article.md").read_text()
        self.assertIn("![cover.png](https://", markdown)
        html = (self.run_dir / "article.html").read_text()
        self.assertTrue(all(e.attrs["src"].startswith("https://") for e in Document(html).elements if e.tag == "img"))

    def test_explicit_latest_alias_resolves_to_the_real_output_directory(self):
        self.cli("build")
        previous = self.run_dir
        latest = self.directory / "state/output/latest"
        self.cli("build", self.note, "--out", str(latest))
        self.assertEqual(latest.resolve(), previous)
        self.cli("upload")
        self.assertEqual(len(self.requests), 1)

    def test_output_directory_cannot_overwrite_the_source_article(self):
        note = self.directory / "article.md"
        original = "---\ncustom: keep\n---\n# 原笔记\n"
        note.write_text(original)
        self.cli("build", note, "--out", str(self.directory), success=False)
        self.assertEqual(note.read_text(), original)

    def test_wrong_note_and_changed_input_are_rejected_before_network(self):
        self.cli("build")
        other = self.directory / "other.md"
        other.write_text(self.note.read_text())
        for command in ("upload", "push", "preview"):
            with self.subTest(command=command):
                result = self.cli(command, other, success=False)
                self.assertIn("another note", result.stderr)
        self.note.write_text(self.note.read_text() + "\nchanged\n")
        for command in ("upload", "push", "preview"):
            result = self.cli(command, success=False)
            self.assertIn("build", result.stderr)
        self.assertEqual(self.requests, [])


if __name__ == "__main__":
    unittest.main()
