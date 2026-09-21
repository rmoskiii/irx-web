#!/usr/bin/env python3
"""make_branch_web.py — the two Day 4 branch frames, web-only.

Destination: irx-web/tools/make_branch_web.py (dev-only)

    s1d4_kitchen.web.svg   scene.jay.kitchen + Kai, wardrobe.party, register.performing
    s1d4_balcony.web.svg   scene.jay.balcony + Tunde, wardrobe.party, register.open

Cast and registers are not chosen here. They are what the scenario declares:
s1d4_kitchen carries character Kai, mood "performing"; s1d4_balcony carries
Tunde, mood "open". Both registers already ship and are already used by the
hero, so nothing is authored — the parts are placed.

Neither shipped scene is modified. Both derivatives are separate files.

THE KITCHEN NIGHT TREATMENT

scene.jay.kitchen is data-time="day" and Day 4 is a Friday night. Inspected
first: none of the three Day 4 scenes carries an atmosphere layer at all — no
filters, no gradients — so time of day is carried entirely by token choice.
And the daylight reduces to a SINGLE element:

    <path id="jk-day-pane" data-time="day" fill="var(--irx-glass)" .../>

The asset already anticipates a variant: four elements carry data-time="day",
and only that one is lighting. So the derivation is to retarget that one pane
to the night-window vocabulary scene.kitchen already uses — outside-dark base,
the three sky bands, a stepped skyline, two accent-dim lit windows opposite.
Every token confirmed present in tokens.css. Geometry preserved exactly, the
mullions untouched, the tea towel left alone because it is a prop and not
lighting. One fill becomes six bands from an existing vocabulary.

Retargeting the pane alone was not enough, and the measurement said so. The
kitchen was a DAY scene lit by daylight through that pane; removing the
daylight left the room with no source at all — mean luminance 75 with no warm
anywhere, against a warm threshold at 203. It also contradicted the hero,
where hb-kit shows this kitchen as --irx-lamp-warm through the bar, i.e.
warmly lit.

So the derivative also carries a key light, and that too is borrowed rather
than invented: scene.kitchen solves the same problem with k-keylight, a
radialGradient in --irx-lamp-warm. Same token, same construction, positioned
where the hero says the light is.
"""
from __future__ import annotations
import pathlib
import re
import sys
import xml.etree.ElementTree as ET

SVGNS = "http://www.w3.org/2000/svg"
NS = "{%s}" % SVGNS
ET.register_namespace("", SVGNS)

# gen_hero.py's contract, unchanged. Socket differs per character and using the
# wrong one puts a head 14px into the shoulders.
SOCKET = {"jay": 196, "kai": 196, "amara": 196, "bola": 210, "tunde": 210, "dee": 210}

# scene.jay_* slots, from anchors.streets.additions.json.
SLOT_CENTRE = (800, 900)

# jk-day-pane: M308 180 h344 v260 h-344 z
PANE = {"x": 308, "y": 180, "w": 344, "h": 260}


def night_pane() -> str:
    """The pane at night, in scene.kitchen's own window vocabulary."""
    x, y, w, h = PANE["x"], PANE["y"], PANE["w"], PANE["h"]
    horizon = y + int(h * 0.78)
    sky = [
        ("--irx-sky-high", y, int(h * 0.37)),
        ("--irx-sky-mid", y + int(h * 0.37), int(h * 0.24)),
        ("--irx-sky-low", y + int(h * 0.61), int(h * 0.17)),
    ]
    out = [f'<g id="jk-night-pane" data-time="night">']
    for tok, ty, th in sky:
        out.append(f'<path fill="var({tok})" d="M{x} {ty} h{w} v{th} h-{w} z"/>')
    out.append(
        f'<path fill="var(--irx-outside-dark)" d="M{x} {horizon} h{w} v{y+h-horizon} h-{w} z"/>'
    )
    # stepped skyline, flat and subdued: one dark token, no glow, no lit windows
    steps = [26, -18, 22, 18, 20, -40, 28, 40, 22, -24, 26, 24, 24, -14, 22, 14,
             26, -34, 24, 34, 28, -20, 24, 20]
    d = [f"M{x} {horizon}"]
    for i in range(0, len(steps) - 1, 2):
        d.append(f"h{steps[i]} v{steps[i+1]}")
    d.append(f"H{x+w} V{horizon} z")
    out.append(f'<path fill="var(--irx-outside-dark)" d="{" ".join(d)}"/>')
    # two lit windows opposite — the only warmth, and small
    out.append(f'<path fill="var(--irx-accent-dim)" d="M{x+48} {horizon-26} h13 v17 h-13 z"/>')
    out.append(f'<path fill="var(--irx-accent-dim)" d="M{x+168} {horizon-34} h11 v15 h-11 z"/>')
    out.append("</g>")
    return "".join(out)


KEYLIGHT = """
    <rect x="0" y="0" width="1600" height="900" fill="url(#jk-keylight)"
          style="mix-blend-mode:screen" pointer-events="none"/>"""

ATMOSPHERE = """
  <g id="br-atmosphere" data-parallax="false">{key}
    <rect x="0" y="0" width="1600" height="900" fill="url(#br-vignette)" pointer-events="none"/>
    <rect x="0" y="0" width="1600" height="900" filter="url(#br-grain)" opacity="0.07"
          style="mix-blend-mode:multiply" pointer-events="none"/>
  </g>"""

