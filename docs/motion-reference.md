# Fold reference study

Reference supplied by Justin:
https://video.twimg.com/amplify_video/2097782703810916352/vid/avc1/2160x3840/8dHmKNa3F7eY2Mzu.mp4?tag=29

The clip is 19.92 seconds at 30 fps. Reviewed the opening from 2.5–6.5 seconds and closing from 6.5–10.5 seconds, then consecutive frames from 4.9–5.3 seconds for the final focus transition.

## Observations

- The exposed right-side grid and dock remain readable while the left side unfolds.
- Left-side widgets remain blurred when the hardware is almost flat. Their right edges become readable before their outer-left edges.
- During closing, cover-screen content near the left edge becomes readable before content near the right edge.
- Camera movement, reflections, and the operator's hand obscure exact screen-space measurements. The clip does not establish Apple's shader parameters or easing curves.

## Implementation

`src/iphone-duo/fold-choreography.ts` defines reversible phases for the hinge, cover focus boundary, incoming panel, and inner focus boundary. The shader moves the focus boundary across the display instead of reducing the whole panel's blur uniformly.

Inner-screen app content is stationary. Screen content is projected onto a virtual plane during folding. Cover projection uses its own left and right anchors. These parameters are visual approximations, not recovered Apple values. The demo uses API-sourced app icons and the Mastra Factory card.

## Verification

The 17-test Playwright suite passes. The late-settling screenshot test checks that the left card changes between progress 0.87 and 1 while a right-grid crop remains pixel-identical. Separate tests check phase ordering, continuous reversal, dragging, keyboard operation, reduced motion, and loading failure.

Agent Browser verified fold and unfold at `http://127.0.0.1:5201/`. The component accessibility audit reported zero violations and zero incomplete checks. No browser errors were reported. Visual comparison is still required for fidelity; passing tests does not establish a pixel-exact match to the reference.

## Bezel geometry

The model conversion closes the cut chassis boundaries and builds a continuous inner bezel from the display outline. The perimeter uses a uniform offset and a smooth, opaque dielectric material. Local reference screenshots and experimental source-material variants are excluded from publication.
