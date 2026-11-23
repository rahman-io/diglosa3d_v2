import {
  CharacterPresetId,
  LocalPlayerSyncPacket,
  MultiplayerMemberDoc,
  RemotePlayerState,
  RoomChatMessage,
  WebRtcSignalDoc,
} from '../types/game';
import {
  sendWebRtcSignal,
  subscribeIncomingSignals,
} from './multiplayerRoomService';

const RTC_ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

// Lightweight client-side profanity filter (Indonesian + English common slang)
const BLOCKED_WORDS = [
  'anjing',
  'bangsat',
  'bajingan',
  'kontol',
  'memek',
  'ngentot',
  'jancok',
  'asu',
  'tolol',
  'goblok',
  'bego',
  'fuck',
  'shit',
  'bitch',
  'asshole',
];

export function filterChatProfanity(raw: string): string {
  let out = raw.trim().slice(0, 150);
  if (!out) return '';
  for (const w of BLOCKED_WORDS) {
    const rx = new RegExp(`\\b${w}\\b`, 'gi');
    out = out.replace(rx, '*'.repeat(Math.min(4, w.length)));
  }
  return out;
}

export const QUICK_CHAT_PHRASES = [
  'Halo semua! 👋',
  'Ayo serang bareng! ⚔️',
  'Ikuti aku ke sini! 🧭',
  'Bantu aku dong! 🆘',
  'Mantap! 🔥',
  'Sebentar lagi siap! ⏳',
];

interface PeerSlot {
  uid: string;
  pc: RTCPeerConnection;
  dc: RTCDataChannel | null;
  makingOffer: boolean;
  ignoreOffer: boolean;
  audioEl: HTMLAudioElement | null;
  remoteStream: MediaStream | null;
  audioCtx: AudioContext | null;
  analyser: AnalyserNode | null;
  analyserBuf: Uint8Array<ArrayBuffer> | null;
  speaking: boolean;
}

export interface P2pTransportCallbacks {
  onRemotePlayersChange: (players: RemotePlayerState[]) => void;
  onChatMessage: (msg: RoomChatMessage) => void;
  onConnectionStats: (stats: { connectedPeers: number; totalPeers: number }) => void;
  onLocalSpeakingChange?: (speaking: boolean) => void;
}

/**
 * Pure P2P WebRTC Mesh Transport (100% Rp 0 server cost):
 * - Coordinates / movement / chat packets run directly over RTCDataChannel (~12 Hz)
 * - Optional Voice Chat runs directly over WebRTC MediaStreamTrack (audio only)
 * - Firestore is used ONLY for initial SDP/ICE handshake signaling
 */
export class P2pMeshTransport {
  private readonly roomId: string;
  private readonly myUid: string;
  private readonly callbacks: P2pTransportCallbacks;
  private peers = new Map<string, PeerSlot>();
  private memberMeta = new Map<string, MultiplayerMemberDoc>();
  private remoteStates = new Map<string, RemotePlayerState>();
  private unsubSignals: (() => void) | null = null;
  private localMicStream: MediaStream | null = null;
  private localMicMuted = true;
  private muteAllPeers = false;
  private localAudioCtx: AudioContext | null = null;
  private localAnalyser: AnalyserNode | null = null;
  private localAnalyserBuf: Uint8Array<ArrayBuffer> | null = null;
  private vadTimer: number | null = null;
  private disposed = false;

  constructor(roomId: string, myUid: string, callbacks: P2pTransportCallbacks) {
    this.roomId = roomId;
    this.myUid = myUid;
    this.callbacks = callbacks;

    this.unsubSignals = subscribeIncomingSignals(roomId, myUid, (sig) => {
      void this.handleIncomingSignal(sig);
    });

    // Lightweight 8 Hz voice-activity detection + peer speaking state sync
    this.vadTimer = window.setInterval(() => {
      if (!this.disposed) this.pollVoiceActivity();
    }, 135);
  }

  public syncMembers(members: MultiplayerMemberDoc[]): void {
    if (this.disposed) return;

    const activeUids = new Set<string>();
    for (const m of members) {
      if (m.uid === this.myUid) continue;
      activeUids.add(m.uid);
      this.memberMeta.set(m.uid, m);

      // Seed remote player state from Firestore member metadata until P2P packet arrives
      if (!this.remoteStates.has(m.uid)) {
        this.remoteStates.set(m.uid, {
          uid: m.uid,
          displayName: m.displayName,
          characterId: m.characterId,
          worldMode: 'overworld',
          x: -6,
          y: 2.6,
          z: 126,
          yaw: Math.PI,
          speed: 0,
          walkCycle: 0,
          onGround: true,
          isSwimming: false,
          activeWeapon: 'ketapel',
          weaponOwned: false,
          aimPitch: 0,
          speaking: false,
          updatedAtMs: Date.now(),
        });
      } else {
        const cur = this.remoteStates.get(m.uid)!;
        cur.displayName = m.displayName;
        cur.characterId = m.characterId;
      }

      if (!this.peers.has(m.uid)) {
        this.createPeer(m.uid);
      }
    }

    // Remove peers who left
    for (const uid of Array.from(this.peers.keys())) {
      if (!activeUids.has(uid)) {
        this.closePeer(uid);
        this.memberMeta.delete(uid);
        this.remoteStates.delete(uid);
      }
    }

    this.emitRemotePlayers();
    this.emitConnectionStats();
  }

