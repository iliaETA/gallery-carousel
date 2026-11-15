import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './gallery-carousel.css';

export type GalleryImage = { src: string; alt: string; caption?: string; type?: 'image' | 'video' };
export type GalleryCarouselSettings = {
  size: number; aspectRatio: number; gap: number; radius: number;
  hoverScale: number; neighborScale: number;
  blur: number; falloff: number; minOpacity: number; edgeFade: number; tilt: number; lift: number;
  stiffness: number; damping: number; friction: number; wheelSpeed: number; dragSpeed: number;
  autoplay: boolean; autoplaySpeed: number; reverse: boolean; pauseOnHover: boolean;
  draggable: boolean; wheel: boolean; captions: boolean;
};

export const defaultGallerySettings: GalleryCarouselSettings = {
  size: 156, aspectRatio: 1, gap: 10, radius: 5,
  hoverScale: 1.12, neighborScale: 1.05,
  blur: 5, falloff: 5, minOpacity: .12, edgeFade: 100, tilt: 0, lift: 0,
  stiffness: 230, damping: 25, friction: .9, wheelSpeed: 1, dragSpeed: 1,
  autoplay: true, autoplaySpeed: 26, reverse: false, pauseOnHover: false,
  draggable: true, wheel: true, captions: true,
};

