import {
  DAY_SURFACE_SPAWNS,
  MONSTER_SPECS,
  NIGHT_SURFACE_SPAWNS,
  OverworldSurfaceSpawnTemplate,
} from './monstersCatalog';
import { MonsterType, WaveMonsterGroupSummary } from '../types/game';

export const MIN_RANDOM_WAVE_MONSTERS = 20;
export const MAX_RANDOM_WAVE_MONSTERS = 50;

const LAND_MONSTER_TYPES: MonsterType[] = [
  'forest_slime',
  'poison_beetle',
  'cave_spider',
  'thorn_goblin',
  'wild_boar',
  'dire_wolf',
  'skeleton_warrior',
  'swamp_lizardman',
  'sand_scorpion',
  'lava_imp',
  'stone_gargoyle',
  'jungle_troll',
  'crystal_golem',
  'minotaur_brute',
  'magma_elemental',
  'frost_ogre',
  'iron_juggernaut',
  'ancient_treant',
  'obsidian_hydra',
  'titan_colossus',
];

function createSeededRng(seed: number): () => number {
  let a = (seed >>> 0) || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateRandomWaveSeed(): number {
  return Math.max(1, Math.floor(1 + Math.random() * 2147483640));
}

export function rollRandomWaveCount(seed?: number): number {
  const rng = typeof seed === 'number' ? createSeededRng(seed ^ 0x9e3779b9) : Math.random;
  const span = MAX_RANDOM_WAVE_MONSTERS - MIN_RANDOM_WAVE_MONSTERS + 1;
  return MIN_RANDOM_WAVE_MONSTERS + Math.floor(rng() * span);
}

export function clampWaveCount(count?: number): number {
  if (typeof count !== 'number' || !Number.isFinite(count)) {
    return rollRandomWaveCount();
  }
  return Math.max(
    MIN_RANDOM_WAVE_MONSTERS,
    Math.min(MAX_RANDOM_WAVE_MONSTERS, Math.round(count)),
  );
}

/**
 * Generates a deterministic random wave of 20-50 overworld monsters across the 6 islands.
 * Preserves strong A1 language challenge density (~50% English A1 Word-Shield monsters,
 * ~50% Slingshot Action Duel monsters) while randomizing total count and monster species.
 */
export function generateRandomSurfaceWave(
  seedInput?: number,
  countInput?: number,
): {
  seed: number;
  count: number;
  spawns: OverworldSurfaceSpawnTemplate[];
  summary: WaveMonsterGroupSummary[];
} {
  const seed =
    typeof seedInput === 'number' && Number.isFinite(seedInput) && seedInput > 0
      ? Math.floor(seedInput)
      : generateRandomWaveSeed();
  const count = clampWaveCount(countInput ?? rollRandomWaveCount(seed));
  const rng = createSeededRng(seed);

  // Merge all 80 verified land coordinates (30 day + 50 night) and deduplicate close spots
  const rawAnchors = [...NIGHT_SURFACE_SPAWNS, ...DAY_SURFACE_SPAWNS];
  const shuffledAnchors = [...rawAnchors];
  for (let i = shuffledAnchors.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledAnchors[i], shuffledAnchors[j]] = [shuffledAnchors[j], shuffledAnchors[i]];
  }

  // Pick 6 to 10 featured monster species for this wave so cards look varied yet legible on the VS screen
  const shuffledSpecies = [...LAND_MONSTER_TYPES];
  for (let i = shuffledSpecies.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledSpecies[i], shuffledSpecies[j]] = [shuffledSpecies[j], shuffledSpecies[i]];
  }
  const activeSpeciesCount = Math.min(shuffledSpecies.length, 6 + Math.floor(rng() * 5));
  const waveSpeciesPool = shuffledSpecies.slice(0, activeSpeciesCount);

  // Balance 50% English A1 challenge monsters (combatOnly=false) and 50% Duel monsters (combatOnly=true)
  const quizFlags: boolean[] = [];
  for (let i = 0; i < count; i++) {
    quizFlags.push(i % 2 === 0);
  }
  for (let i = quizFlags.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [quizFlags[i], quizFlags[j]] = [quizFlags[j], quizFlags[i]];
  }

  const spawns: OverworldSurfaceSpawnTemplate[] = [];
  for (let i = 0; i < count; i++) {
    const anchor = shuffledAnchors[i % shuffledAnchors.length];
    const type = waveSpeciesPool[Math.floor(rng() * waveSpeciesPool.length)];
    const spec = MONSTER_SPECS[type];
    const isQuiz = quizFlags[i];
    spawns.push({
      zoneId: anchor.zoneId,
      type,
      name: isQuiz ? `${spec.name} Kata` : spec.name,
      x: anchor.x + (rng() - 0.5) * 3.0,
      z: anchor.z + (rng() - 0.5) * 3.0,
      combatOnly: !isQuiz,
    });
  }

  return {
    seed,
    count,
    spawns,
    summary: summarizeWaveMonsters(
      spawns.map((s) => ({ type: s.type, combatOnly: s.combatOnly })),
    ),
  };
}

const TIER_RANK: Record<'giant' | 'large' | 'medium' | 'small', number> = {
  giant: 4,
  large: 3,
  medium: 2,
  small: 1,
};

export function summarizeWaveMonsters(
  entries: Array<{ type: MonsterType; combatOnly: boolean }>,
): WaveMonsterGroupSummary[] {
  const byType = new Map<MonsterType, WaveMonsterGroupSummary>();
  for (const item of entries) {
    const spec = MONSTER_SPECS[item.type];
    if (!spec) continue;
    let group = byType.get(item.type);
    if (!group) {
      group = {
        type: item.type,
        name: spec.name,
        tier: spec.tier,
        tierLabel: spec.tierLabel,
        count: 0,
        quizCount: 0,
        combatCount: 0,
      };
      byType.set(item.type, group);
    }
    group.count += 1;
    if (item.combatOnly) {
      group.combatCount += 1;
    } else {
      group.quizCount += 1;
    }
  }
  return Array.from(byType.values()).sort((a, b) => {
    const tDiff = TIER_RANK[b.tier] - TIER_RANK[a.tier];
    if (tDiff !== 0) return tDiff;
    return b.count - a.count;
  });
}
