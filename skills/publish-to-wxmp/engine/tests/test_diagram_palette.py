"""Palette contract at the real installed wxpush CLI boundary."""
import hashlib
import json
import os
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

import test_artifacts
from test_diagrams import FLOW, png_pixels
from test_rendering import Document

FIXTURES = Path(__file__).parent / "fixtures"
GANTT = "gantt\n dateFormat YYYY-MM-DD\n section 发布\n 工作 :2026-01-01, 2d"
PIE = "pie\n" + "\n".join(f' "系列{i}": {i}' for i in range(1, 9))
DEFAULT_SERIES = ("#4c78a8", "#f58518", "#54a24b", "#e45756", "#72b7b2", "#eeca3b", "#b279a2", "#9d755d")


class DiagramPaletteTests(test_artifacts.CLIEnvironment):
    def setUp(self):
        super().setUp()
        self.install_skill()
        guard = self.directory / "offline.cjs"
        guard.write_text("globalThis.fetch = () => { throw Error('network forbidden'); };\n")
        self.env["NODE_OPTIONS"] = f"--require={guard}"

    def theme(self, palette=None, extra=""):
        text = "base_theme: geek-black\n" + extra
        if palette:
            text += "pele:\n" + "".join(f'  {key}: "{value}"\n' for key, value in palette.items())
        elif palette is not None:
            text += "pele: {}\n"
        target = self.installed / "themes/palette.yaml"
        target.write_text(text)
        return target

    def build_chart(self, chart=FLOW, theme="palette"):
        self.note.write_text(f"# 配色\n\n```mermaid\n{chart}\n```\n")
        os.utime(self.note, (1767225600, 1767225600))
        self.cli("build", self.note, "--theme", theme)
        svg = next(self.run_dir.glob("diagrams/*.svg"))
        png = svg.with_suffix(".png")
        width, height, channels, pixels = png_pixels(png.read_bytes())
        self.assertGreater(width * height, 1000)
        colors = Counter(tuple(pixels[i:i + 3]) for i in range(0, len(pixels), channels))
        self.assertGreater(len(colors), 10, "real diagram must contain antialiased shapes and text")
        text = svg.read_text()
        for element in ET.fromstring(text).iter():
            self.assertNotRegex(element.get("style", ""), r"(?:^|;)\s*--")
        self.assertNotIn("var(", text)
        self.assertNotIn("--pele-", text)
        return text, colors, png

    def test_example_midnight_is_discoverable_and_builds_coordinated_article_and_dark_diagram(self):
        listing = self.cli("themes")
        self.assertIn("example-midnight\tcustom", listing.stdout)
        svg, colors, png = self.build_chart(theme="example-midnight")
        for color in ("#101820", "#eff4fa", "#69d3c5", "#87b8b2", "#243b45"):
            self.assertIn(color, svg)
            self.assertGreater(colors[tuple(bytes.fromhex(color[1:]))], 10)
        _, _, _, pixels = png_pixels(png.read_bytes())
        self.assertEqual(tuple(pixels[:3]), (16, 24, 32), "example must also color the PNG canvas")
        document = Document((self.run_dir / "article.html").read_text())
        self.assertEqual(document.first("h1").style["border-bottom"], "2px solid #176b64")
        self.assertEqual(json.loads((self.run_dir / "meta.json").read_text())["theme"], "example-midnight")
        self.assertEqual(self.requests, [], "installed example must render offline")

    def test_old_cli_baseline_and_empty_palette_preserve_asset_names_and_bytes(self):
        baseline = json.loads((FIXTURES / "diagram-palette-baseline.json").read_text())
        self.env["TZ"] = baseline["timezone"]
        self.theme({})
        for theme in ("default", "palette"):
            with self.subTest(theme=theme):
                self.note.write_bytes((FIXTURES / "diagram-palette-baseline.md").read_bytes())
                os.utime(self.note, (baseline["referenceTimeMs"] / 1000,) * 2)
                self.cli("build", self.note, "--theme", theme)
                actual = {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                          for p in self.run_dir.glob("diagrams/*")}
                self.assertEqual(actual, baseline["assets"])

    def test_individual_base_and_semantic_colors_preserve_unspecified_defaults(self):
        cases = [
            ("foreground", FLOW, "#f3f3f3"),
            ("line", FLOW, "#f3f3f3"),
            ("border", FLOW, "#f3f3f3"),
            ("surface", FLOW, "#8a8a8a"),
            ("surface_alt", GANTT.replace("工作 :", "工作 :done,"), "#8a8a8a"),
            ("muted", GANTT, "#5b7bd5"),
            ("accent", GANTT, "#6e6e6e"),
            ("critical", GANTT.replace("工作 :", "工作 :crit,"), "#6e6e6e"),
            ("foreground_on_light", "flowchart TD\n A[浅底标签]\n style A fill:#ffffff", "#8a8a8a"),
            ("foreground_on_dark", "flowchart TD\n A[深底标签]\n style A fill:#000000", "#8a8a8a"),
        ]
        for field, chart, retained in cases:
            with self.subTest(field=field):
                self.theme({field: "#d32f87"})
                svg, colors, _ = self.build_chart(chart)
                self.assertIn("#d32f87", svg)
                self.assertGreater(colors[(211, 47, 135)], 5)
                self.assertIn(retained, svg)
        # A short mixed-case opaque color is also accepted and rendered.
        self.theme({"surface": "#aBc"})
        svg, colors, _ = self.build_chart()
        self.assertIn("#aBc", svg)
        self.assertGreater(colors[(170, 187, 204)], 10)

    def test_each_series_slot_is_independent_and_sparse_slots_are_not_renumbered(self):
        for slot in range(1, 9):
            with self.subTest(slot=slot):
                self.theme({f"series_{slot}": "#d32f87"})
                svg, colors, _ = self.build_chart(PIE)
                self.assertIn("#d32f87", svg)
                self.assertGreater(colors[(211, 47, 135)], 10)
                for index, default in enumerate(DEFAULT_SERIES, 1):
                    if index != slot:
                        self.assertIn(default, svg)
                        self.assertGreater(colors[tuple(bytes.fromhex(default[1:]))], 10)
        self.theme({"series_2": "#120034", "series_7": "#ab4598"})
        svg, colors, _ = self.build_chart(PIE)
        for color in ("#120034", "#ab4598", DEFAULT_SERIES[0], DEFAULT_SERIES[7]):
            self.assertIn(color, svg)
            self.assertGreater(colors[tuple(bytes.fromhex(color[1:]))], 10)

    def test_dark_canvas_has_visible_labels_lines_and_background_sensitive_identity(self):
        palette = {"background": "#101820", "foreground": "#eff4fa", "line": "#ebc123",
                   "border": "#bfdfbf", "surface": "#283848"}
        self.theme(palette)
        svg, colors, png = self.build_chart()
        for color in palette.values():
            self.assertIn(color, svg)
            self.assertGreater(colors[tuple(bytes.fromhex(color[1:]))], 10)
        width, height, channels, pixels = png_pixels(png.read_bytes())
        self.assertEqual(tuple(pixels[:3]), (16, 24, 32), "canvas corner must not stay white")
        self.assertGreater(colors[(16, 24, 32)], width * height // 4)
        first = {p.name: p.read_bytes() for p in self.run_dir.glob("diagrams/*")}
        self.build_chart()
        self.assertEqual({p.name: p.read_bytes() for p in self.run_dir.glob("diagrams/*")}, first)

        # This sequence does not paint a background in SVG: only the canvas changes.
        chart = "sequenceDiagram\n participant A as 用户\n participant B as 系统\n A->>B: 登录"
        self.theme({"background": "#101820"})
        svg1, _, image1 = self.build_chart(chart)
        name1, bytes1 = image1.name, image1.read_bytes()
        guard = self.env.pop("NODE_OPTIONS")
        self.cli("upload")
        self.env["NODE_OPTIONS"] = guard
        self.theme({"background": "#203040"})
        svg2, _, image2 = self.build_chart(chart)
        self.assertEqual(svg1, svg2)
        self.assertNotEqual(name1, image2.name)
        self.assertNotEqual(bytes1, image2.read_bytes())
        self.env.pop("NODE_OPTIONS")
        self.cli("upload")
        self.cli("upload")
        self.assertEqual([path for path, _ in self.requests], ["/publish/img", "/publish/img"])
        self.assertNotEqual(self.requests[0][1], self.requests[1][1])

    def test_dark_background_cannot_make_a_blank_diagram_pass_validation(self):
        self.theme({"background": "#101820", "foreground": "#101820", "surface": "#101820", "border": "#101820"})
        self.note.write_text('# 空图\n\n```mermaid\nflowchart TD\n A[" "]\n```\n')
        result = self.cli("build", self.note, "--theme", "palette", success=False)
        self.assertIn("blank diagram", result.stderr)
        self.cli("upload", success=False)
        self.cli("push", success=False)
        self.assertEqual(self.requests, [])

    def test_style_and_classdef_literal_fill_stroke_and_text_override_theme_defaults(self):
        palette = {"surface": "#203040", "border": "#406080", "foreground": "#abcdee",
                   "foreground_on_light": "#807060", "foreground_on_dark": "#edfaff"}
        self.theme(palette)
        for directive in ("style A fill:#de235a,stroke:#12764d,color:#4519ba",
                          "classDef explicit fill:#de235a,stroke:#12764d,color:#4519ba\n class A explicit"):
            with self.subTest(directive=directive):
                svg, colors, _ = self.build_chart("flowchart TD\n A[显式配色] --> B[主题配色]\n " + directive)
                tree = ET.fromstring(svg)
                node = next(element for element in tree.iter() if element.get("data-id") == "A")
                styles = " ".join(str(element.attrib) for element in node.iter())
                for explicit in ("#de235a", "#12764d", "#4519ba"):
                    self.assertIn(explicit, styles)
                    self.assertGreater(colors[tuple(bytes.fromhex(explicit[1:]))], 5)
                for retained in ("#203040", "#406080", "#abcdee"):
                    self.assertIn(retained, svg)
                    self.assertGreater(colors[tuple(bytes.fromhex(retained[1:]))], 5)

    def test_frontmatter_and_init_override_each_series_slot_without_replacing_other_slots(self):
        themed = ("#902010", "#109020", "#201090", "#904010", "#409010", "#104090", "#901040", "#109040")
        for syntax in ("frontmatter", "init"):
            for slot in range(1, 9):
                for theme_colors in (False, True):
                    with self.subTest(syntax=syntax, slot=slot, theme_colors=theme_colors):
                        self.theme({f"series_{i}": color for i, color in enumerate(themed, 1)} if theme_colors else {})
                        variables = {f"pie{slot}": "#d32f87"}
                        if syntax == "frontmatter":
                            prefix = f'---\nconfig:\n  themeVariables:\n    pie{slot}: "#d32f87"\n---\n'
                        else:
                            prefix = "%%{init: " + json.dumps({"themeVariables": variables}) + "}%%\n"
                        svg, colors, _ = self.build_chart(prefix + PIE)
                        for i, inherited in enumerate(themed if theme_colors else DEFAULT_SERIES, 1):
                            expected = "#d32f87" if i == slot else inherited
                            self.assertIn(expected, svg)
                            self.assertGreater(colors[tuple(bytes.fromhex(expected[1:]))], 10)

    def test_unconfigured_and_empty_palettes_preserve_original_sparse_venn_bytes(self):
        # Captured through the unpatched b7ddc85 CLI before the Venn fix.
        baseline = json.loads((FIXTURES / "diagram-venn-baseline.json").read_text())
        self.theme({})
        for theme in ("default", "palette"):
            with self.subTest(theme=theme):
                self.build_chart(baseline["chart"], theme=theme)
                self.assertEqual({p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                                  for p in self.run_dir.glob("diagrams/*")}, baseline["assets"])

    def test_sparse_venn_overrides_preserve_other_theme_and_default_slots(self):
        chart = "venn-beta\n set A: 10\n set B: 10\n set C: 10\n union A,B: 2\n union B,C: 2"
        themed = ("#902010", "#109020", "#201090")
        for syntax in ("frontmatter", "init"):
            for theme_colors in (False, True):
                with self.subTest(syntax=syntax, theme_colors=theme_colors):
                    self.theme({f"series_{i}": color for i, color in enumerate(themed, 1)}
                               if theme_colors else {"accent": "#902010"})
                    if syntax == "frontmatter":
                        prefix = '---\nconfig:\n  themeVariables:\n    venn2: "#d32f87"\n---\n'
                    else:
                        prefix = '%%{init: {"themeVariables": {"venn2": "#d32f87"}}}%%\n'
                    svg, colors, _ = self.build_chart(prefix + chart)
                    sets = [element for element in ET.fromstring(svg).iter()
                            if element.get("class") == "pele-venn-set"]
                    inherited = themed if theme_colors else DEFAULT_SERIES
                    self.assertEqual([element.get("fill") for element in sets],
                                     [inherited[0], "#d32f87", inherited[2]])
                    for color in (inherited[0], "#d32f87", inherited[2]):
                        self.assertGreater(colors[tuple(bytes.fromhex(color[1:]))], 5,
                                           "the configured strokes must reach the decoded PNG")

    def test_global_theme_selection_and_explicit_override_preserve_inherited_render_options(self):
        self.theme({"surface": "#d32f87"}, extra='block:\n  p:\n    letter-spacing: "2px"\n')
        config = self.directory / ".config/skills/publish-to-wxmp/config.json"
        config.parent.mkdir(parents=True)
        config.write_text(json.dumps({"theme": "palette"}))
        self.note.write_text(f'# 选择主题\n\n段落\n\n```text\nline 1\nline 2\n```\n\n```mermaid\n{FLOW}\n```\n')
        self.cli("build")
        svg = next(self.run_dir.glob("diagrams/*.svg")).read_text()
        self.assertIn("#d32f87", svg)
        html = (self.run_dir / "article.html").read_text()
        self.assertIn("letter-spacing:2px", html.replace(" ", ""))
        self.assertIn("30px", Document(html).elements[0].attrs["style"])
        document = Document(html)
        self.assertTrue(any("line-numbers" in element.attrs.get("class", "") for element in document.elements))
        mac = next(element for element in document.elements if element.attrs.get("class") == "mac-sign")
        self.assertIn("display: none", mac.attrs["style"])
        self.cli("build", self.note, "--theme", "default")
        self.assertNotIn("#d32f87", next(self.run_dir.glob("diagrams/*.svg")).read_text())
        self.assertEqual(json.loads((self.run_dir / "meta.json").read_text())["theme"], "default")

    def test_palette_does_not_bypass_hidden_labels_missing_glyphs_or_raster_limits(self):
        self.theme({"background": "#101820", "foreground": "#eff4fa"})
        for chart in (FLOW + "\n style image color:transparent", "flowchart TD\n A[🦄]", "flowchart TD\n A[" + "中" * 3000 + "]"):
            with self.subTest(chart=chart[:100]):
                self.note.write_text(f"# 不可发布\n\n```mermaid\n{chart}\n```\n")
                result = self.cli("build", self.note, "--theme", "palette", success=False)
                self.assertIn("diagram 1", result.stderr)
                self.cli("upload", success=False)
        self.assertEqual(self.requests, [])

    def test_implicit_empty_or_unquoted_top_level_palette_is_rejected_without_side_effects(self):
        for with_chart in (False, True):
            self.note.write_text("# 校验\n" + (f"\n```mermaid\n{FLOW}\n```\n" if with_chart else ""))
            for config in ("pele:", "pele: #123", "pele: #123456", "pele: # an empty comment"):
                with self.subTest(config=config, with_chart=with_chart):
                    target = self.theme()
                    target.write_text("base_theme: geek-black\n" + config + "\n")
                    result = self.cli("build", self.note, "--theme", "palette", success=False)
                    self.assertIn(str(target), result.stderr)
                    self.assertIn("pele", result.stderr)
                    self.cli("upload", success=False)
                    self.cli("push", success=False)
        self.assertEqual(self.requests, [])

    def test_empty_body_sections_keep_legacy_compatibility_with_explicit_empty_palette(self):
        self.theme(extra="base:\nblock:\ninline:\nrenderOptions:\npele: {}\n")
        self.build_chart()
        self.assertEqual(self.requests, [])

    def test_invalid_palette_fails_with_theme_file_and_field_even_without_diagrams(self):
        invalid = [
            ("pele: red", "pele"), ("pele: true", "pele"), ("pele: null", "pele"),
            ("pele: []", "pele"), ("pele:\n  - '#123'", "pele"),
            ("pele:\n  typo: '#123'", "pele.typo"),
            ("pele:\n  __proto__: '#123'", "pele.__proto__"),
            ("pele:\n  series_9: '#123'", "pele.series_9"),
        ]
        for value in ("true", "false", "42", "null", "#123", "'#12gg00'", "'#12'", "'#12345'",
                      "'#1234'", "'#12345678'", "'transparent'", "'red'", "'rgb(1,2,3)'", "'var(--color)'",
                      "'[red, blue]'", "", "\n    nested: '#123'", "\n    - '#123'"):
            invalid.append((f"pele:\n  accent: {value}", "pele.accent"))
        for with_chart in (False, True):
            self.note.write_text("# 校验\n" + (f"\n```mermaid\n{FLOW}\n```\n" if with_chart else ""))
            for config, field in invalid:
                with self.subTest(config=config, with_chart=with_chart):
                    target = self.theme()
                    target.write_text("base_theme: geek-black\n" + config + "\n")
                    result = self.cli("build", self.note, "--theme", "palette", success=False)
                    self.assertIn(str(target), result.stderr)
                    self.assertIn(field, result.stderr)
                    self.cli("upload", success=False)
                    self.cli("push", success=False)
        self.assertEqual(self.requests, [])

    def test_literal_empty_map_and_body_color_do_not_change_old_diagrams(self):
        baseline = json.loads((FIXTURES / "diagram-palette-baseline.json").read_text())
        self.env["TZ"] = baseline["timezone"]
        self.theme(extra='pele: {}\nbase:\n  --md-primary-color: "#FF0055"\n')
        self.note.write_bytes((FIXTURES / "diagram-palette-baseline.md").read_bytes())
        os.utime(self.note, (baseline["referenceTimeMs"] / 1000,) * 2)
        self.cli("build", self.note, "--theme", "palette")
        self.assertEqual({p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                          for p in self.run_dir.glob("diagrams/*")}, baseline["assets"])

    def test_selected_theme_accent_reaches_svg_png_and_inherited_article_styles(self):
        self.theme({"accent": "#d32f87"})
        svg, colors, _ = self.build_chart("gantt\n dateFormat YYYY-MM-DD\n section 发布\n 工作 :2026-01-01, 2d")
        self.assertIn("#d32f87", svg)
        self.assertGreater(colors[(211, 47, 135)], 10)
        html = (self.run_dir / "article.html").read_text()
        self.assertIn("#000000", html)
        self.assertEqual(json.loads((self.run_dir / "meta.json").read_text())["theme"], "palette")
