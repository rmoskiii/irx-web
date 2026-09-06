# Phase 0.5 — `scene.neighbourhood_night`

**Authoring specification v1.0. Spec before code. No SVG is written until this is signed off.**

**Asset destination:** `irl-backend/tools/visual/assets/environments/scene.neighbourhood_night.svg`
**Spec destination:** `irx-web/docs/SCENE_NEIGHBOURHOOD_NIGHT_SPEC.md`

The asset lives in the backend asset tree, not the website repo, so that
`validate_assets.py` covers it and it inherits `tokens.css`. It is flagged
`data-web-only="true"` and is not referenced by any scenario frame. It is copied into the
site build at Phase 1.

**`scene.street_exterior` is not touched.** It remains shipped, validated and referenced by
*The Secret*.

---

## 1. Three findings that shape this spec

Measured from `scene.kitchen`, not assumed.

### 1.1 The dusk palette already exists — and it is this scene's palette

The kitchen window carries a three-band sky:

```
--irx-sky-high:     #334051   cool blue
--irx-sky-mid:      #4D4656   violet
--irx-sky-low:      #785A4F   warm horizon
--irx-outside-dark: #2A333E   silhouette
```

Cool → violet → warm, top to bottom. That is the reference image's atmosphere, already
tokenised, already shipped. **The new scene needs almost no new colour tokens.**

More than that: this sky was authored as *the view through the kitchen window*. The
establishing shot and the kitchen interior are looking at the same sky from opposite sides.
Using these tokens is not a style match — it is literal continuity.

### 1.2 The kitchen already asserts a distant skyline

Inside `k-window`, in `--irx-outside-dark`:

```
M892 332 v-26 h50 v-18 h38 v44 h34 v-32 h58 v32 h44 v-22 h42 v22 h34 v-30 h60 v30
```

A stepped skyline silhouette. **The distant urban scale the reference suggests is already
established by the shipped asset.** The firewall rule is satisfied before we start — we are
not inventing a city, we are showing the one the kitchen window already looks at.

It follows that the skyline must stay subdued and low-contrast, because that is how the
kitchen renders it. It is flat silhouette in a single dark token. No lit windows, no
gradient, no glow.

### 1.3 Density is a line ratio, not a path count

| Scene | Line paths / total | |
|---|---|---|
| `scene.kitchen` | 87 / 155 | **56% line** |
| `scene.street_exterior` | 23 / 57 | 40% line |
| `scene.office_floor` | 34 / 85 | 40% line |

The kitchen's richness comes from linework carrying the detail, not from more fills. An
exterior at 180 paths with a 40% line ratio will still read as thinner than the kitchen at
155. **The acceptance criterion is the ratio.**

Stroke weights in the kitchen span 1.2 → 6.8, tuned per element rather than snapped to the
five weight tokens. Modal weight is 1.8–2.4 for interior detail; 5.0–6.8 is reserved for
silhouette edges that separate one depth plane from the next.

---

## 2. Canvas and camera frame

| | |
|---|---|
| Authoring canvas | **2200 × 900** |
| Nominal camera frame | **1600 × 900**, centred → x 300–1900 |
| viewBox | `0 0 2200 900` |
| `data-camera-frame` | `300,0,1600,900` |
| `data-occlusion-line` | `600` |
| `data-time` | `night` |

Every band is authored across the full 2200. The central 1600 is what the camera sees at
t=0.

---

## 3. Composition and the camera corridor

Street level. Residential. The camera never leaves the ground.

### 3.1 Layout across the authoring canvas

```
x 300 ──────────────── 1100 ──────── 1400 ──────────── 1900
  │                      │             │                  │
  │  terrace, receding   │  TARGET     │  terrace,        │
  │  left, unlit         │  HOUSE      │  receding right  │
  │                      │  window     │                  │
```

The target house sits **right of centre** in the camera frame — window centred near
**x 1240** in authoring coordinates, which is x 940 within the 1600 frame. Off-centre, on
the right third. The camera corridor runs diagonally from wide-centre toward it, which
means the near band sweeps left-to-right past the viewer as the push develops.

### 3.2 The camera timeline

| Scroll | Beat | Scale | Frame reads |
|---|---|---|---|
| 0.00 | **WIDE** | 1.0 | street, terrace both sides, several houses, one warm window among them |
| 0.35 | **MEDIUM** | 1.6 | near band sweeps out of frame; target house separates from its neighbours |
| 0.70 | **HOUSE DOMINATES** | 2.8 | the house fills the frame; the window is unmistakably the subject |
| 0.92 | **WINDOW TARGET** | 5.5 | window occupies ~60% of frame height; interior warmth visible, no figures legible |
| 1.00 | **CUT** | — | hard cut to the kitchen frame |

