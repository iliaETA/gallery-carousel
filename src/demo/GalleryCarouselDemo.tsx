import { useEffect, useRef, useState } from 'react';
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

type NumberKey = { [K in keyof GalleryCarouselSettings]: GalleryCarouselSettings[K] extends number ? K : never }[keyof GalleryCarouselSettings];
type BooleanKey = { [K in keyof GalleryCarouselSettings]: GalleryCarouselSettings[K] extends boolean ? K : never }[keyof GalleryCarouselSettings];
type SliderDefinition = { key: NumberKey; label: string; min: number; max: number; step: number; unit?: string };
const layout: SliderDefinition[] = [
  { key: 'size', label: 'Card size', min: 80, max: 240, step: 1, unit: 'px' },
  { key: 'aspectRatio', label: 'Aspect ratio', min: .65, max: 1.6, step: .05, unit: ':1' },
  { key: 'gap', label: 'Gap', min: 0, max: 40, step: 1, unit: 'px' },
  { key: 'radius', label: 'Corner radius', min: 0, max: 40, step: 1, unit: 'px' },
];
const focus: SliderDefinition[] = [
  { key: 'hoverScale', label: 'Hover scale', min: 1, max: 3, step: .05, unit: '×' },
  { key: 'neighborScale', label: 'Neighbor scale', min: 1, max: 1.5, step: .05, unit: '×' },
  { key: 'blur', label: 'Distance blur', min: 0, max: 16, step: .5, unit: 'px' },
  { key: 'falloff', label: 'Focus range', min: 1, max: 8, step: .25, unit: 'cards' },
  { key: 'minOpacity', label: 'Minimum opacity', min: 0, max: 1, step: .01 },
  { key: 'edgeFade', label: 'Edge fade', min: 0, max: 240, step: 5, unit: 'px' },
  { key: 'tilt', label: 'Pointer tilt', min: 0, max: 12, step: .5, unit: '°' },
  { key: 'lift', label: 'Hover lift', min: 0, max: 40, step: 1, unit: 'px' },
];
const motion: SliderDefinition[] = [
  { key: 'stiffness', label: 'Spring stiffness', min: 80, max: 500, step: 5 },
  { key: 'damping', label: 'Spring damping', min: 10, max: 50, step: 1 },
  { key: 'friction', label: 'Momentum', min: .6, max: .98, step: .01 },
  { key: 'wheelSpeed', label: 'Scroll sensitivity', min: .2, max: 3, step: .1, unit: '×' },
  { key: 'dragSpeed', label: 'Drag sensitivity', min: .5, max: 2, step: .1, unit: '×' },
  { key: 'autoplaySpeed', label: 'Autoplay speed', min: 5, max: 100, step: 1, unit: 'px/s' },
];

