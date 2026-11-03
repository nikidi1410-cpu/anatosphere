# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# AnatoSphere 3D

### Interactive Human Anatomy Learning & Exploration Platform

**Document Version:** 1.0

**Date:** 31 October 2026

**Product Type:** Interactive 3D Educational Web Application

**Platform:** Responsive Web (Desktop, Tablet, Mobile)

**Primary Language:** English & Bahasa Indonesia

**Development Approach:** Incremental Development (MVP → Advanced → Professional)

---

# 1. EXECUTIVE SUMMARY

## 1.1 Product Overview

AnatoSphere 3D is an interactive, browser-based human anatomy learning platform that allows users to explore the human body through realistic 3D visualization.

The application combines an interactive anatomical model, educational information, guided exploration, and interactive quizzes into a single learning experience.

Users can rotate, zoom, inspect, isolate, and explore different anatomical structures, including the skeletal system, muscular system, organs, nervous system, cardiovascular system, and other major body systems.

Unlike traditional anatomy diagrams or static illustrations, AnatoSphere 3D focuses on spatial understanding and active learning.

The platform should feel like a combination of:

- Apple-inspired minimalist product design.

- BioDigital-inspired anatomical exploration.

- Visible Body-inspired educational interaction.

- A modern, accessible learning application.

These products are references for their design principles and interaction patterns, not templates to copy.

## 1.2 Product Vision

"Make human anatomy easier to understand through immersive, interactive, and accessible 3D exploration."

AnatoSphere 3D aims to make learning anatomy engaging without sacrificing scientific accuracy.

## 1.3 Core Value Proposition

Users should be able to:

1. See the human body in interactive 3D.

2. Understand the location and relationship of anatomical structures.

3. Explore individual body systems and their components.

4. Learn anatomical terminology in English and Indonesian.

5. Test their understanding through interactive quizzes.

6. Explore independently or follow structured learning experiences.

---

# 2. PRODUCT GOALS & OBJECTIVES

## 2.1 Primary Goals

**G1 — Immersive 3D Exploration**

Provide a realistic and interactive representation of the human body.

**G2 — Educational Value**

Provide reliable, accessible explanations of anatomical structures and their functions.

**G3 — Interactive Learning**

Allow users to learn through selecting structures, switching anatomical layers, guided tours, and quizzes.

**G4 — Accessibility**

Ensure the experience works on desktop and mobile devices.

**G5 — Bilingual Experience**

Provide complete English and Indonesian localization.

**G6 — Expandability**

Create an architecture that supports adding more anatomical systems, models, educational content, and learning features without rebuilding the application.

## 2.2 Non-Goals

The initial product is NOT intended to:

- Diagnose medical conditions.

- Recommend medication or treatment.

- Replace medical education or professional medical references.

- Provide patient-specific medical information.

- Simulate every physiological process in real time.

- Replace professional anatomical software used in clinical environments.

AnatoSphere 3D is an educational application, not a medical decision-making tool.

---

# 3. TARGET AUDIENCE

AnatoSphere 3D is designed for users with different levels of anatomical knowledge.

### Primary Audience

Students and general learners interested in understanding the human body.

### Secondary Audience

- Students studying biology and health sciences.

- University students studying introductory anatomy.

- Educators who need visual learning tools.

- People interested in science and human biology.

### User Personas

**Persona A — Beginner Learner**

Needs simple explanations, visual examples, and accessible navigation.

**Persona B — Curious Explorer**

Wants to inspect individual anatomical structures and understand their relationships.

**Persona C — Advanced Learner**

Needs more detailed terminology, anatomical classifications, and references.

The interface should support all three without overwhelming beginners.

---

# 4. ANATOMICAL CONTENT SCOPE

## 4.1 Long-Term Anatomical Coverage

The long-term vision is to cover the major human body systems.

| System | Main Content |
|---|---|
| Skeletal | Bones, joints, skull, vertebral column |
| Muscular | Major muscle groups, individual muscles |
| Nervous | Brain, spinal cord, nerves |
| Cardiovascular | Heart, arteries, veins |
| Respiratory | Lungs, trachea, bronchi |
| Digestive | Mouth, esophagus, stomach, intestines, liver |
| Urinary | Kidneys, ureters, bladder |
| Endocrine | Major endocrine glands |
| Lymphatic | Lymph nodes, lymphatic vessels |
| Integumentary | Skin, hair, nails |
| Reproductive | Major anatomical structures, presented educationally |

