# IRX — irx.world

Landing page for **IRX**, an AI-powered interactive simulation for real-world
decision-making. Built for investor conversations during the pre-seed raise.

React 18 · TypeScript · Vite. No UI framework, no CSS library — one stylesheet
(`src/index.css`) holding the design tokens.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks, then outputs to dist/
npm run preview  # serve the production build locally
```

Open the folder directly in WebStorm — it will pick up `tsconfig.json` and the
npm scripts automatically. Run configurations appear in the `package.json`
gutter next to each script.

## Structure

```
index.html              fonts, meta/OG tags, favicon
public/                 the three logo exports (icon, primary, horizontal)
src/index.css           design tokens + every component style
src/App.tsx             page order
src/components/
  Mark.tsx              the X mark as inline SVG
  Header.tsx            sticky nav
  Hero.tsx              headline, subhead, status tags
  ScenarioDemo.tsx      playable beat from The Prince / The Secret
  Loop.tsx              the three-step core loop
  Districts.tsx         four districts, two live
  Raise.tsx             raise statement + facts
  Founder.tsx           founder card + contact CTA
  Footer.tsx
```

## Design notes

The palette and type are taken from the app rather than invented for the web:
Digital District teal `#5EE6D0` and Neighbourhood amber `#FFC15E` are the same
values in `DistrictTheme`, and Space Mono is the Digital District's own face,
used here for labels and data. Zilla Slab was chosen to match the slab
construction of the `IR` in the wordmark.

The scenario demo in the hero is the signature element. Rather than describing
the product, it runs a real beat — message, choices, and the plain-English
reason behind the score — so the transparency principle is the first thing a
visitor experiences instead of the first thing they read about.

## Before it goes live

- Contact address is `rmagnus98@gmail.com` (in `Founder.tsx` and `Footer.tsx`) — swap for a domain address once mail is set up on irx.world.
- Point the "Request the deck" CTA at a deck link or form if you'd rather not use mailto.
- Run the trademark / App Store / domain check on "IRX" (still outstanding).
- Deploy: `npm run build` and drop `dist/` on Vercel, Netlify or Cloudflare Pages.
