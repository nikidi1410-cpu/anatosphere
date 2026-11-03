import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Bounds, OrbitControls, useBounds, useGLTF, useProgress } from '@react-three/drei';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
import { useAppStore } from '../../stores/useAppStore';
import { findStructureId, isEffectivelyVisible, sceneRegistry } from './sceneRegistry';
import { Highlighter } from './highlight';
import { AtlasLabelOverlay, AtlasLabelTracker, useAtlasLabelRefs } from './AtlasLabel';
import { DebugBridge } from '../../debug/DebugBridge';

/** Pointer travel (px) above which a click is treated as the end of a camera drag. */
const CLICK_DRAG_TOLERANCE = 5;

export default function Viewer({ fallback }: { fallback: ReactNode }) {
  const { t } = useTranslation();
  const files = useAppStore((s) => s.files);
  const clearSelection = useAppStore((s) => s.clearSelection);
  const perf = useRef<HTMLDivElement>(null);
  const labelRefs = useAtlasLabelRefs();
  // Track pointer travel so releasing a drag over empty space does not deselect.
  const down = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const showPerf = import.meta.env.DEV || new URLSearchParams(location.search).has('debug');
  const reducedMotion = useMemo(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false, []);

  return (
    <div
      className="viewer"
      onPointerDown={(e) => {
        down.current = { x: e.clientX, y: e.clientY };
        dragged.current = false;
      }}
      onPointerMove={(e) => {
        if (down.current && Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) > CLICK_DRAG_TOLERANCE)
          dragged.current = true;
      }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 36, near: 0.01, far: 40, position: [0, 0, 4] }}
        fallback={fallback}
        aria-label={t('viewer.canvasLabel')}
        onPointerMissed={() => {
          if (!dragged.current) clearSelection();
        }}
      >
        <color attach="background" args={['#F5F7FA']} />
        <hemisphereLight args={['#ffffff', '#b0b8c4', 1.4]} />
        <directionalLight position={[2, 4, 3]} intensity={1.6} />
        <directionalLight position={[-3, 2, -2]} intensity={0.6} />
        <Bounds margin={1.12} maxDuration={reducedMotion ? 0.001 : 0.6}>
          {Object.entries(files).map(([url, file]) => (
            <FileBoundary key={`${url}#${file.attempt}`} url={url}>
              <Suspense fallback={null}>
                <ModelFile url={url} />
              </Suspense>
            </FileBoundary>
          ))}
          <SceneSync />
          <CameraRig />
        </Bounds>
        {/* Left drag: rotate. Wheel or pinch: zoom. Right drag or two-finger drag: pan. */}
        <OrbitControls makeDefault enableDamping={!reducedMotion} dampingFactor={0.12} minDistance={0.04} maxDistance={8} />
        <AtlasLabelTracker refs={labelRefs} />
        {showPerf && <PerfProbe target={perf} />}
        {import.meta.env.DEV && <DebugBridge />}
      </Canvas>
      <AtlasLabelOverlay refs={labelRefs} />
      <LoadingOverlay />
      {showPerf && <div className="perf" ref={perf} aria-hidden="true" />}
    </div>
  );
}

/** A file that fails to load marks its layer as failed; the rest of the model keeps working. */
class FileBoundary extends Component<{ url: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.warn(`[AnatoSphere] could not load ${this.props.url}:`, error.message);
    useGLTF.clear(this.props.url);
    useAppStore.getState().setFileState(this.props.url, 'error');
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function ModelFile({ url }: { url: string }) {
  // Draco disabled: drei would otherwise fetch the decoder from a Google CDN.
  // Meshopt decoding is bundled locally and stays enabled.
  const { scene } = useGLTF(url, false, true);
  const setFileState = useAppStore((s) => s.setFileState);
  const bumpScene = useAppStore((s) => s.bumpScene);

  useEffect(() => {
    sceneRegistry.add(url, scene);
    setFileState(url, 'ready');
    bumpScene();
  }, [url, scene, setFileState, bumpScene]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > CLICK_DRAG_TOLERANCE) return; // a rotate or pan drag, not a click
    // three.js raycasts hidden objects too, so take the nearest visible hit.
    const hit = e.intersections.find((i) => isEffectivelyVisible(i.object));
    const id = hit ? findStructureId(hit.object) : null;
    const store = useAppStore.getState();
    if (id) store.selectStructure(id);
    else store.clearSelection();
  };

  return <primitive object={scene} onClick={handleClick} />;
}

