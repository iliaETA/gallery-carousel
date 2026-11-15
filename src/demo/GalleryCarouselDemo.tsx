import { useEffect, useRef, useState } from 'react';
import { DialRoot, useDialKitController, type DialConfig } from 'dialkit';
import 'dialkit/styles.css';
import { GalleryCarousel, defaultGallerySettings, type GalleryCarouselSettings, type GalleryImage } from '../GalleryCarousel';
import './gallery-demo.css';

const repository = 'https://github.com/iliaETA/gallery-carousel';
const photos = [
  [1015, 'River through the mountains'], [1016, 'Across the valley'], [1018, 'A quiet landscape'],
  [1020, 'In the forest'], [1035, 'The waterfall'], [1039, 'Mountain light'],
  [1040, 'Somewhere in Europe'], [1043, 'Along the coast'], [1050, 'By the water'],
  [1057, 'A different perspective'], [1067, 'City stories'], [1074, 'Into the wild'],
] as const;
export const demoGalleryImages: GalleryImage[] = photos.map(([id, caption]) => ({ src: `/assets/gallery-carousel/${id}.jpg`, alt: caption, caption }));

const d = defaultGallerySettings;
const galleryDialConfig = {
  layout: {
    cardSize: [d.size, 80, 240, 1],
    aspectRatio: [d.aspectRatio, .65, 1.6, .05],
    gap: [d.gap, 0, 40, 1],
    cornerRadius: [d.radius, 0, 40, 1],
    imageCount: [12, 4, 12, 1],
    showCaptions: d.captions,
  },
  focusAndDepth: {
    hoverScale: [d.hoverScale, 1, 3, .01],
    neighborScale: [d.neighborScale, 1, 1.5, .01],
    distanceBlur: [d.blur, 0, 16, .5],
    focusRange: [d.falloff, 1, 8, .25],
    minimumOpacity: [d.minOpacity, 0, 1, .01],
    edgeFade: [d.edgeFade, 0, 240, 5],
    pointerTilt: [d.tilt, 0, 12, .5],
    hoverLift: [d.lift, 0, 40, 1],
  },
  motion: {
    springStiffness: [d.stiffness, 80, 500, 5],
    springDamping: [d.damping, 10, 50, 1],
    momentum: [d.friction, .6, .98, .01],
    scrollSensitivity: [d.wheelSpeed, .2, 3, .1],
    dragSensitivity: [d.dragSpeed, .5, 2, .1],
    autoplaySpeed: [d.autoplaySpeed, 5, 100, 1],
    autoplay: d.autoplay,
    reverseDirection: d.reverse,
    pauseAutoplayOnHover: d.pauseOnHover,
  },
  interaction: {
    dragToBrowse: d.draggable,
    scrollToBrowse: d.wheel,
  },
  resetAll: { type: 'action', label: 'Reset all' },
} satisfies DialConfig;

export function GalleryCarouselDemo() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [revision, setRevision] = useState(0);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const resetAction = useRef<() => void>(() => {});
  const dial = useDialKitController('Settings', galleryDialConfig, {
    id: 'gallery-carousel-settings',
    persist: false,
    onAction: action => { if (action === 'resetAll') resetAction.current(); },
  });
  const values = dial.values;
  const settings: GalleryCarouselSettings = {
    ...d,
    size: values.layout.cardSize,
    aspectRatio: values.layout.aspectRatio,
    gap: values.layout.gap,
    radius: values.layout.cornerRadius,
    captions: values.layout.showCaptions,
    hoverScale: values.focusAndDepth.hoverScale,
    neighborScale: values.focusAndDepth.neighborScale,
    blur: values.focusAndDepth.distanceBlur,
    falloff: values.focusAndDepth.focusRange,
    minOpacity: values.focusAndDepth.minimumOpacity,
    edgeFade: values.focusAndDepth.edgeFade,
    tilt: values.focusAndDepth.pointerTilt,
    lift: values.focusAndDepth.hoverLift,
    stiffness: values.motion.springStiffness,
    damping: values.motion.springDamping,
    friction: values.motion.momentum,
    wheelSpeed: values.motion.scrollSensitivity,
    dragSpeed: values.motion.dragSensitivity,
    autoplaySpeed: values.motion.autoplaySpeed,
    autoplay: values.motion.autoplay,
    reverse: values.motion.reverseDirection,
    pauseOnHover: values.motion.pauseAutoplayOnHover,
    draggable: values.interaction.dragToBrowse,
    wheel: values.interaction.scrollToBrowse,
  };
  const reset = () => {
    dial.resetValues();
    setRevision(value => value + 1);
    setDark(false);
  };
  resetAction.current = reset;
  const closeSettings = () => {
    setSettingsOpen(false);
    settingsButton.current?.focus();
  };

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && settingsOpen) {
        setSettingsOpen(false);
        settingsButton.current?.focus();
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [settingsOpen]);

  return <div className={`gallery-demo ${dark ? 'gd-dark' : ''}`} data-settings={settingsOpen || undefined}>
    <header className="gd-header">
      <nav className="gd-toolbar" aria-label="Demo controls">
        <a className="gd-button gd-github" href={repository} target="_blank" rel="noreferrer">GitHub</a>
        <button className="gd-button" onClick={() => setDark(value => !value)}>{dark ? 'Light theme' : 'Dark theme'}</button>
        <button ref={settingsButton} className="gd-button" onClick={() => { dial.setOpen(true); setSettingsOpen(value => !value); }} aria-expanded={settingsOpen} aria-controls="gallery-settings">Settings</button>
        <button className="gd-button" onClick={reset}>Reset</button>
      </nav>
    </header>
    <main className="gd-main" aria-label="Gallery carousel">
      <div className="gd-gallery-stage" style={{ minHeight: `${Math.max(380, settings.size * (2 * Math.max(2.05, settings.hoverScale) - 1) / settings.aspectRatio + 48)}px` }}>
        <GalleryCarousel key={revision} images={demoGalleryImages.slice(0, values.layout.imageCount)} settings={settings} />
      </div>
    </main>
    <button className="gd-shade" tabIndex={-1} aria-hidden="true" onClick={closeSettings} />
    <aside id="gallery-settings" className="gd-settings" aria-label="Gallery settings" inert={!settingsOpen}>
      <button className="gd-settings-close" aria-label="Close settings" onClick={closeSettings}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>
      <div className="gd-settings-scroll">
        <DialRoot mode="inline" theme={dark ? 'dark' : 'light'} productionEnabled versions="menu" />
      </div>
    </aside>
  </div>;
}
