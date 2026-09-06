# IRX VISUAL ASSETS — CONTEXT FOR THE WEBSITE BUILD

Everything the website needs to know about the shipped IRX visual system: what
exists, what it looks like, how to render it, and what does not exist yet.

Source of truth: `irl-backend/tools/visual/assets/`
This file lives in the website repo, at `irx-website/docs/IRX_VISUAL_ASSET_CONTEXT.md`.

Written for the site build. Nothing here is a proposal — it describes assets that
are locked, validated and in the repo today.

---

## 1. THE HEADLINE: WHAT EXISTS AND WHAT DOES NOT

**67 validated SVG assets across two districts. The third has none.**

| District | Anchor scenario | Accent | Visual assets | State |
|---|---|---|---|---|
| Neighbourhood | *The Secret* | `#FFC15E` amber | **45** | complete, shipped |
| Career | *The Instruction* | `#7EA6DB` steel blue | **22** | complete, audited |
| Digital | *The Prince* | `#5EE6D0` teal | **0** | no artwork exists |

**The site plan asks for three scroll zones. Two of them can be built from real
assets today. The Digital zone cannot.** Section 8 sets out the options; the
short version is that the honest ones are to build Digital from UI rather than
from scene art, or to defer it.

One naming correction, because it matters for asset paths: *The Instruction* is
the **Career** district (offices, the QA signature, Ray and Dana). *The Prince*
is the Digital district (the heir-hunter scam). They are frequently swapped in
conversation and the file paths follow the districts, not the scenarios.

---

## 2. THE SINGLE MOST USEFUL FACT FOR THE SITE

**Fully composed 1600×900 scene SVGs already exist.** You do not have to
assemble characters onto backgrounds at runtime.

```
irl-backend/tools/visual/assets/frames/*.svg
```

Each one is a complete, self-contained SVG: environment, character body,
clothing, head, furniture, props and lighting, correctly layered and positioned.
Drop one into an `<img>`, an `<object>` or inline it in JSX and it renders.

Currently in `frames/`:

- ~21 Career frames (`audit_*.svg`, `frame_c_*.svg`, `frame_d_*.svg`)
- the Neighbourhood set (`frame_1_confession.svg`, `frame_4_alex_reveal.svg`,
  `frame_8_engagement_party.svg`, and others)

Regenerate or add one with:

```bash
cd irl-backend/tools/visual/assets
python3 compose_frame.py <frame_name>
```

Frame names are declared in `anchors.json` under `frames`.

If you want runtime composition instead — swapping a character's expression on
hover, for example — section 6 gives the transform maths. But for a scroll
narrative, pre-composed frames are the cheaper and safer path.

---

## 3. WHY THESE SVGS ARE UNUSUALLY GOOD FOR AN INTERACTIVE SITE

They were built for Flutter, and they happen to be better suited to a browser
than to the app they were made for.

**Every colour is a CSS custom property.** Each asset embeds the full token
block in a `<style>` element:

```css
:root {
  --irx-career-wall:       #6E757E;
  --irx-career-accent:     #7EA6DB;
  --irx-career-skin-c:     #D9A886;
  /* ...49 tokens... */
}
```

Flutter cannot resolve `var()` and needs them flattened at build time. **A
browser resolves them natively.** So if the SVG is inlined in the DOM you can
retheme any asset live from JavaScript or a CSS class:

```js
scene.style.setProperty('--irx-career-accent', '#5EE6D0');
```

That gives you district cross-fades, hover states, day/night shifts and scroll
transitions with no extra assets. **This must be inline SVG, not `<img>`** —
`<img>` isolates the document and blocks the cascade.

**Every asset carries named layer groups.** Stable ids, always in this order:

```
background · architecture · environmental_detail · character_back ·
character_body · character_clothing · character_head · furniture ·
prop · character_contact · character_front · foreground
```

You can select and animate them independently: parallax on `background` versus
`furniture`, a spotlight on `character_head`, `foreground` gradients driven by
scroll. This is the strongest hook the assets offer.

**No rasters.** No `<image>`, no data URIs, no PNGs. Everything is vector and
scales to any viewport. Environments are 1600×900 (16:9).

---

