# AnatoSphere 3D: Phase 0 Technical Feasibility Report

**Dates:** built 2026-10-31, closed 2026-11-03 · **Status: Phase 0 complete.** Automated tests pass and a real-phone test passed. See section 5 for what remains unverified.

> **Note (2026-11-03):** this report records Phase 0 as it was. Phase 1 replaced the prototype: the asset is now `public/models/body/`, the source moved to the PRD 10.1 layout, and `scripts/build-bodyparts3d.mjs` became `scripts/build-body.mjs`. See `docs/phase1-report.md`.

## 1. What was built

A single-page technical prototype. It is not the MVP: there is no router, i18n, Tailwind or educational content.

| Area | Files |
|---|---|
| Viewer | `src/viewer/Viewer.tsx`, `AssetModel.tsx`, `sceneIndex.ts`, `highlight.ts` |
| App shell | `src/App.tsx`, `src/ui/ErrorBoundary.tsx`, `src/index.css` |
| Asset data | `src/assets/manifest.ts`, `src/assets/registry.ts` |
| Diagnostics | `src/debug/HierarchyPanel.tsx`, `src/debug/DebugBridge.tsx` (dev-only test hook) |
| Asset pipeline | `scripts/make-fixture.mjs`, `scripts/build-bodyparts3d.mjs`, `scripts/inspect-glb.mjs` |
| Tests | `tests/e2e/phase0.spec.ts`, `playwright.config.ts` (uses the installed Google Chrome) |
| Assets | `public/models/fixture/*` (generated, non-anatomical), `public/models/bodyparts3d/*` (BodyParts3D-derived) |

**Versions installed:** react 19.3.1, three 0.187.0, @react-three/fiber 9.8.2, @react-three/drei 10.7.9, vite 8.3.5, typescript 7.0.2.
**Dev tooling:** @gltf-transform/core and functions 4.5.1, meshoptimizer 1.3.0, @playwright/test 1.64.1.

## 2. Anatomical asset

**BodyParts3D 4.0, PART-OF subset.** The source is licensed CC BY 4.0, and the derived model is licensed CC BY-SA 4.0 (see `public/models/bodyparts3d/PROVENANCE.md`, which also records the CC BY-SA 2.1 JP header found in the OBJ files).

| Property | Value |
|---|---|
| Layers | Skin (1), Skeletal system (138), Internal organs (8) |
| Selectable structures | 147, each with an FMA concept ID and the dataset's English name |
| Triangles | 455,896 (simplified from 1,652,384) |
| File size | 12.0 MB (meshopt-compressed; raw OBJ source is 218 MB) |
| glTF validation | 0 errors, 0 warnings |
| Draw calls, everything visible | 147 |

**Limitations:**
- No free-limb bones and no muscles (they are in the IS-A dataset, not processed yet).
- Eye structures sit inside the dataset's "skeletal system" grouping.
- Three structures appear as duplicate meshes, because the dataset splits each into two mesh files.

## 3. Test results (automated, Chrome, 2026-10-31)

`npm run test:e2e` gave **13 passed, 1 skipped, 0 failed**. The skipped test is the mouse-drag test, which doesn't run on mobile. The tests ran in two configurations: desktop (1440×900) and emulated mobile (Pixel 7 profile, touch input, DPR 2).

