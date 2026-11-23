import * as THREE from 'three';
import { getCharacterPreset } from '../data/characterPresets';
import { createMaterialPalette } from '../three/materials';
import { applyHeroAppearance, createHeroAvatar, createMonsterMesh } from '../three/rpgModels';
import { CharacterPresetId, MonsterType } from '../types/game';

const cachedHeroPortraits: Partial<Record<CharacterPresetId, string>> = {};
const cachedMonsterPortraits: Partial<Record<MonsterType, string>> = {};

function renderBatch(
  heroIds: CharacterPresetId[],
  monsterTypes: MonsterType[],
): void {
  if (typeof document === 'undefined') return;
  const missingHeroes = heroIds.filter((id) => !cachedHeroPortraits[id]);
  const missingMonsters = monsterTypes.filter((t) => !cachedMonsterPortraits[t]);
  if (missingHeroes.length === 0 && missingMonsters.length === 0) return;

  let renderer: THREE.WebGLRenderer | null = null;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'default',
    });
    renderer.setSize(192, 240, false);
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.24;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 192 / 240, 0.1, 30);

    const hemi = new THREE.HemisphereLight(0xfffbeb, 0x1e293b, 1.65);
    const key = new THREE.DirectionalLight(0xfff7ed, 2.35);
    key.position.set(3, 5, 4);
    const rim = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rim.position.set(-4, 2.5, -3);
    const fill = new THREE.DirectionalLight(0xfef3c7, 0.9);
    fill.position.set(0, -1.5, 3.5);
    scene.add(hemi, key, rim, fill);

    const palette = createMaterialPalette(renderer, true);
    const box = new THREE.Box3();
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();

    const snapObject = (obj: THREE.Object3D, yaw: number): string => {
      const pivot = new THREE.Group();
      pivot.add(obj);
      obj.rotation.y = yaw;

      box.setFromObject(pivot);
      box.getCenter(center);
      box.getSize(size);
      obj.position.sub(center);

      const maxDim = Math.max(size.x, size.y * 0.92, size.z, 0.7);
      const dist = maxDim * 2.25;
      camera.position.set(0, maxDim * 0.14, dist);
      camera.lookAt(0, 0, 0);

      scene.add(pivot);
      renderer!.render(scene, camera);
      const url = renderer!.domElement.toDataURL('image/png');
      scene.remove(pivot);

      pivot.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.geometry.dispose();
        }
      });
      return url;
    };

    for (const heroId of missingHeroes) {
      const rig = createHeroAvatar(palette);
      applyHeroAppearance(rig, getCharacterPreset(heroId).colors);
      cachedHeroPortraits[heroId] = snapObject(rig.root, 0.34);
    }

    for (const mType of missingMonsters) {
      const mesh = createMonsterMesh(mType, palette);
      cachedMonsterPortraits[mType] = snapObject(mesh, -0.32);
    }

    palette.dispose();
    const gl = renderer.getContext();
    renderer.dispose();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    try {
      renderer?.dispose();
    } catch {
      // ignore
    }
  }
}

export function getSquadPortraits(
  heroIds: CharacterPresetId[],
  monsterTypes: MonsterType[],
): {
  heroes: Partial<Record<CharacterPresetId, string>>;
  monsters: Partial<Record<MonsterType, string>>;
} {
  renderBatch(heroIds, monsterTypes);
  return {
    heroes: { ...cachedHeroPortraits },
    monsters: { ...cachedMonsterPortraits },
  };
}