export type GalleryCarouselProps = {
  images: GalleryImage[];
  settings?: Partial<GalleryCarouselSettings>;
  className?: string;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const wrap = (value: number, period: number) => ((value % period) + period) % period;

/** Infinite, inertial gallery. No animation library or remote runtime dependencies. */
export function GalleryCarousel({ images, settings, className = '' }: GalleryCarouselProps) {
  const root = useRef<HTMLDivElement>(null);
  const latest = useRef({ settings });
  latest.current = { settings };
  const count = images.length;
  const [copies, setCopies] = useState(3);

  useEffect(() => {
    const element = root.current;
    if (!element || !count) return;
    const items = Array.from(element.querySelectorAll<HTMLButtonElement>('.gc-item'));
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const values = Array(count).fill(defaultGallerySettings.size) as number[];
    const speeds = Array(count).fill(0) as number[];
    const heights = Array(count).fill(defaultGallerySettings.size) as number[];
    const heightSpeeds = Array(count).fill(0) as number[];
    let width = element.clientWidth;
    let height = element.clientHeight;
    let active = -1;
    let selected = -1;
    let selectedCycle = 1;
    let closing = -1;
    let closingCycle = 1;
    let selectionVelocity = 0;
    let suppressClick = false;
    let pointerInside = false;
    let pointerX = width / 2;
    let offset = 0;
    let velocity = 0;
    let initialized = false;
    let dragging = false;
    let dragPointer = -1;
    let lastX = 0;
    let dragged = 0;
    let frame = 0;
    let previous = 0;
    let disposed = false;
    let visible = !document.hidden;
    let onScreen = true;
    let lastMovement = 0;
    const config = () => ({ ...defaultGallerySettings, ...latest.current.settings });

    const resize = new ResizeObserver(() => {
      const nextWidth = element.clientWidth;
      offset += (width - nextWidth) / 2;
      width = nextWidth;
      height = element.clientHeight;
      setCopies(Math.max(3, Math.ceil(width / (Math.max(count, 1) * 48)) + 3));
    });
    resize.observe(element);

    const animate = (time: number) => {
      if (disposed) return;
      const dt = clamp((time - previous) / 1000 || 1 / 60, .001, 1 / 30);
      previous = time;
      if (visible && onScreen) {
        const s = config();
        const size = clamp(s.size, 48, 320);
        const gap = clamp(s.gap, 0, 80);
        const ratio = clamp(s.aspectRatio, .5, 2);
        const oldPeriod = values.reduce((sum, value) => sum + value + gap, 0);
        if (!initialized) {
          values.fill(size);
          heights.fill(size / ratio);
          offset = count * (size + gap) + Math.floor(count / 3) * (size + gap) - width / 2 + size / 2;
          initialized = true;
        }
        // Preserve the current anchor as widths spring toward their new sizes.
        const oldPrefix = active < 0 ? 0 : values.slice(0, active).reduce((sum, value) => sum + value + gap, 0);
        const activeCycle = active < 0 ? 1 : Math.round((offset + pointerX - oldPrefix - values[active] / 2) / oldPeriod);
        const oldAnchor = active < 0 ? 0 : activeCycle * oldPeriod + oldPrefix + values[active] / 2 - offset;
        const oldSelectedPrefix = selected < 0 ? 0 : values.slice(0, selected).reduce((sum, value) => sum + value + gap, 0);
        const oldSelectedLeft = selected < 0 ? 0 : selectedCycle * oldPeriod + oldSelectedPrefix - offset;
        const oldClosingPrefix = closing < 0 ? 0 : values.slice(0, closing).reduce((sum, value) => sum + value + gap, 0);
        const oldClosingLeft = closing < 0 ? 0 : closingCycle * oldPeriod + oldClosingPrefix - offset;
        const inset = width < 600 ? 16 : 28;
        for (let i = 0; i < count; i++) {
          const distance = active < 0 ? Infinity : Math.min(wrap(i - active, count), wrap(active - i, count));
          const scale = distance === 0 ? clamp(s.hoverScale, 1, 3) : distance === 1 ? clamp(s.neighborScale, 1, 1.5) : 1;
          const expandedHeight = size / ratio * Math.max(2.05, s.hoverScale);
          const target = i === selected ? Math.min(expandedHeight, width - inset * 2) : size * scale;
          const targetHeight = i === selected ? target : target / ratio;
          if (media.matches) { values[i] = target; heights[i] = targetHeight; speeds[i] = 0; heightSpeeds[i] = 0; }
          else {
            // Substeps keep the spring stable at low display frame rates.
            for (let step = 0; step < 2; step++) {
              speeds[i] += ((target - values[i]) * clamp(s.stiffness, 60, 500) - speeds[i] * clamp(s.damping, 10, 50)) * dt / 2;
              values[i] += speeds[i] * dt / 2;
              heightSpeeds[i] += ((targetHeight - heights[i]) * clamp(s.stiffness, 60, 500) - heightSpeeds[i] * clamp(s.damping, 10, 50)) * dt / 2;
              heights[i] += heightSpeeds[i] * dt / 2;
            }
            values[i] = Math.max(1, values[i]);
            heights[i] = Math.max(1, heights[i]);
          }
        }
        const period = values.reduce((sum, value) => sum + value + gap, 0);
        if (selected >= 0) {
          const prefix = values.slice(0, selected).reduce((sum, value) => sum + value + gap, 0);
          offset = selectedCycle * period + prefix - oldSelectedLeft;
          const targetOffset = selectedCycle * period + prefix - inset;
          if (media.matches) { offset = targetOffset; selectionVelocity = 0; }
          else for (let step = 0; step < 2; step++) {
            selectionVelocity += ((targetOffset - offset) * clamp(s.stiffness, 60, 500) - selectionVelocity * clamp(s.damping, 10, 50)) * dt / 2;
            offset += selectionVelocity * dt / 2;
          }
        } else if (closing >= 0) {
          const prefix = values.slice(0, closing).reduce((sum, value) => sum + value + gap, 0);
          offset = closingCycle * period + prefix - oldClosingLeft;
          if (Math.abs(speeds[closing]) < .1 && Math.abs(heightSpeeds[closing]) < .1) closing = -1;
        } else if (active >= 0) {
          const prefix = values.slice(0, active).reduce((sum, value) => sum + value + gap, 0);
          offset = activeCycle * period + prefix + values[active] / 2 - oldAnchor;
        }
        if (!dragging && selected < 0) {
          offset += velocity * dt * 60;
          velocity *= Math.pow(clamp(s.friction, .5, .98), dt * 60);
          if (Math.abs(velocity) < .01) velocity = 0;
          if (s.autoplay && !media.matches && !(s.pauseOnHover && pointerInside)) {
            offset += clamp(s.autoplaySpeed, 0, 120) * dt * (s.reverse ? -1 : 1);
          }
        }
        const normalized = wrap(offset, period) + period;
        if (selected >= 0) selectedCycle += Math.round((normalized - offset) / period);
        if (closing >= 0) closingCycle += Math.round((normalized - offset) / period);
        offset = normalized;
        let prefix = 0;
        const activePrefix = active < 0 ? 0 : values.slice(0, active).reduce((sum, value) => sum + value + gap, 0);
        const anchorCycle = active < 0 ? 1 : Math.round((offset + pointerX - activePrefix - values[active] / 2) / period);
        const selectedPrefix = selected < 0 ? 0 : values.slice(0, selected).reduce((sum, value) => sum + value + gap, 0);
        const selectedLeft = selected < 0 ? 0 : selectedCycle * period + selectedPrefix - offset;
        const anchorX = selected >= 0 ? selectedLeft + values[selected] / 2 : active < 0 ? width / 2 : anchorCycle * period + activePrefix + values[active] / 2 - offset;
        for (let copy = 0; copy < copies; copy++) {
          prefix = 0;
          for (let i = 0; i < count; i++) {
            const item = items[copy * count + i];
            const itemWidth = values[i];
            const itemHeight = heights[i];
            const x = copy * period + prefix - offset;
            const isSelected = selected === i && selectedCycle === copy;
            const isActive = i === active && selected < 0;
            const distance = selected >= 0
              ? Math.max(0, (x - selectedLeft - values[selected]) / (size + gap))
              : Math.abs(x + itemWidth / 2 - anchorX) / (size + gap);
            const falloff = selected < 0 ? 0 : clamp(distance / Math.max(s.falloff, 1), 0, 1);
            const opacity = 1 - falloff * (1 - clamp(s.minOpacity, 0, 1));
            const baseline = (height + size / ratio) / 2;
            const y = baseline - itemHeight;
            const inView = x + itemWidth > -60 && x < width + 60;
            item.style.width = `${itemWidth}px`;
            item.style.height = `${itemHeight}px`;
            item.style.transform = `translate3d(${x}px,${y - (isActive ? s.lift : 0)}px,0) rotate(${isActive ? clamp((pointerX - anchorX) / size, -1, 1) * s.tilt : 0}deg)`;
            item.style.opacity = `${isSelected ? 1 : opacity}`;
            item.style.filter = `blur(${isSelected ? 0 : falloff * clamp(s.blur, 0, 20)}px)`;
            item.style.visibility = inView ? 'visible' : 'hidden';
            item.style.zIndex = isSelected ? '3' : isActive ? '2' : '1';
            item.dataset.hovered = String(isActive && inView);
            item.dataset.selected = String(isSelected);
            item.tabIndex = inView ? 0 : -1;
            item.setAttribute('aria-expanded', String(isSelected));
            item.setAttribute('aria-hidden', String(!inView));
            prefix += itemWidth + gap;
          }
        }
      }
      frame = requestAnimationFrame(animate);
    };

    const itemFrom = (target: EventTarget | null) => target instanceof Element ? target.closest<HTMLButtonElement>('.gc-item') : null;
    const onMove = (event: PointerEvent) => {
      if (selected >= 0) return;
      pointerX = event.clientX - element.getBoundingClientRect().left;
      if (dragging && event.pointerId === dragPointer) {
        const delta = (lastX - event.clientX) * config().dragSpeed;
        offset += delta;
        velocity = delta;
        dragged += Math.abs(lastX - event.clientX);
        lastX = event.clientX;
        lastMovement = performance.now();
        if (dragged > 5) {
          active = -1; suppressClick = true;
          if (!element.hasPointerCapture(event.pointerId)) element.setPointerCapture(event.pointerId);
        }
      } else if (event.pointerType === 'mouse') {
        const item = itemFrom(event.target);
        active = item ? Number(item.dataset.index) : -1;
      }
    };
    const onOver = (event: PointerEvent) => {
      pointerInside = true;
      if (selected < 0 && event.pointerType === 'mouse' && !dragging) {
        const item = itemFrom(event.target);
        active = item ? Number(item.dataset.index) : -1;
        pointerX = event.clientX - element.getBoundingClientRect().left;
      }
    };
    const onLeave = () => { if (!dragging) { active = -1; pointerInside = false; } };
    const onDown = (event: PointerEvent) => {
      suppressClick = false;
      if (selected >= 0 || !config().draggable || event.button !== 0) return;
      dragging = true; dragPointer = event.pointerId; lastX = event.clientX; dragged = 0; velocity = 0;
      element.dataset.dragging = 'true';
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== dragPointer) return;
      dragging = false; dragPointer = -1;
      if (performance.now() - lastMovement > 100 || media.matches) velocity = 0;
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
      delete element.dataset.dragging;
      if (event.pointerType !== 'mouse') active = -1;
    };
    const cancelDrag = () => { if (!dragging) return; dragging = false; dragPointer = -1; velocity = 0; active = -1; delete element.dataset.dragging; };
    const onWheel = (event: WheelEvent) => {
      if (!config().wheel || event.ctrlKey) return;
      event.preventDefault();
      if (selected >= 0) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? width : 1;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      velocity += clamp(delta * unit * config().wheelSpeed, -160, 160) * .22;
      velocity = clamp(velocity, -100, 100);
      active = -1;
    };
    const collapse = () => {
      closing = selected; closingCycle = selectedCycle;
      selected = -1; active = -1; selectionVelocity = 0; velocity = 0;
      delete element.dataset.expanded;
    };
    const onClick = (event: MouseEvent) => {
      if (suppressClick) { suppressClick = false; return; }
      const item = itemFrom(event.target);
      if (!item) { if (selected >= 0) collapse(); return; }
      const index = Number(item.dataset.index);
      if (selected === index) { collapse(); return; }
      selected = index; closing = -1;
      selectedCycle = Math.floor(items.indexOf(item) / count);
      active = -1; velocity = 0; selectionVelocity = 0;
      element.dataset.expanded = 'true';
    };
    const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape' && selected >= 0) collapse(); };
    const onOutside = (event: PointerEvent) => { if (selected >= 0 && event.target instanceof Node && !element.contains(event.target)) collapse(); };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home') return;
      event.preventDefault();
      if (selected >= 0) return;
      active = -1;
      if (event.key === 'Home') { initialized = false; velocity = 0; }
      else velocity = (config().size + config().gap) * .14 * (event.key === 'ArrowLeft' ? -1 : 1);
    };
    const visibility = () => { visible = !document.hidden; previous = performance.now(); };
    const observer = new IntersectionObserver(entries => { onScreen = entries[0].isIntersecting; });
    observer.observe(element);
    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerover', onOver);
    element.addEventListener('pointerleave', onLeave);
    element.addEventListener('pointerdown', onDown);
    element.addEventListener('pointerup', onUp);
    element.addEventListener('pointercancel', cancelDrag);
    element.addEventListener('lostpointercapture', cancelDrag);
    element.addEventListener('wheel', onWheel, { passive: false });
    element.addEventListener('keydown', onKey);
    element.addEventListener('click', onClick);
    document.addEventListener('keydown', onEscape);
    document.addEventListener('pointerdown', onOutside);
    document.addEventListener('visibilitychange', visibility);
    frame = requestAnimationFrame(animate);
    return () => {
      disposed = true; cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect();
      element.removeEventListener('pointermove', onMove); element.removeEventListener('pointerover', onOver);
      element.removeEventListener('pointerleave', onLeave); element.removeEventListener('pointerdown', onDown);
      element.removeEventListener('pointerup', onUp); element.removeEventListener('pointercancel', cancelDrag);
      element.removeEventListener('lostpointercapture', cancelDrag); element.removeEventListener('wheel', onWheel);
      element.removeEventListener('keydown', onKey);
      element.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onEscape);
      document.removeEventListener('pointerdown', onOutside);
      delete element.dataset.expanded;
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [count, copies]);

  const s = { ...defaultGallerySettings, ...settings };
  return <div ref={root} className={`gallery-carousel ${className}`} role="region" aria-roledescription="carousel" aria-label="Automatically scrolling image gallery. Use the arrow keys to browse." tabIndex={0}
    style={{ '--gc-radius': `${s.radius}px`, '--gc-edge': `${s.edgeFade}px` } as CSSProperties}>
    {count ? Array.from({ length: copies }, (_, copy) => images.map((image, index) =>
      <button type="button" className="gc-item" key={`${copy}-${index}`} data-index={index} tabIndex={-1} aria-label={`Expand ${image.caption || image.alt}`}>
        {image.type === 'video'
          ? <video className="gc-photo" src={image.src} aria-label={image.alt} autoPlay muted loop playsInline preload="auto" disablePictureInPicture />
          : <img className="gc-photo" src={image.src} alt={image.alt} draggable={false} decoding="async" />}
        {s.captions && <span className="gc-caption" aria-hidden="true">{image.caption || image.alt}</span>}
      </button>)) : <p className="gc-empty">Add images to start your gallery.</p>}
  </div>;
}
