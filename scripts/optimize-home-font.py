#!/usr/bin/env python3
"""Build/check the homepage's additive critical font; never change fallback CSS.

Requires the existing node_modules/typescript and ephemeral fontTools + Brotli:
  uvx --with brotli==1.2.0 --from fonttools==4.65.0 python scripts/optimize-home-font.py
  uvx --with brotli==1.2.0 --from fonttools==4.65.0 python scripts/optimize-home-font.py --check

The production homepage must be running (default http://127.0.0.1:3100/).
--css-output /tmp/pretendard-home.css emits updated CSS for review/application;
otherwise the checked-in CSS must already match. No HTML/text snapshot is saved.
Changing CMS copy can change output; uncollected characters retain upstream faces.
"""

import argparse
import hashlib
import html
from html.parser import HTMLParser
from io import BytesIO
import json
from pathlib import Path
import subprocess
import urllib.request

from fontTools import subset
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
SOURCE_URL = (
    "https://raw.githubusercontent.com/orioncactus/pretendard/v1.3.9/"
    "packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2"
)
SOURCE_SHA256 = "9599f12fd42fc0bce1cd50b47a0c022e108d7aa64dd0d1bb0ed44f3282d900b4"
OUTPUT = ROOT / "public/fonts/egun-home.woff2"
CSS = ROOT / "app/pretendard-home.css"
LICENSE = ROOT / "public/fonts/egun-home-OFL.txt"
FAMILY = "Egun Home Variable"


class PageText(HTMLParser):
    """Only rendered text/labels, never React flight, scripts, styles or comments."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.excluded = []
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style", "head"}:
            self.excluded.append(tag)
        if not self.excluded:
            self.parts.extend(value for key, value in attrs if value and key in {
                "alt", "title", "placeholder", "aria-label", "data-cursor-hint",
            })

    def handle_endtag(self, tag):
        if self.excluded and tag == self.excluded[-1]:
            self.excluded.pop()

    def handle_data(self, data):
        if not self.excluded:
            self.parts.append(data)


# TypeScript's AST excludes comments and decodes JS string escapes. JSX text is
# always included; Korean string/template literals cover unopened menus, later
# hero slides, modal validation and defaults absent from the server-rendered HTML.
COLLECT_STATIC = r"""
const fs = require('node:fs');
const ts = require('typescript');
const paths = JSON.parse(fs.readFileSync(0, 'utf8'));
const parts = [];
for (const path of paths) {
  const file = ts.createSourceFile(path, fs.readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest, true, path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  if (file.parseDiagnostics.length) throw new Error(`Cannot parse ${path}`);
  function visit(node) {
    if (ts.isJsxText(node)) parts.push(node.text);
    else if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) &&
      /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/u.test(node.text)) parts.push(node.text);
    ts.forEachChild(node, visit);
  }
  visit(file);
}
process.stdout.write(JSON.stringify(parts));
"""


def fetch(url):
    with urllib.request.urlopen(url, timeout=45) as response:
        return response.read()


def collect_codepoints(url):
    parser = PageText()
    parser.feed(fetch(url).decode("utf-8"))
    assert parser.parts, "Homepage has no rendered text"
    paths = sorted(
        path for directory in ("components/layout", "components/main")
        for path in (ROOT / directory).rglob("*") if path.suffix in {".ts", ".tsx"}
    )
    paths += [ROOT / name for name in (
        "components/SlidePopup.tsx", "components/IntroScreen.tsx",
        "data/clinic-info.ts", "lib/board-carousel.ts",
    )]
    result = subprocess.run(
        ["node", "-e", COLLECT_STATIC], cwd=ROOT, check=True, capture_output=True,
        text=True, input=json.dumps([str(path) for path in paths]),
    )
    static_parts = [html.unescape(part) for part in json.loads(result.stdout)]
    # HTML whitespace controls become spaces, not font glyph requests. All other
    # characters are kept; unsupported characters fail rather than silently drop.
    def points(parts):
        return {ord(char) for part in parts for char in part if char not in "\t\r\n\f"}
    rendered = points(parser.parts)
    static = points(static_parts)
    return rendered | static, len(rendered), len(static), len(paths)


def unicode_range(codepoints):
    runs = []
    for point in sorted(codepoints):
        if runs and point == runs[-1][1] + 1:
            runs[-1][1] = point
        else:
            runs.append([point, point])
    return ", ".join(f"U+{lo:X}" if lo == hi else f"U+{lo:X}-{hi:X}" for lo, hi in runs)


def axes(font):
    return [(a.axisTag, a.minValue, a.defaultValue, a.maxValue) for a in font["fvar"].axes]


def verify_font(original, font, codepoints):
    cmap = font.getBestCmap()
    assert set(cmap) == codepoints, "Subset cmap must equal the collected codepoints"
    assert axes(font) == axes(original), "Variable axes changed"
    # Validate every included outline and advance at the CSS range's endpoints
    # and default. No instancing, outline simplification, or hint removal is used.
    for weight in (45, 400, 920):
        old = original.getGlyphSet(location={"wght": weight})
        new = font.getGlyphSet(location={"wght": weight})
        for point, name in cmap.items():
            old_name = original.getBestCmap()[point]
            old_pen = DecomposingRecordingPen(old)
            new_pen = DecomposingRecordingPen(new)
            old[old_name].draw(old_pen)
            new[name].draw(new_pen)
            assert old_pen.value == new_pen.value, f"Outline changed: U+{point:X} at {weight}"
            assert old[old_name].width == new[name].width, f"Advance changed: U+{point:X}"
    assert "GPOS" in font and "GSUB" in font and "gvar" in font
    def features(font, table):
        return {record.FeatureTag for record in font[table].table.FeatureList.FeatureRecord}
    assert "kern" in features(font, "GPOS"), "Kerning feature was lost"
    assert all("Pretendard" not in name.toUnicode() for name in font["name"].names
               if name.nameID in {1, 3, 4, 6, 16, 21, 25}), "Reserved family name remains"


def main():
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument("--url", default="http://127.0.0.1:3100/")
    args.add_argument("--check", action="store_true", help="Verify without modifying outputs")
    args.add_argument("--css-output", type=Path, help="Emit proposed CSS outside the repo")
    options = args.parse_args()
    assert not (options.check and options.css_output), "--check never writes files"
    codepoints, rendered_count, static_count, source_count = collect_codepoints(options.url)
    source = fetch(SOURCE_URL)
    assert hashlib.sha256(source).hexdigest() == SOURCE_SHA256, "Upstream fingerprint changed"
    original = TTFont(BytesIO(source), recalcTimestamp=False)
    missing = codepoints - set(original.getBestCmap())
    assert not missing, "Upstream lacks collected glyphs: " + unicode_range(missing)
    font = TTFont(BytesIO(source), recalcTimestamp=False)
    settings = subset.Options()
    settings.layout_features = ["*"]
    settings.name_IDs = ["*"]
    settings.name_languages = ["*"]
    settings.name_legacy = True
    settings.glyph_names = True
    settings.notdef_outline = True
    settings.recalc_timestamp = False
    subsetter = subset.Subsetter(options=settings)
    subsetter.populate(unicodes=codepoints)
    subsetter.subset(font)
    # Retain upstream attribution/license records, rename only family/identity
    # records (including named-instance PostScript names) to respect the OFL RFN.
    for name in font["name"].names:
        if name.nameID not in {0, 7, 8, 9, 10, 11, 12, 13, 14}:
            value = name.toUnicode().replace("Pretendard Variable", FAMILY).replace("Pretendard", "EgunHome")
            name.string = value.encode(name.getEncoding())
    output = BytesIO()
    font.flavor = "woff2"
    font.save(output)
    binary = output.getvalue()
    verified = TTFont(BytesIO(binary), recalcTimestamp=False)
    verify_font(original, verified, codepoints)
    assert len(binary) < 150_000, f"Critical subset exceeds 150 KB: {len(binary)}"
    css = f"""/* Generated by scripts/optimize-home-font.py; load AFTER ./pretendard.css.
 * Egun Home Variable: homepage subset of Pretendard Variable v1.3.9.
 * Copyright (c) 2021 Kil Hyung-jin; SIL OFL 1.1: /fonts/egun-home-OFL.txt.
 * Internal family renamed for the reserved font name; CSS alias is unchanged.
 * Original SHA-256: {SOURCE_SHA256}
 * Keep all upstream faces: codepoints outside this exact cmap use those faces.
 */
