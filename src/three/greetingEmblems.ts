import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { MaterialPalette } from './materials';

export const MAX_GREETING_EMBLEMS = 6;

export interface GreetingEmblemSlot {
  active: boolean;
  kind: 'star' | 'heart';
  x: number;
  y: number;
  z: number;
  progress: number;
  phase: number;
}

export interface GreetingEmblemPool {
  group: THREE.Group;
  starMesh: THREE.InstancedMesh;
  heartMesh: THREE.InstancedMesh;
  starGeo: THREE.BufferGeometry;
  heartGeo: THREE.BufferGeometry;
  starMat: THREE.Material;
  heartMat: THREE.Material;
}

const _emblemDummy = new THREE.Object3D();

function createVoxelStarGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const addPart = (w: number, h: number, d: number, rx = 0, ry = 0, rz = 0) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (rx || ry || rz) {
      g.rotateX(rx);
      g.rotateY(ry);
      g.rotateZ(rz);
    }
    parts.push(g);
  };
  addPart(0.32, 0.32, 0.14, 0, 0, Math.PI * 0.25);
  addPart(0.14, 0.5, 0.12);
  addPart(0.5, 0.14, 0.12);
  addPart(0.16, 0.16, 0.18);
  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  merged.computeBoundingSphere();
  return merged;
}

function createVoxelHeartGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const addBox = (w: number, h: number, d: number, x: number, y: number) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(x, y, 0);
    parts.push(g);
  };
  // Crisp symmetric 3D voxel heart silhouette
  addBox(0.18, 0.16, 0.14, -0.11, 0.12);
  addBox(0.18, 0.16, 0.14, 0.11, 0.12);
  addBox(0.42, 0.16, 0.14, 0, 0.01);
  addBox(0.28, 0.14, 0.14, 0, -0.11);
  addBox(0.14, 0.12, 0.14, 0, -0.21);
  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  merged.computeBoundingSphere();
  return merged;
}

export function createGreetingEmblemPool(palette: MaterialPalette): GreetingEmblemPool {
  const group = new THREE.Group();
  group.name = 'citizen_greeting_emblems';

  const starGeo = createVoxelStarGeometry();
  const heartGeo = createVoxelHeartGeometry();

  const starMat = palette.createSurfaceMat({
    color: 0xfde047,
    emissive: 0xfacc15,
    emissiveIntensity: 0.55,
    roughness: 0.2,
    metalness: 0.25,
  });
  const heartMat = palette.createSurfaceMat({
    color: 0xfb7185,
    emissive: 0xf43f5e,
    emissiveIntensity: 0.48,
    roughness: 0.22,
    metalness: 0.15,
  });

  const starMesh = new THREE.InstancedMesh(starGeo, starMat, MAX_GREETING_EMBLEMS);
  starMesh.frustumCulled = false;
  starMesh.castShadow = false;
  starMesh.receiveShadow = false;
  starMesh.visible = false;
  starMesh.count = 0;

  const heartMesh = new THREE.InstancedMesh(heartGeo, heartMat, MAX_GREETING_EMBLEMS);
  heartMesh.frustumCulled = false;
  heartMesh.castShadow = false;
  heartMesh.receiveShadow = false;
  heartMesh.visible = false;
  heartMesh.count = 0;

  group.add(starMesh, heartMesh);
  return { group, starMesh, heartMesh, starGeo, heartGeo, starMat, heartMat };
}

export function updateGreetingEmblemPool(
  pool: GreetingEmblemPool,
  slots: readonly GreetingEmblemSlot[],
  activeCount: number,
  elapsed: number,
): void {
  if (activeCount <= 0) {
    if (pool.starMesh.visible) {
      pool.starMesh.visible = false;
      pool.starMesh.count = 0;
    }
    if (pool.heartMesh.visible) {
      pool.heartMesh.visible = false;
      pool.heartMesh.count = 0;
    }
    return;
  }

  let starIdx = 0;
  let heartIdx = 0;
  const limit = Math.min(activeCount, MAX_GREETING_EMBLEMS);

  for (let i = 0; i < limit; i++) {
    const slot = slots[i];
    if (!slot.active) continue;
    const p = slot.progress;
    const popIn = p < 0.16 ? p / 0.16 : 1;
    const fadeOut = p > 0.78 ? Math.max(0, (1 - p) / 0.22) : 1;
    const baseScale = Math.min(popIn, fadeOut) * (0.86 + Math.sin(elapsed * 5.2 + slot.phase) * 0.1);
    if (baseScale <= 0.02) continue;

    const bob = Math.sin(elapsed * 3.8 + slot.phase) * 0.12 + p * 0.22;
    _emblemDummy.position.set(slot.x, slot.y + bob, slot.z);
    _emblemDummy.rotation.set(0, elapsed * 2.4 + slot.phase, Math.sin(elapsed * 3.0 + slot.phase) * 0.12);
    _emblemDummy.scale.setScalar(baseScale);
    _emblemDummy.updateMatrix();

    if (slot.kind === 'star' && starIdx < MAX_GREETING_EMBLEMS) {
      pool.starMesh.setMatrixAt(starIdx++, _emblemDummy.matrix);
    } else if (heartIdx < MAX_GREETING_EMBLEMS) {
      pool.heartMesh.setMatrixAt(heartIdx++, _emblemDummy.matrix);
    }
  }

  if (starIdx > 0) {
    pool.starMesh.count = starIdx;
    pool.starMesh.visible = true;
    pool.starMesh.instanceMatrix.needsUpdate = true;
  } else if (pool.starMesh.visible) {
    pool.starMesh.visible = false;
    pool.starMesh.count = 0;
  }

  if (heartIdx > 0) {
    pool.heartMesh.count = heartIdx;
    pool.heartMesh.visible = true;
    pool.heartMesh.instanceMatrix.needsUpdate = true;
  } else if (pool.heartMesh.visible) {
    pool.heartMesh.visible = false;
    pool.heartMesh.count = 0;
  }
}

export function disposeGreetingEmblemPool(pool: GreetingEmblemPool): void {
  if (pool.group.parent) {
    pool.group.parent.remove(pool.group);
  }
  pool.starGeo.dispose();
  pool.heartGeo.dispose();
  pool.starMat.dispose();
  pool.heartMat.dispose();
}