function Icon({ name }: { name: 'close' | 'sun' | 'moon' }) {
  const paths = {
    close: <path d="m6 6 12 12M18 6 6 18" />,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1"/></>,
    moon: <path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z" />,
  };
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function GalleryCarouselDemo() {
  const [settings, setSettings] = useState<GalleryCarouselSettings>({ ...defaultGallerySettings });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [imageCount, setImageCount] = useState(12);
  const [revision, setRevision] = useState(0);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const update = <K extends keyof GalleryCarouselSettings>(key: K, value: GalleryCarouselSettings[K]) => setSettings(current => ({ ...current, [key]: value }));
  const reset = () => {
    setSettings({ ...defaultGallerySettings }); setImageCount(12); setRevision(value => value + 1); setDark(false);
  };

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && settingsOpen) { setSettingsOpen(false); settingsButton.current?.focus(); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [settingsOpen]);
  const slider = (definition: SliderDefinition) => <label className="gd-control" key={definition.key}>
    <span className="gd-control-top"><span>{definition.label}</span><output>{settings[definition.key].toLocaleString('en-US', { maximumFractionDigits: 2 })}{definition.unit ? ` ${definition.unit}` : ''}</output></span>
    <input type="range" aria-label={definition.label} min={definition.min} max={definition.max} step={definition.step} value={settings[definition.key]} onChange={event => update(definition.key, Number(event.target.value))} />
  </label>;
  const toggle = (key: BooleanKey, label: string) => <label className="gd-toggle" key={key}><span>{label}</span><input type="checkbox" role="switch" checked={settings[key]} onChange={event => update(key, event.target.checked)} /><span className="gd-switch" aria-hidden="true" /></label>;

  return <div className={`gallery-demo ${dark ? 'gd-dark' : ''}`} data-settings={settingsOpen || undefined}>
    <header className="gd-header">
      <nav className="gd-toolbar" aria-label="Demo controls">
        <a className="gd-button gd-github" href={repository} target="_blank" rel="noreferrer">GitHub</a>
        <button className="gd-button gd-theme" onClick={() => setDark(value => !value)} aria-label={dark ? 'Light theme' : 'Dark theme'}><Icon name={dark ? 'sun' : 'moon'} /></button>
        <button ref={settingsButton} className="gd-button" onClick={() => setSettingsOpen(value => !value)} aria-expanded={settingsOpen} aria-controls="gallery-settings">Settings</button>
        <button className="gd-button" onClick={reset}>Reset</button>
      </nav>
    </header>
    <main className="gd-main" aria-label="Gallery carousel">
      <div className="gd-gallery-stage" style={{ minHeight: `${Math.max(380, (settings.alignment === 'center' ? settings.size * Math.max(2.05, settings.hoverScale) : settings.size * (2 * Math.max(2.05, settings.hoverScale) - 1)) / settings.aspectRatio + 48)}px` }}>
        <GalleryCarousel key={revision} images={demoGalleryImages.slice(0, imageCount)} settings={settings} />
      </div>
    </main>
    <button className="gd-shade" tabIndex={-1} aria-hidden="true" onClick={() => setSettingsOpen(false)} />
    <aside id="gallery-settings" className="gd-settings" aria-label="Gallery settings" inert={!settingsOpen}>
      <div className="gd-settings-heading"><div><h2>Settings</h2><p>Make it move your way.</p></div><button className="gd-icon-button" aria-label="Close settings" onClick={() => { setSettingsOpen(false); settingsButton.current?.focus(); }}><Icon name="close" /></button></div>
      <div className="gd-settings-scroll">
        <fieldset><legend>Layout</legend>{layout.map(slider)}
          <label className="gd-select"><span>Alignment</span><select value={settings.alignment} onChange={event => update('alignment', event.target.value as GalleryCarouselSettings['alignment'])}><option value="bottom">Bottom</option><option value="center">Center</option><option value="top">Top</option></select></label>
          <label className="gd-control"><span className="gd-control-top"><span>Image count</span><output>{imageCount}</output></span><input aria-label="Image count" type="range" min="4" max="12" step="1" value={imageCount} onChange={event => setImageCount(Number(event.target.value))} /></label>
          {toggle('captions', 'Show captions')}
        </fieldset>
        <fieldset><legend>Focus & depth</legend>{focus.map(slider)}</fieldset>
        <fieldset><legend>Motion</legend>{motion.map(slider)}{toggle('autoplay', 'Autoplay')}{toggle('reverse', 'Reverse direction')}{toggle('pauseOnHover', 'Pause autoplay on hover')}</fieldset>
        <fieldset><legend>Interaction</legend>{toggle('draggable', 'Drag to browse')}{toggle('wheel', 'Scroll to browse')}<p className="gd-setting-note">Arrow keys browse the gallery. Home returns to the beginning. Reduced motion follows your device preference.</p></fieldset>
      </div>
      <div className="gd-settings-footer"><span>Changes apply instantly</span><button onClick={reset}>Reset all</button></div>
    </aside>

  </div>;
}
