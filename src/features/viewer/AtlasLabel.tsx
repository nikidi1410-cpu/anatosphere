import { useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
import { useAppStore } from '../../stores/useAppStore';
import { useStructureName } from '../anatomy/useNames';
import { isEffectivelyVisible, sceneRegistry } from './sceneRegistry';

/**
 * The atlas label: a leader line from the selected structure to its name, like a
 * labelled plate in an anatomy atlas. It follows the model as it rotates. Positions
 * are written straight to the DOM each frame, so rotating causes no React renders.
 */
export interface AtlasLabelRefs {
  root: RefObject<HTMLDivElement | null>;
  line: RefObject<SVGLineElement | null>;
  dot: RefObject<SVGCircleElement | null>;
  label: RefObject<HTMLDivElement | null>;
}

export function useAtlasLabelRefs(): AtlasLabelRefs {
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<SVGLineElement>(null);
  const dot = useRef<SVGCircleElement>(null);
  const label = useRef<HTMLDivElement>(null);
  return useMemo(() => ({ root, line, dot, label }), []);
}

export function AtlasLabelOverlay({ refs }: { refs: AtlasLabelRefs }) {
  const { i18n } = useTranslation();
  const primaryId = useAppStore((s) => s.selection.primaryId);
  const recordId = useAppStore((s) => s.selection.recordId);
  const selectionSize = useAppStore((s) => s.selection.ids.length);
  const catalog = useAppStore((s) => s.catalog);
  const structureName = useStructureName(primaryId);
  const record = recordId ? catalog?.recordById.get(recordId) : undefined;
  // A whole documented structure is labelled by its name, a single part by the part's.
  const text = record && selectionSize > 1 ? (i18n.language === 'id' ? record.name.id : record.name.en) : structureName;

  return (
    <div ref={refs.root} className="atlas" aria-hidden="true" style={{ visibility: 'hidden' }}>
      <svg className="atlas-lines">
        <line ref={refs.line} />
        <circle ref={refs.dot} r="3.5" />
      </svg>
      <div ref={refs.label} className="atlas-label">{text}</div>
    </div>
  );
}

const MARGIN = 16;
const NARROW = 640;

export function AtlasLabelTracker({ refs }: { refs: AtlasLabelRefs }) {
  const { camera, size } = useThree();
  const primaryId = useAppStore((s) => s.selection.primaryId);
  const center = useRef(new THREE.Vector3());
  const box = useRef(new THREE.Box3());
  const side = useRef<{ id: string | null; left: boolean }>({ id: null, left: false });

  useFrame(() => {
    const root = refs.root.current;
    const line = refs.line.current;
    const dot = refs.dot.current;
    const label = refs.label.current;
    if (!root || !line || !dot || !label) return;

    const obj = primaryId ? sceneRegistry.structures.get(primaryId) : undefined;
    if (!obj || !isEffectivelyVisible(obj)) {
      root.style.visibility = 'hidden';
      return;
    }
    box.current.setFromObject(obj).getCenter(center.current).project(camera);
    const x = ((center.current.x + 1) / 2) * size.width;
    const y = ((1 - center.current.y) / 2) * size.height;
    const offscreen = center.current.z > 1 || x < 0 || x > size.width || y < 0 || y > size.height;
    if (offscreen) {
      root.style.visibility = 'hidden';
      return;
    }

    const w = label.offsetWidth;
    const h = label.offsetHeight;
    let lx: number;
    let ly: number;
    let ax: number;
    let ay: number;
    if (size.width < NARROW) {
      // Narrow screens have no side margin: the label sits along the top.
      // Keep clear of the floating viewer buttons on the right.
      lx = Math.min(Math.max(MARGIN, x - w / 2), size.width - w - 64);
      ly = 30;
      ax = lx + w / 2;
      ay = ly + h;
    } else {
      // Choose a side once per selection, so the label doesn't jump while rotating.
      if (side.current.id !== primaryId) side.current = { id: primaryId, left: x < size.width / 2 };
      const left = side.current.left;
      lx = left ? MARGIN + 8 : size.width - w - MARGIN - 8;
      ly = Math.min(Math.max(72, y - 90 - h / 2), size.height - h - 72);
      ax = left ? lx + w : lx;
      ay = ly + h / 2;
    }

    label.style.transform = `translate(${lx}px, ${ly}px)`;
    line.setAttribute('x1', String(ax));
    line.setAttribute('y1', String(ay));
    line.setAttribute('x2', String(x));
    line.setAttribute('y2', String(y));
    dot.setAttribute('cx', String(x));
    dot.setAttribute('cy', String(y));
    root.style.visibility = 'visible';
  });

  return null;
}
