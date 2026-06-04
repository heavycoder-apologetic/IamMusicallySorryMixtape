# Rewind — A Retro Bollywood Cassette Experience

A single-page, scroll-driven 3D website. A hyper-stylised audio cassette sits
in the centre of the screen and "rewinds" as you scroll. Two vertical film
strips on the sides let you pick a 90s Bollywood song to play.

## Architecture

```
retro-bollywood-cassette/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── audio/                      ← drop .mp3 placeholders here
└── src/
    ├── main.tsx
    ├── App.tsx                     ← layout + scroll spacers + lyric reveals
    ├── index.css                   ← Tailwind + grain/vignette/EQ keyframes
    ├── data/
    │   └── songs.ts                ← 10 songs, 5 per side
    ├── store/
    │   └── audioStore.ts           ← Zustand store wrapping a single <audio>
    ├── hooks/
    │   └── useScrollProgress.ts    ← 0..1 scroll (state + ref variants)
    └── components/
        ├── Cassette.tsx            ← procedural R3F cassette + reels
        ├── CassetteScene.tsx       ← Canvas, lights, environment, shadows
        ├── StickyCassette.tsx      ← pins 3D scene + caption
        ├── FilmStrip.tsx           ← vertical filmstrip with sprocket holes
        ├── SongFrame.tsx           ← individual clickable song frame
        ├── LyricSection.tsx        ← GSAP ScrollTrigger reveal
        └── BackgroundEffects.tsx   ← bokeh, light leaks, vignette, grain
```

### Why this split?

- **Data first** (`songs.ts`) — the song list is the canonical source for
  posters, filenames, and which side they appear on. Changing it is the only
  thing you need to do to add/remove tracks.
- **One global audio element** — the `<audio>` lives in `App.tsx` and is
  attached to the Zustand store on mount. Every frame talks to the store,
  not its own audio tag, so transport state is always coherent.
- **Scroll progress is published two ways** — a state hook for React-tree
  consumers (background parallax) and a ref hook for `useFrame` inside R3F
  (so the 3D scene doesn't trigger React re-renders on every scroll tick).
- **3D cassette is procedural** — built from `RoundedBox`, cylinders, and a
  `CanvasTexture` label. No GLB asset needed; everything ships in the bundle.

## Component breakdown

| Component | Responsibility |
|---|---|
| `Cassette` | The full procedural cassette — shell, window, two `Reel`s, label `CanvasTexture`, screws, notch holes. Subscribes to scroll progress + audio store to drive rotation and tape transfer. |
| `Reel` | Hub + spokes + sprocket teeth + a flat wound-tape disc that scales between an empty and full radius. |
| `CassetteScene` | The R3F `<Canvas>` with warm key light, rose fill, cool rim, an `Environment` for reflections, and a soft `ContactShadows`. |
| `StickyCassette` | Pins the canvas to the viewport while lyrics scroll over it. Caption + play/pause toggle live here. |
| `FilmStrip` | Vertical film with sprocket holes on both inner and outer edges, stacked song frames. |
| `SongFrame` | Mini poster (gradient + light leak) + title + play/pause/equalizer indicator. Framer Motion handles hover/tap micro-interactions. |
| `LyricSection` | GSAP ScrollTrigger reveal of a romantic line + handwritten whisper. |
| `BackgroundEffects` | Bokeh dots with light parallax, two animated light leaks, base gradient, vignette. `FilmGrain` is exported separately so it can sit ABOVE the canvas. |

## Visual design direction

- **Palette** — deep maroon body (`#5b1f2a`), warm sepia paper labels, dusty
  rose (`#d76283`), antique gold (`#d4a24c`), cream highlights (`#f4e7cf`).
  Background gradient mixes rose + gold radial washes over a near-black base.
- **Typography** — Playfair Display (italic) for cinematic display lines,
  Caveat for handwritten whispers, Cormorant Garamond for body text. All
  from Google Fonts, preconnected in `index.html`.
- **Texture pass** — SVG-encoded fractal noise as a fixed grain layer at
  `mix-blend-mode: overlay`, animated in 8-step `steps()` for that film
  flicker. Vignette via radial gradient. Bokeh as blurred warm circles
  parallaxing on scroll.
- **3D lighting** — golden directional key, rose pointLight fill, cool
  pointLight rim, plus a low-intensity `Environment preset="sunset"` for
  realistic reflections on the plastic shell.

## Implementation plan (how it was built)

1. Tailwind theme + global grain/vignette CSS.
2. Data layer (`songs.ts`) and Zustand audio store wrapping a single
   `<audio>` element with `play / toggle / stop`.
3. Two scroll-progress hooks — one state, one ref — so 3D code can avoid
   triggering React re-renders.
4. Procedural 3D cassette: rounded shell → inset face → transparent window
   → reels (hub + spokes + scalable wound-tape disc) → label `CanvasTexture`
   → screws → notch holes.
5. Canvas wrapper with cinematic three-point lighting + environment +
   contact shadows.
6. Film strips with sprocket holes via repeating radial-gradient CSS, song
   frames with Framer Motion hover/tap, equalizer + play/pause states.
7. App shell with intro hero, sticky 3D cassette, GSAP-revealed lyric
   sections that overlay the sticky canvas, outro.

## Running locally

```bash
cd retro-bollywood-cassette
npm install
npm run dev
```

The dev server opens at <http://localhost:5173>. Build with `npm run build`,
preview with `npm run preview`.

### Adding audio

Drop royalty-free or licensed `.mp3` files in `public/audio/` with the
filenames listed in `public/audio/README.md`. The UI is built to handle
missing audio — frames stay clickable, the indicator just stays in the
paused state.

## Suggestions for improving realism further

1. **Replace the procedural cassette with a textured GLB.** Model it in
   Blender, bake AO + normal + roughness maps, and `useGLTF()` it. Keep the
   `Reel` rotation logic exactly as-is.
2. **Anisotropic plastic.** Switch `meshStandardMaterial` on the shell for
   `meshPhysicalMaterial` with `clearcoat`, `clearcoatRoughness`,
   `anisotropy`, and `iridescence` for that wet plastic sheen.
3. **Real tape geometry.** Replace the flat scaling disc with a thin
   `TorusGeometry` whose `tube` parameter changes over scroll progress, plus
   a curve-following `TubeGeometry` for the visible tape strip between the
   reels.
4. **Post-processing.** Add `@react-three/postprocessing` with
   `Bloom`, `ChromaticAberration`, `Vignette`, and `Noise` passes; tune them
   so the 3D scene matches the CSS grain layer.
5. **Custom GLSL film grain shader.** Replace the SVG grain with a fragment
   shader sampling 3D noise — gives a much more organic, less repeating
   pattern. Mount it as a full-screen postprocess pass.
6. **Use the Web Audio API for analysis.** Pipe the `<audio>` element
   through an `AnalyserNode` and feed frequency bins into the equalizer
   bars and a subtle wobble on the cassette reels.
7. **GSAP ScrollSmoother.** Add Smoother for that buttery cinematic scroll
   feel; pair it with `ScrollTrigger.refresh()` after font load to avoid
   layout jumps.
8. **Real label artwork.** Replace the `CanvasTexture` paper with a hand-
   drawn label per song, decoupled from the title text — pure SVG sketches
   imported as textures.
9. **HDRI lighting.** Swap the `Environment preset` for a custom warm-tone
   HDRI baked from a single golden-hour photo for an unmistakable retro
   warmth on the plastic.
10. **Mobile gyro tilt.** On touch devices, listen to
    `deviceorientation` and use it to drive a small tilt on the cassette,
    so the reflections shift naturally as the user moves the phone.
