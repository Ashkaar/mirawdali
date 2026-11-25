"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Translate } from "./copy";

const OUTPUT = 800;
const MAX_ZOOM = 4;
type Pan = { x: number; y: number };

/**
 * Photo picker with framing: drag to move, slider / pinch / wheel to zoom.
 * The framed square is drawn to a canvas and submitted under `name` as a JPEG.
 */
export default function PhotoCrop({ name, label, hint, current, round, t }: {
  name: string; label: string; hint: string; current?: ReactNode; round?: boolean; t: Translate;
}) {
  const [source, setSource] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [size, setSize] = useState(260);
  const view = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const output = useRef<HTMLInputElement>(null);
  const pointers = useRef(new Map<number, Pan>());
  const state = useRef({ zoom, pan, size });
  state.current = { zoom, pan, size };

  const base = source ? Math.max(size / source.naturalWidth, size / source.naturalHeight) : 1;
  const clamp = useCallback((next: Pan, scale: number): Pan => {
    if (!source) return next;
    const minX = size - source.naturalWidth * scale, minY = size - source.naturalHeight * scale;
    return { x: Math.min(0, Math.max(minX, next.x)), y: Math.min(0, Math.max(minY, next.y)) };
  }, [source, size]);

  /** Zoom to `next`, keeping the point at (fx, fy) in the frame still. */
  const zoomTo = useCallback((next: number, fx = state.current.size / 2, fy = state.current.size / 2) => {
    if (!source) return;
    const { zoom: was, pan: at } = state.current;
    const target = Math.min(MAX_ZOOM, Math.max(1, next));
    const ratio = target / was;
    setZoom(target);
    setPan(clamp({ x: fx - (fx - at.x) * ratio, y: fy - (fy - at.y) * ratio }, base * target));
  }, [source, clamp, base]);

  function pick(file: File | undefined) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => setSource(image);
    image.src = url;
  }
  function clear() {
    setSource(null);
    if (picker.current) picker.current.value = "";
    if (output.current) output.current.value = "";
  }

  // Once the frame is on screen, measure it and centre the new photo in it.
  useEffect(() => {
    if (!source || !view.current) return;
    const width = view.current.clientWidth;
    const scale = Math.max(width / source.naturalWidth, width / source.naturalHeight);
    setSize(width);
    setZoom(1);
    setPan({ x: (width - source.naturalWidth * scale) / 2, y: (width - source.naturalHeight * scale) / 2 });
  }, [source]);

  // Keep the submitted file in step with the frame.
  useEffect(() => {
    if (!source) return;
    const timer = window.setTimeout(() => {
      const scale = base * zoom;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = OUTPUT;
      canvas.getContext("2d")?.drawImage(source, -pan.x / scale, -pan.y / scale, size / scale, size / scale, 0, 0, OUTPUT, OUTPUT);
      canvas.toBlob(blob => {
        if (!blob || !output.current) return;
        try {
          const transfer = new DataTransfer();
          transfer.items.add(new File([blob], "photo.jpg", { type: "image/jpeg" }));
          output.current.files = transfer.files;
        } catch {
          // Very old browsers: fall back to uploading the original file uncropped.
          picker.current?.setAttribute("name", name);
        }
      }, "image/jpeg", 0.9);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [source, zoom, pan, size, base, name]);

  // Wheel zoom needs a non-passive listener so the dialog doesn't scroll instead.
  useEffect(() => {
    const element = view.current;
    if (!element || !source) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const box = element.getBoundingClientRect();
      zoomTo(state.current.zoom * Math.exp(-event.deltaY * 0.0015), event.clientX - box.left, event.clientY - box.top);
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [source, zoomTo]);

  function down(event: React.PointerEvent) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
  }
  function move(event: React.PointerEvent) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous || !source) return;
    const others = [...pointers.current].filter(([id]) => id !== event.pointerId).map(([, point]) => point);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (others.length === 1) {
      // Pinch: scale by the change in finger distance around their midpoint.
      const [other] = others;
      const before = Math.hypot(previous.x - other.x, previous.y - other.y);
      const after = Math.hypot(event.clientX - other.x, event.clientY - other.y);
      const box = event.currentTarget.getBoundingClientRect();
      if (before > 0) zoomTo(state.current.zoom * after / before, (event.clientX + other.x) / 2 - box.left, (event.clientY + other.y) / 2 - box.top);
    } else if (others.length === 0) {
      const { pan: at, zoom: z } = state.current;
      setPan(clamp({ x: at.x + event.clientX - previous.x, y: at.y + event.clientY - previous.y }, base * z));
    }
  }
  function up(event: React.PointerEvent) {
    pointers.current.delete(event.pointerId);
  }

  const scale = base * zoom;
  return <div className="photo-crop">
    <label>{label}
      <input ref={picker} type="file" accept="image/jpeg,image/png,image/webp" onChange={event => pick(event.target.files?.[0])} />
      <small>{hint}</small>
    </label>
    <input ref={output} type="file" name={name} hidden tabIndex={-1} aria-hidden="true" />
    {source ? <div className="crop">
      <div ref={view} className={"crop-view" + (round ? " round" : "")} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <img src={source.src} alt="" draggable={false}
          style={{ width: source.naturalWidth * scale, height: source.naturalHeight * scale, transform: `translate(${pan.x}px, ${pan.y}px)` }} />
      </div>
      <div className="crop-controls">
        <button type="button" className="icon" aria-label={t("zoomOut")} onClick={() => zoomTo(zoom / 1.25)}>−</button>
        <input type="range" min={1} max={MAX_ZOOM} step={0.01} value={zoom} aria-label={t("zoom")} onChange={event => zoomTo(Number(event.target.value))} />
        <button type="button" className="icon" aria-label={t("zoomIn")} onClick={() => zoomTo(zoom * 1.25)}>+</button>
      </div>
      <p className="hint">{t("cropHint")}</p>
      <button type="button" className="plain" onClick={clear}>{t("cancelPhoto")}</button>
    </div> : current && <div className="crop-current">{current}</div>}
  </div>;
}