/** Applies layer visibility, the system filter and the highlight to the real scene objects. */
function SceneSync() {
  const layerVisible = useAppStore((s) => s.layerVisible);
  const activeSystem = useAppStore((s) => s.activeSystem);
  const selection = useAppStore((s) => s.selection);
  const sceneVersion = useAppStore((s) => s.sceneVersion);
  const catalog = useAppStore((s) => s.catalog);
  const highlighter = useRef(new Highlighter());

  useEffect(() => {
    for (const [id, obj] of sceneRegistry.layers) obj.visible = layerVisible[id] ?? true;
    if (!catalog) return;
    for (const [id, obj] of sceneRegistry.structures) {
      obj.visible = !activeSystem || catalog.byId.get(id)?.systemId === activeSystem;
    }
  }, [layerVisible, activeSystem, sceneVersion, catalog]);

  useEffect(() => {
    const targets = selection.ids.map((id) => sceneRegistry.structures.get(id)).filter((o) => o !== undefined);
    highlighter.current.apply(targets);
  }, [selection, sceneVersion]);

  useEffect(() => {
    const h = highlighter.current;
    return () => h.clear();
  }, []);

  return null;
}

function CameraRig() {
  const bounds = useBounds();
  const command = useAppStore((s) => s.camera);
  const selection = useAppStore((s) => s.selection);
  const sceneVersion = useAppStore((s) => s.sceneVersion);
  const stillLoading = useAppStore((s) => Object.values(s.files).some((f) => f.state === 'loading'));
  const view = useAppStore((s) => s.view);
  const homeBox = useRef<THREE.Box3 | null>(null);
  const handled = useRef(0);

  // Default view: straight-on front view (+Z) of the model. drei's fit() keeps the
  // current viewing angle, so it cannot serve as "reset". The box is taken once per
  // asset, after the first files have all arrived, so that lazy-loading another layer
  // does not change what "reset" means. The distance is recomputed for the current
  // canvas shape.
  const goHome = () => {
    if (!homeBox.current) {
      const box = new THREE.Box3();
      for (const root of sceneRegistry.roots.values()) box.expandByObject(root);
      if (box.isEmpty()) return false;
      homeBox.current = box;
    }
    const { center, distance } = bounds.refresh(homeBox.current).getSize();
    bounds.to({ position: [center.x, center.y, center.z + distance], target: [center.x, center.y, center.z] });
    return true;
  };

  // The canvas changes shape between the start page and the explorer.
  const lastView = useRef(view);
  useEffect(() => {
    if (lastView.current === view) return;
    lastView.current = view;
    if (selection.ids.length === 0) requestAnimationFrame(() => goHome());
  }, [view]); // oxlint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (homeBox.current === null && !stillLoading && sceneRegistry.roots.size > 0) goHome();
    // A focus request may arrive before its layer has loaded; retry as files arrive.
    if (command && command.nonce !== handled.current) {
      if (command.kind === 'reset') {
        if (goHome()) handled.current = command.nonce;
      } else {
        // A system fills the view with all of its parts; otherwise, the selection.
        const { activeSystem, catalog } = useAppStore.getState();
        const ids = command.kind === 'system'
          ? (catalog?.structures.filter((s) => s.systemId === activeSystem).map((s) => s.id) ?? [])
          : selection.ids;
        const box = sceneRegistry.boxOf(ids);
        const allLoaded = ids.every((id) => sceneRegistry.structures.has(id));
        if (box && allLoaded) {
          bounds.refresh(box).fit();
          handled.current = command.nonce;
        } else if (ids.length === 0) {
          handled.current = command.nonce;
        }
      }
    }
    // Selection changes alone must not move the camera, only commands do.
  }, [command, sceneVersion, stillLoading]); // oxlint-disable-line react-hooks/exhaustive-deps

  return null;
}

function LoadingOverlay() {
  const { t } = useTranslation();
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className="viewer-loading" role="status">
      {t('viewer.loading', { percent: progress.toFixed(0) })}
    </div>
  );
}

/** Writes FPS / draw calls / triangles into a DOM node without causing React re-renders. */
function PerfProbe({ target }: { target: React.RefObject<HTMLDivElement | null> }) {
  const gl = useThree((s) => s.gl);
  const acc = useRef({ frames: 0, t: 0 });
  useFrame(() => {
    const a = acc.current;
    a.frames++;
    const now = performance.now();
    if (a.t === 0) a.t = now;
    if (now - a.t >= 1000 && target.current) {
      const fps = (a.frames * 1000) / (now - a.t);
      const { calls, triangles } = gl.info.render;
      target.current.textContent = `${fps.toFixed(0)} fps, ${calls} draw calls, ${triangles.toLocaleString()} triangles`;
      a.frames = 0;
      a.t = now;
    }
  });
  return null;
}