DEFS = """
    <filter id="br-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <radialGradient id="br-vignette" cx="50%" cy="46%" r="72%">
      <stop offset="0.48" stop-color="#2A231E" stop-opacity="0"/>
      <stop offset="1" stop-color="#2A231E" stop-opacity="0.55"/>
    </radialGradient>"""

KEY_DEF = """
    <radialGradient id="jk-keylight" cx="46%" cy="40%" r="62%">
      <stop offset="0" stop-color="var(--irx-lamp-warm)" stop-opacity="0.46"/>
      <stop offset="0.55" stop-color="var(--irx-lamp-warm)" stop-opacity="0.20"/>
      <stop offset="1" stop-color="var(--irx-lamp-warm)" stop-opacity="0"/>
    </radialGradient>"""


def ser(el) -> str:
    out = ET.tostring(el, encoding="unicode")
    return (out.replace(f' xmlns="{SVGNS}"', "").replace(f' xmlns:ns0="{SVGNS}"', "")
            .replace("<ns0:", "<").replace("</ns0:", "</").replace(NS, "").strip())


def groups(path: pathlib.Path):
    root = ET.fromstring(path.read_text())
    return {g.get("id"): [ser(c) for c in g] for g in root.findall(NS + "g")}


def figure(uid: str, who: str, wardrobe: str, register: str,
           assets: pathlib.Path, slot, scale: float) -> str:
    """body -> wardrobe -> head, using the shipped anchor contract."""
    ch = assets / "characters"
    body = groups(ch / f"{who}.body.svg")
    cloth = groups(ch / f"{who}.wardrobe.{wardrobe}.svg")["character_clothing"]
    head = groups(ch / f"{who}.register.{register}.svg")["character_head"]
    sy = SOCKET[who]

    def ns(els, tag):
        return [re.sub(r'id="([^"]+)"', f'id="{uid}-{tag}-\\1"', e) for e in els]

    below = ns(body.get("character_contact", []), "c") + ns(body.get("character_back", []), "b")
    mid = ns(body["character_body"], "y") + ns(cloth, "w")
    top = ns(body.get("character_front", []), "f")
    headg = f'<g transform="translate(110 {sy - 210})">' + "".join(ns(head, "h")) + "</g>"
    whole = "".join(below) + "".join(mid) + headg + "".join(top)
    tx = slot[0] - 210 * scale
    ty = slot[1] - 800 * scale
    return f'<g id="{uid}" transform="translate({tx:.1f} {ty:.1f}) scale({scale:.4f})">{whole}</g>'


BRANCHES = {
    "kitchen": dict(scene="scene.jay.kitchen.svg", who="kai", wardrobe="party",
                    register="performing", asset="s1d4_kitchen.web",
                    threshold=None, night=True),
    "balcony": dict(scene="scene.jay.balcony.svg", who="tunde", wardrobe="party",
                    register="open", asset="s1d4_balcony.web",
                    threshold=None, night=False),
}


def main() -> int:
    which = sys.argv[1]
    assets = pathlib.Path(sys.argv[2])
    out_path = pathlib.Path(sys.argv[3])
    cfg = BRANCHES[which]

    s = (assets / "environments" / cfg["scene"]).read_text()
    before = len(s)
    s = re.sub(r"<metadata>.*?</metadata>", "", s, flags=re.S)

    if cfg["night"]:
        m = re.search(r'<path id="jk-day-pane"[^/]*/>', s)
        if not m:
            raise SystemExit("jk-day-pane not found — the kitchen's day element has moved")
        s = s.replace(m.group(0), night_pane(), 1)
        s = s.replace('data-time="day"', 'data-time="night"', 1)

    fig = figure(f"br-{cfg['who']}", cfg["who"], cfg["wardrobe"], cfg["register"],
                 assets, SLOT_CENTRE, 0.62)
    # figures go into furniture so the scene's occluding surfaces cut them at
    # the waist, exactly as compose_frame.py places them
    idx = s.index('<g id="furniture">') + len('<g id="furniture">')
    s = s[:idx] + "\n  " + fig + s[idx:]

    defs = DEFS + (KEY_DEF if cfg["night"] else "")
    if "<defs>" in s:
        s = s.replace("</defs>", defs + "\n  </defs>", 1)
    else:
        s = s.replace("<style>", "<defs>" + defs + "</defs>\n  <style>", 1)
    idx = s.rindex("</g>")
    s = s[:idx] + ATMOSPHERE.format(key=KEYLIGHT if cfg["night"] else "") + "\n  " + s[idx:]

    root = re.search(r"<svg[^>]*>", s).group(0)
    s = s.replace(root, root[:-1] + (
        f'\n     data-asset="{cfg["asset"]}"'
        '\n     data-web-only="true"'
        '\n     data-authoring-canvas="1600,900"'
        '\n     data-camera-frame="0,0,1600,900"'
        '\n     data-max-fov="1300">'), 1)

    out_path.write_text(s)
    print(f"{out_path.name}: {before:,} -> {len(s):,} bytes")
    print(f"  {cfg['who']} / {cfg['wardrobe']} / {cfg['register']} at centre")
    print(f"  night pane        : {'yes' if cfg['night'] else 'n/a (already night)'}")
    print(f"  paths             : {s.count('<path')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())