| Requirement | Test evidence | Desktop | Mobile emulation |
|---|---|---|---|
| GLB loading | both assets load; every manifest structure and layer is found (0 missing) | ✅ | ✅ |
| Error state | missing asset shows "Model unavailable" plus a Retry button, without crashing | ✅ | ✅ |
| Hierarchy inspection | in-app tree and JSON export; offline `npm run inspect:glb`; names changed by three.js are shown | ✅ | ✅ |
| Individual selection | click/tap selects the nearest *visible* structure; multi-material mesh and duplicate names resolve correctly | ✅ | ✅ (tap) |
| Occlusion | with skin visible, clicking the heart's position selects the skin; with skin and skeleton hidden, it selects the heart | ✅ | ✅ |
| Highlighting | highlight doesn't spread to other meshes that share the same material; the original material is restored on deselect | ✅ | ✅ |
| Layer visibility | toggle, isolate and show-all change `Object3D.visible` on the real layer nodes; hidden layers can't be clicked | ✅ | ✅ |
| Camera | a drag rotates without selecting; clicking empty space deselects; Reset returns the camera to within 0.02 of the default view | ✅ | not tested (touch rotate/pinch) |
| Focus | picking a structure from the list moves the camera to it | ✅ | ✅ |
| Responsive layout | ≤900 px puts the viewer first at full width with panels below; DPR capped at 2 | ✅ screenshot | ✅ screenshot |
| No console errors | asserted in the tests | ✅ | ✅ |

**Headless performance numbers:** headless Chrome reported about 144 fps and 147 draw calls. This is not a meaningful mobile measurement; the real-device result is below.

### Real-device test (manual, reported by the project owner, 2026-11-03)

Device: **Redmi Note 14 Pro+ 5G**, over local Wi-Fi from the dev server, read from the in-app counter.

| Check | Result |
|---|---|
| All layers visible | about 100 fps while moving, about 60 fps idle |
| Skin hidden | about 90 fps on average while moving, about 60 fps idle |
| Load time | under 1 second |
| One-finger rotate, pinch zoom, two-finger pan, tap to select, Reset view | all OK |

Both results are well above the PRD's target of about 30 fps on mid-range mobile.

Reading these numbers:
- The 60 fps idle reading is probably the phone lowering its screen refresh rate when nothing moves. That is an inference, not something measured.
- The load time reflects a local network, and possibly a cached file. It does not predict loading 12 MB over mobile data.

## 4. Risks confirmed in testing or code review

1. **three.js raycasting includes hidden objects.** Confirmed in the source code (`Raycaster.intersect` has no visibility check, and R3F 9.8.2 doesn't filter either) and covered by a test. The fix is in `AssetModel.handleClick`.
2. **GLTFLoader changes node names.** Observed: `Fixture.Dotted Name` → `FixtureDotted_Name`, and `Fixture_Duplicate` → `Fixture_Duplicate_1`. Matching uses glTF `extras` instead.
3. **drei `<Html>` crashed when assets were switched** under React 19: "synchronously unmount a root" plus a `removeChild` error. It was replaced with a plain DOM overlay.
4. **Clearing the GLTF cache in an unmount effect broke rendering** (0 draw calls) under StrictMode's dev-only remount. Resources are now released by the App after the model has unmounted.
5. **drei `Bounds.fit()` keeps the current viewing angle.** It can't serve as "reset view", so reset now moves to a fixed front view.
6. **The raw dataset is far over the mobile budget** (1.65 M triangles, 119 MB), so simplification and compression are required steps in the asset pipeline.

## 5. Not yet verified

- Lower-end phones and tablets. Only one upper-mid-range phone has been tested.
- Memory use on mobile.
- Load time over mobile data from a real host.
- Raycast cost on weaker devices, for heavy merged organs such as the brain. No problem was reported on the tested phone. If it appears, add `three-mesh-bvh` (it already comes with drei).
- Anatomical review of the simplified shapes.
- Safari/iOS and Firefox.

## 6. Next steps (Phase 1)

1. Process the BodyParts3D IS-A dataset with the same pipeline to add limbs and muscles. Re-test performance, because the triangle and draw-call counts will grow.
2. Add the content schema (PRD §10.2), i18n, and search over the manifest.
3. Build the mobile bottom sheet from PRD §6.3. The prototype stacks panels below the viewer instead.
4. Split the 1.25 MB JS bundle into smaller chunks.
5. If performance drops on weaker devices, lower `BP3D_RATIO` (e.g. 0.1) and/or load layers lazily as separate GLBs.
6. Set up git and choose a license for the application code. The owner has deferred this.
