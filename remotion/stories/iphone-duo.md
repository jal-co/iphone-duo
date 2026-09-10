# iPhone Duo detail showcase

## Source and format

Exact browser capture of `http://127.0.0.1:5201/`. The production WebGL renderer, React controls, model, SVG widgets and API-sourced app icons remain the source of every phone pixel. FFmpeg encodes the captured frames; no new rendering dependency is required.

1920×1184, 30 fps, 18 seconds, silent. Uses the solo reference aspect ratio and cadence. No supplied video reference for camera direction. The product-page reference is for phone behavior, not editorial framing. One continuous component instance, no cuts, no rotation, no titles or gallery chrome. Existing Apple credit retained.

## Coverage

| Category | Available | Showcase | Reason |
| --- | --- | --- | --- |
| Structure | Cover, open inner display, partial fold | All three | Main hardware configurations |
| Stable states | Open, closed, book | All three | User explicitly requests book hold |
| Transition | Fold, unfold, screen defocus | Fold and unfold | Signature behavior |
| Input | Click, drag, keyboard | Click and drag | Real pointer input supplies causality |
| Cosmetic | Tide, ink, background, light/dark | Studio dark only | User approved Factory and API icons; no cosmetic slideshow |
| Stress | Error, reduced motion, reversal | Excluded | Covered by automated tests; not this detail showcase |

## Storyboard

| Frames | State | Camera anchor | Cursor/action | Result/read time |
| --- | --- | --- | --- | --- |
| 0–29 | Open | Whole device, 1.2× | Hidden | Establish, 1 second |
| 30–89 | Open | Factory card, 1.85× | Hidden | Zoom then read, 1 second |
| 90–149 | Open | Right widgets, 1.85× | Hidden | Pan then read, 1 second |
| 150–194 | Open | Whole device, 1.2× | Approach left screen | Settle before drag |
| 195–239 | Folding to book | Whole device | Actual horizontal drag | Stop around 120° |
| 240–269 | Book | Whole device | Release and retreat | Blur settles via existing Blur control |
| 270–344 | Book | Hinge, 1.42× | Hidden | Fixed hinge and clear screens; only camera framing moves |
| 345–374 | Book | Whole device, 1.2× | Approach device | Pull back |
| 375–434 | Closing | Whole device | Actual click, retreat | Production fold transition |
| 435–449 | Closed | Whole device | Hidden | Read cover |
| 450–509 | Opening | Whole device | Actual click, retreat | Production unfold transition |
| 510–539 | Open | Whole device | Hidden | Clean ending |

The book beat uses the production Blur control at zero. It does not claim an automatic resting-mode feature. Hinge progress remains constant during the book detail hold. Camera operations are parent translations and uniform scale only. Rotation control is removed from the demo and the underlying fixed viewing angle is unchanged.

## Assets and rights

Apple model and wallpaper remain separately attributed. Individual app icons came from the iTunes Lookup API; source manifest is `public/app-icons/sources.json`. Factory and widget layouts are original demo artwork. No screenshot-based widget layers are used in this clip. No Apple viewer code or runtime is included. Publication is not authorized by this render request.

## Render evidence

`node scripts/render-showcase.mjs` produced `exports/iphone-duo-demo.mp4`: 540 frames, 1920×1184, 30 fps, 18 seconds, H.264, no audio, 7.55 MB. The capture reported no browser errors or failed requests. `exports/frame-state.json` records every frame. Frames 250–374 hold progress 0.68 and Blur 0. Camera scale and translation change; the viewing angle does not.

`exports/contact-sheet.jpg` samples the final encode every 0.5 seconds. Proofs at 0, 75, 135, 225, 285, 330, 435, and 539 cover the opening, both detail views, drag, book pose, closed state and ending. Inspected the contact sheet and native proof frames. Automated video-analysis playback was unavailable because Gemini access is not configured; normal-speed and quarter-speed human playback review remains pending. Do not describe frame inspection as full playback review.

No lint command is configured in this project. Build and existing Playwright suite are the available checks. No publication or push performed.
