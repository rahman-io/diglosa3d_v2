// 100% Procedural Web Audio API Synthesis + Custom MP3 SFX + SpeechSynthesis TTS

import { WeaponId } from '../types/game';

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
  | 'boom';

type AmbientMode = 'none' | 'day' | 'night';

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
};

const INTRO_AUDIO_PATH = './assets/aistudio/game_intro_1db79a4e.mp3';
const WALK_AUDIO_PATH = './assets/aistudio/walk_adce5e54.mp3';
const AMBIENT_AUDIO_PATHS: Record<Exclude<AmbientMode, 'none'>, string> = {
  day: './assets/aistudio/morning_afternoon_f080cd3e.mp3',
  night: './assets/aistudio/evening_night_cbbbc15c.mp3',
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
  private introAudio: HTMLAudioElement | null = null;
  private introActive = false;
  private ambientAudios: Partial<Record<Exclude<AmbientMode, 'none'>, HTMLAudioElement>> = {};
  private ambientMode: AmbientMode = 'none';

  constructor() {
    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      (Object.keys(AUDIO_CLIP_PATHS) as AudioClipKey[]).forEach((key) => {
        const audio = new Audio(AUDIO_CLIP_PATHS[key]);
        audio.preload = 'auto';
        this.clipTemplates[key] = audio;
      });
      const intro = new Audio(INTRO_AUDIO_PATH);
      intro.preload = 'auto';
      intro.loop = true;
      intro.volume = 0.34;
      this.introAudio = intro;

      const walk = new Audio(WALK_AUDIO_PATH);
      walk.preload = 'auto';
      walk.loop = true;
      walk.volume = 0.45;
      this.walkAudio = walk;

      (['day', 'night'] as const).forEach((mode) => {
        const amb = new Audio(AMBIENT_AUDIO_PATHS[mode]);
        amb.preload = 'auto';
        amb.loop = true;
        amb.volume = mode === 'day' ? 0.24 : 0.26;
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
        this.syncAmbientPlayback();
        this.syncWalkPlayback();
      };
      const onKeyDownGlobal = () => {
        this.syncIntroPlayback();
        this.syncAmbientPlayback();
        this.syncWalkPlayback();
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

  private syncAmbientPlayback(): void {
    (['day', 'night'] as const).forEach((mode) => {
      const el = this.ambientAudios[mode];
      if (!el) return;
      const shouldPlay = !this.muted && !this.introActive && this.ambientMode === mode;
      if (shouldPlay) {
        if (el.paused) {
          el.play().catch(() => {});
        }
      } else if (!el.paused) {
        el.pause();
      }
    });
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
    this.syncWalkPlayback();
    this.syncAmbientPlayback();
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

  public speakEnglish(text: string, rate = 0.88, pitch = 1.0): void {
    if (this.muted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = rate;
      utter.pitch = pitch;
      window.speechSynthesis.speak(utter);
    } catch {
      // ignore speech synthesis restrictions
    }
  }
}

export const soundEngine = new SoundEngine();
