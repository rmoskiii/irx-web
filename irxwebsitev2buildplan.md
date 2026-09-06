# IRX Website v2 — Build Plan

**Version 3.0 — supersedes v2.0. Reconciled with `IRX_VISUAL_ASSET_CONTEXT.md`.**

Scroll-driven cinematic site. "Interactive Reality Experience."

**Repo:** `irx-web` · **Branch:** `v2-reality` · **Live v1 stays on `main`** serving
irx.world until v2 clears Gate 10.

---

## 1. What the asset context changed

Four revisions against v2.0. Two of them remove work.

**Runtime composition is deleted.** `frames/` holds fully composed 1600×900 SVGs —
environment, body, wardrobe, head, furniture, props and lighting, correctly layered. The
site never touches individual figure files. This removes the `Figure` component, the
`headSocket` transform maths, and `tools/figure_parity.py` from Phase 1. It also makes the
figure layer-group divergence between A/B and C/D **a non-issue for this build** — it stays
an upstream asset question, not a website blocker.

**The Career near-band decision is resolved, and my v2.0 recommendation was wrong.** I said
author no near band and take a flatter camera, because `foreground` held zero geometry. But
`scene.office_floor` carries three real depth planes — wall, a run of cubicle partitions in
`environmental_detail` (31 paths), then a near desk in `furniture` (36 paths). The depth was
never in `foreground`; it was distributed across the bands. Career parallaxes properly, and
`scene.office_floor` is the best parallax subject in the entire asset library.

**Faces cap the camera.** Faces are drawn to read at 390pt on a phone. A full-bleed face
push on a 27" display will look thin and expose the line weight. **Torso-and-above is the
tightest crop the choreography may use.** This is a hard constraint on Act 1, where v2.0
had the camera pushing through a window onto the confession beat.

**Digital is intentionally assetless and gets built from UI.** Confirmed. See Phase 6.

---

## 2. The universal band → depth mapping

This is the core mechanic of the whole site, and it now generalises across every scene.

| Band | Parallax role | Factor | Notes |
|---|---|---|---|
| `background` | far | 0.05 | sky, wall, carpet |
| `architecture` | mid-far | 0.15 | structure |
| `environmental_detail` | mid | 0.35 | cubicle pods, shelving |
| `character_*` | subject | 0.50 | body, clothing, head — move as one unit |
| `furniture` | **near** | 0.75 | occludes the figure at the waist |
| `prop` | near | 0.75 | travels with furniture |
| `character_front` | nearest | 0.80 | hands over furniture |
| `foreground` | **none** | **0.0** | atmosphere only — locked to viewport |

Two rules fall out of this and both are load-bearing:

**`foreground` never parallaxes.** In every scene it holds full-canvas `<rect>` elements
carrying the grain filter, vignette and light gradients. Move it and you drag the lighting
across the frame. It renders perfectly on load and only breaks on scroll — the worst failure
mode, because it passes inspection.

**`furniture` must stay faster than `character_*`.** Everything below y=600 is a deliberate
occluding surface; it's what makes figures sit *in* the room rather than float in front of
it. Invert that relationship and the illusion collapses.

---

## 3. Stack

```bash
npm install lenis gsap
```

- **Lenis** — scroll inertia; doesn't hijack the scroll container
- **GSAP + ScrollTrigger** — choreography; free since the Webflow acquisition, no token
- **CSS transforms** — native; rules out `top`/`left` animation and WebGL

**No Three.js.** 2D vector assets with no 3D pipeline behind them; ~600 KB before a pixel.

**Inline SVG, never `<img>`.** `<img>` isolates the document and blocks the cascade. Inlined,
every colour resolves through `var()` natively in the browser — which Flutter cannot do —
so district cross-fades, hover states and day/night shifts come free:

```js
scene.style.setProperty('--irx-career-accent', '#5EE6D0');
```

Retheme by overriding the custom property. Never edit a fill. Never mix district token
namespaces — ten Career names collide with Neighbourhood at different values, so a
cross-fade animates *token values*, not assets.

**Performance rule:** transform the band, never the paths inside it.
`.band { will-change: transform; }`

---

## 4. Open items

Down from three blocking decisions to one asset task.

**A kitchen frame containing `prop.phone`.** Act 2's entry is the camera pushing into a
phone on the counter. The firewall rule applies to the web layer: the phone must exist in
the scene before the camera can find it. `prop.phone` exists in the Neighbourhood set; it
needs composing into a kitchen frame.

```bash
cd irl-backend/tools/visual/assets
python3 compose_frame.py <frame_name>
```

Everything else is unblocked.

---

## 5. Phases and gates

### Phase 0 — Scaffold

