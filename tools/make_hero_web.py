#!/usr/bin/env python3
"""make_hero_web.py — the web-only interior derivative.

Destination: irx-web/tools/make_hero_web.py (dev-only)

Reads the shipped hero and writes hero_birthday.web.svg. The shipped asset is
never modified: it is read, and the derivative is a separate file.

Four changes, each with a reason. Notably NOT included: the 406x300 -> 406x287
window correction and the glazing-bar realignment from v1.0 of the spec. Those
solved a shape-match cut that the measurements killed — the two windows are not
the same visual surface (exterior mean L 140, interior 79), so the hinge is a
light match and the interior window is never on screen at the swap. Its aspect
is irrelevant and the shipped geometry stands.

  1. ns0 serialisation. 306 of 391 drawn elements ship as
     <ns0:path xmlns:ns0="..."> — valid SVG that browsers render, but ~12.8 KB
     of repeated namespace declarations and invisible to every tool matching
     `<path`. split_bands.py would have emitted a furniture band containing
     four people and reported 10 paths.

  2. Atmosphere. The shipped hero has none: no filters, no gradients, nothing.
     The exterior carries grain and vignette. Cutting from a grained scene to a
     clean one reads as a change of material rather than a change of place, so
     the derivative gains an equivalent pair — warm-shifted, because this is an
     interior. The vignette tints with --irx-shadow (#2A231E, the hero's own
     shadow token) instead of the exterior's black.

  3. Camera metadata, so the scene describes itself to the camera rather than
     the camera hard-coding it: authoring canvas, nominal frame, the interior
     FOV cap, and the hinge anchor on the pendant shade.

  4. prop.phone, composed onto the table. Environmental storytelling only:
     somebody's phone is out among the mugs and the card. It is NOT an
     interaction target and gets no separate addressable layer — Pass F's
     interaction is the authored one, kitchen or balcony.

     Worth knowing what the asset actually is. prop.phone is authored LIT and
     face-up — screen at 0.72 opacity, an --irx-accent glow, two message lines
     — because its home is act3b_jessica_calls, a remote-mode frame where the
     phone is the only object tying the player to a call. Dropped large into a
     room it would read as an affordance.

     Nothing about the asset is changed. It is placed so it cannot pull the
     eye: scale 0.34 against the other props' 0.44, tucked into the 50-unit
     gap between the mugs and the drink so it is one object among four rather
     than isolated, and tilted 7 degrees so it sits as something put down
     rather than positioned. Verified by measurement, not by intent — the
     phone region must not be the brightest warm element in the frame.

  5. data-max-fov="1300". The hero is a composed 1600x900 frame with no
     overscan, so a camera at full canvas width has zero margin and the first
     frame of parallax exposes a band edge. 1300 leaves 150 units each side.
     Declared on the asset because it is a property of the asset.
"""
from __future__ import annotations
import pathlib
import re
import sys
import xml.etree.ElementTree as ET

SVGNS = "http://www.w3.org/2000/svg"

# The pendant shade: M674 190 h94 l22 46 h-138 z -> x 652..790, y 190..236.
# This is the interior end of the warm hinge, measured flat at sd 0.00.
HINGE = {"x": 652, "y": 190, "w": 138, "h": 46}

# The free span on the table is x 724.4..774.2 — between the mugs and the
# drink. 130 * 0.34 = 44.2 wide, which sits inside it with three units clear.
PHONE = {"x": 749.3, "base": 782.0, "scale": 0.34, "tilt": -7.0}

ATMOSPHERE = """
  <g id="hb-atmosphere" data-parallax="false">
    <rect x="0" y="0" width="1600" height="900" fill="url(#hb-warmspill)" pointer-events="none"/>
    <rect x="0" y="0" width="1600" height="900" fill="url(#hb-vignette)" pointer-events="none"/>
    <rect x="0" y="0" width="1600" height="900" filter="url(#hb-grain)" opacity="0.07"
          style="mix-blend-mode:multiply" pointer-events="none"/>
  </g>"""

DEFS = """
    <filter id="hb-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <radialGradient id="hb-vignette" cx="47%" cy="46%" r="72%">
      <stop offset="0.48" stop-color="#2A231E" stop-opacity="0"/>
      <stop offset="1" stop-color="#2A231E" stop-opacity="0.55"/>
    </radialGradient>
    <radialGradient id="hb-warmspill" cx="45%" cy="24%" r="42%">
      <stop offset="0" stop-color="#F2C77E" stop-opacity="0.10"/>
      <stop offset="1" stop-color="#F2C77E" stop-opacity="0"/>
    </radialGradient>"""