Coverage is subject to model availability, anatomical quality, and appropriate educational references.

## 4.2 Anatomical Visualization Modes

The platform should support the following visualization modes:

1. Full Body Overview

2. Skeletal System

3. Muscular System

4. Internal Organs

5. Nervous System

6. Cardiovascular System

7. Respiratory System

8. Digestive System

9. Additional systems as their assets become available.

The system architecture must allow additional systems to be registered through data configuration rather than requiring a completely new viewer.

## 4.3 Anatomical Detail Levels

Organize anatomical information into three levels.

**Level 1 — Overview**

A beginner-friendly introduction to the selected system.

**Level 2 — Structure**

Individual anatomical structures, names, locations, and functions.

**Level 3 — Advanced Detail**

Detailed terminology, anatomical relationships, additional explanations, and references.

---

# 5. CORE FEATURE REQUIREMENTS

## 5.1 Interactive 3D Anatomy Viewer

**Priority: P0 — Essential**

The central experience of AnatoSphere 3D.

Users should be able to interact directly with the 3D human model.

### Required Features

- Rotate the model using mouse or touch.

- Zoom in and out.

- Pan the viewing area.

- Reset camera position.

- Select individual anatomical structures.

- Highlight selected structures.

- Display anatomical labels.

- Focus the camera on a selected structure.

- Support smooth camera transitions.

- Provide clear loading and error states.

### Interaction Requirements

Desktop:

- Left mouse drag: rotate.

- Scroll wheel: zoom.

- Appropriate drag or modifier gesture: pan.

- Click: select structure.

Mobile:

- One-finger drag: rotate.

- Two-finger pinch: zoom.

- Appropriate touch gesture: pan.

- Tap: select structure.

### Acceptance Criteria

- Users can interact with the model without noticeable input delay.

- Camera controls do not interfere with selecting structures.

- The camera can always return to a known default position.

- The viewer remains usable when the selected structure is missing or unavailable.

---

## 5.2 Anatomical Structure Information

**Priority: P0 — Essential**

When users click an anatomical structure, show an information panel.

### Information Panel Contents

- Anatomical name.

- Indonesian translation.

- English name.

- Latin name, when available.

- Anatomical system.

- Body region.

- General location.

- Main function.

- Related anatomical structures.

- Scientific references.

### Example

**Heart / Jantung**

System: Cardiovascular System

Description: The heart is a muscular organ that pumps blood throughout the circulatory system.

Function:

- Maintains blood circulation.

- Delivers oxygenated blood to body tissues.

- Receives blood returning from the body.

References:

- Source title.

- Publisher or institution.

- Relevant chapter or page.

- Direct reference URL.

All example content must be checked against authoritative educational references before being published.

### Acceptance Criteria

- Clicking a recognized structure displays the corresponding information.

- The selected structure is visually distinguished.

- Switching language changes all relevant information.

- Every published anatomical description includes at least one verifiable reference.

---

## 5.3 Anatomical Layer Control

**Priority: P0 — Essential**

Users can show or hide anatomical layers.

Initial layer categories:

- Skin.

- Muscles.

- Skeleton.

- Internal organs.

- Additional system-specific layers when supported.

### Required Interactions

- Show or hide an individual layer.

- Restore all layers.

- Combine multiple layers.

- Isolate one layer.

- Adjust opacity for supported layers.

- Provide a clear active/inactive state.

Important: Layer visibility must operate on actual model components, not merely change decorative interface elements.

---

## 5.4 Exploded View

**Priority: P1 — Advanced**

Provide a visualization that separates selected anatomical structures to make their spatial relationships easier to understand.

### Required Features

- Activate exploded view.

- Animate supported structures moving apart.

- Adjust separation level.

- Restore original anatomical arrangement.

- Allow users to rotate the separated model.

Exploded view must be based on predefined model transformations or an appropriate asset structure.

Do not use arbitrary transformations that distort anatomical relationships.

If an asset does not support exploded view, disable the feature for that asset and provide a clear explanation.

---

## 5.5 Anatomical Search

**Priority: P0 — Essential**

Users can find anatomical structures using a search bar.

### Search Capabilities

- Search in English.

- Search in Indonesian.

- Search by recognized anatomical terminology.

- Support synonyms where available.

- Display matching structures.

