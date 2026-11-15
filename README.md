# Gallery carousel

An infinite React image gallery by [Ilya Fedorov](https://ilyfedorov.com/).

[Interactive demo](https://ilyfedorov.com/ui-components/gallery-carousel/)

Photographs move automatically in an endless ribbon. Hover gently magnifies a photograph and its two immediate neighbors, without adding blur or fading. Click to expand a square crop inline, slide it to the left and freeze the gallery; its neighbors remain in the same ribbon. Click the expanded image again, click outside the gallery or press Escape to collapse it and resume scrolling. No modal or fullscreen overlay is used.

## Playground features

- Seventeen sample files, including two looping muted videos and an animated GIF; captions preserve the exact original filenames and extensions.
- Continuous autoplay, with optional dragging and wheel/trackpad browsing.
- Square image expansion regardless of the source image proportions, with a 14 px caption placed 10 px below the image.
- Sliders, segmented switches and collapsible Layout, Focus And Depth, and Motion sections.
- A right settings panel that overlays the gallery without resizing it, with a 32 px backdrop blur and a translucent surface in both themes.
- A fixed Settings header and close button above the scrollable controls, followed by one divider and Layout; the version picker and parameter-copy button are hidden.
- Text-only gray Back, GitHub, Dark theme / Light theme, Settings and Reset buttons, with Helvetica Neue Medium, 12 px corners and a subtle press scale effect.
- Back links to the [UI Components collection](https://ilyfedorov.com/ui-components/). Reset restores all playground defaults.
- Responsive layout, keyboard controls and reduced-motion support.

## Run the playground

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

For production: `npm run build`, then `npm run preview`.

## Use the component

Copy `src/GalleryCarousel.tsx` and `src/gallery-carousel.css` into a React project. The carousel itself only needs React. Its styles are imported by the component. Install the playground dependencies with `npm ci`.

```tsx
import { GalleryCarousel } from './GalleryCarousel';

const images = [
  { src: '/photos/one.jpg', alt: 'A mountain lake', caption: 'Morning by the lake' },
  { src: '/photos/two.jpg', alt: 'A forest path', caption: 'Into the forest' },
  { src: '/photos/three.jpg', alt: 'Waves at sunset', caption: 'The coast' },
];

export function Gallery() {
  return <div style={{ height: 560 }}>
    <GalleryCarousel
      images={images}
      settings={{ size: 156, hoverScale: 1.12, gap: 10, blur: 5 }}
    />
  </div>;
}
```

Give the parent a height. Allow at least `2 × size × max(2.05, hoverScale) / aspectRatio − size / aspectRatio + 48` pixels so enlarged images fit above the shared bottom baseline. The demo adjusts its height automatically.

`images` accepts `{ src, alt, caption?, type? }` objects. Set `type: 'video'` for a video; videos autoplay muted, loop and play inline, with the same hover and square expansion behavior as images. The default type is an image. Replace them with your own files. `settings` is a partial `GalleryCarouselSettings` object. Image buttons expand inline within the carousel. The selected image always uses a square crop, regardless of its source aspect ratio, and moves to a 28 px left inset (16 px on narrow screens). The gallery pauses until the image is collapsed. The expanded height is 2.05 times the base height, constrained to fit the available width.

## Settings

| Setting | Default | Meaning |
| --- | --- | --- |
| `size` | `156` | Resting image width, px |
| `aspectRatio` | `1` | Width divided by height |
| `gap` | `10` | Space between images, px |
| `radius` | `5` | Corner radius, px |
| `hoverScale` | `1.12` | Focused image magnification |
| `neighborScale` | `1.05` | Immediate neighbor magnification |
| `blur` | `5` | Maximum distance blur while expanded, px |
| `falloff` | `5` | Focus falloff in resting card widths |
| `minOpacity` | `0.12` | Opacity at the far end of falloff |
| `edgeFade` | `100` | Fade width at viewport edges, px |
| `tilt` | `0` | Maximum pointer tilt, degrees |
| `lift` | `0` | Additional upward movement on hover, px |
| `stiffness` | `230` | Magnification spring stiffness |
| `damping` | `25` | Magnification spring damping |
| `friction` | `0.9` | Momentum retained per 60 Hz frame |
| `wheelSpeed` | `1` | Wheel/trackpad sensitivity |
| `dragSpeed` | `1` | Drag sensitivity |
| `autoplay` | `true` | Continuous automatic scrolling |
| `autoplaySpeed` | `26` | Autoplay speed, px/s |
| `reverse` | `false` | Reverse autoplay direction |
| `pauseOnHover` | `false` | Pause autoplay while pointer is inside |
| `draggable` | `true` | Enable pointer/touch dragging |
| `wheel` | `true` | Enable wheel/trackpad browsing |
| `captions` | `true` | Show the focused image caption |

The demo additionally controls the sample image count (4–17), theme and Settings visibility. Alignment is fixed to the shared bottom baseline. Pointer Tilt, Hover Lift and the Interaction section are not exposed in the playground; the reusable component still accepts `tilt`, `lift`, `draggable` and `wheel` through its API. Drag and wheel browsing remain enabled by default. Reset restores settings, theme, sample count and gallery position.

## Keyboard and motion

- Tab focuses the gallery and visible images. Enter/Space expands or collapses an image inline.
- Left/Right arrows browse; Home returns to the beginning. Navigation is frozen while an image is expanded.
- Escape collapses the expanded image or closes the settings drawer.
- Native pinch zoom and vertical touch scrolling are preserved.
- `prefers-reduced-motion` disables autoplay and spring magnification.
- Animation work pauses when the gallery is outside the viewport or the document is hidden.