At t=0.00 the window must be *noticeable but not announced* — one warm rectangle among
cool architecture. The viewer should register it before they understand why.

### 3.3 The cut is a match cut — and this is the hardest requirement

The exterior window and the kitchen window are the same window from opposite sides.

Kitchen `k-window` interior geometry: **x 892–1296, y 112–398** → 404 × 286 → **aspect
1.41 : 1**.

**Authoring rule: `n-window-lit` must be drawn at 1.41 : 1**, so that at t=0.92 the two
window apertures share proportion and the cut reads as passing through glass rather than
switching shot.

Suggested authoring size: **170 × 120** (1.417 : 1), which at scale 5.5 gives 935 × 660 —
approximately 73% of frame height, tuned down to ~60% by adjusting final scale at
implementation.

The reverse is implied and correct: outside we look in through the window; inside, the
kitchen's window sits on the right of frame, which is where we came from.

---

## 4. The five bands

All five carry real geometry. `foreground` additionally carries the atmosphere rects and
does not parallax.

### `background` — factor 0.05
Three-band dusk sky using `--irx-sky-high` / `-mid` / `-low`, banded horizontally exactly as
the kitchen window bands it. Distant skyline in flat `--irx-outside-dark`, stepped silhouette,
low on the horizon, no interior lights. Low hills or rooftline mass behind the terrace.
Optional moon, small, `--irx-vig-light` at low opacity.

### `architecture` — factor 0.15
The terrace itself. Houses receding left and right, rooflines, chimneys, unlit or
cool-lit windows in `--irx-outside-dark` and `--irx-wall-dark`. **The target house is in this
band.** Two to three neighbouring warm windows elsewhere in the terrace so the target is one
of a set rather than the only lit thing in the world — the "living neighbourhood" reading
depends on this.

### `environmental_detail` — factor 0.35
Street furniture and the mid-depth clutter that makes it inhabited: lamp posts with warm
`--irx-lamp-warm` pools, wheelie bins, gate posts, a bicycle against a wall, telegraph pole
and slack wire, hedging along front gardens. This is where most of the line-ratio budget
goes.

### `furniture` — factor 0.75
The near street plane. Kerb, pavement edge, a parked car in three-quarter view, low garden
wall running toward camera. Everything here sits **below y=600** and is the occluding
surface — the same contract as the desk and the counter.

### `foreground` — geometry factor 0.90, atmosphere factor 0.0

**Two contents, two behaviours, and they must be split by `split_bands.py`.**

*Geometry* — a foreground tree with a branch reaching across the upper-left corner, and a
hedge or railing running along the lower-left edge. **Left side only.** The camera corridor
travels toward the right third, so left-weighted near geometry sweeps out of frame as the
push develops and never crosses the target window.

*Atmosphere* — full-canvas rects carrying grain, vignette, and a cool overhead gradient,
`pointer-events="none"`. **Locked to viewport, never transformed.**

---

## 5. Overscan

Bands are authored wider than the camera frame because a band that scales less than the
camera retreats from the frame edge as the push develops, exposing a gap. Far bands scale
least, so far bands need the most.

| Band | Overscan each side | Content spans |
|---|---|---|
| `background` | 300 px | full 0 → 2200 |
| `environmental_detail` | 200 px | 100 → 2100 |
| `architecture` | 180 px | 120 → 2080 |
| `furniture` | 140 px | 160 → 2040 |
| `foreground` geometry | 100 px | 200 → 2000 |
| `foreground` atmosphere | full canvas | 0 → 2200 |

**Overscan is part of the asset contract, not an implementation concern.** A band that stops
at the camera frame edge is a defect, not a tuning issue.

---

## 6. The target window

```xml
<g id="n-window-lit" data-camera-anchor="primary">
```

`n-window-lit` is the readable artwork id. `data-camera-anchor="primary"` is what the camera
system queries, so choreography targets a semantic anchor rather than hard-coding an artwork
id.

Contents: aperture at 1.41 : 1; warm interior fill in `--irx-accent-dim` with
`--irx-lamp-warm` for the brightest plane; a glazing bar cross; curtain edge in
`--irx-curtain`; sill and frame in line weight 3.0–3.4. **No figures.** At t=0.92 the viewer
should see warmth and habitation, not people — the people are on the other side of the cut.

