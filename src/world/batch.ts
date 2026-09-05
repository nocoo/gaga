import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Bake static decorations by material, while preserving articulated subtrees. */
export function batchStaticMeshes(root: THREE.Group) {
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert();
  const batches = new Map<string, { material: THREE.Material; geometries: THREE.BufferGeometry[]; cast: boolean; receive: boolean }>();
  const meshes: THREE.Mesh[] = [];
  function visit(object: THREE.Object3D) {
    if (object !== root && object.userData.dynamic) return;
    if (object instanceof THREE.Mesh && !Array.isArray(object.material)) {
      const key = `${object.material.uuid}-${object.castShadow}-${object.receiveShadow}`;
      const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
      geometry.applyMatrix4(inverse.clone().multiply(object.matrixWorld));
      // Static meshes in this project share position / normal / uv attributes.
      for (const name of Object.keys(geometry.attributes)) if (!['position', 'normal', 'uv'].includes(name)) geometry.deleteAttribute(name);
      if (!batches.has(key)) batches.set(key, { material: object.material, geometries: [], cast: object.castShadow, receive: object.receiveShadow });
      batches.get(key)!.geometries.push(geometry); meshes.push(object);
    }
    for (const child of object.children) visit(child);
  }
  visit(root);
  for (const batch of batches.values()) {
    const geometry = mergeGeometries(batch.geometries);
    batch.geometries.forEach(g => g.dispose());
    if (!geometry) throw new Error('Static geometry attributes do not match.');
    const combined = new THREE.Mesh(geometry, batch.material);
    combined.castShadow = batch.cast; combined.receiveShadow = batch.receive;
    combined.name = 'static-batch'; root.add(combined);
  }
  meshes.forEach(item => item.removeFromParent());
}