- Select a result to highlight the corresponding 3D structure.

- Focus the camera on the selected structure.

### Example

Search: `Jantung`

Results:

- Heart.

- Right atrium.

- Left atrium.

- Right ventricle.

- Left ventricle.

Results must only display structures that exist in the available model and anatomical content dataset.

---

## 5.6 Quiz & Interactive Assessment

**Priority: P1 — Advanced**

An interactive assessment system that helps users evaluate their anatomical knowledge.

### Quiz Types

**A. Multiple Choice**

Users answer questions based on anatomical information.

**B. Identify the Structure**

Users identify a highlighted structure on the 3D model.

**C. System Recognition**

Users identify which anatomical system a structure belongs to.

### Quiz Features

- Select anatomical system.

- Beginner and intermediate difficulty.

- Randomized questions.

- Instant answer feedback.

- Brief explanation for correct answers.

- Reference attached to explanations.

- Score summary.

- Retry quiz.

### Example Question

"Which organ is primarily responsible for pumping blood throughout the body?"

Options:

- Lungs.

- Heart.

- Liver.

- Kidneys.

The quiz system must use the same verified anatomical content dataset as the information panels.

---

## 5.7 Guided Learning / Guided Tour

**Priority: P1 — Advanced**

Provide structured learning sessions for users who prefer step-by-step exploration.

### Features

- Select a body system.

- Start a guided tour.

- Highlight one structure at a time.

- Automatically focus the camera.

- Show an educational explanation.

- Next and Previous controls.

- Show tour completion progress.

- Allow users to exit at any time.

Example:

**Explore the Cardiovascular System**

1. Locate the heart.

2. Explore the chambers.

3. Identify major blood vessels.

4. Understand the basic circulation pathway.

Each tour must have a defined sequence, educational objective, and associated references.

---

## 5.8 Bilingual Localization

**Priority: P0 — Essential**

The application supports:

- English.

- Bahasa Indonesia.

### Requirements

- Language selector available in the main interface.

- All navigation labels are translated.

- All feature descriptions are translated.

- Anatomy descriptions are available in both languages.

- Quiz questions and answers are translated.

- Search supports both languages.

- Language preferences persist between visits.

Do not translate only the interface while leaving important educational content in one language.

Use a centralized localization architecture.

---

# 6. USER EXPERIENCE & INTERFACE DESIGN

## 6.1 Design Direction

**Primary Design Style: Modern Medical Semi-Minimalist**

The interface combines medical professionalism with the visual simplicity of premium modern software.

### Reference Philosophy

**Apple**

- Visual hierarchy.

- Generous spacing.

- Consistent typography.

- Simple navigation.

- Refined transitions.

- Minimal visual clutter.

**BioDigital Human**

- Anatomical model exploration.

- Anatomical selection.

- Layer-based visualization.

- Guided learning concepts.

**Visible Body**

- Educational structure.

- Anatomical discovery.

- Information presentation.

- Learning-oriented interactions.

Do not copy proprietary designs, graphics, branding, or model assets.

## 6.2 Visual Design Principles

- Clean and structured interface.

- Neutral backgrounds.

- Strong typographic hierarchy.

- Minimal decorative elements.

- Professional medical appearance.

- 3D model remains the primary visual focus.

- Consistent spacing and alignment.

- Smooth but restrained transitions.

- Avoid unnecessary gradients and excessive glassmorphism.

### Suggested Color Direction

| Purpose | Suggested Color |
|---|---|
| Primary background | #F5F7FA |
| Main surface | #FFFFFF |
| Primary text | #172033 |
| Secondary text | #64748B |
| Primary accent | #2563EB |
| Secondary accent | #0F9D9A |
| Borders | #E2E8F0 |
| Dark mode background | #101827 |

These are starting design tokens and may be refined during implementation.

### Typography

Use a modern sans-serif typeface.

Typography should prioritize:

- Readability.

- Consistent hierarchy.

- Clear anatomical terminology.

- Comfortable long-form reading.

## 6.3 Main Application Layout

### Desktop Layout

The main exploration interface should use three primary regions.

**Left Sidebar — Navigation**

Contains:

- Application identity.

- Anatomical system selector.

- Layer controls.

- Exploration modes.

- Quiz access.

- Guided tour access.

**Center — 3D Viewer**

Contains:

- Central anatomical model.

- Camera controls.

- Selection highlights.

- Anatomical labels.

