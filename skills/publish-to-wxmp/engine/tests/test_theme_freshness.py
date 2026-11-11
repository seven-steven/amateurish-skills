"""Theme freshness through the installed wxpush CLI and local HTTP boundary."""
import json
import os
import socket
import subprocess
import time
import urllib.error
import urllib.request

import test_artifacts
from test_diagrams import FLOW, png_pixels


class ThemeFreshnessTests(test_artifacts.CLIEnvironment):
    def setUp(self):
        super().setUp()
        self.note.write_text(self.note.read_text() + "\n## 主题标题\n")
        # Even a regressed preview must never open the development host's browser.
        bin_dir = self.directory / "bin"
        bin_dir.mkdir()
        for name in ("open", "xdg-open"):
            opener = bin_dir / name
            opener.write_text("#!/bin/sh\nexit 0\n")
            opener.chmod(0o755)
        self.env["PATH"] = str(bin_dir) + os.pathsep + self.env["PATH"]
        self.install_skill()
        self.theme = self.installed / "themes/selected.yaml"
        self.theme.write_text('base_theme: geek-black\nblock:\n  h2:\n    color: "#123456"\n')
        config = self.directory / ".config/skills/publish-to-wxmp/config.json"
        config.parent.mkdir(parents=True)
        config.write_text(json.dumps({"theme": "default"}))

    def build_selected(self, *args):
        self.cli("build", self.note, "--theme", "selected", *args)

    def assert_consumers_reject(self, *args):
        before = list(self.requests)
        for command, flags in (("preview", ("--port", "0")), ("upload", ()),
                               ("push", ()), ("push", ("--update", "--media-id", "draft-test"))):
            with self.subTest(command=command, flags=flags, out=args):
                result = self.cli(command, self.note, *args, *flags, success=False)
                self.assertIn("theme", result.stderr.lower())
                self.assertIn("build", result.stderr.lower())
                self.assertNotIn("preview:", result.stdout)
        self.assertEqual(self.requests, before, "no image, cover or draft requests before rebuild")

    def test_body_theme_change_blocks_all_consumers_for_latest_and_explicit_output(self):
        out = self.directory / "explicit"
        self.build_selected("--out", str(out))
        self.cli("upload")
        self.cli("push")
        self.requests.clear()
        self.theme.write_text(self.theme.read_text().replace("#123456", "#654321"))
        self.assert_consumers_reject()
        self.assert_consumers_reject("--out", str(out))
        self.assertEqual(self.requests, [])
        self.build_selected("--out", str(out))
        self.cli("upload", self.note, "--out", str(out))
        self.cli("push", self.note, "--out", str(out))
        self.cli("push", self.note, "--out", str(out), "--update")
        self.assertEqual([path for path, _ in self.requests], ["/publish", "/publish/update"])
        self.assertIn("#654321", (out / "article.html").read_text())

    def test_deleted_or_invalid_selected_theme_requires_rebuild_before_consumption(self):
        original = self.theme.read_text()
        for invalid in (None, 'pele:\n  foreground: "red"\n', 'pele: [oops]\n',
                        'base_theme: missing\n', 'this is not YAML\n',
                        'pele:\n  foreground: "#123456\n'):
            with self.subTest(theme=invalid):
                self.theme.write_text(original)
                self.build_selected()
                self.cli("upload")
                self.requests.clear()
                if invalid is None:
                    self.theme.unlink()
                else:
                    self.theme.write_text(invalid)
                self.assert_consumers_reject()
        self.theme.write_text(original)
        self.build_selected()
        self.cli("upload")
        self.cli("push")
        self.assertEqual([path for path, _ in self.requests], ["/publish"])

    def test_palette_change_blocks_image_upload_and_rebuild_restores_full_flow(self):
        self.note.write_text(self.note.read_text() + f"\n```mermaid\n{FLOW}\n```\n")
        original = self.theme.read_text()
        self.theme.write_text(original + 'pele:\n  surface: "#123456"\n')
        self.build_selected()
        old_image = next(self.run_dir.glob("diagrams/*.png")).read_bytes()
        self.theme.write_text(original + 'pele:\n  surface: "#654321"\n')
        self.assert_consumers_reject()
        self.assertEqual(self.requests, [])
        self.build_selected()
        new_image = next(self.run_dir.glob("diagrams/*.png")).read_bytes()
        self.assertNotEqual(old_image, new_image)
        width, height, channels, pixels = png_pixels(new_image)
        self.assertGreater(width * height, 1000)
        self.assertIn(bytes.fromhex("654321"), pixels)
        self.cli("upload")
        self.cli("push")
        self.cli("push", self.note, "--update")
        self.assertEqual([path for path, _ in self.requests],
                         ["/publish/img", "/publish/img", "/publish", "/publish/update"])
        for _, data in self.requests[-2:]:
            self.assertEqual(json.loads(data)["content"], (self.run_dir / "article.html").read_text())
            self.assertTrue(json.loads(data)["cover_base64"].startswith("data:image/png;base64,"))

    def test_full_effective_theme_includes_base_inline_and_render_options(self):
        original = self.theme.read_text()
        changes = ('base:\n  color: "#123456"\n', 'inline:\n  codespan:\n    color: "#123456"\n',
                   'renderOptions:\n  isMacCodeBlock: true\n',
                   'renderOptions:\n  isShowLineNumber: false\n')
        for change in changes:
            with self.subTest(change=change):
                self.theme.write_text(original)
                self.build_selected()
                self.theme.write_text(original + change)
                self.assert_consumers_reject()

    def test_mtime_order_comments_and_unrelated_themes_do_not_invalidate_selected_config(self):
        self.build_selected()
        os.utime(self.theme, (1767225600, 1767225600))
        self.cli("upload")
        self.theme.write_text('block:\n  h2:\n    color: "#123456"\n# Same effective configuration\nbase_theme: geek-black\n'
                              'renderOptions:\n  isMacCodeBlock: false\n  isShowLineNumber: true\npele: {}\n')
        unrelated = self.installed / "themes/unrelated.yaml"
        unrelated.write_text('pele: invalid\n')
        config = self.directory / ".config/skills/publish-to-wxmp/config.json"
        config.write_text(json.dumps({"theme": "unrelated"}))
        self.cli("upload")
        self.cli("push")
        self.cli("push", self.note, "--update")
        self.assertEqual([path for path, _ in self.requests], ["/publish/img", "/publish", "/publish/update"])

    def test_global_selection_is_recorded_and_not_replaced_by_later_default(self):
        config = self.directory / ".config/skills/publish-to-wxmp/config.json"
        config.write_text(json.dumps({"theme": "selected"}))
        self.cli("build")
        config.write_text(json.dumps({"theme": "default"}))
        self.cli("upload")
        self.theme.write_text(self.theme.read_text().replace("#123456", "#654321"))
        self.assert_consumers_reject()

    def test_missing_or_malformed_theme_metadata_requires_rebuild(self):
        self.cli("build")
        self.cli("upload")
        self.requests.clear()
        record_path = self.run_dir / "build.json"
        original = json.loads(record_path.read_text())
        for metadata in (None, {}, {"name": "default"}, {"name": 7, "fingerprint": "bad"},
                         {"name": "default", "fingerprint": "bad"}):
            with self.subTest(metadata=metadata):
                legacy = dict(original)
                if metadata is None:
                    legacy.pop("theme")
                else:
                    legacy["theme"] = metadata
                record_path.write_text(json.dumps(legacy))
                self.assert_consumers_reject()
                self.assert_consumers_reject("--out", str(self.run_dir))
        self.cli("build")
        self.cli("upload")
        self.cli("push")
        self.assertEqual([path for path, _ in self.requests], ["/publish"])

    def test_rebuilt_theme_can_be_previewed_without_opening_a_browser(self):
        self.build_selected()
        self.theme.write_text(self.theme.read_text().replace("#123456", "#654321"))
        self.build_selected()
        with socket.socket() as listener:
            listener.bind(("127.0.0.1", 0))
            port = listener.getsockname()[1]
        process = subprocess.Popen(["node", str(self.cli_path), "preview", str(self.note), "--port", str(port)],
                                   env=self.env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        try:
            deadline = time.monotonic() + 10
            while True:
                try:
                    with urllib.request.urlopen(f"http://127.0.0.1:{port}/", timeout=1) as response:
                        html = response.read().decode()
                    break
                except urllib.error.URLError:
                    if process.poll() is not None or time.monotonic() >= deadline:
                        self.fail("rebuilt preview did not start")
                    time.sleep(0.05)
            self.assertEqual(html, (self.run_dir / "article.html").read_text())
            self.assertIn("#654321", html)
        finally:
            process.terminate()
            stdout, stderr = process.communicate(timeout=5)
        self.assertIn("preview:", stdout, stderr)
        self.assertEqual(self.requests, [])

    def test_failed_theme_rebuild_cannot_fall_back_to_previous_success(self):
        self.build_selected()
        self.cli("upload")
        self.requests.clear()
        self.theme.write_text('pele:\n  foreground: "red"\n')
        result = self.cli("build", self.note, "--theme", "selected", success=False)
        self.assertIn("pele.foreground", result.stderr)
        for command in ("upload", "push", "preview"):
            result = self.cli(command, success=False)
            self.assertIn("did not complete", result.stderr)
        self.assertEqual(self.requests, [])
