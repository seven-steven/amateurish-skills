"""The saved build artifact must still support the public image-upload step."""
import json
import os
import shutil
import subprocess
import tempfile
import threading
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

from test_rendering import Document, ROOT


class UploadTests(unittest.TestCase):
    def test_upload_rewrites_image_urls_with_ampersands_without_losing_theme(self):
        cdn = "https://mmbiz.qpic.cn/test.png?wx_fmt=png&from=test"
        requests = []

        class ImageAPI(BaseHTTPRequestHandler):
            def do_PUT(self):
                self.rfile.read(int(self.headers["Content-Length"]))
                requests.append(self.path)
                body = json.dumps({"url": cdn}).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def log_message(self, *_):
                pass

        with tempfile.TemporaryDirectory(prefix="wxmp-upload-test-") as directory:
            project = Path(directory)
            shutil.copytree(ROOT / "scripts", project / "scripts")
            (project / "engine").mkdir()
            for bundle in ("engine.mjs", "diagrams.bundle.mjs"):
                shutil.copy2(ROOT / "engine" / bundle, project / "engine" / bundle)
            note = project / "note.md"
            note.write_text("## 主题标题\n\n![图片](image&name.png)\n", encoding="utf-8")
            (project / "image&name.png").write_bytes(b"test-image")
            api = HTTPServer(("127.0.0.1", 0), ImageAPI)
            worker = threading.Thread(target=api.serve_forever, daemon=True)
            worker.start()
            try:
                env = {**os.environ, "WXMP_API_BASE": f"http://127.0.0.1:{api.server_port}",
                       "WXMP_API_TOKEN": "test-api-token",
                       "WXMP_STATE_DIR": str(project / ".bin"),
                       "WXMP_CONFIG_DIR": str(project / "config.json")}
                cli = ["node", str(project / "scripts/wxpush.mts")]
                for command in ("build", "upload"):
                    result = subprocess.run(cli + [command, str(note)], cwd=project,
                                            env=env, capture_output=True, text=True, timeout=15)
                    self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            finally:
                api.shutdown()
                api.server_close()
                worker.join(timeout=5)
            document = Document((project / ".bin/output/latest/article.html").read_text())
            self.assertEqual(requests, ["/publish/img"])
            self.assertEqual(document.first("img").attrs["src"], cdn)
            self.assertEqual(document.first("h2").style["background"], "#000000")


if __name__ == "__main__":
    unittest.main()