- Model loading indicators.

**Right Panel — Information**

Contains:

- Selected structure.

- Anatomical description.

- Function.

- Related structures.

- References.

The interface must allow panels to collapse when users need more space for the 3D model.

### Mobile Layout

The desktop layout must not simply be compressed.

Mobile should use:

- Full-width 3D viewer.

- Compact top navigation.

- Floating viewer controls.

- Bottom sheet for anatomical information.

- Accessible system selector.

- Touch-friendly buttons.

- Collapsible learning controls.

The 3D viewer should remain the primary focus.

## 6.4 Important Interface States

Design and implement:

- Default exploration state.

- Structure selected state.

- Search results state.

- Active layer state.

- Exploded view state.

- Guided tour state.

- Quiz state.

- Model loading state.

- Model unavailable state.

- Error and recovery state.

Do not implement only the default screen.

---

# 7. USER JOURNEY

## 7.1 Main Exploration Journey

1. User opens AnatoSphere 3D.

2. User sees the main application dashboard.

3. User enters Explore Anatomy.

4. A full-body anatomical model loads.

5. User selects a body system.

6. Relevant anatomical structures are displayed.

7. User rotates and zooms the model.

8. User clicks a structure.

9. Information appears in the detail panel.

10. User can search for another structure or change layers.

## 7.2 Guided Learning Journey

1. User opens Guided Learning.

2. User chooses an anatomical system.

3. User starts a guided tour.

4. The camera focuses on the first structure.

5. The application displays an explanation.

6. User continues through the learning sequence.

7. User completes the tour.

8. Application offers a related quiz.

## 7.3 Quiz Journey

1. User opens Quiz.

2. User chooses a body system.

3. User chooses a difficulty level.

4. Questions are displayed.

5. User answers each question.

6. Application provides feedback.

7. User receives a score summary.

8. User can retry or explore the related structures.

---

# 8. TECHNICAL REQUIREMENTS

## 8.1 Recommended Technology Stack

### Frontend

- React.

- TypeScript.

- Vite.

- Tailwind CSS or a consistent component-based CSS system.

### 3D Engine

- Three.js.

- React Three Fiber.

- @react-three/drei.

### State Management

- Zustand or an equivalent lightweight state-management solution.

### Localization

- i18next.

- react-i18next.

### Testing

- Vitest.

- React Testing Library.

- Playwright for browser-based end-to-end testing.

Use compatible stable versions of the dependencies at project initialization. Do not blindly install alpha releases for production features.

## 8.2 Recommended 3D Asset Format

Primary format:

**GLB / GLTF**

Reasons:

- Suitable for web-based 3D applications.

- Supports geometry and materials.

- Supports scene hierarchies.

- Supports animations.

- Can contain multiple objects and structures.

- Compatible with Three.js loading tools.

All model files must be tested before integration.

## 8.3 Anatomical Asset Requirements

This is one of the most important technical requirements.

Anatomical assets should ideally support:

1. Individual anatomical meshes.

2. Unique and stable object names.

3. Logical grouping by anatomical system.

4. Consistent scale and orientation.

5. Suitable material definitions.

6. Alignment across different anatomical layers.

7. Metadata linking meshes to educational content.

Example:

```text
human-body.glb
├── Skeleton
│ ├── Skull
│ ├── Spine
│ ├── Ribcage
│ └── Femur
│
├── Muscular System
│ ├── Biceps
│ ├── Triceps
│ └── Quadriceps
│
└── Internal Organs
├── Heart
├── Lungs
├── Liver
├── Stomach
└── Kidneys
```

This is a logical example, not a requirement that every provider's GLB file uses this exact structure.

If a model is one combined mesh without separately identifiable structures, it may not support the required selection and layer interactions.

Such an asset must be rejected for those features or processed appropriately before implementation.

## 8.4 Recommended Asset Workflow

1. Find an anatomically suitable 3D model.

2. Inspect its licensing conditions.

3. Download the model in GLB/GLTF where available.

4. Inspect it using Blender or a compatible 3D viewer.

5. Check mesh hierarchy and anatomical grouping.

6. Prepare missing metadata.

7. Optimize geometry and textures.

8. Export the processed asset.

9. Integrate into React Three Fiber.

10. Test selection, visibility, and camera interaction.

### Potential Asset Sources

- NIH 3D.

- Other openly licensed 3D anatomy collections.

