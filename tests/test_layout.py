"""Layout integrity: paths referenced by CI/compose/docs must exist.

Guards against directory renames that grep misses (e.g. `server/` -> `wxmp-server/`
broke the workflow, Dockerfile context and docs links). If this test fails,
a referenced path no longer exists — fix the reference, not the test.

Run as part of `npm test` (test:layout). No third-party deps.
"""
from __future__ import annotations

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class LayoutIntegrityTests(unittest.TestCase):
    def test_workflow_path_references_exist(self):
        """Every bare `dir/` token or `context:`/`discover -s` value in the workflow exists."""
        text = (ROOT / ".github" / "workflows" / "docker.yml").read_text(encoding="utf-8")
        refs = re.findall(r"context:\s*(\S+)", text)
        refs += re.findall(r"discover -s (\S+)", text)
        refs += re.findall(r"workdir:\s*(\S+)", text)
        refs += re.findall(r"paths: \[([^\]]+)\]", text)
        path_filters = [p.strip().strip('"') for group in refs if "," in group for p in group.split(",")] \
            if any("," in r for r in refs) else []
        refs = [r for r in refs if "," not in r]
        for pf in path_filters:
            refs.append(re.sub(r"/\*\*$|/\*\*", "", pf))
        for ref in refs:
            self.assertTrue((ROOT / ref).exists(), f"workflow references missing path: {ref}")

    def test_compose_build_context_exists(self):
        compose = (ROOT / "wxmp-server" / "docker-compose.yml").read_text(encoding="utf-8")
        for ref in re.findall(r"build:\s*(\S+)", compose):
            self.assertTrue((ROOT / "wxmp-server" / ref).exists(),
                            f"compose build context missing: {ref}")

    def test_docs_markdown_links_resolve(self):
        """Relative markdown links in README/docs/skill READMEs point at real files."""
        docs = [ROOT / "README.md", *sorted((ROOT / "docs").glob("*.md")),
                *sorted((ROOT / "skills").glob("*/README.md"))]
        for doc in docs:
            text = doc.read_text(encoding="utf-8")
            for target in re.findall(r"\]\(([^)#?]+?\.md)\)", text):
                if target.startswith(("http", "~", "/")):
                    continue
                self.assertTrue((doc.parent / target).resolve().exists(),
                                f"{doc.name} links to missing file: {target}")

    def test_workflow_image_name_is_fully_qualified(self):
        text = (ROOT / ".github" / "workflows" / "docker.yml").read_text(encoding="utf-8")
        m = re.search(r"IMAGE:\s*(\S+)", text)
        self.assertIsNotNone(m, "IMAGE env not found in workflow")
        self.assertRegex(m.group(1), r"^[\w.-]+/[\w.-]+$",
                         "image name must be owner/name (bare name gets ghcr.io/<name> -> 400)")

    def test_workflow_runs_the_local_test_command(self):
        """CI must not duplicate test invocation; it runs npm run test:server."""
        text = (ROOT / ".github" / "workflows" / "docker.yml").read_text(encoding="utf-8")
        self.assertIn("npm run test:server", text,
                      "workflow should run `npm run test:server`, not a hand-rolled unittest command")
        self.assertNotIn("unittest discover -s wxmp-server", text)

    def test_compose_image_matches_workflow(self):
        compose = (ROOT / "wxmp-server" / "docker-compose.yml").read_text(encoding="utf-8")
        workflow = (ROOT / ".github" / "workflows" / "docker.yml").read_text(encoding="utf-8")
        compose_image = re.search(r"image:\s*(\S+)", compose).group(1).rsplit(":", 1)[0]
        workflow_image = re.search(r"IMAGE:\s*(\S+)", workflow).group(1)
        self.assertEqual(compose_image, f"ghcr.io/{workflow_image}",
                         "deploy image and CI image drifted apart")

    def test_npm_test_covers_all_python_test_dirs(self):
        """Every directory containing python tests is reachable from npm test —
        either named in a script or delegated to via a runner script (no CI-only suites,
        which is how the server rename slipped through)."""
        pkg = (ROOT / "package.json").read_text(encoding="utf-8")
        # collect every "discover -s <dir>" target across npm scripts and runner scripts
        wired = set(re.findall(r"discover -s ([\w./-]+)", pkg))
        runners = [p for p in ROOT.glob("**/run-tests.sh") if "node_modules" not in p.parts]
        for r in runners:
            for d in re.findall(r"discover -s \"?\$?\{?DIR\}?/([\w./-]+)", r.read_text(encoding="utf-8")):
                wired.add((r.parent / d).relative_to(ROOT).as_posix())
            wired.update(re.findall(r"discover -s ([\w./-]+)", r.read_text(encoding="utf-8")))
        test_dirs = {p.parent.relative_to(ROOT).as_posix()
                     for p in ROOT.glob("**/test_*.py") if "node_modules" not in p.parts and ".venv" not in p.parts}
        self.assertTrue(test_dirs, "sanity: no python tests found")
        for d in sorted(test_dirs):
            self.assertIn(d, wired, f"test dir '{d}' is not run by any npm script or runner")


if __name__ == "__main__":
    unittest.main()
