# Asset provenance: AnatoSphere body model

| Field | Value |
|---|---|
| Files | `skin.glb`, `muscles.glb`, `skeleton.glb`, `organs.glb`, `body.manifest.json`, `body.build-report.json` |
| Derived from | **BodyParts3D**, data release 4.0 (2013-06-19), `isa_BP3D_4.0_obj_99.zip` and `partof_BP3D_4.0_obj_99.zip` |
| Publisher | Database Center for Life Science (DBCLS), Research Organization of Information and Systems, Japan |
| Source page | https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html |
| Downloaded | 2026-10-31 (PART-OF) and 2026-11-03 (IS-A) |
| Source license (official page) | **CC BY 4.0**: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html (page updated 2025-02-27) |
| License of this derived model | **CC BY-SA 4.0**: https://creativecommons.org/licenses/by-sa/4.0/ (decided 2026-11-03) |
| Required attribution | "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International" |

## License discrepancy (recorded, not resolved by assumption)

The comment header of every source OBJ file still says:

> "The license for this database is specified in the Creative Commons Attribution-Share Alike 2.1 Japan … licensed under CC Attribution-Share Alike 2.1 Japan"

The official license page currently states CC BY 4.0. To satisfy both readings, this project:

1. shows the attribution above, a statement of the modifications, and both licenses wherever the model is shown (the app does this under "About this model"), and
2. licenses this **derived model** under **CC BY-SA 4.0**, which is intended to meet the share-alike condition if the older license applies. The project owner chose this on 2026-11-03 for an open-source portfolio project. This is a practical compliance choice, not legal advice.

This license covers the model files only. The application code is under the MIT License (see `LICENSE`).

## Modifications made (scripts/build-body.mjs)

- **Selected** these concepts:
  - Skin: `skin` (FMA7163).
  - Muscles: `muscle organ`, `head of muscle organ`, `zone of muscle organ`, the ascending and descending parts of trapezius, and the sets of lumbricals, interossei and levatores costarum.
  - Skeleton: `bone organ`, the three parts of the sternum, `costal cartilage`, `intervertebral disk`.
  - Organs: 19 organs, listed in the script.
- **Named** each structure from its OBJ header (`Concept ID`, `English name`). Eight files have empty headers. They take the name of their mirrored twin file, which agrees with the dataset's table.
- **Merged** files that share one concept into one mesh, and merged all files of each organ into one mesh.
- **Converted** millimetres to metres, and rotated Z-up to glTF Y-up with the body's front facing +Z. The axes were measured from the data (sternum vs. vertebral column, brain position). The build fails if the result would be mirrored (the left lung must be on +X).
- **Welded** vertices, simplified with meshoptimizer, recomputed normals, and applied meshopt compression. The ratio and error limit for each layer are in the script. Triangles went from about 4.03 million to 881,778.
- **Added** glTF `extras`: `structureId`, `layerId`, `conceptId`, and license notes.

Geometry was compared for one file present in both trees (FJ3152): the only differences were in comment lines.

## Known limitations of the source data

- The model is based on one adult male.
- **Absent from the dataset**, checked against the model's own part list:
  - Latissimus dorsi, rectus abdominis, internal oblique, transversus abdominis, quadratus lumborum.
  - Masseter, temporalis, pterygoids.
  - The muscles of facial expression (only platysma is present).
- **The lungs have no outer surface.** Each lung consists of airway and blood-vessel meshes only. The app says so on the lung page. No surface was invented.
- Simplification removes geometric detail, and small muscles remain the most detailed relative to their size. Shapes still need visual review by an anatomy educator before being relied on for teaching.

## Rebuild

```sh
# raw data goes to .asset-cache/ (git-ignored)
mkdir -p .asset-cache/bodyparts3d-4.0 && cd .asset-cache/bodyparts3d-4.0
B=https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST
for f in isa_BP3D_4.0_obj_99.zip partof_BP3D_4.0_obj_99.zip isa_element_parts.txt partof_element_parts.txt; do curl -fLO $B/$f; done
unzip isa_BP3D_4.0_obj_99.zip && unzip partof_BP3D_4.0_obj_99.zip && cd ../..
npm run asset:body
```