- Custom Blender models.

- Original models created for the application.

The license of every downloaded asset must be recorded individually.

Do not assume that because a model can be downloaded, it is automatically permitted for redistribution or commercial use.

---

# 9. CAN CLAUDE CODE CREATE THE ANATOMY?

Claude Code should be treated as the development agent, not as an automatic medical-grade 3D modeling system.

### What Claude Code Can Do

- Generate Three.js and React Three Fiber scenes.

- Create simple procedural anatomical shapes.

- Build placeholder human models.

- Generate Blender Python scripts for repetitive modeling tasks.

- Modify model loading pipelines.

- Map GLB mesh names to anatomical metadata.

- Implement selection and highlighting.

- Implement layer visibility.

- Create camera animations.

- Implement search and quiz functionality.

- Optimize the code and asset loading workflow.

### What Requires Additional Assets or Human Validation

- Highly realistic human anatomy.

- Accurate individual muscles and bones.

- Complex internal organ geometry.

- Anatomical relationships.

- Medical-grade structural accuracy.

- Scientific verification of educational content.

### Recommended Strategy

Use a hybrid asset approach.

**Stage A — Development Prototype**

Claude Code generates simple placeholder anatomy or procedural shapes.

This allows the application to be developed before final assets are ready.

**Stage B — Real Anatomical Models**

Integrate externally sourced, appropriately licensed GLB models.

**Stage C — Asset Refinement**

Use Blender to correct scale, grouping, materials, and hierarchy.

Claude Code may assist by generating scripts, but the final model must still be inspected.

**Stage D — Verification**

Check that the rendered model, anatomical labels, and educational descriptions correspond to each other.

Never present placeholder geometry as medically accurate anatomy.

---

# 10. DATA ARCHITECTURE

## 10.1 Content Structure

Separate 3D model files from anatomical information.

Recommended structure:

```text
src/
app/
components/
features/
anatomy/
viewer/
search/
learning/
quiz/
data/
anatomy/
systems/
tours/
quizzes/
references/
hooks/
lib/
stores/
locales/
en/
id/
styles/
public/
models/
skeleton/
muscles/
organs/
textures/
icons/
```

## 10.2 Anatomical Data Schema

Every anatomical structure should have a structured record.

Example:

```ts
interface AnatomyStructure {
id: string;
systemId: string;
regionId: string;
meshNames: string[];
name: {
en: string;
id: string;
latin?: string;
};
description: {
en: string;
id: string;
};
function: {
en: string;
id: string;
};
synonyms: {
en: string[];
id: string[];
};
relatedStructures: string[];
referenceIds: string[];
reviewStatus:
| "draft"
| "reviewed"
| "approved";
}
```

This is an architectural example. Expand the schema when needed.

## 10.3 Reference Data

Every educational structure must link to one or more reference records.

Suggested fields:

- Reference ID.

- Source title.

- Author or institution.

- Publisher.

- Relevant chapter or section.

- Direct URL.

- Publication or revision date, when available.

- Date accessed.

- Applicable license, where relevant.

A citation must lead to a source that actually supports the associated information.

Do not generate fabricated references.

## 10.4 Data Separation Principles

- Do not hardcode anatomical descriptions throughout UI components.

- Store educational content centrally.

- Keep English and Indonesian content synchronized.

- Separate model metadata from educational data.

- Allow new systems to be added without rewriting the 3D viewer.

- Keep model-specific transformations configurable.

---

# 11. NON-FUNCTIONAL REQUIREMENTS

## 11.1 Performance

The application must be optimized for real-world desktop and mobile hardware.

Requirements:

- Lazy-load anatomical models.

- Avoid loading every 3D asset at startup.

- Optimize GLB file sizes.

- Use appropriate texture resolutions.

- Minimize unnecessary React re-renders.

- Avoid loading unused anatomical systems.

- Dispose of unused 3D resources appropriately.

- Provide a fallback for unsupported WebGL environments.

Performance targets:

- Aim for approximately 60 FPS on capable desktop devices.

- Aim for stable performance around 30 FPS or better on supported mid-range mobile devices.

- Keep the initial experience responsive while models load.

- Measure actual performance on representative devices rather than assuming it.

## 11.2 Responsive Design

Must support:

- Desktop browsers.

- Laptop browsers.

- Tablet browsers.

- Mobile browsers.

Test both mouse and touch interactions.

## 11.3 Accessibility

