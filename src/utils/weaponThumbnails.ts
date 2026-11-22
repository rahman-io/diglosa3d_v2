import * as THREE from 'three';
import { WEAPON_ORDER } from '../data/diglosaCatalog';
import { createMaterialPalette } from '../three/materials';
import { createWeaponMesh } from '../three/weaponModels';
import { WeaponId } from '../types/game';

let cachedThumbnails: Partial<Record<WeaponId, string>> | null = null;

/**
 * Renders each 3D weapon model once onto a transparent 128x128 PNG data URL
 * using a short-lived offscreen WebGLRenderer so HUD weapon switchers can
 * display true 3D weapon silhouettes with zero runtime WebGL context overhead.
 */
export function getWeaponThumbnails(): Partial<Record<WeaponId, string>> {
  if (cachedThumbnails) return cachedThumbnails;
  if (typeof document === 'undefined') return {};

  const result: Partial<Record<WeaponId, string>> = {};
  let renderer: THREE.WebGLRenderer | null = null;

  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'default',
    });
    renderer.setSize(160, 160, false);
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    camera.position.set(1.42, 0.44, 1.12);
    camera.lookAt(0, 0, 0);

    const hemi = new THREE.HemisphereLight(0xfffbeb, 0x334155, 1.55);
    const key = new THREE.DirectionalLight(0xfff7ed, 2.4);
    key.position.set(3, 5, 4);
    const rim = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rim.position.set(-4, 2, -3);
    const fill = new THREE.DirectionalLight(0xffffff, 0.95);
    fill.position.set(0, -2, 3);
    scene.add(hemi, key, rim, fill);

    const palette = createMaterialPalette(renderer, true);
    const box = new THREE.Box3();
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();

    for (const weaponId of WEAPON_ORDER) {
      const pivot = new THREE.Group();
      const mesh = createWeaponMesh(weaponId, palette, 1.0);
      box.setFromObject(mesh);
      box.getCenter(center);
      box.getSize(size);
      mesh.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z, 0.45);
      const fitScale = 1.24 / maxDim;
      pivot.add(mesh);
      pivot.scale.setScalar(fitScale);
      pivot.rotation.set(0.1, 0.58, -0.06);

      scene.add(pivot);
      renderer.render(scene, camera);
      result[weaponId] = renderer.domElement.toDataURL('image/png');
      scene.remove(pivot);

      pivot.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
        }
      });
    }

    palette.dispose();
    const gl = renderer.getContext();
    renderer.dispose();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    cachedThumbnails = result;
  } catch {
    try {
      renderer?.dispose();
    } catch {
      // ignore
    }
    return {};
  }

  return cachedThumbnails;
}
