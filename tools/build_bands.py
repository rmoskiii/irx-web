#!/usr/bin/env python3
"""Inline split bands into a TS module for the proof harness.
Destination: irx-web/tools/build_bands.py (dev-only)"""
import json, pathlib, re, sys
d = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
man = json.loads((d / "manifest.json").read_text())
DEPTH = {"background":0.05,"architecture":0.15,"architecture_far":1.0,
         "n-window-lit":1.0,"environmental_detail":0.35,"furniture":0.75,
         "near":0.9,"overhead":0.95,"atmosphere":0.0}
style = defs = ""
parts = []
for b in man["bands"]:
    s = (d / b["file"]).read_text()
    if not style:
        m = re.search(r"<style>(.*?)</style>", s, re.S);  style = m.group(1) if m else ""
        m = re.search(r"<defs>(.*?)</defs>", s, re.S);    defs  = m.group(1) if m else ""
    body = re.search(r"<g id=\"[^\"]+\"[^>]*>(.*)</g>", s, re.S).group(1)
    parts.append((b["id"], DEPTH[b["id"]], b["parallax"], body))
ts = ["// GENERATED from split_bands.py output. Do not edit.",
      f"export const VIEW_BOX = {json.dumps(man['viewBox'])};",
      f"export const STYLE = {json.dumps(style)};",
      f"export const DEFS = {json.dumps(defs)};",
      "export const BANDS: {id:string;depth:number;parallax:boolean;svg:string}[] = ["]
for i,(bid,depth,par,body) in enumerate(parts):
    ts.append(f"  {{ id: {json.dumps(bid)}, depth: {depth}, parallax: {str(par).lower()}, svg: {json.dumps(body)} }},")
ts.append("];")
out.write_text("\n".join(ts))
print(f"{out}: {len(parts)} bands, {out.stat().st_size//1024} KB")