@font-face {{
  font-family: 'Pretendard Variable';
  font-style: normal;
  font-display: swap;
  font-weight: 45 920;
  src: url('/fonts/egun-home.woff2') format('woff2-variations');
  unicode-range: {unicode_range(verified.getBestCmap())};
}}
"""
    license_text = (ROOT / "public/fonts/pretendard-v1.3.9/OFL.txt").read_bytes()
    assert LICENSE.read_bytes() == license_text, "Ship the original license unchanged"
    if options.css_output:
        assert not options.css_output.resolve().is_relative_to(ROOT), "Apply CSS changes as a source patch"
        options.css_output.write_text(css)
    else:
        assert CSS.read_text() == css, "CSS stale; regenerate with --css-output and apply the diff"
    if options.check:
        assert OUTPUT.read_bytes() == binary, "Font stale; regenerate after reviewing copy changes"
    else:
        OUTPUT.write_bytes(binary)
    print(json.dumps({
        "mode": "check" if options.check else "generate",
        "output": str(OUTPUT.relative_to(ROOT)), "bytes": len(binary),
        "sha256": hashlib.sha256(binary).hexdigest(),
        "codepoints": len(codepoints), "glyphs": len(verified.getGlyphOrder()),
        "renderedCodepoints": rendered_count, "staticCodepoints": static_count,
        "staticFiles": source_count, "originalBytes": len(source),
        "originalSha256": SOURCE_SHA256, "preservedAxes": axes(verified),
        "cssWeightRange": [45, 920], "outlineCheckWeights": [45, 400, 920],
    }, indent=2))


if __name__ == "__main__":
    main()