def compose_prop(name: str, uid: str, assets: pathlib.Path,
                 x: float, base: float, scale: float, tilt: float = 0.0):
    """Place a shipped prop using its own anchor contract.

    Same maths as gen_hero.py's prop(): the asset declares its viewBox and
    data-base-point, and we translate so the base point lands at (x, base).
    No geometry is authored here and the prop file is never modified.

    Returns (markup, class_rules). The class rules matter: every prop the hero
    already composes — card, mugs, drink, food, shoes — uses inline fills, so
    gen_hero.py never needed to carry styling across. prop.phone is the first
    that uses CLASSES (.ph, .scr, .ln), and they are defined in its own
    stylesheet, not the hero's. Composed without them the phone rendered as a
    black silhouette with no stroke: quiet enough to pass a glance, but not the
    asset as authored, and silently wrong for every class-styled prop after it.
    The rules are lifted from the asset, not written here.
    """
    root = ET.fromstring((assets / "props" / f"prop.{name}.svg").read_text())
    vb = [float(v) for v in root.get("viewBox").split()]
    bx, by = [float(v) for v in root.get("data-base-point").split(",")]
    inner = "".join(
        re.sub(r'id="([^"]+)"', f'id="{uid}-\\1"',
               ET.tostring(c, encoding="unicode")
               .replace("{http://www.w3.org/2000/svg}", "")
               .replace(f' xmlns:ns0="{SVGNS}"', "")
               .replace("<ns0:", "<").replace("</ns0:", "</").strip())
        for g in root.findall("{http://www.w3.org/2000/svg}g") for c in g)
    tx = x - bx * scale
    ty = base - by * scale
    rot = f" rotate({tilt} {bx} {by})" if tilt else ""
    markup = (f'\n    <g id="{uid}" transform="translate({tx:.1f} {ty:.1f}) '
              f'scale({scale:.4f}){rot}">{inner}</g>')

    used = set(re.findall(r'class="([a-z_]+)"', markup))
    src = (assets / "props" / f"prop.{name}.svg").read_text()
    rules = []
    for cls in sorted(used):
        m = re.search(r"\.%s\s*\{[^}]*\}" % re.escape(cls), src)
        if not m:
            raise SystemExit(f"prop.{name} uses .{cls} but does not define it")
        rules.append(m.group(0))
    return markup, rules


def main() -> int:
    src_path = pathlib.Path(sys.argv[1])
    out_path = pathlib.Path(sys.argv[2])
    assets = pathlib.Path(sys.argv[3]) if len(sys.argv) > 3 else None
    s = src_path.read_text()
    before = len(s)

    # 1. namespace normalisation
    s = s.replace(f' xmlns:ns0="{SVGNS}"', "").replace("<ns0:", "<").replace("</ns0:", "</")
    if "<ns0:" in s:
        raise SystemExit("ns0 normalisation incomplete")

    # 3/4. metadata on the root
    root = re.search(r"<svg[^>]*>", s).group(0)
    if "data-asset" not in root:
        new_root = root[:-1] + (
            '\n     data-asset="hero_birthday.web"'
            '\n     data-web-only="true"'
            '\n     data-time="night"'
            '\n     data-authoring-canvas="1600,900"'
            '\n     data-camera-frame="0,0,1600,900"'
            '\n     data-max-fov="1300"'
            f'\n     data-hinge-anchor="{HINGE["x"]},{HINGE["y"]},{HINGE["w"]},{HINGE["h"]}">'
        )
        s = s.replace(root, new_root, 1)

    # the hinge target, named semantically so choreography never cites artwork ids
    s = s.replace('id="hb-shade"', 'id="hb-shade" data-camera-anchor="interior-hinge"', 1)

    # 4. the phone, into the foreground band beside the other table props
    if assets:
        phone, rules = compose_prop("phone", "hb-p-phone", assets,
                                    PHONE["x"], PHONE["base"], PHONE["scale"],
                                    PHONE["tilt"])
        marker = '<g id="hb-p-card"'
        s = s.replace(marker, phone + "\n    " + marker, 1)
        # the prop's own rules, appended to the hero's stylesheet
        if rules:
            block = "\n/* prop.phone — class rules lifted from the shipped asset */\n" + "\n".join(rules) + "\n"
            s = s.replace("]]></style>", block + "]]></style>", 1)

    # 2. atmosphere — inside foreground so split_bands.py finds it where it
    #    finds it in every other scene
    s = s.replace("</defs>", DEFS + "\n  </defs>", 1)
    idx = s.rindex("</g>")  # close of the foreground band
    s = s[:idx] + ATMOSPHERE + "\n  " + s[idx:]

    out_path.write_text(s)
    paths = s.count("<path")
    print(f"{out_path.name}: {before:,} -> {len(s):,} bytes ({(before-len(s))/1024:.1f} KB saved)")
    print(f"  drawn paths visible to tooling : {paths}")
    print(f"  atmosphere group               : {'yes' if 'hb-atmosphere' in s else 'NO'}")
    print(f"  hinge anchor                   : {HINGE}")
    print(f"  prop.phone composed            : {'yes' if 'hb-p-phone' in s else 'NO'}")
    for cls in ("ph", "scr", "ln"):
        print(f"    .{cls:4} resolves                 : "
              f"{'yes' if re.search(r'[.]' + cls + r'\s*{', s) else 'NO'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())