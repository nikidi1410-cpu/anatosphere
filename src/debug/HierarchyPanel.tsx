import { useMemo } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../stores/useAppStore';
import { sceneRegistry } from '../features/viewer/sceneRegistry';

interface TreeNode {
  name: string;
  type: string;
  structureId?: string;
  layerId?: string;
  triangles?: number;
  children: TreeNode[];
}

function toTree(obj: THREE.Object3D): TreeNode {
  const mesh = obj as THREE.Mesh;
  const g = mesh.isMesh ? mesh.geometry : null;
  return {
    name: obj.name,
    type: obj.type,
    structureId: obj.userData?.structureId,
    layerId: obj.userData?.layerId,
    triangles: g ? (g.index ? g.index.count : g.attributes.position.count) / 3 : undefined,
    children: obj.children.map(toTree),
  };
}

/** Developer view (?debug): the hierarchy exactly as three.js loaded it, plus the matching report. */
export function HierarchyPanel() {
  const asset = useAppStore((s) => s.asset);
  const sceneVersion = useAppStore((s) => s.sceneVersion);
  const data = useMemo(() => {
    if (asset.status !== 'ready') return null;
    return {
      report: sceneRegistry.report(asset.manifest),
      trees: [...sceneRegistry.roots.entries()].map(([url, root]) => ({ url, tree: toTree(root) })),
    };
    // The registry is mutable; sceneVersion is what signals a change.
  }, [asset, sceneVersion]); // oxlint-disable-line react-hooks/exhaustive-deps
  if (!data) return null;
  const r = data.report;

  const download = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'loaded-scene-report.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <details className="about">
      <summary>Hierarchy inspector</summary>
      <dl className="facts">
        <dt>Meshes</dt><dd>{r.meshes}</dd>
        <dt>Triangles</dt><dd>{r.triangles.toLocaleString()}</dd>
        <dt>Materials</dt><dd>{r.materials} ({r.sharedMaterials} shared)</dd>
        <dt>Missing structures</dt><dd>{r.missingStructures.length}</dd>
        <dt>Missing layers</dt><dd>{r.missingLayers.length}</dd>
        <dt>Renamed on load</dt><dd>{r.renamedNodes.length}</dd>
      </dl>
      <ul className="tree">
        {data.trees.map(({ url, tree }) => (
          <li key={url}>{url}<ul><TreeItem node={tree} /></ul></li>
        ))}
      </ul>
      <button type="button" className="quiet-button" onClick={download}>Download scene report (JSON)</button>
    </details>
  );
}

function TreeItem({ node }: { node: TreeNode }) {
  const tag = node.layerId ? ` [layer:${node.layerId}]` : node.structureId ? ` [id:${node.structureId}]` : '';
  const tris = node.triangles !== undefined ? ` ${node.triangles.toLocaleString()}t` : '';
  return (
    <li>
      {node.name || '(unnamed)'} <span className="hint">{node.type}{tag}{tris}</span>
      {node.children.length > 0 && <ul>{node.children.map((c, i) => <TreeItem key={i} node={c} />)}</ul>}
    </li>
  );
}
