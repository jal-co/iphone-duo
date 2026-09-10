# iPhone Duo

A composable React folding-phone study with drag-to-fold interaction, layered screen content, and progressive blur. Built with React 19, Three.js, and Motion. The demo includes DialKit controls, API-sourced app icons, and a Mastra Factory reveal card.

The 3D phone model and desert wallpapers are by [Apple](https://www.apple.com/iphone-duo/). This is an independent study, not an Apple product or an official Mastra announcement.

## Run locally

Use Node.js 22.12 or newer.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5201
```

Open `http://127.0.0.1:5201`. Drag horizontally across the phone, click to toggle, or scrub the transition. The Tune panel adjusts duration, blur, content parallax, lighting, backgrounds, and screen images. Demo settings persist locally.

```sh
npm run build
npm run preview
npx playwright install chromium
npm test
```

## Use the component

Copy `src/iphone-duo/` into your React project. Install `three` and `motion`, and copy the model and desired screen assets into your public directory. DialKit belongs to the demo shell and is not required by the component.

```tsx
import {
  AppleCredit,
  FoldablePhone,
  FoldScrubber,
  FoldToggle,
  PhoneBackground,
  PhoneDevice,
} from './iphone-duo'

export function PhoneDemo() {
  return (
    <FoldablePhone duration={2}>
      <PhoneBackground />
      <PhoneDevice
        modelSrc="/models/iphone-duo.glb"
        screenSrc="/wallpapers/apple-desert.avif"
        coverSrc="/wallpapers/apple-desert-cover.avif"
        screenOverlaySrc="/wallpapers/home-apps.svg"
        coverOverlaySrc="/wallpapers/home-cover.svg"
        revealSrc="/wallpapers/home-photo.svg"
        blur={48}
        parallax={1}
      />
      <FoldToggle />
      <FoldScrubber />
      <AppleCredit />
    </FoldablePhone>
  )
}
```

Give the device container an explicit height. `src/iphone-duo/foldable-phone.css` supplies the base styles; `src/app.css` contains the demo layout.

### Parts and props

| Part | Purpose |
| --- | --- |
| `FoldablePhone` | Owns transition progress. Accepts `defaultValue`, `value`, `onValueChange`, and `duration` in seconds. |
| `PhoneDevice` | Renders the model and handles pointer interaction. |
| `FoldToggle` | Accessible fold/unfold button. Accepts custom children and native button props. |
| `FoldScrubber` | Native keyboard-accessible range input. |
| `PhoneBackground` | Decorative background slot. Accepts children and native div props. |
| `AppleCredit` | Visible link to the model source. |
| `useFoldablePhone()` | Returns the `progress` MotionValue, `setValue(number)`, and `toggle(instant?)`. |

Progress runs from `0` (closed) to `1` (open and settled). It describes the whole transition, not a linear hinge angle. The hinge finishes before the incoming card finishes sharpening. `duration` defaults to `2`; the demo uses `2` seconds.

`PhoneDevice` accepts:

| Prop | Default | Meaning |
| --- | --- | --- |
| `modelSrc` | Required | URL of the prepared GLB. |
| `screenSrc` | Required | Inner-screen background image. |
| `coverSrc` | `screenSrc` | Cover-screen background image. |
| `screenOverlaySrc` | None | Transparent, anchored inner-screen content. |
| `coverOverlaySrc` | None | Transparent cover-screen content. |
| `revealSrc` | None | Transparent incoming card layer. |
| `rotation` | `-6` | Static device rotation in degrees. |
| `exposure` | `1.2` | Hardware lighting exposure. |
| `blur` | `28` | Maximum screen blur in source-texture pixels. |
| `parallax` | `1` | Fold-driven screen-layer movement. Set to `0` to disable. |

Use transparent PNGs or self-contained SVGs for content layers. Inner-screen assets use a `1600 × 1120` canvas; cover assets use `800 × 1120`. Images fill their respective surfaces. Keep the incoming card on the left and anchored content on the right to follow the demo's blur boundary. Custom images need same-origin access or suitable CORS headers.

Screen content is rendered into WebGL textures, not interactive HTML. Put accessible actions outside the phone. Keyboard activation and reduced-motion preferences skip animated toggles; reduced motion also disables content parallax.

## How the fold works

The model's two halves share a hinge on the display plane. There is no added black crease stripe. Screen shaders composite the wallpaper, anchored content, and incoming card separately. The cover blurs as it turns away. The card slides and scales into place on the left, then sharpens while the right-side content stays readable. Cursor movement does not tilt the device or drive the screen effect.

The prepared GLB avoids splitting the USD geometry on every page load. To regenerate it, run the dev server on port 5201, then:

```sh
node scripts/prepare-model.mjs
```

The preparation script uses the included landscape-pose USDZ derived from Apple's original model. Arbitrary GLBs are not drop-in replacements: the runtime expects a `folding-half` node and `inner-screen` / `cover-screen` materials.

To regenerate the original SVG icons, widgets, and Factory card:

```sh
node scripts/create-screens.mjs
```

## License and attribution

The source code and original SVG screen artwork are [MIT licensed](LICENSE). Apple's model, embedded model textures, and desert wallpapers are **not** covered by that license. Mastra's name remains its owner's trademark. See [THIRD_PARTY.md](THIRD_PARTY.md) before redistributing or using the included third-party assets.

This repository is a source-distributed component and demo, not a published npm package.
