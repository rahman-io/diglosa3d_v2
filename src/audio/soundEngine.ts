// 100% Procedural Web Audio API Synthesis + Custom MP3 SFX + SpeechSynthesis TTS

import { WeaponId } from '../types/game';
import { getDevicePerfProfile } from '../utils/devicePerf';

type AudioClipKey =
  | 'collect'
  | 'correct_answer'
  | 'wrong_answer'
  | 'game_over'
  | 'game_winner'
  | 'monster_1'
  | 'monster_2'
  | 'button_click'
  | 'shoot_1'
  | 'shoot_2'
  | 'grunt'
  | 'boom'
  | 'jump_to_swim';

type AmbientMode = 'none' | 'day' | 'night' | 'deep_sea';

const AUDIO_CLIP_PATHS: Record<AudioClipKey, string> = {
  collect: './assets/aistudio/collect_e2cd5af7.mp3',
  correct_answer: './assets/aistudio/correct_answer_a23e872d.mp3',
  wrong_answer: './assets/aistudio/wrong_answer_16098fa3.mp3',
  game_over: './assets/aistudio/game_over_7c0b1fe2.mp3',
  game_winner: './assets/aistudio/game_winner_f4b7dc9e.mp3',
  monster_1: './assets/aistudio/monster_1_031a334e.mp3',
  monster_2: './assets/aistudio/monster_2_9c814271.mp3',
  button_click: './assets/aistudio/bottom_click_293d8433.mp3',
  shoot_1: './assets/aistudio/shoot_1_00924daf.mp3',
  shoot_2: './assets/aistudio/shoot_2_c4b4b097.mp3',
  grunt: './assets/aistudio/grunt_1342944e.mp3',
  boom: './assets/aistudio/boom_630ba31f.mp3',
  jump_to_swim: './assets/aistudio/jump_to_swim_63f1e6ac.mp3',
};

const WEAPON_SHOOT_CLIP: Record<WeaponId, 'shoot_1' | 'shoot_2'> = {
  ketapel: 'shoot_2',
  kerikil: 'shoot_2',
  emas: 'shoot_1',
  saus: 'shoot_2',
  biji: 'shoot_1',
  kertas: 'shoot_2',
  jarum: 'shoot_1',
  kristal: 'shoot_1',
  harpun: 'shoot_2',
};