```bash
git checkout -b v2-reality
git push -u origin v2-reality
npm install lenis gsap
```

```
src/
  acts/      Act0Preloader, Act1Neighbourhood, Act2Digital, Act3Career, Act4Resolution
  scene/     SceneStage, Band, useParallax
  digital/   MessageThread, DocumentCard, VerificationStep
  modal/     ScenarioModal
  motion/    useLenis, scrollTimeline, prefersReducedMotion
  assets/    frames/, tokens.css
tools/
  split_bands.py
docs/
  IRX_VISUAL_ASSET_CONTEXT.md
```

**GATE 0** — Branch pushed, Vercel preview URL live, `main` untouched.

---

### Phase 1 — Band extraction

**`tools/split_bands.py`** — one composed frame in; one SVG per band plus `atmosphere.svg`
out, each keeping `0 0 1600 900` so they stack in register with no repositioning maths.

- **Separate atmosphere from `foreground`.** Full-canvas rects carrying `filter=`,
  `fill="url(#…)"` or `pointer-events="none"` go to `atmosphere.svg`, flagged
  `data-parallax="false"`. Any geometry paths stay in the band.
- Group all `character_*` bands into one transform unit
- Preserve `viewBox`, `data-occlusion-line`, `data-time`
- Carry `<defs>` into bands that reference them; drop from bands that don't
- Strip `<metadata>` — 68 KB of C2PA across nine files, web output only, source untouched
- **Assert each expected group is found exactly once; raise on silent no-op.**
  Validate-all-then-write.
- Emit a per-frame manifest: bands, path counts, depth factors

**GATE 1** — A kitchen frame splits to bands + atmosphere; restacking in a browser
reproduces the composite pixel-for-pixel. Splitter raises on a renamed band. Token block
survives extraction and `setProperty` retints a band live.

---

### Phase 2 — Scroll foundation

`useLenis` plus the ScrollTrigger connector. Lenis drives a virtual scroll position;
ScrollTrigger reads native by default. Unconnected they fight and everything judders — the
most common failure in Lenis+GSAP builds.

`SceneStage` (pinned viewport) and `Band` (single transformed layer, depth factor as prop).
Prove parallax with placeholder rectangles before real art goes near it.

`prefersReducedMotion` built in now — scrub replaced by static states with fades.

**GATE 2** — Placeholder bands hold 60fps in a throttled Chrome profile. Lenis and
ScrollTrigger agree through a full scroll, on resize, and on back-navigation. Reduced-motion
renders every scene statically.

---

### Phase 3 — Act 0, preloader

Black. The mark's centre dot alone. Two strokes grow outward along the diagonals to form the
X, then retract into the dot. Three cycles via `stroke-dashoffset` with `pathLength="1"` —
one CSS line per stroke, no JS loop. On the third completion the X holds;
`INTERACTIVE REALITY EXPERIENCE` letterspaces in beneath in **Space Mono**; ~800ms beat;
curtain lifts into Act 1.

New work, pure path animation, lives in the site repo — not the asset pipeline.

- **Tie to real asset loading with a minimum-duration floor**, never a fixed timer
- **Skip control, always visible.** Investors open links on hotel wifi.

**GATE 3** — Runs standalone, skip works, floor honoured, time-to-Act-1 under 2.5s.

---

### Phase 4 — Act 1, Neighbourhood — **VERTICAL SLICE ENDS HERE**

`scene.street_exterior` at night. Bands parallax per §2. Camera drifts toward one lit
window; the window grows; cut through to `frame_1_confession` — the kitchen, Jessica, the
confession beat. Pulsing hotspot opens the modal.

**Crop ceiling: torso-and-above.** No face fills the frame. The window push resolves to a
two-figure counter composition, not a close-up.

Accent `#FFC15E`. Text stays off the x590–1010 figure corridor; the rooms are built with
quiet backdrops behind head positions and overlaying text there fights artwork designed to
stay calm.

**GATE 4 — the decision point.** Phases 0–4 plus one modal is the vertical slice. Open it
cold: does it feel remarkable, or does it feel like a parallax template with good art? If
the latter, stop and rethink the choreography. One week spent, not six. **Do not proceed
without a clear yes.**

---

### Phase 5 — Modal system

Full-bleed overlay in district accent, parent scene blurred and desaturated. Content driven
by the **same `BEATS` array** already in `ScenarioDemo.tsx` — one source of truth, so
scenario copy never forks between v1 and v2. Focus trap, Escape, body scroll lock. Two
exits: `Close` restores exact scroll position; `Play the full scenario →` routes to `/demo`
via the existing `vercel.json` rewrite.