  public getOpenChannelCount(): number {
    let open = 0;
    for (const p of this.peers.values()) {
      if (p.dc && p.dc.readyState === 'open') open++;
    }
    return open;
  }

  public broadcastState(packet: LocalPlayerSyncPacket): void {
    if (this.disposed || this.peers.size === 0) return;
    let serialized: string | null = null;
    for (const peer of this.peers.values()) {
      if (peer.dc && peer.dc.readyState === 'open') {
        if (!serialized) serialized = JSON.stringify(packet);
        try {
          peer.dc.send(serialized);
        } catch {
          // ignore transient buffer errors
        }
      }
    }
  }

  public broadcastChat(senderName: string, rawText: string): { text: string; sentP2pCount: number } {
    const clean = filterChatProfanity(rawText);
    if (!clean) return { text: '', sentP2pCount: 0 };

    const msgId = `${this.myUid.slice(0, 6)}_${Date.now().toString(36)}`;
    const wire = JSON.stringify({
      t: 'chat',
      id: msgId,
      nm: senderName.slice(0, 28),
      tx: clean,
    });

    let sent = 0;
    for (const peer of this.peers.values()) {
      if (peer.dc && peer.dc.readyState === 'open') {
        try {
          peer.dc.send(wire);
          sent++;
        } catch {
          // ignore
        }
      }
    }
    return { text: clean, sentP2pCount: sent };
  }

  public applyRemoteChatBubble(senderUid: string, text: string): void {
    const existing = this.remoteStates.get(senderUid);
    if (existing) {
      existing.lastChatText = text;
      existing.lastChatAt = Date.now();
      this.emitRemotePlayers();
    }
  }

  public async setMicEnabled(enabled: boolean): Promise<boolean> {
    if (this.disposed) return false;
    if (!enabled) {
      this.localMicMuted = true;
      if (this.localMicStream) {
        this.localMicStream.getAudioTracks().forEach((tr) => {
          tr.enabled = false;
        });
      }
      this.callbacks.onLocalSpeakingChange?.(false);
      return false;
    }

    if (!this.localMicStream) {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Browser tidak mendukung akses mikrofon untuk Voice Chat.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      if (this.disposed) {
        stream.getTracks().forEach((t) => t.stop());
        return false;
      }
      this.localMicStream = stream;
      this.setupLocalVad(stream);

      // Attach audio track to all existing peer connections & renegotiate
      for (const peer of this.peers.values()) {
        for (const track of stream.getAudioTracks()) {
          const already = peer.pc.getSenders().some((s) => s.track?.kind === 'audio');
          if (!already) {
            peer.pc.addTrack(track, stream);
          } else {
            const sender = peer.pc.getSenders().find((s) => s.track?.kind === 'audio');
            void sender?.replaceTrack(track);
          }
        }
      }
    }

    this.localMicMuted = false;
    this.localMicStream.getAudioTracks().forEach((tr) => {
      tr.enabled = true;
    });
    return true;
  }

  public setMuteAllPeers(muted: boolean): void {
    this.muteAllPeers = muted;
    for (const peer of this.peers.values()) {
      if (peer.audioEl) {
        peer.audioEl.muted = muted;
      }
    }
  }

