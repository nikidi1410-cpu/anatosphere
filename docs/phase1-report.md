# AnatoSphere 3D: Phase 1 (MVP) Report

**Date:** 2026-11-03. **Status:** built and passing automated tests. **The owner reports an average above 60 fps on a real phone (section 3). The content has not been reviewed by an anatomy educator.**

## 1. What was built

| Step | Result |
|---|---|
| 1. Complete the model | Full body: skin, 394 muscle parts, 240 skeleton parts, 19 organs. Four GLB files that load separately. |
| 2. Data and language | PRD 10.2 content schema, i18next (English and Indonesian), language saved between visits, search across English, Indonesian, Latin and synonyms. |
| 3. Main interface | Start page, three-panel desktop layout with collapsible panels, mobile layout with bottom sheet, atlas leader-line label, loading and error states. |
| 4. Educational content | 45 documented structures in both languages, each citing a section of OpenStax *Anatomy and Physiology 2e*. One introductory guided tour. |

The source layout follows PRD 10.1: `src/app`, `components`, `features/{viewer,anatomy,search,learning}`, `data/{anatomy,systems,tours,references}`, `lib`, `stores`, `locales/{en,id}`, `styles`.

### Model

| Layer | Parts | Triangles | File size | Loaded |
|---|---|---|---|---|
| Skin | 1 | 40,674 | 1.0 MB | When first shown |
| Muscles | 394 | 479,436 | 12.8 MB | When first shown |
| Skeleton | 240 | 183,208 | 5.3 MB | At start |
| Internal organs | 19 | 178,460 | 4.6 MB | At start |

All four GLB files validate with 0 errors and 0 warnings. With everything on, the scene has 654 draw calls and 881,778 triangles in the loaded scene report. The start view has 259 draw calls and 361,668 triangles.

The app code is split so 3D code loads after the first paint: about 115 KB gzipped at first, then about 276 KB gzipped for three.js and the viewer.

## 2. Test results

| Suite | Result |
|---|---|
| `npm test` (Vitest): content integrity, search, translation rules | 209 passed |
| `npm run test:e2e` (Playwright, Chrome): desktop 1440x900, tablet 1024x768, mobile Pixel 7 emulation | 55 passed, 8 skipped, 0 failed |
| Production build smoke test (`E2E_BASE_URL=... playwright test production`) | 3 passed, one per screen size |

The 8 skipped tests are ones that don't apply to a screen size (for example, the bottom sheet on desktop) and the production test, which runs separately.

The content tests check that every record's mesh names exist in the model, that each record is complete in both languages and cites a known reference, that related structures exist, that no record claims a review that hasn't happened, and that English and Indonesian have the same interface keys.

### PRD section 13 checklist

| Item | Status | Evidence |
|---|---|---|
| Model loads | ✅ | All parts of all loaded layers found in the scene (0 missing) |
| Rotation, camera reset | ✅ | Automated, with a mouse |
| Zoom | ✅ on phase 0 phone test only | Not automated; the control code is unchanged |
| Selecting and highlighting the correct mesh | ✅ | Automated; shared materials don't spread the highlight |
| Information panel, names in both languages | ✅ | Automated |
| Description, function and references | ✅ | 45 documented structures cover 119 of the 654 model parts. The other 535 parts have names only and say so. |
| No fabricated anatomical information | ✅ as far as checked | Facts were checked against the cited section. See limits in section 3. |
| Layers hide and show actual 3D objects | ✅ | Automated against scene state |
| Search in English and Indonesian, results exist, result focuses | ✅ | Automated |
| Language selector, translated navigation and content, persistence | ✅ | Automated |
| Desktop, tablet and mobile layouts | ✅ | Automated with screenshots reviewed |
| Touch interactions | ⚠️ partly | Tap is automated. Rotate and pinch were confirmed on a real phone in phase 0, on the lighter model. |
| No major console errors | ✅ | Asserted in tests |
| Model loading errors handled | ✅ | Missing manifest, and a failed layer download with Retry, are both tested |
| No placeholder controls presented as functional | ✅ | Every control has a tested or direct effect |
| Main journey | ✅ | Automated |

## 3. Limits to know about

**Content is a draft.**
- Every record is marked `draft`, and the app says so on each page. PRD section 15 requires review by a qualified anatomy educator before claiming validation. That hasn't happened.
- Latin names and Indonesian text are not taken from the cited English source. They come from standard terminology and my own translation, so they need that same review.
- Indonesian names for model parts come from fixed rules in `src/lib/translateName.ts`. Muscle names keep their Latin spelling.
- Facts were checked against a machine-read summary of each OpenStax page, not line by line by a person.
- OpenStax states a Creative Commons NonCommercial ShareAlike license on these pages. AnatoSphere cites them and uses original wording, so nothing is copied. Check this again if the project ever becomes commercial.

**Model gaps** (details in `public/models/body/PROVENANCE.md`):
- Some major muscles are not in the dataset, including latissimus dorsi, rectus abdominis, masseter and the muscles of facial expression. The app states this.
- The lungs show only airways and vessels, and the lung page says so.

**Not measured:**
- Frame rate per layer on a real phone. The owner tested on a Redmi Note 14 Pro+ 5G and reported an average above 60 fps (2026-11-03). That is one overall figure, so the Muscles and all-layers views have no separate numbers.
- Loading over mobile data. The start view downloads about 9.9 MB of models.
- Safari/iOS and Firefox.
- Screen-reader use. Keyboard use of search is tested, and controls have labels, but no screen reader was run.

**Not in scope for Phase 1:** layer opacity, exploded view and quizzes are Phase 2 in the PRD. Dark mode is not built.

**Decisions to confirm:**
- The start view shows skeleton and organs, not skin. It makes the layers obvious at once and avoids opening on an undressed figure.
- Picking a structure from search or Browse hides the layers covering it, so it can be seen.

## 4. Bugs found and fixed during this phase

1. The dataset's `muscle organ` list omits major muscles (biceps, deltoid, pectoralis major, trapezius, quadriceps), which are published as heads and zones. They would have been missing. The content test also caught two missing trapezius parts.
2. Eight mesh files have empty headers. They are now named from their mirrored twin.
3. "Reset view" could frame only the organs if that file arrived before the skeleton.
4. Moving between the start page and the explorer would have rebuilt the 3D canvas.
5. Debug code pulled three.js into the first download (750 KB). It now loads on demand (365 KB).
6. On mobile, the tour card covered the structure being explained. Panels now sit below the canvas.
7. Escape in the search box didn't clear the selection.

## 5. How to run

```sh
npm run dev -- --host     # development, with the performance counter
npm run build && npm run preview -- --host   # production build; add ?debug to the URL for the counter
npm test                  # content and logic tests
npm run test:e2e          # browser tests
```

## 6. Next steps

1. No performance work is needed now, since the test phone averages above 60 fps. If a weaker phone runs below about 30 fps, merge muscle meshes per region at a distance or use `BatchedMesh`.
2. Have an anatomy educator review the content, then move records from `draft` to `reviewed`.
3. Done on 2026-11-03: git set up, application code released under the MIT License, and the app deployed to https://anatosphere-smoky.vercel.app. The production browser tests pass against that address.
4. Start Phase 2: quizzes, more tours, exploded view and opacity.
