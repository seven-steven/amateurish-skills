"""Regression tests through the real CLI, parsing HTML instead of grepping CSS."""
import os
import shutil
import subprocess
import tempfile
import unittest
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
NOTE = (Path(__file__).parent / "fixtures/geek-black.md").read_text(encoding="utf-8")


class Element:
    def __init__(self, tag, attrs, parent):
        self.tag = tag
        self.attrs = dict(attrs)
        self.parent = parent
        self.children = []
        self.text = ""

    @property
    def style(self):
        return dict(
            (k.strip(), v.strip())
            for part in self.attrs.get("style", "").split(";")
            if ":" in part
            for k, v in [part.split(":", 1)]
        )


class Document(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.elements = []
        self.stack = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        parent = self.stack[-1] if self.stack else None
        element = Element(tag, attrs, parent)
        self.elements.append(element)
        if parent:
            parent.children.append(element)
        if tag not in {"br", "hr", "img", "input", "meta", "link", "wbr"}:
            self.stack.append(element)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if self.stack and self.stack[-1].tag == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        for element in self.stack:
            element.text += data

    def first(self, tag):
        return next(e for e in self.elements if e.tag == tag)


class RenderingTests(unittest.TestCase):
    def build(self, theme, custom_theme=None, note_text=NOTE):
        with tempfile.TemporaryDirectory(prefix="wxmp-render-test-") as directory:
            directory = Path(directory)
            project = ROOT
            if custom_theme is not None:
                # Exercise discovery and base_theme inheritance without writing
                # fixtures into the user's real skill/themes or runtime state.
                project = directory / "project"
                shutil.copytree(ROOT / "scripts", project / "scripts")
                (project / "engine").mkdir()
                for bundle in ("engine.mjs", "diagrams.bundle.mjs"):
                    shutil.copy2(ROOT / "engine" / bundle, project / "engine" / bundle)
                (project / "themes").mkdir()
                (project / f"themes/{theme}.yaml").write_text(custom_theme, encoding="utf-8")
            note = directory / "note.md"
            out = directory / "out"
            note.write_text(note_text, encoding="utf-8")
            result = subprocess.run(
                ["node", str(project / "scripts/wxpush.mts"), "build", str(note),
                 "--theme", theme, "--out", str(out)],
                cwd=project, capture_output=True, text=True, timeout=15,
                env={**os.environ, "WXMP_STATE_DIR": str(directory / "state"),
                     "WXMP_CONFIG_DIR": str(directory / "config.json")},

            )
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            return (out / "article.html").read_text(encoding="utf-8")

    def test_style_attributes_survive_quoted_fonts_in_every_builtin(self):
        for theme in ["default", "grace", "simple", "geek-black"]:
            with self.subTest(theme=theme):
                document = Document(self.build(theme))
                for element in document.elements:
                    if "style" not in element.attrs:
                        continue
                    # A raw quote in font-family used to turn the rest of the CSS
                    # into bogus HTML attributes such as `helvetica` and `15px;`.
                    unexpected = set(element.attrs) - {
                        "style", "class", "data-heading", "href", "title", "alt", "src",
                        "xmlns", "version", "x", "y", "width", "height", "viewbox",
                        "cx", "cy", "rx", "ry", "stroke", "stroke-width", "fill",
                    }
                    self.assertFalse(unexpected, (theme, element.tag, unexpected))
                self.assertIn('"Helvetica Neue"', document.first("h2").style["font-family"])
                self.assertIn("font-size", document.first("h2").style)
                bold = next(e for e in document.elements if e.tag == "strong" and e.text == "重点")
                self.assertEqual(bold.style["color"], "inherit")

    def test_built_styles_do_not_trigger_wechat_custom_property_filter(self):
        # A real draft/get capture reduced the loss of heading/paragraph styles
        # to `--md-primary-color: #000000; font-size: 1.2em`. WeChat discards
        # declarations following the custom property, even though browsers do not.
        for theme in ["default", "grace", "simple", "geek-black"]:
            with self.subTest(theme=theme):
                document = Document(self.build(theme))
                for element in document.elements:
                    self.assertFalse(
                        any(key.startswith("--") for key in element.style),
                        (theme, element.tag, "custom CSS properties cannot be sent to WeChat"),
                    )
                    for value in element.style.values():
                        self.assertNotIn("var(", value, (theme, element.tag, value))
                if theme != "geek-black":
                    self.assertEqual(document.first("h2").style["background"], "#000000")
                    self.assertEqual(document.first("h3").style["border-left"],
                                     "3px solid #000000" if theme == "default" else "4px solid #000000")
                else:
                    numbers = next(e for e in document.elements if e.attrs.get("class") == "line-numbers")
                    self.assertEqual(numbers.style["background"], "transparent")

    def test_variable_materialization_preserves_custom_themes_scopes_and_article_text(self):
        custom_theme = """base_theme: default
base:
  "--accent": "#123456"
  "--md-primary-color": "var(--accent)"
block:
  h2:
    "--accent": "#654321"
  p:
    color: "var(--missing, rgb(12, 34, 56))"
"""
        note = '''## 局部主题变量

### 基础主题变量

正文中的 `var(--accent)` 不应该被替换。

<section style="--local: #abcdef; color: var(--local)">
<span style="color: var(--missing, var(--local)); font-family: &quot;A;B&amp;C&quot;">继承变量</span>
</section>
'''
        document = Document(self.build("variables", custom_theme, note))
        self.assertEqual(document.first("h2").style["background"], "#654321")
        self.assertEqual(document.first("h3").style["border-left"], "3px solid #123456")
        self.assertEqual(document.first("p").style["color"], "rgb(12, 34, 56)")
        self.assertEqual(document.first("code").text, "var(--accent)")
        span = document.first("span")
        self.assertEqual(span.style["color"], "#abcdef")
        self.assertIn('font-family: "A;B&C"', span.attrs["style"])
        self.assertEqual(set(span.attrs), {"style"})

    def test_geek_black_has_two_layer_heading_and_full_width_rail(self):
        document = Document(self.build("geek-black"))
        h2 = document.first("h2")
        self.assertEqual(h2.style["display"], "block")
        self.assertEqual(h2.style["background-color"], "rgb(251, 251, 251)")
        content = next(c for c in h2.children if c.attrs.get("class") == "content")
        self.assertEqual(content.style["background-color"], "rgb(33, 33, 34)")
        self.assertEqual(content.style["color"], "rgb(255, 255, 255)")
        self.assertEqual(content.style["border-bottom-right-radius"], "100px")
        self.assertEqual(content.style["line-height"], "40px")
        self.assertEqual(content.style["margin-left"], "-10px")
        strong = next(c for c in content.children if c.tag == "strong")
        self.assertEqual(strong.style["color"], "inherit")
        for tag in ["h3", "h4"]:
            heading = document.first(tag)
            self.assertEqual(heading.style["display"], "block")
            self.assertEqual(heading.style["border-top"], "1px solid rgb(221, 221, 221)")
            inner = next(c for c in heading.children if c.attrs.get("class") == "content")
            self.assertEqual(inner.style["border-top"], "2px solid rgb(33, 33, 34)")

    def test_geek_black_paragraphs_and_quotes_keep_their_spacing(self):
        document = Document(self.build("geek-black"))
        paragraph = next(e for e in document.elements if e.tag == "p" and e.text.startswith("PARA 由"))
        self.assertEqual(paragraph.style["font-size"], "15px")
        self.assertEqual(paragraph.style["margin-bottom"], "16px")
        self.assertEqual(paragraph.style["line-height"], "1.75em")
        self.assertEqual(paragraph.style["text-align"], "start")
        quote = document.first("blockquote")
        self.assertEqual(quote.style["background"], "#f4f4f4")
        self.assertEqual(quote.style["border-left"], "4px solid rgb(221, 221, 221)")
        self.assertEqual(quote.children[0].style["color"], "rgb(119, 119, 119)")
        self.assertIn("PingFang SC", quote.children[0].style["font-family"])

    def test_saved_output_includes_container_and_references_without_style_tags(self):
        html = self.build("geek-black")
        document = Document(html)
        self.assertEqual(document.elements[0].tag, "section")
        self.assertEqual(document.elements[0].style["padding"], "30px")
        self.assertIn("引用链接", document.elements[0].text)
        self.assertIn("https://example.com", document.elements[0].text)
        self.assertNotIn("<style", html)
        self.assertEqual(document.first("a").style["color"], "rgb(239, 112, 96)")

    def test_custom_theme_keeps_inherited_layout_and_round_trips_quoted_css(self):
        custom_theme = """base_theme: geek-black
block:
  h2_content:
    background-color: "#123456"
    font-family: '"A&B", "<test>", sans-serif'
renderOptions:
  isMacCodeBlock: true
  isShowLineNumber: false
"""
        document = Document(self.build("quoted-font", custom_theme))
        h2 = document.first("h2")
        content = next(c for c in h2.children if c.attrs.get("class") == "content")
        self.assertEqual(content.style["background-color"], "#123456")
        self.assertEqual(content.style["font-family"], '"A&B", "<test>", sans-serif')
        self.assertEqual(content.style["color"], "rgb(255, 255, 255)")
        self.assertEqual(content.style["border-bottom-right-radius"], "100px")
        self.assertEqual(document.elements[0].style["padding"], "30px")
        self.assertEqual(document.first("blockquote").style["background"], "#f4f4f4")
        sign = next(e for e in document.elements if e.attrs.get("class") == "mac-sign")
        self.assertEqual(sign.style["display"], "flex")
        self.assertFalse(any(e.attrs.get("class") == "line-numbers" for e in document.elements))
        self.assertFalse(any(e.tag == "test" for e in document.elements))

    def test_code_layout_does_not_depend_on_css_wechat_discards(self):
        for theme in ["default", "geek-black"]:
            with self.subTest(theme=theme):
                document = Document(self.build(theme))
                pre = document.first("pre")
                self.assertEqual(pre.style["padding"], "0")
                code = next(c for c in pre.children if c.tag == "code")
                self.assertEqual(code.style["display"], "block")
                self.assertEqual(code.style["overflow-x"], "auto")
                # Numbered blocks contain structural indentation around their
                # flex columns, but preserve code whitespace in the inner div.
                self.assertEqual(code.style["white-space"], "normal" if theme == "geek-black" else "pre")
                sign = next(c for c in pre.children if c.attrs.get("class") == "mac-sign")
                self.assertEqual(sign.style["display"], "none" if theme == "geek-black" else "flex")
                if theme == "geek-black":
                    self.assertEqual(pre.style["background"], "#f8f8f8")
                    self.assertTrue(any(e.attrs.get("class") == "line-numbers" for e in document.elements))


if __name__ == "__main__":
    unittest.main()