## 4. NEIGHBOURHOOD DISTRICT — *The Secret* — 45 assets

Domestic drama. Warm, lamplit, close. Accent `#FFC15E`.

**Characters** — Jessica (`figure_a`) and Alex (`figure_b`), each with a rear
variant for over-the-shoulder framings.

| Base | Registers | Wardrobes |
|---|---|---|
| `figure_a` (Jessica) | open, held, tight, away, bright | home_casual, coat, day, formal |
| `figure_a_rear` | rear | formal |
| `figure_b` (Alex) | open, bright, alert, deflated, searching | home_casual, formal |
| `figure_b_rear` | rear | home_casual |

**Environments (5)** — `scene.kitchen` (evening), `scene.flat_hallway`
(evening), `scene.coffee_shop` (day), `scene.street_exterior` (night),
`scene.party` (night).

**Props (11)** — tea_towel, wet_glasses, jacket_chair, last_glass, door_closed,
ring_box, coffee_cup, glass_set_down, raised_glass, cigarette, phone.

**Vignettes (6)** — hospital_night, flat_curtained, table_three, group_chat,
photos, saturday_quiet. Desaturated montage panels for compressed time.

**Best for the site:** `scene.kitchen` and `scene.party`. The kitchen is the
district's signature image — warm, domestic, two figures at a counter. The party
is the only night exterior-feeling interior and gives tonal contrast on scroll.

---

## 5. CAREER DISTRICT — *The Instruction* — 22 assets

Corporate. Cool, fluorescent, institutional. Accent `#7EA6DB`, matching
`district_theme.dart`.

**Characters** — Ray Okonjo (`figure_c`) and Dana Whitfield (`figure_d`). No
rear variants; nothing in the scenario frames over a shoulder.

| Base | Registers | Wardrobes |
|---|---|---|
| `figure_c` (Ray) | open 0°, guarded −5°, heavy −10°, set −15°, squared +8° | work, work_coat |
| `figure_d` (Dana) | level 0°, noting −6° | work_formal |

Dana's jacket is burgundy — the only saturated garment in the district and the
only warm note in a cool palette. If the site needs one Career image with colour
in it, it is a Dana frame.

**Environments (5)**

| Scene | Time | What it is |
|---|---|---|
| `scene.desk_evening` | evening | your desk, half past eight, floor emptying |
| `scene.desk_day` | day | the same desk on a Friday afternoon |
| `scene.meeting_room` | day | small internal room, whiteboard, closed door |
| `scene.review_room` | day | Dana's office, blinds, credenza |
| `scene.office_floor` | day | **cubicle floor, three depth planes** |

**Props (2)** — `prop.laptop_open`, `prop.notepad`.

**Vignettes (3)** — call_without_you, kitchen_pleasantry, june_two_seats.

**Best for the site:** `scene.office_floor`. It is the only IRX environment with
real depth — wall, then a run of cubicle partitions, then a near desk — so it
parallaxes properly where the flatter rooms do not. `scene.meeting_room` is the
best "someone is asking you for something" image, since the laptop is turned
toward camera.

---

## 6. RUNTIME COMPOSITION, IF YOU WANT IT

Only needed if you intend to swap expressions or wardrobes live. Otherwise use
`frames/`.

A figure is three files layered in order: **body → wardrobe → register (head).**

```
figure_c.body.svg              the torso, arms and hands
figure_c.wardrobe.work.svg     the clothing, drawn over the body
figure_c.register.open.svg     the head, drawn over the clothing
```

Placement, from `anchors.json`:

```
body      translate(slotX - basePointX, slotY - basePointY)
head      the same, plus (headSocketX - neckAnchorX, headSocketY - neckAnchorY)
```

Worked example, Ray at the centre slot:

```
slot (800,900) · basePoint (210,800) · headSocket (210,210) · neckAnchor (100,210)
body     translate(590,100)
head     translate(700,100)          rotate(0, 100, 210)
```

**`headSocket` is per character and they differ.** Ray sockets at `210,196` is
wrong — Ray is `210,210`, Dana is `210,196`. Using the wrong one puts a head 14px
into the shoulders. Read it from `anchors.characters[<base>]`, never from the
deprecated global `anchors.character`.

