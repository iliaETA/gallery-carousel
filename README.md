# Gallery carousel

An infinite React image gallery by [Ilya Fedorov](https://ilyfedorov.com/).

[Interactive demo](https://ilyfedorov.com/ui-components/gallery-carousel/)

Hover to magnify a photograph as its neighbors fade into the distance. Drag or scroll to explore an endless ribbon with spring motion and momentum. The demo includes a vertical settings drawer on the right, light/dark themes, image expansion and Reset.

## Run the playground

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

For production: `npm run build`, then `npm run preview`.

## Use the component

Copy `src/GalleryCarousel.tsx` and `src/gallery-carousel.css` into a React project. Only React is required. Styles are imported by the component; no animation or UI library is needed.

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
      settings={{ size: 156, hoverScale: 2.05, gap: 10, blur: 5 }}
      onImageSelect={(image, index) => console.log(image, index)}
    />
  </div>;
}
```

Give the parent a height. For bottom/top alignment, allow at least `2 × size × hoverScale / aspectRatio − size / aspectRatio + 48` pixels so enlarged images fit. For center alignment, `size × hoverScale / aspectRatio + 48` is sufficient. The demo adjusts its height automatically.

`images` accepts `{ src, alt, caption? }` objects. Replace them with your own files. `settings` is a partial `GalleryCarouselSettings` object; `onImageSelect` is an optional callback. Fullscreen viewing is implemented in the demo so consuming applications can choose their own behavior.

## Settings

| Setting | Default | Meaning |
| --- | --- | --- |
| `size` | `156` | Resting image width, px |
| `aspectRatio` | `1` | Width divided by height |
| `gap` | `10` | Space between images, px |
| `radius` | `5` | Corner radius, px |
| `hoverScale` | `2.05` | Focused image magnification |
| `neighborScale` | `1` | Immediate neighbor magnification |
| `alignment` | `'bottom'` | `'bottom'`, `'center'` or `'top'` |
| `blur` | `5` | Maximum distance blur, px |
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
| `autoplay` | `false` | Continuous automatic scrolling |
| `autoplaySpeed` | `26` | Autoplay speed, px/s |
| `reverse` | `false` | Reverse autoplay direction |
| `pauseOnHover` | `true` | Pause autoplay while pointer is inside |
| `draggable` | `true` | Enable pointer/touch dragging |
| `wheel` | `true` | Enable wheel/trackpad browsing |
| `captions` | `true` | Show the focused image caption |
| `expandOnClick` | `true` | Enable image-selection callback |

The demo additionally controls the sample image count (4–12), theme and Settings visibility. Reset restores settings, theme, sample count and gallery position.

## Keyboard and motion

- Tab focuses visible images; Enter activates the image-selection callback.
- Left/Right arrows browse; Home returns to the beginning.
- Escape closes the demo image viewer or settings drawer.
- Native pinch zoom and vertical touch scrolling are preserved.
- `prefers-reduced-motion` disables autoplay and spring magnification.
- Animation work pauses when the gallery is outside the viewport or the document is hidden.

## Credits

An independently written interaction study inspired by [Nick Pyl's gallery](https://nickpyl.space/). Playground controls were inspired by [Misha Naer's Matrix demo](https://mishanaer.com/ui/matrix). No code or media from those sites is included.

Code: [MIT](LICENSE). Temporary photographs are from [Unsplash](https://unsplash.com/) and retain their [Unsplash license](https://unsplash.com/license); see [sources](public/assets/gallery-carousel/sources.json). They are placeholders and are not part of the component API.