The window is the strongest warm value in the composition, achieved by being the largest
uninterrupted warm area, not by being brighter than the street lamps.

---

## 7. Tokens

Reuse without modification: `--irx-line`, `--irx-line-soft`, `--irx-shadow`, the
`--irx-sky-*` family, `--irx-outside-dark`, `--irx-wall`, `--irx-wall-dark`, `--irx-accent`,
`--irx-accent-dim`, `--irx-lamp-warm`, `--irx-cool-spill`, `--irx-curtain`, and the five
stroke weight tokens.

New tokens, `--irx-neighbourhood-*` namespace, added to `tokens.css`. Keep to these six:

```css
--irx-neighbourhood-brick:       /* terrace facade, mid */
--irx-neighbourhood-brick-dark:  /* terrace facade, shadow side */
--irx-neighbourhood-roof:        /* slate */
--irx-neighbourhood-pavement:    /* kerb and paving */
--irx-neighbourhood-foliage:     /* tree and hedge mass */
--irx-neighbourhood-foliage-dark:/* foliage shadow */
```

`scene.street_exterior` already defines `sky`, `skyd`, `pave`, `brick`, `brickd`, `dark`
classes. **Reuse those class names** so the two exteriors share a vocabulary.

**No Career tokens. No cross-namespace mixing.**

---

## 8. Craft rules

1. **Line ratio ≥ 55%.** Measured as `class="ln"` paths over total paths. This is the
   density acceptance criterion.
2. **Total paths 150–200.** A guardrail. If the ratio holds and the scene reads at the
   kitchen's density, count is secondary.
3. **Stroke weights tuned per element**, spanning 1.4 → 6.6. Modal 1.8–2.4. Reserve 5.0–6.8
   for edges separating depth planes — this is what makes bands read as distinct under
   parallax.
4. **Quadratic beziers with slight wobble on organic and long edges**
   (`q202 -4 404 1`), matching the kitchen. Straight `h`/`v` runs only for skyline steps and
   window mullions.
5. **All fills via token `var()` or a class.** No literal hex outside the token block.
6. **No rasters, no `<image>`, no data URIs.**
7. **Nothing below y=600 may be semi-transparent** — the occluding plane is opaque by
   contract.
8. **Avoid decorative repetition that becomes noise under motion.** Brick courses, roof
   tiles and foliage read as texture when static and as shimmer when parallaxed. Suggest
   material with a few strokes, not a full pattern.
9. **Warm light appears only where a human put it** — windows, lamps, a doorway. The
   environment is cool. Hierarchy: cool environment → warm light → human presence → scenario.
10. **The skyline stays flat and subdued.** Single dark token, no glow, no lit windows. It
    is depth, not subject.

---

## 9. Acceptance criteria

Nothing is approved until all of these pass.

1. `validate_assets.py` passes with the asset added — 68 assets, PASS
2. Line ratio ≥ 55%, path count 150–200
3. All five bands populated with real geometry; overscan per §5 verified per band
4. `foreground` splits cleanly into geometry and atmosphere via `split_bands.py`
5. `n-window-lit` present, aspect 1.41 : 1 ± 0.03, `data-camera-anchor="primary"` set
6. **Rendered at 1600×900 beside `scene.kitchen` at the same scale, the two read as one
   world** — this is the judgment call and it is the point of the whole exercise
7. **Rendered at 390pt**, the wide composition still reads; the window is still findable
8. At t=0.92 crop, the window aperture proportion matches `k-window` visually
9. No token collision with `--irx-career-*`; no literal hex outside the token block
10. Camera corridor simulated at all five beats with no band edge exposed

---

## 10. Sequencing

Phase 0.5 sits before Phase 1. The camera path, overscan and target window are locked in the
artwork first, so the compositor is built around a known cinematic sequence rather than the
art being retrofitted to an implementation.

```
Phase 0.5  →  Phase 0  →  Phase 1  →  Phase 2  →  Phase 3  →  Phase 4  →  GATE 4
```

The kitchen-with-phone frame from §4 of the build plan can be composed in parallel; it is
not a dependency of this asset.

---

## North star

The first twenty seconds should feel like entering a living world, noticing one human story
inside it, and physically crossing the boundary into that story.

The strongest asset we have toward that is not the artwork — it is that the kitchen already
looks out at this sky and this skyline. The exterior is not a new place. It is the other
side of a window that has been there all along.