- Clear keyboard-accessible navigation.

- Semantic controls.

- Appropriate labels for buttons.

- Sufficient text contrast.

- Readable typography.

- Reduced-motion support.

- Non-3D alternatives for finding and reading anatomical information.

Users must not be forced to use the 3D canvas to access essential educational information.

## 11.4 Reliability

- Handle model loading failures.

- Handle missing structure metadata.

- Prevent application crashes when assets are unavailable.

- Preserve navigation state when practical.

- Display useful error messages.

---

# 12. DEVELOPMENT ROADMAP

Development must be incremental.

Do not attempt to implement every planned feature in one enormous coding task.

## PHASE 0 — Research & Technical Foundation

**Objective:** Verify that the project's 3D asset strategy is technically viable.

Tasks:

- Initialize the React and TypeScript project.

- Configure Three.js and React Three Fiber.

- Create the base 3D scene.

- Test a sample GLB model.

- Inspect anatomical mesh hierarchy.

- Test object selection.

- Test layer visibility.

- Evaluate mobile performance.

- Establish the asset licensing and attribution workflow.

**Completion Criteria:**

A working technical prototype with at least one suitable anatomical model.

Do not begin full-scale content development before this stage succeeds.

## PHASE 1 — MVP

**Objective:** Deliver a genuinely usable anatomy exploration application.

Features:

- Responsive application layout.

- Main 3D viewer.

- Full-body anatomical overview where assets permit.

- Initial skeletal, muscular, and major internal organ content.

- Camera navigation.

- Structure selection.

- Highlighting.

- Information panels.

- Basic layer controls.

- Anatomical search.

- English and Indonesian language support.

- Initial anatomical references.

Minimum educational content target:

- A curated starting set of at least 30 individually documented structures, depending on asset coverage.

- At least one introductory learning experience.

**Completion Criteria:**

Users can load the model, explore it, select supported structures, read the descriptions, search for structures, and change language.

The experience must work on desktop and mobile.

## PHASE 2 — Advanced Learning

**Objective:** Expand the application from an anatomy viewer into a learning platform.

Features:

- Additional anatomical systems.

- Exploded view.

- Guided tours.

- Interactive quizzes.

- More detailed anatomical information.

- Related structure navigation.

- Improved model transitions.

- Layer opacity controls.

**Completion Criteria:**

Users can complete a guided learning session and an interactive anatomy quiz.

## PHASE 3 — Professional Expansion

**Objective:** Improve the depth and quality of the platform.

Potential features:

- Expanded coverage of all major anatomical systems.

- Higher-quality anatomical models.

- More granular anatomical structures.

- Additional camera and visualization modes.

- More advanced quizzes.

- Saved structures and favorites.

- Progress tracking.

- More educational modules.

- Enhanced mobile performance.

Features in this stage should be prioritized based on actual user value and technical feasibility.

---

# 13. MVP ACCEPTANCE CRITERIA

The MVP is not complete merely because the interface looks polished.

All the following conditions must be met.

### 3D Viewer

- [ ] Anatomical model loads successfully.

- [ ] Rotation works.

- [ ] Zoom works.

- [ ] Camera reset works.

- [ ] Supported anatomical structures can be selected.

- [ ] Selection highlights the correct mesh.

### Anatomical Information

- [ ] Information panel displays selected structure.

- [ ] Names are available in both languages.

- [ ] Description and function are available.

- [ ] References are accessible.

- [ ] No fabricated anatomical information.

### Layers

- [ ] Supported layers can be hidden.

- [ ] Supported layers can be shown again.

- [ ] Visibility works on actual 3D objects.

### Search

- [ ] Search accepts English terms.

- [ ] Search accepts Indonesian terms.

- [ ] Search results correspond to available structures.

- [ ] Selecting a result focuses the appropriate structure.

### Localization

- [ ] Language selector works.

- [ ] Navigation is translated.

- [ ] Anatomical information is translated.

- [ ] Language preference persists.

### Responsive

- [ ] Desktop interface works.

- [ ] Tablet layout works.

- [ ] Mobile layout works.

- [ ] Touch interactions work.

### Quality

- [ ] No major console errors.

- [ ] Model loading errors are handled.

- [ ] No important placeholder controls presented as functional features.

- [ ] Main user journey can be completed.

---

# 14. RISKS AND MITIGATION