**GATE 5** — Opens from Act 1, traps focus, returns to exact position, demo link resolves.

---

### Phase 6 — Act 2, Digital — built from interface

Zero scene assets, by design. *The Prince* is a scam played out in emails, documents and
verification steps, so the district is built from UI — which is the one thing a website is
better at than a game client.

The transition: a phone lies face-down on the kitchen counter. It lights. Camera pushes into
the screen; the bezel expands past the viewport edges; you are inside it. Palette hard-cuts
to teal `#5EE6D0`.

Inside, no artwork — `MessageThread`, `DocumentCard`, `VerificationStep`. The Halloway &
Finch email assembles line by line on scroll. Probate registry lookups, a firm that doesn't
appear on the register, a phone number that traces to a mobile.

This is the strongest transition in the sequence because its entry point is a real object in
the previous scene, and the district's absence of scene art becomes the point rather than a
gap — you are looking at a screen, so you see a screen.

Screen-bleed distortion via `feTurbulence` + `feDisplacementMap`, on a short scrubbed window
only. **Filters are expensive — mount for the transition, tear down after.**

**GATE 6** — 60fps through the filter window; filter provably unmounted after; phone prop
verified present in the composed kitchen frame.

---

### Phase 7 — Act 3, Career

Pull back out of the phone into `scene.desk_evening` — not back to the kitchen. Half past
eight, floor emptying, monitor glow. Ray delivers the instruction.

Camera widens to **`scene.office_floor`**, the parallax hero: wall, then the run of cubicle
partitions, then the near desk. Three genuine depth planes and the only environment in the
library with real recession.

Close on a Dana frame. Her burgundy jacket is the only saturated garment in the district and
the only warm note in a cool palette — it should be the last colour before Act 4 goes flat.

Accent **`#7EA6DB`**, matching `district_theme.dart`. The `#B4A0FF` placeholder is still in
`ScenarioDemo.tsx` on `main` and should be corrected there too.

**GATE 7** — Both Career scenes parallax per §2; `--irx-career-*` tokens resolve with no
collision against the Neighbourhood namespace.

---

### Phase 8 — Act 4, Resolution

The three worlds collapse into the X mark. Raise, founder, contact. Flat, calm, no motion.
After three acts of spectacle, stillness reads as confidence — and it's where the investor
actually needs to read something.

---

### Phase 9 — Mobile

**A separate treatment sharing components, not a squeezed desktop build.** Scroll-scrubbed
cinematics are punishing on phones, and a meaningful share of investor traffic is phone.

Three tap-through district cards, same modals, same `BEATS`, same accents, same preloader.
Static or single-axis band offsets rather than scrubbed camera moves.

Mobile is where the assets were designed to live — 390pt is their native scale — so frames
can crop tighter here than on desktop.

**GATE 9** — Real device test on a mid-range Android, not Chrome device emulation.

---

### Phase 10 — Performance and launch

- Lighthouse ≥ 90 performance, throttled mobile
- Total transfer under 1.2 MB gzipped (all assets stripped: 256 KB — not a constraint)
- Lazy-load Acts 2 and 3; inline Act 1 only
- Every band through `simplifyForClient.js`
- Full keyboard traversal, no scroll-jacking
- Reduced-motion path verified end to end
- OG image, meta, favicon carried from v1

Merge `v2-reality` → `main`.

---

## 6. Standing rules

1. **`foreground` never parallaxes.** It holds the grain, vignette and light rects.
2. **`furniture` stays faster than `character_*`.** Occlusion below y=600 is what seats a
   figure in a room.
3. **Never crop an environment below y=600.** It removes the occluding surface.
4. **Torso-and-above is the tightest crop.** Faces are drawn for 390pt.
5. **Transform bands, never paths.**
6. **Retheme by overriding tokens, never by editing fills.** Never mix district namespaces.
7. **Inline SVG only.** `<img>` blocks the cascade and kills live retinting.
8. **The firewall rule extends to the web layer.** The site must not assert what the scenes
   have not established. No invented props to serve a camera move.
9. **One source of truth for scenario content.** `BEATS` stays canonical across v1 and v2.
10. **Keep the district order Neighbourhood → Digital → Career.** Warm → teal → cool moves
    through the whole palette in sequence.
11. **`main` stays deployable throughout.**
12. **Fix asset defects at source**, so `irx-flutter` and the render service inherit them.

---

## 7. Sequencing

Order: compose the kitchen-with-phone frame → Phase 0 → 1 → 2 → 3 → 4 →
**Gate 4 judgment** → Phases 5–10.

Gate 4 is the real decision point. Everything before it is roughly one week. Everything
after is four to six. Do not spend the second unless the first earns it.