The register's `data-register-rotate` is its head tilt and is already correct in
the file; apply it about the neckAnchor.

---

## 7. HARD CONSTRAINTS — things that will look broken if ignored

**Do not recolour by hand.** Every colour comes from the token block. Override
the custom property; never edit a fill.

**Do not mix district tokens.** Career tokens are namespaced `--irx-career-*`
because ten names collide with Neighbourhood at different values (`--irx-wall`,
`--irx-accent`, `--irx-floor`, the sky family). Cross-fading districts means
cross-fading token values, not mixing assets.

**Line, shadow, stroke and vignette tokens are global and shared.** They are the
craft language and are identical in both districts. Do not fork them.

**Everything below y=600 in an environment is an occluding surface** — a desk,
a counter, a table — deliberately opaque so figures are cut off at the waist.
Cropping an environment below y=600 removes the thing that makes figures sit in
the room rather than float in front of it.

**The safe area for text is not the full canvas.** Figures occupy roughly
x590–1010 at the centre slot. The rooms are built with quiet backdrops behind
head positions; overlaying text there fights artwork designed to stay calm.

**Faces are simple by design**, built to read at 390pt on a phone. Do not zoom a
face to full-bleed on desktop; it will look thin. Crop to torso-and-above at
most.

---

## 8. THE DIGITAL DISTRICT GAP

*The Prince* is complete as a scenario and has **no visual assets**. Building
them would be a full district pass: 2 characters, 3–5 environments, props and
vignettes — the same scope as Career, which took the whole of this workstream.

Four options, honestly ranked:

1. **Build Digital from interface, not scene art.** *The Prince* is a scam
   played out in emails, documents and verification steps. A Digital zone made
   of message threads, document cards and search results is faithful to the
   scenario, needs no character art, and is exactly the kind of thing a website
   is good at. **Recommended.**
2. **Reuse the existing device props.** `prop.laptop_open` (Career) and
   `prop.phone` (Neighbourhood) exist and are on-brand. A Digital zone built
   around a screen, with the district's teal accent, borrows plausibly.
3. **Two zones instead of three.** Neighbourhood and Career, with Digital as a
   teaser card. Least impressive, most honest.
4. **Commission the district.** Correct long-term, wrong for this build.

Note that option 1 matches the site plan's own instinct — the brief already says
"a laptop/phone that blends into it for the digital district".

---

## 9. NOTES ON THE SITE PLAN AS WRITTEN

**The IRX loading mark, dot to X.** No asset does this; it is new work. It is
also a pure SVG path morph, so it belongs in the site repo rather than the asset
pipeline. Keep it there.

**"Interactive Reality Experience" under the mark.** IRX typography is Space
Grotesk, Space Mono and DM Serif Display; the landing page display face is Zilla
Slab; the Career district uses IBM Plex Sans. Pick from those rather than
introducing a fourth.

**Scroll Neighbourhood → Digital → Career.** Worth noting the districts are
warm → teal → cool, so a scroll cross-fade moves through the whole palette in
order. That is a real gift and it is worth keeping the order.

**Scenario demos in modals.** The demo lives at `irx-demo.vercel.app`, proxied
through `/demo` by a `vercel.json` rewrite. A modal wrapping that route is the
least-effort route to "try the full scenario".

---

## 10. QUICK REFERENCE

```
irl-backend/tools/visual/assets/
├── tokens.css                  the single source for every colour
├── anchors.json                slots, basePoints, headSockets, frames, montage
├── registries.json             characters, registers, wardrobes, scenes
├── characters/                 figure_a, figure_a_rear, figure_b, figure_b_rear,
│                               figure_c, figure_d — body, register.*, wardrobe.*
├── environments/               scene.*.svg — all 1600×900
├── props/                      prop.*.svg
├── vignettes/                  vig.*.svg — montage panels
└── frames/                     COMPOSED SCENES — start here
```

Validate anything you change:

```bash
cd irl-backend/tools/visual/assets
python3 validate_assets.py      # expect: 67 assets, PASS
```

Current status: **67 assets, no structural failures, PASS.** Career audited
across all 34 render states with zero blockers.