const INTRO_AUDIO_PATH = './assets/aistudio/game_intro_1db79a4e.mp3';
const PROLOGUE_SCENE_AUDIO_PATHS: Record<number, { path: string; volume: number }> = {
  0: { path: './assets/aistudio/scene_1_65ae3f36.mp3', volume: 0.42 },
  1: { path: './assets/aistudio/scene_2_7f364184.mp3', volume: 0.42 },
  2: { path: './assets/aistudio/scene_3_e9f4fb5b.mp3', volume: 0.42 },
  3: { path: './assets/aistudio/scene_4_f344cecb.mp3', volume: 0.44 },
};
const WALK_AUDIO_PATH = './assets/aistudio/walk_adce5e54.mp3';
const SWIM_AUDIO_PATH = './assets/aistudio/swimming_1e6d979c.mp3';
const AMBIENT_AUDIO_PATHS: Record<Exclude<AmbientMode, 'none'>, string> = {
  day: './assets/aistudio/morning_afternoon_f080cd3e.mp3',
  night: './assets/aistudio/evening_night_cbbbc15c.mp3',
  deep_sea: './assets/aistudio/deep_sea_44a86af6.mp3',
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private muted = false;
  private clipTemplates: Partial<Record<AudioClipKey, HTMLAudioElement>> = {};
  private activeClips = new Set<HTMLAudioElement>();
  private lastClipAt: Partial<Record<AudioClipKey | 'monster_any', number>> = {};
  private walkAudio: HTMLAudioElement | null = null;
  private isWalking = false;
  private swimAudio: HTMLAudioElement | null = null;
  private isSwimmingSound = false;
  private introAudio: HTMLAudioElement | null = null;
  private introActive = false;
  private prologueAudios: Partial<Record<number, HTMLAudioElement>> = {};
  private activePrologueScene: number | null = null;
  private prologueFadeTimers: Partial<Record<number, number>> = {};
  private ambientAudios: Partial<Record<Exclude<AmbientMode, 'none'>, HTMLAudioElement>> = {};
  private ambientMode: AmbientMode = 'none';
  private carEngineOsc: OscillatorNode | null = null;
  private carEngineGain: GainNode | null = null;
  private carEngineFilter: BiquadFilterNode | null = null;
  private carEngineActive = false;
  private planeEngineOsc: OscillatorNode | null = null;
  private planeEngineGain: GainNode | null = null;
  private planeEngineFilter: BiquadFilterNode | null = null;
  private planeEngineActive = false;

  constructor() {
    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      const isLowEnd = getDevicePerfProfile().isLowEnd;
      const instantClips = new Set<AudioClipKey>([
        'button_click',
        'collect',
        'correct_answer',
        'wrong_answer',
        'shoot_1',
        'shoot_2',
      ]);
      (Object.keys(AUDIO_CLIP_PATHS) as AudioClipKey[]).forEach((key) => {
        const audio = new Audio(AUDIO_CLIP_PATHS[key]);
        audio.preload = isLowEnd && !instantClips.has(key) ? 'metadata' : 'auto';
        this.clipTemplates[key] = audio;
      });
      const intro = new Audio(INTRO_AUDIO_PATH);
      intro.preload = 'metadata';
      intro.loop = true;
      intro.volume = 0.34;
      this.introAudio = intro;

      (Object.keys(PROLOGUE_SCENE_AUDIO_PATHS) as Array<string>).forEach((k) => {
        const idx = Number(k);
        const spec = PROLOGUE_SCENE_AUDIO_PATHS[idx];
        const track = new Audio(spec.path);
        track.preload = 'metadata';
        track.loop = true;
        track.volume = spec.volume;
        this.prologueAudios[idx] = track;
      });

      const walk = new Audio(WALK_AUDIO_PATH);
      walk.preload = 'metadata';
      walk.loop = true;
      walk.volume = 0.45;
      this.walkAudio = walk;

      const swim = new Audio(SWIM_AUDIO_PATH);
      swim.preload = 'metadata';
      swim.loop = true;
      swim.volume = 0.44;
      this.swimAudio = swim;

      (['day', 'night', 'deep_sea'] as const).forEach((mode) => {
        const amb = new Audio(AMBIENT_AUDIO_PATHS[mode]);
        amb.preload = 'metadata';
        amb.loop = true;
        amb.volume = mode === 'day' ? 0.24 : mode === 'deep_sea' ? 0.3 : 0.26;
        this.ambientAudios[mode] = amb;
      });

      const onPointerDownGlobal = (e: PointerEvent) => {
        const target = e.target as Element | null;
        const btn = target?.closest('button, [role="button"]');
        if (
          btn &&
          !(btn as HTMLButtonElement).disabled &&
          !btn.getAttribute('aria-disabled') &&
          !btn.hasAttribute('data-no-click-sfx')
        ) {
          this.playButtonClick();
        }
        this.syncIntroPlayback();
        this.syncProloguePlayback();
        this.syncAmbientPlayback();
        this.syncWalkPlayback();
        this.syncSwimPlayback();
      };
      const onKeyDownGlobal = () => {
        this.syncIntroPlayback();
        this.syncProloguePlayback();
        this.syncAmbientPlayback();
        this.syncWalkPlayback();
        this.syncSwimPlayback();
      };
      window.addEventListener('pointerdown', onPointerDownGlobal, { capture: true, passive: true });
      window.addEventListener('keydown', onKeyDownGlobal, { capture: true, passive: true });
    }
  }

  private syncIntroPlayback(): void {
    const el = this.introAudio;
    if (!el) return;
    if (this.muted || !this.introActive) {
      if (!el.paused) {
        el.pause();
        el.currentTime = 0;
      }
      return;
    }
    if (el.paused) {
      el.play().catch(() => {});
    }
  }

  private syncWalkPlayback(): void {
    const el = this.walkAudio;
    if (!el) return;
    if (this.muted || !this.isWalking) {
      if (!el.paused) {
        el.pause();
      }
      return;
    }
    if (el.paused) {
      el.play().catch(() => {});
    }
  }

  private syncSwimPlayback(): void {
    const el = this.swimAudio;
    if (!el) return;
    if (this.muted || !this.isSwimmingSound) {
      if (!el.paused) {
        el.pause();
      }
      return;
    }
    if (el.paused) {
      el.play().catch(() => {});
    }
  }

  private syncAmbientPlayback(): void {
    (['day', 'night', 'deep_sea'] as const).forEach((mode) => {
      const el = this.ambientAudios[mode];
      if (!el) return;
      const shouldPlay =
        !this.muted &&
        !this.introActive &&
        this.activePrologueScene === null &&
        this.ambientMode === mode;
      if (shouldPlay) {
        if (el.paused) {
          el.play().catch(() => {});
        }
      } else if (!el.paused) {
        el.pause();
      }
    });
  }

  private clearPrologueSceneFade(sceneIndex: number): void {
    const timer = this.prologueFadeTimers[sceneIndex];
    if (timer !== undefined && typeof window !== 'undefined') {
      window.clearInterval(timer);
      delete this.prologueFadeTimers[sceneIndex];
    }
  }

  private syncProloguePlayback(): void {
    (Object.keys(PROLOGUE_SCENE_AUDIO_PATHS) as Array<string>).forEach((k) => {
      const idx = Number(k);
      const el = this.prologueAudios[idx];
      if (!el) return;
      const isTarget = this.activePrologueScene === idx;
      if (this.muted || !isTarget) {
        if (this.muted && !el.paused) {
          el.pause();
        }
        return;
      }
      if (el.paused) {
        el.play().catch(() => {});
      }
    });
  }

  public setPrologueSceneMusic(sceneIndex: number | null): void {
    if (this.activePrologueScene === sceneIndex) return;
    const prevScene = this.activePrologueScene;
    this.activePrologueScene = sceneIndex;

    if (prevScene !== null) {
      this.clearPrologueSceneFade(prevScene);
      const prevEl = this.prologueAudios[prevScene];
      const prevSpec = PROLOGUE_SCENE_AUDIO_PATHS[prevScene];
      if (prevEl) {
        if (typeof window !== 'undefined' && !prevEl.paused) {
          this.prologueFadeTimers[prevScene] = window.setInterval(() => {
            if (this.activePrologueScene === prevScene) {
              this.clearPrologueSceneFade(prevScene);
              return;
            }
            const nextVol = Math.max(0, prevEl.volume - 0.06);
            prevEl.volume = nextVol;
            if (nextVol <= 0.01) {
              prevEl.pause();
              prevEl.currentTime = 0;
              prevEl.volume = prevSpec?.volume ?? 0.42;
              this.clearPrologueSceneFade(prevScene);
            }
          }, 50);
        } else {
          prevEl.pause();
          prevEl.currentTime = 0;
          prevEl.volume = prevSpec?.volume ?? 0.42;
        }
      }
    }

    if (sceneIndex !== null) {
      this.clearPrologueSceneFade(sceneIndex);
      const el = this.prologueAudios[sceneIndex];
      const spec = PROLOGUE_SCENE_AUDIO_PATHS[sceneIndex];
      const targetVol = spec?.volume ?? 0.42;
      if (el) {
        el.currentTime = 0;
        el.volume = 0.04;
        if (!this.muted) {
          el.play().catch(() => {});
        }
        if (typeof window !== 'undefined') {
          this.prologueFadeTimers[sceneIndex] = window.setInterval(() => {
            if (this.activePrologueScene !== sceneIndex) {
              this.clearPrologueSceneFade(sceneIndex);
              return;
            }
            const nextVol = Math.min(targetVol, el.volume + 0.045);
            el.volume = nextVol;
            if (nextVol >= targetVol) {
              this.clearPrologueSceneFade(sceneIndex);
            }
          }, 70);
        } else {
          el.volume = targetVol;
        }
      }
    }

    this.syncAmbientPlayback();
  }

  public setPrologueScene1Music(active: boolean): void {
    this.setPrologueSceneMusic(active ? 0 : null);
  }

  public setIntroMusic(active: boolean): void {
    if (this.introActive === active) return;
    this.introActive = active;
    this.syncIntroPlayback();
    this.syncAmbientPlayback();
  }

  public playButtonClick(): void {
    this.playClip('button_click', 0.55, 45);
  }

  public setWalking(walking: boolean, playbackRate = 1.0): void {
    this.isWalking = walking;
    if (this.walkAudio) {
      this.walkAudio.playbackRate = playbackRate;
    }
    this.syncWalkPlayback();
  }

  public setSwimmingAudio(swimming: boolean, playbackRate = 1.0): void {
    this.isSwimmingSound = swimming;
    if (this.swimAudio) {
      this.swimAudio.playbackRate = playbackRate;
    }
    this.syncSwimPlayback();
  }

  public setAmbientMode(mode: AmbientMode): void {
    if (this.ambientMode === mode) return;
    this.ambientMode = mode;
    this.syncAmbientPlayback();
  }

  private playClip(
    key: AudioClipKey,
    volume = 0.75,
    cooldownMs = 0,
    cooldownBucket?: AudioClipKey | 'monster_any',
  ): void {
    if (this.muted || typeof Audio === 'undefined') return;
    const nowMs = Date.now();
    const bucket = cooldownBucket || key;
    if (cooldownMs > 0) {
      const prev = this.lastClipAt[bucket] || 0;
      if (nowMs - prev < cooldownMs) return;
      this.lastClipAt[bucket] = nowMs;
    }
    const base = this.clipTemplates[key];
    const el = base
      ? (base.cloneNode(true) as HTMLAudioElement)
      : new Audio(AUDIO_CLIP_PATHS[key]);
    el.volume = Math.max(0, Math.min(1, volume));
    this.activeClips.add(el);
    const cleanup = () => {
      this.activeClips.delete(el);
    };
    el.addEventListener('ended', cleanup, { once: true });
    el.addEventListener('error', cleanup, { once: true });
    el.play().catch(cleanup);
  }

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.activeClips.forEach((el) => {
        try {
          el.pause();
          el.currentTime = 0;
        } catch {
          // ignore
        }
      });
      this.activeClips.clear();
    }
    this.syncIntroPlayback();
    this.syncProloguePlayback();
    this.syncWalkPlayback();
    this.syncSwimPlayback();
    this.syncAmbientPlayback();
    if (muted) {
      this.setCarEngine(false, 0);
      this.stopSpeech();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private beep(
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    slideTo?: number,
    delay = 0,
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), now + duration);
    }
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private noise(duration: number, volume: number, delay = 0, highpassHz = 600): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (!this.noiseBuf) {
      const len = Math.floor(ctx.sampleRate * 0.5);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuf = buf;
    }
    const now = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(highpassHz, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    src.stop(now + duration + 0.02);
  }

  // 14 Diglosa SFX
  public playTick(): void {
    this.beep(980, 0.018, 'triangle', 0.04);
  }

  public playFanfare(): void {
    this.playClip('game_winner', 0.78, 300);
  }

  public playLose(): void {
    this.playClip('game_over', 0.82, 300);
  }

  public playShoot(weaponId?: WeaponId): void {
    const key: AudioClipKey = weaponId ? WEAPON_SHOOT_CLIP[weaponId] : 'shoot_1';
    this.playClip(key, 0.72, 35);
  }

  public playHit(): void {
    this.noise(0.08, 0.08, 0, 900);
    this.beep(210, 0.09, 'square', 0.07, 110);
  }

  public playBoom(): void {
    this.playClip('boom', 0.85, 80);
  }

  public playHurt(): void {
    this.playClip('grunt', 0.8, 120);
  }

  public playPick(): void {
    this.playClip('collect', 0.72, 60);
  }

  public playDoor(): void {
    [330, 495, 660].forEach((f, i) => {
      this.beep(f, 0.16, 'triangle', 0.1, undefined, i * 0.06);
    });
  }

  public playMonster(): void {
    const key: AudioClipKey = Math.random() < 0.5 ? 'monster_1' : 'monster_2';
    this.playClip(key, 0.72, 800, 'monster_any');
  }

  public playBoss(): void {
    this.playMonster();
  }

  public playOk(): void {
    this.playClip('correct_answer', 0.76, 40);
  }

  public playWrongAnswer(): void {
    this.playClip('wrong_answer', 0.76, 40);
  }

  public playNo(): void {
    this.beep(190, 0.16, 'sawtooth', 0.08, 130);
    this.beep(145, 0.18, 'sawtooth', 0.07, 100, 0.1);
  }

  public playWin(): void {
    this.playClip('game_winner', 0.78, 300);
  }

  public playFlip(): void {
    this.beep(440, 0.05, 'sine', 0.06, 560);
  }

  public playCountdownTick(step: 3 | 2 | 1 | 'go'): void {
    if (step === 3) {
      this.beep(440, 0.14, 'triangle', 0.11);
    } else if (step === 2) {
      this.beep(523.25, 0.14, 'triangle', 0.12);
    } else if (step === 1) {
      this.beep(659.25, 0.16, 'triangle', 0.13);
    } else {
      this.beep(783.99, 0.14, 'sine', 0.13);
      this.beep(1046.5, 0.24, 'triangle', 0.14, undefined, 0.08);
    }
  }

  // Backward-compatible aliases used across existing modules
  public playSparkPickup(combo = 1): void {
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const idx = Math.min(pentatonic.length - 1, Math.max(0, combo - 1));
    const freq = pentatonic[idx];
    this.beep(freq, 0.13, 'triangle', 0.1, freq * 1.15);
  }

  public playBuild(): void {
    this.playDoor();
  }

  public playUpgrade(): void {
    this.playWin();
  }

  public playDash(): void {
    this.beep(320, 0.14, 'sawtooth', 0.05, 140);
    this.beep(520, 0.14, 'sine', 0.07, 880, 0.02);
  }

  public playJumpToSwim(): void {
    this.playClip('jump_to_swim', 0.85, 750);
  }

  public playSplash(intensity = 1.0): void {
    const scale = Math.max(0.35, Math.min(1.4, intensity));
    this.noise(0.18, 0.09 * scale, 0, 520);
    this.beep(360, 0.12, 'sine', 0.065 * scale, 125);
    this.beep(230, 0.14, 'triangle', 0.045 * scale, 90, 0.04);
  }

  public playSurgeAlert(): void {
    this.playBoss();
  }

  public playQuestComplete(): void {
    this.playWin();
  }

  public playTierUp(): void {
    this.playFanfare();
  }

  public playGameOver(): void {
    this.playLose();
  }

  public playWrong(): void {
    this.playWrongAnswer();
  }

  public playHeartPickup(): void {
    this.playPick();
  }

  public playCarDoor(opening: boolean): void {
    if (opening) {
      this.noise(0.06, 0.055, 0, 1200);
      this.beep(260, 0.09, 'triangle', 0.065, 340, 0.02);
      this.beep(170, 0.22, 'sine', 0.045, 220, 0.08);
    } else {
      this.noise(0.08, 0.08, 0, 500);
      this.beep(135, 0.14, 'triangle', 0.11, 72);
      this.beep(310, 0.05, 'square', 0.03, 180, 0.02);
    }
  }

  public playCarHorn(): void {
    this.beep(415, 0.26, 'sawtooth', 0.065);
    this.beep(523.25, 0.26, 'sawtooth', 0.055);
  }

  public playCarEngineStart(): void {
    this.noise(0.14, 0.045, 0, 380);
    this.beep(78, 0.16, 'sawtooth', 0.075, 130);
    this.beep(112, 0.24, 'triangle', 0.06, 68, 0.14);
  }

  public setCarEngine(active: boolean, speedRatio = 0, turbo = false): void {
    if (this.muted || !active) {
      if (this.carEngineGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.carEngineGain.gain.setTargetAtTime(0.0001, now, 0.08);
      }
      if (this.carEngineActive && (!active || this.muted)) {
        this.carEngineActive = false;
        const osc = this.carEngineOsc;
        const gain = this.carEngineGain;
        this.carEngineOsc = null;
        this.carEngineGain = null;
        this.carEngineFilter = null;
        if (osc) {
          window.setTimeout(() => {
            try {
              osc.stop();
              osc.disconnect();
              gain?.disconnect();
            } catch {
              // ignore
            }
          }, 160);
        }
      }
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx) return;
    if (!this.carEngineOsc || !this.carEngineGain || !this.carEngineFilter) {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(52, ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(210, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      this.carEngineOsc = osc;
      this.carEngineFilter = filter;
      this.carEngineGain = gain;
    }
    this.carEngineActive = true;
    const clamped = Math.max(0, Math.min(1.3, speedRatio));
    const targetFreq = 48 + clamped * 92 + (turbo ? 24 : 0);
    const targetCutoff = 180 + clamped * 380 + (turbo ? 160 : 0);
    const targetGain = 0.024 + clamped * 0.032 + (turbo ? 0.015 : 0);
    const now = ctx.currentTime;
    this.carEngineOsc.frequency.setTargetAtTime(targetFreq, now, 0.08);
    this.carEngineFilter.frequency.setTargetAtTime(targetCutoff, now, 0.08);
    this.carEngineGain.gain.setTargetAtTime(targetGain, now, 0.08);
  }

  public playPlaneCanopy(opening: boolean): void {
    if (opening) {
      this.noise(0.09, 0.045, 0, 1800);
      this.beep(320, 0.14, 'sine', 0.06, 540, 0.02);
    } else {
      this.noise(0.08, 0.06, 0, 720);
      this.beep(260, 0.12, 'triangle', 0.075, 140);
    }
  }

  public playPlaneTakeoff(): void {
    this.noise(0.32, 0.07, 0, 950);
    this.beep(130, 0.28, 'sawtooth', 0.065, 310);
    this.beep(260, 0.24, 'triangle', 0.055, 520, 0.08);
  }

  public playPlaneLand(): void {
    this.noise(0.16, 0.08, 0, 420);
    this.beep(180, 0.16, 'triangle', 0.075, 95);
    this.beep(440, 0.09, 'sine', 0.045, 620, 0.09);
  }

  public playPlaneRing(): void {
    this.beep(587.33, 0.1, 'triangle', 0.065);
    this.beep(880, 0.14, 'sine', 0.075, undefined, 0.06);
  }

  public playPlaneFire(ammo: 'vulcan' | 'missile' | 'bomb' | 'plasma'): void {
    if (ammo === 'vulcan') {
      this.noise(0.04, 0.045, 0, 2200);
      this.beep(240, 0.045, 'square', 0.045, 110);
    } else if (ammo === 'missile') {
      this.noise(0.2, 0.06, 0, 1400);
      this.beep(360, 0.22, 'sawtooth', 0.055, 760);
    } else if (ammo === 'bomb') {
      this.beep(340, 0.16, 'sine', 0.06, 120);
      this.noise(0.1, 0.035, 0, 520);
    } else {
      this.beep(720, 0.14, 'sawtooth', 0.065, 290);
      this.beep(1080, 0.12, 'sine', 0.05, 520, 0.03);
    }
  }

  public setPlaneEngine(active: boolean, speedRatio = 0, turbo = false): void {
    if (this.muted || !active) {
      if (this.planeEngineGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.planeEngineGain.gain.setTargetAtTime(0.0001, now, 0.1);
      }
      if (this.planeEngineActive && (!active || this.muted)) {
        this.planeEngineActive = false;
        const osc = this.planeEngineOsc;
        const gain = this.planeEngineGain;
        this.planeEngineOsc = null;
        this.planeEngineGain = null;
        this.planeEngineFilter = null;
        if (osc) {
          window.setTimeout(() => {
            try {
              osc.stop();
              osc.disconnect();
              gain?.disconnect();
            } catch {
              // ignore
            }
          }, 180);
        }
      }
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx) return;
    if (!this.planeEngineOsc || !this.planeEngineGain || !this.planeEngineFilter) {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(92, ctx.currentTime);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(340, ctx.currentTime);
      filter.Q.setValueAtTime(1.1, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      this.planeEngineOsc = osc;
      this.planeEngineFilter = filter;
      this.planeEngineGain = gain;
    }
    this.planeEngineActive = true;
    const clamped = Math.max(0, Math.min(1.5, speedRatio));
    const targetFreq = 88 + clamped * 125 + (turbo ? 42 : 0);
    const targetCutoff = 320 + clamped * 680 + (turbo ? 320 : 0);
    const targetGain = 0.022 + clamped * 0.03 + (turbo ? 0.018 : 0);
    const now = ctx.currentTime;
    this.planeEngineOsc.frequency.setTargetAtTime(targetFreq, now, 0.09);
    this.planeEngineFilter.frequency.setTargetAtTime(targetCutoff, now, 0.09);
    this.planeEngineGain.gain.setTargetAtTime(targetGain, now, 0.09);
  }

  public playDarkCloudErupt(): void {
    this.noise(0.55, 0.12, 0, 260);
    this.beep(92, 0.55, 'sawtooth', 0.11, 42);
    this.beep(138, 0.42, 'triangle', 0.085, 64, 0.06);
    this.beep(260, 0.28, 'sine', 0.055, 110, 0.14);
  }

  public playDarkCloudVanish(): void {
    this.noise(0.45, 0.1, 0, 720);
    this.beep(140, 0.34, 'sawtooth', 0.08, 420);
    this.beep(420, 0.28, 'triangle', 0.09, 58, 0.24);
  }

  public playVillainLaugh(subtle = false): void {
    const volScale = subtle ? 0.68 : 1.0;
    const bursts: Array<[number, number, number]> = [
      [218, 152, 0.0],
      [204, 140, 0.15],
      [190, 126, 0.3],
      [232, 108, 0.46],
    ];
    bursts.forEach(([startHz, endHz, delay]) => {
      this.beep(startHz, 0.12, 'sawtooth', 0.072 * volScale, endHz, delay);
      this.beep(startHz * 0.52, 0.12, 'triangle', 0.068 * volScale, endHz * 0.5, delay);
    });
    if (!subtle) {
      this.playBoss();
    }
  }

  public playHeroDefiance(): void {
    this.beep(329.63, 0.12, 'triangle', 0.085);
    this.beep(440, 0.14, 'triangle', 0.09, undefined, 0.08);
    this.beep(659.25, 0.22, 'sine', 0.095, 740, 0.16);
  }

  public playPrisonThreatSlam(): void {
    // Metallic iron-bar slam + ominous monster growl rumble
    this.beep(520, 0.09, 'square', 0.075, 210);
    this.beep(790, 0.14, 'triangle', 0.055, 340, 0.018);
    this.noise(0.28, 0.11, 0.015, 310);
    this.beep(98, 0.34, 'sawtooth', 0.09, 44, 0.025);
  }

  public playSadPlea(variant: 'siblings' | 'children' | 'adults' = 'siblings'): void {
    if (variant === 'children') {
      // High, fragile descending notes evoking young crying children
      this.beep(659.25, 0.24, 'sine', 0.055, 622.25, 0.0);
      this.beep(587.33, 0.28, 'sine', 0.055, 523.25, 0.2);
      this.beep(523.25, 0.34, 'triangle', 0.05, 466.16, 0.44);
      this.beep(440.0, 0.52, 'sine', 0.055, 392.0, 0.72);
      return;
    }
    if (variant === 'adults') {
      // Deep, solemn minor lament for exhausted adult villagers
      this.beep(392.0, 0.32, 'triangle', 0.055, 369.99, 0.0);
      this.beep(349.23, 0.36, 'sine', 0.06, 329.63, 0.28);
      this.beep(311.13, 0.42, 'triangle', 0.055, 293.66, 0.6);
      this.beep(261.63, 0.62, 'sine', 0.065, 233.08, 0.96);
      return;
    }
    // Gentle descending minor notes evoking sorrow and vulnerability (siblings)
    this.beep(523.25, 0.28, 'sine', 0.06, 493.88, 0.0);
    this.beep(440.0, 0.32, 'sine', 0.06, 415.3, 0.24);
    this.beep(392.0, 0.38, 'triangle', 0.055, 349.23, 0.52);
    this.beep(329.63, 0.55, 'sine', 0.06, 293.66, 0.84);
  }

  public playBossCrumble(): void {
    this.noise(0.65, 0.12, 0.02, 260);
    this.beep(196, 0.42, 'triangle', 0.075, 92, 0.05);
    this.beep(146.83, 0.55, 'sine', 0.07, 68, 0.25);
    this.beep(587.33, 0.28, 'sine', 0.05, 880, 0.55);
  }

  public playPrisonersCheer(): void {
    [523.25, 659.25, 783.99, 1046.5, 987.77, 1174.66].forEach((freq, i) => {
      this.beep(freq, 0.16, 'triangle', 0.065, freq * 1.04, i * 0.09);
    });
  }

  public playGuardianCall(): void {
    [392.0, 493.88, 587.33, 783.99].forEach((freq, i) => {
      this.beep(freq, 0.22, 'triangle', 0.075, freq * 1.02, i * 0.09);
    });
  }

  public playGardenTransform(): void {
    this.noise(0.5, 0.07, 0.0, 1100);
    [523.25, 659.25, 783.99, 987.77, 1174.66, 1318.51, 1567.98].forEach((freq, i) => {
      this.beep(freq, 0.34, 'sine', 0.065, freq * 1.03, i * 0.11);
      if (i % 2 === 0) {
        this.beep(freq * 0.5, 0.28, 'triangle', 0.05, undefined, i * 0.11);
      }
    });
  }

  public playMistClear(): void {
    // Soft airy breeze shimmer + uplifting sunrise harp arpeggio as island fog lifts
    this.noise(0.85, 0.06, 0.0, 1450);
    [523.25, 659.25, 783.99, 987.77, 1174.66, 1567.98].forEach((freq, i) => {
      this.beep(freq, 0.42, 'sine', 0.065, freq * 1.02, i * 0.14);
      if (i % 2 === 0) {
        this.beep(freq * 0.5, 0.36, 'triangle', 0.045, undefined, i * 0.14);
      }
    });
  }

  public playIslandLiberationFanfare(): void {
    // Heartfelt triumphant village celebration chord progression
    [392.0, 493.88, 587.33, 783.99, 987.77, 1174.66, 1567.98].forEach((freq, i) => {
      this.beep(freq, 0.28, 'triangle', 0.065, freq * 1.02, i * 0.09);
      this.beep(freq * 0.5, 0.28, 'sine', 0.045, undefined, i * 0.09);
    });
  }

  public playDialogueBlip(pitchOffset = 0): void {
    if (this.muted) return;
    const nowMs = Date.now();
    const prev = this.lastClipAt.button_click || 0;
    if (nowMs - prev < 52) return;
    this.lastClipAt.button_click = nowMs;
    const freq = Math.max(320, Math.min(760, 520 + pitchOffset));
    this.beep(freq, 0.028, 'triangle', 0.026, freq + 35);
  }

  public stopSpeech(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore speech synthesis restrictions
    }
  }

  private pickEnglishVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    try {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return null;
      return (
        voices.find((v) => v.lang.toLowerCase() === 'en-us') ||
        voices.find((v) => v.lang.toLowerCase() === 'en-gb') ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
        null
      );
    } catch {
      return null;
    }
  }

  public speakEnglish(text: string, rate = 0.88, pitch = 1.0): void {
    const cleaned = text.trim();
    if (!cleaned || this.muted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      if (synth.paused) {
        synth.resume();
      }
      const utter = new SpeechSynthesisUtterance(cleaned);
      utter.lang = 'en-US';
      const voice = this.pickEnglishVoice();
      if (voice) {
        utter.voice = voice;
      }
      utter.rate = Math.max(0.4, Math.min(1.6, rate));
      utter.pitch = Math.max(0.5, Math.min(1.5, pitch));
      synth.speak(utter);
    } catch {
      // ignore speech synthesis restrictions
    }
  }
}

export const soundEngine = new SoundEngine();
