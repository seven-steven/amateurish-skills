"""Configuration contract through an installed CLI with an isolated home."""
import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

from test_rendering import ROOT


class ConfigTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="wxmp-config-")
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name)
        self.home = self.directory / "home"
        self.home.mkdir()
        self.config = self.home / ".config/skills/publish-to-wxmp/config.json"
        self.project = self.directory / "skill"
        shutil.copytree(ROOT / "scripts", self.project / "scripts")
        for name in ("engine", "themes"):
            (self.project / name).symlink_to(ROOT / name, target_is_directory=True)
        self.note = self.directory / "note.md"
        self.note.write_text("# 配置测试\n\n正文。\n", encoding="utf-8")
        self.env = {key: value for key, value in os.environ.items()
                    if key not in {"WXMP_CONFIG_DIR", "WXMP_STATE_DIR", "WXMP_API_BASE",
                                   "WXMP_API_TOKEN", "XDG_CONFIG_HOME"}}
        self.env["HOME"] = str(self.home)

    def write_file(self, path, content):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return path

    def cli(self, command, *args):
        return subprocess.run(
            ["node", str(self.project / "scripts/wxpush.mts"), command, *map(str, args)],
            cwd=self.directory, env=self.env, capture_output=True, text=True, timeout=15,
        )

    def test_build_reads_only_the_fixed_skill_config_despite_path_env(self):
        self.write_file(self.config, '{"theme": "geek-black"}')
        override = self.write_file(self.directory / "override.json", '{"theme": "simple"}')
        xdg = self.directory / "xdg"
        self.write_file(xdg / "skills/publish-to-wxmp/config.json", '{"theme": "grace"}')
        self.env.update(WXMP_CONFIG_DIR=str(override), XDG_CONFIG_HOME=str(xdg))

        result = self.cli("build", self.note)

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("(theme: geek-black)", result.stdout)

    def test_legacy_config_is_ignored_while_runtime_state_still_migrates(self):
        legacy = self.project / ".bin"
        self.write_file(legacy / "config.json", '{"theme": "geek-black"}')
        state_files = {
            "image-cache.json": '{"hash": "https://example.invalid/image.png"}',
            "drafts.json": '{"/old/note.md": "draft-id"}',
            "output/previous/article.html": "<p>previous build</p>",
        }
        for name, content in state_files.items():
            self.write_file(legacy / name, content)

        result = self.cli("build", self.note)

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("(theme: default)", result.stdout)
        self.assertFalse(self.config.parent.exists(), "CLI must not initialize or migrate config")
        self.assertEqual((legacy / "config.json").read_text(), '{"theme": "geek-black"}')
        for name, content in state_files.items():
            self.assertEqual((self.home / ".local/state/wxmp-publisher" / name).read_text(), content)
            self.assertEqual((legacy / name).read_text(), content)

    def test_invalid_config_reports_its_path_without_falling_back_or_building(self):
        self.write_file(self.config, '{"theme":')
        self.write_file(self.home / ".config/wxmp-publisher/config.json", '{"theme": "simple"}')
        self.write_file(self.project / ".bin/config.json", '{"theme": "grace"}')
        for command, args in (("build", (self.note,)), ("doctor", ())):
            with self.subTest(command=command):
                result = self.cli(command, *args)
                self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
                self.assertIn(str(self.config), result.stderr)
                self.assertIn("JSON", result.stderr)
        self.assertEqual(self.config.read_text(), '{"theme":')
        self.assertFalse((self.home / ".local/state/wxmp-publisher/output").exists())

    def test_missing_api_base_points_to_the_fixed_config_path(self):
        self.note.write_text("# 图片\n\n![封面](cover.png)\n", encoding="utf-8")
        (self.directory / "cover.png").write_bytes(b"test-image")
        build = self.cli("build", self.note)
        self.assertEqual(build.returncode, 0, build.stdout + build.stderr)
        for command, args in (("doctor", ()), ("upload", (self.note,))):
            with self.subTest(command=command):
                result = self.cli(command, *args)
                self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
                self.assertIn(str(self.config), result.stdout + result.stderr)
                self.assertIn("WXMP_API_BASE", result.stdout + result.stderr)
        self.assertFalse(self.config.parent.exists())

    def test_missing_config_uses_defaults_not_old_paths_or_env_overrides(self):
        xdg = self.directory / "xdg"
        override = self.directory / "override.json"
        ignored = [self.home / ".config/wxmp-publisher/config.json", override,
                   xdg / "skills/publish-to-wxmp/config.json"]
        for path in ignored:
            self.write_file(path, '{"theme": "not-a-theme"}')
        self.env.update(WXMP_CONFIG_DIR=str(override), XDG_CONFIG_HOME=str(xdg))

        result = self.cli("build", self.note)

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("(theme: default)", result.stdout)
        self.assertFalse(self.config.parent.exists())
        for path in ignored:
            self.assertEqual(path.read_text(), '{"theme": "not-a-theme"}')

    @unittest.skipIf(os.geteuid() == 0, "root bypasses filesystem permission checks")
    def test_unreadable_config_or_parent_reports_path_and_permission_error(self):
        self.write_file(self.config, '{"theme": "geek-black"}')
        for blocked in (self.config, self.config.parent):
            with self.subTest(blocked=blocked.name):
                mode = blocked.stat().st_mode
                try:
                    blocked.chmod(0)
                    result = self.cli("build", self.note)
                finally:
                    blocked.chmod(mode)
                self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
                self.assertIn(str(self.config), result.stderr)
                self.assertIn("EACCES", result.stderr)
        self.assertFalse((self.home / ".local/state/wxmp-publisher/output").exists())
        self.assertEqual(self.config.read_text(), '{"theme": "geek-black"}')


if __name__ == "__main__":
    unittest.main()