  private setupLocalVad(stream: MediaStream): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      this.localAudioCtx = ctx;
      this.localAnalyser = analyser;
      this.localAnalyserBuf = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    } catch {
      // Optional visual indicator
    }
  }

  private setupRemoteVad(slot: PeerSlot, stream: MediaStream): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      slot.audioCtx = ctx;
      slot.analyser = analyser;
      slot.analyserBuf = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    } catch {
      // ignore
    }
  }

  private pollVoiceActivity(): void {
    if (this.localAnalyser && this.localAnalyserBuf && !this.localMicMuted) {
      this.localAnalyser.getByteFrequencyData(this.localAnalyserBuf);
      let sum = 0;
      for (let i = 0; i < this.localAnalyserBuf.length; i++) sum += this.localAnalyserBuf[i];
      const avg = sum / this.localAnalyserBuf.length;
      this.callbacks.onLocalSpeakingChange?.(avg > 14);
    } else {
      this.callbacks.onLocalSpeakingChange?.(false);
    }

    let changed = false;
    for (const [uid, slot] of this.peers.entries()) {
      let nextSpeaking = false;
      if (slot.analyser && slot.analyserBuf && !this.muteAllPeers) {
        slot.analyser.getByteFrequencyData(slot.analyserBuf);
        let sum = 0;
        for (let i = 0; i < slot.analyserBuf.length; i++) sum += slot.analyserBuf[i];
        nextSpeaking = sum / slot.analyserBuf.length > 14;
      }
      if (slot.speaking !== nextSpeaking) {
        slot.speaking = nextSpeaking;
        const st = this.remoteStates.get(uid);
        if (st) {
          st.speaking = nextSpeaking;
          changed = true;
        }
      }
    }
    if (changed) {
      this.emitRemotePlayers();
    }
  }

  private isPoliteFor(remoteUid: string): boolean {
    return this.myUid < remoteUid;
  }

  private createPeer(remoteUid: string): PeerSlot {
    const pc = new RTCPeerConnection(RTC_ICE_CONFIG);
    const slot: PeerSlot = {
      uid: remoteUid,
      pc,
      dc: null,
      makingOffer: false,
      ignoreOffer: false,
      audioEl: null,
      remoteStream: null,
      audioCtx: null,
      analyser: null,
      analyserBuf: null,
      speaking: false,
    };
    this.peers.set(remoteUid, slot);

    // Attach local mic if already active
    if (this.localMicStream) {
      for (const tr of this.localMicStream.getAudioTracks()) {
        pc.addTrack(tr, this.localMicStream);
      }
    }

    // Impolite peer creates the initial DataChannel so both sides converge cleanly
    if (!this.isPoliteFor(remoteUid)) {
      const dc = pc.createDataChannel('diglosa-sync', { ordered: false, maxRetransmits: 0 });
      this.bindDataChannel(slot, dc);
    }

    pc.ondatachannel = (ev) => {
      this.bindDataChannel(slot, ev.channel);
    };

    pc.onnegotiationneeded = async () => {
      try {
        slot.makingOffer = true;
        await pc.setLocalDescription();
        if (pc.localDescription && !this.disposed) {
          await sendWebRtcSignal({
            roomId: this.roomId,
            toUid: remoteUid,
            kind: pc.localDescription.type === 'answer' ? 'answer' : 'offer',
            payload: JSON.stringify(pc.localDescription),
          });
        }
      } catch {
        // ignore transient negotiation errors
      } finally {
        slot.makingOffer = false;
      }
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate && !this.disposed) {
        void sendWebRtcSignal({
          roomId: this.roomId,
          toUid: remoteUid,
          kind: 'ice',
          payload: JSON.stringify(ev.candidate),
        });
      }
    };

    pc.ontrack = (ev) => {
      const stream = ev.streams[0] ?? new MediaStream([ev.track]);
      slot.remoteStream = stream;
      if (!slot.audioEl) {
        const audio = document.createElement('audio');
        audio.autoplay = true;
        audio.muted = this.muteAllPeers;
        audio.srcObject = stream;
        slot.audioEl = audio;
        void audio.play().catch(() => undefined);
        this.setupRemoteVad(slot, stream);
      } else {
        slot.audioEl.srcObject = stream;
      }
    };

    pc.onconnectionstatechange = () => {
      this.emitConnectionStats();
    };

    return slot;
  }

  private bindDataChannel(slot: PeerSlot, dc: RTCDataChannel): void {
    slot.dc = dc;
    dc.onopen = () => {
      this.emitConnectionStats();
    };
    dc.onclose = () => {
      this.emitConnectionStats();
    };
    dc.onmessage = (ev) => {
      if (typeof ev.data !== 'string' || this.disposed) return;
      try {
        const parsed = JSON.parse(ev.data) as
          | LocalPlayerSyncPacket
          | { t: 'chat'; id?: string; nm?: string; tx?: string };
        if (parsed.t === 'state') {
          const meta = this.memberMeta.get(slot.uid);
          const prev = this.remoteStates.get(slot.uid);
          this.remoteStates.set(slot.uid, {
            uid: slot.uid,
            displayName: (parsed.nm || meta?.displayName || 'Teman').slice(0, 32),
            characterId: (parsed.ch || meta?.characterId || 'hoot_emerald') as CharacterPresetId,
            worldMode: parsed.w || 'overworld',
            x: Number.isFinite(parsed.x) ? parsed.x : -6,
            y: Number.isFinite(parsed.y) ? parsed.y : 2.6,
            z: Number.isFinite(parsed.z) ? parsed.z : 126,
            yaw: Number.isFinite(parsed.yaw) ? parsed.yaw : 0,
            speed: Number.isFinite(parsed.spd) ? parsed.spd : 0,
            walkCycle: Number.isFinite(parsed.wc) ? parsed.wc : 0,
            onGround: Boolean(parsed.og),
            isSwimming: Boolean(parsed.sw),
            activeWeapon: parsed.wp || 'ketapel',
            weaponOwned: Boolean(parsed.wo),
            aimPitch: Number.isFinite(parsed.ap) ? parsed.ap : 0,
            speaking: slot.speaking,
            lastChatText: prev?.lastChatText,
            lastChatAt: prev?.lastChatAt,
            updatedAtMs: Date.now(),
          });
          this.emitRemotePlayers();
        } else if (parsed.t === 'chat' && parsed.tx) {
          const clean = filterChatProfanity(parsed.tx);
          if (!clean) return;
          const meta = this.memberMeta.get(slot.uid);
          const senderName = (parsed.nm || meta?.displayName || 'Teman').slice(0, 32);
          const prev = this.remoteStates.get(slot.uid);
          if (prev) {
            prev.lastChatText = clean;
            prev.lastChatAt = Date.now();
            this.emitRemotePlayers();
          }
          this.callbacks.onChatMessage({
            id: parsed.id || `${slot.uid}_${Date.now()}`,
            roomId: this.roomId,
            senderUid: slot.uid,
            senderName,
            text: clean,
            createdAtMs: Date.now(),
            source: 'p2p',
          });
        }
      } catch {
        // ignore malformed datagram
      }
    };
  }

  private async handleIncomingSignal(sig: WebRtcSignalDoc): Promise<void> {
    if (this.disposed || sig.fromUid === this.myUid) return;
    let slot = this.peers.get(sig.fromUid);
    if (!slot) {
      slot = this.createPeer(sig.fromUid);
    }

    const pc = slot.pc;
    const polite = this.isPoliteFor(sig.fromUid);

    try {
      if (sig.kind === 'offer' || sig.kind === 'answer') {
        const description = JSON.parse(sig.payload) as RTCSessionDescriptionInit;
        const offerCollision =
          description.type === 'offer' &&
          (slot.makingOffer || pc.signalingState !== 'stable');
        slot.ignoreOffer = !polite && offerCollision;
        if (slot.ignoreOffer) return;

        await pc.setRemoteDescription(description);
        if (description.type === 'offer') {
          await pc.setLocalDescription();
          if (pc.localDescription && !this.disposed) {
            await sendWebRtcSignal({
              roomId: this.roomId,
              toUid: sig.fromUid,
              kind: 'answer',
              payload: JSON.stringify(pc.localDescription),
            });
          }
        }
      } else if (sig.kind === 'ice') {
        const candidate = JSON.parse(sig.payload) as RTCIceCandidateInit;
        try {
          await pc.addIceCandidate(candidate);
        } catch (err) {
          if (!slot.ignoreOffer) throw err;
        }
      }
    } catch {
      // ignore transient SDP/ICE race
    }
  }

  private closePeer(uid: string): void {
    const slot = this.peers.get(uid);
    if (!slot) return;
    this.peers.delete(uid);
    try {
      slot.dc?.close();
    } catch {
      // ignore
    }
    try {
      slot.pc.close();
    } catch {
      // ignore
    }
    if (slot.audioEl) {
      slot.audioEl.pause();
      slot.audioEl.srcObject = null;
      slot.audioEl = null;
    }
    if (slot.audioCtx) {
      void slot.audioCtx.close().catch(() => undefined);
      slot.audioCtx = null;
    }
  }

  private emitRemotePlayers(): void {
    this.callbacks.onRemotePlayersChange(Array.from(this.remoteStates.values()));
  }

  private emitConnectionStats(): void {
    this.callbacks.onConnectionStats({
      connectedPeers: this.getOpenChannelCount(),
      totalPeers: this.peers.size,
    });
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.vadTimer !== null) {
      window.clearInterval(this.vadTimer);
      this.vadTimer = null;
    }
    this.unsubSignals?.();
    this.unsubSignals = null;
    for (const uid of Array.from(this.peers.keys())) {
      this.closePeer(uid);
    }
    if (this.localMicStream) {
      this.localMicStream.getTracks().forEach((t) => t.stop());
      this.localMicStream = null;
    }
    if (this.localAudioCtx) {
      void this.localAudioCtx.close().catch(() => undefined);
      this.localAudioCtx = null;
    }
    this.memberMeta.clear();
    this.remoteStates.clear();
  }
}