| Risk | Impact | Mitigation |
|---|---|---|
| Poor anatomical asset quality | High | Inspect assets before integration |
| Combined meshes without identifiable parts | High | Reject or preprocess assets |
| Unclear model licensing | High | Record and verify every license |
| Large GLB files | High | Optimize and lazy-load models |
| Inaccurate descriptions | High | Use references and educational review |
| Mobile GPU limitations | Medium | Reduce geometry and texture complexity |
| Complex feature scope | High | Follow roadmap and prioritize MVP |
| Translation inconsistency | Medium | Centralized bilingual content |
| Exploded view misalignment | Medium | Use configured transformations per asset |

---

# 15. CONTENT ACCURACY & SOURCE POLICY

Scientific reliability is a core product requirement.

### Approved Reference Approach

Use recognized educational and institutional sources.

Initial reference candidates:

- OpenStax Anatomy & Physiology.

- NIH educational and scientific resources.

- Recognized anatomy textbooks.

- University educational materials.

- Peer-reviewed educational references where applicable.

### Content Rules

1. Every published anatomical explanation must have an actual source.

2. Never invent scientific citations.

3. Do not copy large passages from copyrighted textbooks.

4. Use accurate anatomical terminology.

5. Ensure English and Indonesian descriptions have equivalent meaning.

6. Clearly distinguish simplified educational explanations from advanced information.

7. Mark draft content separately from reviewed content.

8. Seek review from a qualified anatomy educator or relevant professional before claiming medical-grade validation.

All text, diagrams, images, and 3D assets must comply with their respective licensing terms.

---

# 16. SUCCESS METRICS

Evaluate the application's success through:

**Usability**

- Users can find anatomical structures without confusion.

- The model responds consistently to interactions.

- Users can navigate the interface on desktop and mobile.

**Learning Experience**

- Users can complete guided tours.

- Users can complete quizzes.

- Users can access explanations and their sources.

**Technical Quality**

- Models load reliably.

- No critical runtime errors.

- Smooth interaction on supported devices.

- No major mobile layout issues.

**Content Quality**

- Published information has verifiable sources.

- Terminology is consistent.

- The bilingual experience is complete.

---

# 17. DEVELOPMENT PRINCIPLES FOR CLAUDE CODE

The following principles apply throughout implementation.

### Principle 1 — Build Working Features

A button must perform its advertised function.

Do not create decorative controls that appear interactive but do nothing.

### Principle 2 — Prioritize Architecture

Build reusable systems for:

- 3D models.

- Anatomical selection.

- Layer visibility.

- Anatomical metadata.

- Localization.

- Search.

- Learning modules.

Avoid putting the entire application into one massive component.

### Principle 3 — Respect Scientific Accuracy

Never invent anatomy, anatomical relationships, or citations.

If content is unavailable, mark it as unavailable or draft.

### Principle 4 — Respect Asset Integrity

Do not assume mesh names, anatomical groupings, or object transforms.

Inspect the model before implementing features that depend on its hierarchy.

### Principle 5 — Maintain Performance

Use appropriate loading strategies and optimization techniques.

Do not sacrifice the mobile experience for unnecessary visual effects.

### Principle 6 — Maintain Visual Consistency

Follow one design system throughout the application.

Do not allow each page or component to develop a completely different visual style.

### Principle 7 — Test Continuously

After implementing each major feature:

- Run the application.

- Check browser console.

- Test the feature.

- Test responsive layouts.

- Fix regressions before continuing.

### Principle 8 — Work Incrementally

Complete the current development phase before moving to the next one.

Do not skip asset verification or testing merely to produce more interface features.

---

# 18. FINAL PRODUCT DEFINITION

AnatoSphere 3D is an interactive bilingual human anatomy learning platform built around a realistic and explorable 3D human model.

Its main experience is a central anatomical viewer supported by structured educational information, layer-based exploration, anatomical search, guided learning, and interactive quizzes.

The first release must prioritize:

- A functional 3D viewer.

- Reliable anatomical assets.

- Structure selection.

- Anatomical information.

- Layer visibility.

- Search.

- Responsive design.

- Bilingual support.

Future releases will expand anatomical coverage, educational depth, and interactive functionality.

**The primary product principle:**

"Build a scientifically responsible anatomy learning experience where the 3D model is not just something users look at, but something they can actively explore and learn from."

---

**END OF PRD — ANATOSPHERE 3D v1.0**