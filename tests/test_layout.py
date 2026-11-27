"""Layout integrity: paths referenced by CI/compose/docs must exist.

Guards against directory renames that grep misses (e.g. `server/` -> `wxmp-server/`
broke the workflow, Dockerfile context and docs links). If this test fails,
a referenced path no longer exists — fix the reference, not the test.

Run as part of `npm test` (test:layout). No third-party deps.
"""
from __future__ import annotations

import hashlib
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class LayoutIntegrityTests(unittest.TestCase):
    def test_installable_wxmp_skills_ship_the_same_raster_runtime(self):
        diagram = ROOT / "skills/publish-to-wxmp/engine/diagram-assets"
        cover = ROOT / "skills/wxmp-cover/vendor"
        source = ROOT / "tools/wxmp-graphics/rasterize.mjs"
        for name in ("rasterize.mjs", "resvg.mjs", "resvg.wasm"):
            with self.subTest(name=name):
                copies = [diagram / name, cover / name]
                if name == source.name:
                    copies.append(source)
                for asset in copies:
                    self.assertTrue(asset.is_file() and not asset.is_symlink(), f"missing standalone file: {asset}")
                digests = {hashlib.sha256(asset.read_bytes()).hexdigest() for asset in copies}
                self.assertEqual(len(digests), 1, "raster runtime differs; run npm run build:wxmp-graphics")

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

    def test_publish_to_skills_ship_and_reference_shared_rules(self):
        source = ROOT / "docs/publish-to-rules.md"
        self.assertTrue(source.is_file() and not source.is_symlink(), f"missing shared rules doc: {source}")
        source_digest = hashlib.sha256(source.read_bytes()).hexdigest()

        source_text = source.read_text(encoding="utf-8")
        source_headings = {
            re.sub(r"\s+", "-", m.group(1).strip().lower())
            for m in re.finditer(r"^#{1,6}\s+(.+)$", source_text, re.MULTILINE)
        }

        publish_skills = sorted(p for p in (ROOT / "skills").glob("publish-to-*") if p.is_dir())
        self.assertTrue(publish_skills, "sanity: no publish-to-* skills found")

        for skill_dir in publish_skills:
            with self.subTest(skill=skill_dir.name):
                bundled = skill_dir / "PUBLISH-RULES.md"
                self.assertTrue(bundled.is_file() and not bundled.is_symlink(), f"missing standalone file: {bundled}")
                self.assertEqual(
                    hashlib.sha256(bundled.read_bytes()).hexdigest(),
                    source_digest,
                    f"{bundled.relative_to(ROOT)} drifted from docs/publish-to-rules.md",
                )
                skill_md = (skill_dir / "SKILL.md").read_text(encoding="utf-8")
                self.assertIn("PUBLISH-RULES.md", skill_md, f"{skill_dir.name}/SKILL.md must reference PUBLISH-RULES.md")
                frontmatter = re.match(r"^---\n(.*?)\n---\n", skill_md, re.DOTALL)
                self.assertIsNotNone(frontmatter, f"{skill_dir.name}/SKILL.md missing YAML frontmatter")
                self.assertRegex(
                    frontmatter.group(1),
                    r"(?m)^disable-model-invocation:\s*true\s*$",
                    f"{skill_dir.name}/SKILL.md must set disable-model-invocation: true",
                )
                for anchor in re.findall(r"\]\(PUBLISH-RULES\.md#([^)]+)\)", skill_md):
                    self.assertIn(
                        anchor.lower(),
                        source_headings,
                        f"{skill_dir.name}/SKILL.md links to missing PUBLISH-RULES.md anchor: #{anchor}",
                    )
                self.assertFalse((skill_dir / "REDACTION.md").exists(), f"stale REDACTION.md in {skill_dir.name}")

        self.assertFalse((ROOT / "docs/publication-redaction.md").exists(), "stale docs/publication-redaction.md")

    def test_docs_markdown_links_resolve(self):
        """Relative markdown links in AGENTS/README/docs/skills point at real files."""
        docs = [
            ROOT / "AGENTS.md",
            ROOT / "README.md",
            *sorted((ROOT / "docs").glob("*.md")),
            *sorted((ROOT / "skills").glob("*/README.md")),
            *sorted((ROOT / "skills").glob("*/SKILL.md")),
        ]
        for doc in docs:
            text = doc.read_text(encoding="utf-8")
            for target in re.findall(r"\]\(([^)#?]+?\.md)(?:#[^)]*)?\)", text):
                if target.startswith(("http", "~", "/")):
                    continue
                self.assertTrue((doc.parent / target).resolve().exists(),
                                f"{doc.relative_to(ROOT)} links to missing file: {target}")

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
