import {
  CharacterPresetId,
  LocalPlayerSyncPacket,
  MultiplayerMemberDoc,
  P2pReliableMessage,
  RemotePlayerState,
  RoomChatMessage,
  WebRtcSignalDoc,
} from '../types/game';
import {
  sendWebRtcSignal,
  subscribeIncomingSignals,
} from './multiplayerRoomService';

function buildRtcIceConfig(): RTCConfiguration {
  const iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ];
  const turnUrl = (import.meta.env.VITE_TURN_URL as string | undefined)?.trim();
  if (turnUrl) {
    const turnUser = (import.meta.env.VITE_TURN_USERNAME as string | undefined)?.trim();
    const turnCred = (import.meta.env.VITE_TURN_CREDENTIAL as string | undefined)?.trim();
    iceServers.push({
      urls: turnUrl.split(',').map((u) => u.trim()).filter(Boolean),
      ...(turnUser ? { username: turnUser } : {}),
      ...(turnCred ? { credential: turnCred } : {}),
    });
  }
  return {
    iceServers,
    iceCandidatePoolSize: 6,
  };
}

const RTC_ICE_CONFIG: RTCConfiguration = buildRtcIceConfig();

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
  reliableDc: RTCDataChannel | null;
  makingOffer: boolean;
  ignoreOffer: boolean;
  pendingNegotiation: boolean;
  remoteOriginSessionId: string | null;
  closing: boolean;
  audioEl: HTMLAudioElement | null;
  remoteStream: MediaStream | null;
  audioCtx: AudioContext | null;
  analyser: AnalyserNode | null;
  analyserBuf: Uint8Array<ArrayBuffer> | null;
  speaking: boolean;
  pendingIce: RTCIceCandidateInit[];
  pendingRemoteIce: RTCIceCandidateInit[];
  iceFlushTimer: number | null;
  createdAtMs: number;
}

export interface P2pTransportCallbacks {
  onRemotePlayersChange: (players: RemotePlayerState[]) => void;
  onChatMessage: (msg: RoomChatMessage) => void;
  onConnectionStats: (stats: { connectedPeers: number; totalPeers: number }) => void;
  onLocalSpeakingChange?: (speaking: boolean) => void;
  onWorldEvent?: (fromUid: string, pkt: P2pReliableMessage) => void;
  onPeerChannelOpen?: (peerUid: string) => void;
  onPeerDeparted?: (info: { uid: string; displayName: string; reason: 'left' | 'timeout' }) => void;
  onPeerJoined?: (info: { uid: string; displayName: string }) => void;
}

function getUpdatedAtMs(val: unknown): number {
  if (!val || typeof val !== 'object') return 0;
  const maybeTs = val as { toMillis?: () => number; seconds?: number };
  if (typeof maybeTs.toMillis === 'function') return maybeTs.toMillis();
  if (typeof maybeTs.seconds === 'number') return maybeTs.seconds * 1000;
  return 0;
}

function extractSdpOriginId(sdp?: string): string | null {
  if (!sdp) return null;
  const match = sdp.match(/^o=\S+\s+(\S+)/m);
  return match ? match[1] : null;
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
  private memberUpdatedAtMs = new Map<string, number>();
  private memberJoinedAtMs = new Map<string, number>();
  private remoteStates = new Map<string, RemotePlayerState>();
  private fallbackStates = new Map<string, RemotePlayerState>();
  private lastActivityMs = new Map<string, number>();
  private disconnectedSinceMs = new Map<string, number>();
  private reconnectAttempts = new Map<string, number>();
  private nextReconnectAtMs = new Map<string, number>();
  private departedPeers = new Set<string>();
  private departedAtMs = new Map<string, number>();
  private signalQueues = new Map<string, Promise<void>>();
  private everHadLiveState = new Set<string>();
  private lastHealthCheckMs = 0;
  private unsubSignals: (() => void) | null = null;
  private localMicStream: MediaStream | null = null;
  private localMicMuted = true;
  private muteAllPeers = false;
  private localAudioCtx: AudioContext | null = null;
  private localAnalyser: AnalyserNode | null = null;
  private localAnalyserBuf: Uint8Array<ArrayBuffer> | null = null;
  private vadTimer: number | null = null;
  private audioUnlockAttached = false;
  private disposed = false;

  constructor(roomId: string, myUid: string, callbacks: P2pTransportCallbacks) {
    this.roomId = roomId;
    this.myUid = myUid;
    this.callbacks = callbacks;

    this.unsubSignals = subscribeIncomingSignals(roomId, myUid, (sig) => {
      this.enqueueSignal(sig.fromUid, () => this.handleIncomingSignal(sig));
    });

    // Lightweight 8 Hz voice-activity detection + peer speaking state sync
    this.vadTimer = window.setInterval(() => {
      if (!this.disposed) this.pollVoiceActivity();
    }, 135);
  }

  private enqueueSignal(uid: string, task: () => Promise<void>): void {
    const prev = this.signalQueues.get(uid) ?? Promise.resolve();
    const next = prev
      .catch(() => undefined)
      .then(async () => {
        if (this.disposed) return;
        await task();
      });
    this.signalQueues.set(uid, next);
  }

  public syncMembers(members: MultiplayerMemberDoc[]): void {
    if (this.disposed) return;

    const activeUids = new Set<string>();
    for (const m of members) {
      if (m.uid === this.myUid) continue;
      activeUids.add(m.uid);
      this.memberMeta.set(m.uid, m);

      const cur = this.remoteStates.get(m.uid);
      if (cur) {
        cur.displayName = m.displayName;
        cur.characterId = m.characterId;
      }

      const prevUpdated = this.memberUpdatedAtMs.get(m.uid) ?? 0;
      const nextUpdated = getUpdatedAtMs(m.updatedAt);
      if (nextUpdated > 0) {
        this.memberUpdatedAtMs.set(m.uid, nextUpdated);
      }

      const prevJoined = this.memberJoinedAtMs.get(m.uid) ?? 0;
      const nextJoined = getUpdatedAtMs(m.joinedAt);
      if (nextJoined > 0) {
        this.memberJoinedAtMs.set(m.uid, nextJoined);
      }

      const departedAt = this.departedAtMs.get(m.uid) ?? 0;
      const memberUpdatedFresh =
        (nextUpdated > prevUpdated && prevUpdated > 0) ||
        (nextJoined > prevJoined && prevJoined > 0) ||
        (nextJoined > 0 && prevJoined === 0 && departedAt > 0) ||
        (nextUpdated === 0 && nextJoined === 0 && departedAt > 0);
      const departureExpired = departedAt > 0 && Date.now() - departedAt >= 5000;

      if ((memberUpdatedFresh || departureExpired) && this.departedPeers.has(m.uid)) {
        this.departedPeers.delete(m.uid);
        this.departedAtMs.delete(m.uid);
      }

      if (this.departedPeers.has(m.uid)) {
        continue;
      }

      const existingSlot = this.peers.get(m.uid);
      if (!existingSlot) {
        this.reconnectAttempts.delete(m.uid);
        this.nextReconnectAtMs.delete(m.uid);
        this.createPeer(m.uid);
      } else if (memberUpdatedFresh) {
        const dcOpen =
          existingSlot.dc?.readyState === 'open' ||
          existingSlot.reliableDc?.readyState === 'open';
        const pcState = existingSlot.pc.connectionState;
        const iceState = existingSlot.pc.iceConnectionState;
        const handshakeAgeMs = Date.now() - existingSlot.createdAtMs;
        const isActivelyNegotiating =
          pcState === 'connecting' || iceState === 'checking' || handshakeAgeMs < 10000;
        const isHardBroken =
          pcState === 'failed' || pcState === 'closed' || (pcState === 'disconnected' && handshakeAgeMs >= 5000);
        if (isHardBroken || (!dcOpen && !isActivelyNegotiating)) {
          this.closePeer(m.uid);
          this.createPeer(m.uid);
        }
      }
    }

    // Remove peers who were deleted from Firestore members
    const allTrackedUids = new Set<string>([
      ...this.peers.keys(),
      ...this.memberMeta.keys(),
      ...this.remoteStates.keys(),
      ...this.fallbackStates.keys(),
    ]);
    for (const uid of allTrackedUids) {
      if (!activeUids.has(uid)) {
        const meta = this.memberMeta.get(uid);
        this.handlePeerDeparture(uid, meta?.displayName, 'left');
        this.memberMeta.delete(uid);
        this.memberUpdatedAtMs.delete(uid);
        this.memberJoinedAtMs.delete(uid);
        this.fallbackStates.delete(uid);
        this.reconnectAttempts.delete(uid);
        this.nextReconnectAtMs.delete(uid);
        this.departedPeers.delete(uid);
        this.departedAtMs.delete(uid);
        this.everHadLiveState.delete(uid);
      }
    }

    this.emitRemotePlayers();
    this.emitConnectionStats();
  }

  public ingestFallbackStates(states: RemotePlayerState[]): void {
    if (this.disposed) return;
    const seenUids = new Set<string>();
    for (const st of states) {
      if (!st.uid || st.uid === this.myUid) continue;
      seenUids.add(st.uid);
      const prevFallback = this.fallbackStates.get(st.uid);
      const prevP2p = this.remoteStates.get(st.uid);
      this.fallbackStates.set(st.uid, {
        ...st,
        speaking: prevP2p?.speaking ?? prevFallback?.speaking ?? false,
        lastChatText: prevP2p?.lastChatText ?? prevFallback?.lastChatText,
        lastChatAt: prevP2p?.lastChatAt ?? prevFallback?.lastChatAt,
      });
    }
    for (const uid of Array.from(this.fallbackStates.keys())) {
      if (!seenUids.has(uid)) {
        this.fallbackStates.delete(uid);
      }
    }
    this.emitRemotePlayers();
  }

  public hasMissingP2pPeers(): boolean {
    if (this.disposed) return false;
    for (const uid of this.memberMeta.keys()) {
      if (this.departedPeers.has(uid)) continue;
      const slot = this.peers.get(uid);
      const open =
        slot &&
        ((slot.dc && slot.dc.readyState === 'open') ||
          (slot.reliableDc && slot.reliableDc.readyState === 'open'));
      if (!open) return true;
    }
    return false;
  }

  public reconnectAllPeers(): void {
    if (this.disposed) return;
    for (const uid of this.memberMeta.keys()) {
      this.departedPeers.delete(uid);
      this.departedAtMs.delete(uid);
      const slot = this.peers.get(uid);
      const dcOpen =
        slot &&
        ((slot.dc && slot.dc.readyState === 'open') ||
          (slot.reliableDc && slot.reliableDc.readyState === 'open'));
      if (!dcOpen) {
        this.closePeer(uid);
        this.reconnectAttempts.delete(uid);
        this.nextReconnectAtMs.delete(uid);
        this.createPeer(uid);
      }
    }
    this.emitConnectionStats();
  }

  public getOpenChannelCount(): number {
    let open = 0;
    for (const p of this.peers.values()) {
      if (
        (p.dc && p.dc.readyState === 'open') ||
        (p.reliableDc && p.reliableDc.readyState === 'open')
      ) {
        open++;
      }
    }
    return open;
  }

  public getActivePeerUids(): string[] {
    const now = Date.now();
    const active: string[] = [];
    for (const [uid, p] of this.peers.entries()) {
      if (this.departedPeers.has(uid)) continue;
      const pcState = p.pc.connectionState;
      if (pcState === 'closed' || pcState === 'failed') continue;
      const dcOpen =
        (p.dc && p.dc.readyState === 'open') ||
        (p.reliableDc && p.reliableDc.readyState === 'open');
      const lastAct = this.lastActivityMs.get(uid) ?? 0;
      if (dcOpen || (lastAct > 0 && now - lastAct < 7500)) {
        active.push(uid);
      }
    }
    return active;
  }

  public broadcastLeave(displayName: string): void {
    if (this.disposed || this.peers.size === 0) return;
    const wire = JSON.stringify({
      t: 'leave',
      nm: displayName.trim().slice(0, 32) || undefined,
    });
    for (const peer of this.peers.values()) {
      const channels = [peer.reliableDc, peer.dc];
      for (const ch of channels) {
        if (ch && ch.readyState === 'open') {
          try {
            ch.send(wire);
            break;
          } catch {
            // ignore
          }
        }
      }
    }
  }

  public broadcastState(packet: LocalPlayerSyncPacket): void {
    if (this.disposed || this.peers.size === 0) return;
    let serialized: string | null = null;
    for (const peer of this.peers.values()) {
      const ch = peer.dc && peer.dc.readyState === 'open' ? peer.dc : peer.reliableDc;
      if (ch && ch.readyState === 'open') {
        if (!serialized) serialized = JSON.stringify(packet);
        try {
          ch.send(serialized);
        } catch {
          // ignore transient buffer errors
        }
      }
    }
  }

  public sendReliableToAll(pkt: P2pReliableMessage): number {
    if (this.disposed || this.peers.size === 0) return 0;
    let serialized: string | null = null;
    let sent = 0;
    for (const peer of this.peers.values()) {
      const ch =
        peer.reliableDc && peer.reliableDc.readyState === 'open' ? peer.reliableDc : peer.dc;
      if (ch && ch.readyState === 'open') {
        if (!serialized) serialized = JSON.stringify(pkt);
        try {
          ch.send(serialized);
          sent++;
        } catch {
          // ignore transient buffer errors
        }
      }
    }
    return sent;
  }

  public sendReliableToPeer(toUid: string, pkt: P2pReliableMessage): boolean {
    if (this.disposed) return false;
    const peer = this.peers.get(toUid);
    if (!peer) return false;
    const ch =
      peer.reliableDc && peer.reliableDc.readyState === 'open' ? peer.reliableDc : peer.dc;
    if (!ch || ch.readyState !== 'open') return false;
    try {
      ch.send(JSON.stringify(pkt));
      return true;
    } catch {
      return false;
    }
  }

  public broadcastChat(
    senderName: string,
    rawText: string,
    explicitId?: string,
  ): { text: string; sentP2pCount: number; msgId: string } {
    const clean = filterChatProfanity(rawText);
    const msgId = explicitId || `${this.myUid.slice(0, 6)}_${Date.now().toString(36)}`;
    if (!clean) return { text: '', sentP2pCount: 0, msgId };

    const wire = JSON.stringify({
      t: 'chat',
      id: msgId,
      nm: senderName.slice(0, 28),
      tx: clean,
    });

    let sent = 0;
    for (const peer of this.peers.values()) {
      const ch =
        peer.reliableDc && peer.reliableDc.readyState === 'open' ? peer.reliableDc : peer.dc;
      if (ch && ch.readyState === 'open') {
        try {
          ch.send(wire);
          sent++;
        } catch {
          // ignore
        }
      }
    }
    return { text: clean, sentP2pCount: sent, msgId };
  }

  public applyRemoteChatBubble(senderUid: string, text: string): void {
    const now = Date.now();
    const existing = this.remoteStates.get(senderUid);
    if (existing) {
      existing.lastChatText = text;
      existing.lastChatAt = now;
    }
    const existingFb = this.fallbackStates.get(senderUid);
    if (existingFb) {
      existingFb.lastChatText = text;
      existingFb.lastChatAt = now;
    }
    if (existing || existingFb) {
      this.emitRemotePlayers();
    }
  }

  private async attachLocalMicToPeer(slot: PeerSlot, stream: MediaStream): Promise<void> {
    if (this.disposed || slot.closing || this.peers.get(slot.uid) !== slot) return;
    const tracks = stream.getAudioTracks();
    if (tracks.length === 0) return;
    const track = tracks[0];
    const pc = slot.pc;

    const audioTransceiver = pc
      .getTransceivers()
      .find(
        (t) =>
          t.sender.track?.kind === 'audio' ||
          t.receiver.track?.kind === 'audio',
      );
    if (audioTransceiver) {
      let needsNegotiation = false;
      if (audioTransceiver.direction !== 'sendrecv' && audioTransceiver.direction !== 'sendonly') {
        audioTransceiver.direction = 'sendrecv';
        needsNegotiation = true;
      }
      if (audioTransceiver.sender.track !== track) {
        await audioTransceiver.sender.replaceTrack(track).catch(() => undefined);
        needsNegotiation = true;
      }
      if (needsNegotiation) {
        slot.pendingNegotiation = true;
        void this.runNegotiation(slot);
      }
      return;
    }

    const existingSender = pc.getSenders().find((s) => s.track?.kind === 'audio');
    if (existingSender) {
      if (existingSender.track !== track) {
        await existingSender.replaceTrack(track).catch(() => undefined);
        slot.pendingNegotiation = true;
        void this.runNegotiation(slot);
      }
    } else {
      pc.addTrack(track, stream);
      slot.pendingNegotiation = true;
      void this.runNegotiation(slot);
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

    const hasLiveTrack =
      Boolean(this.localMicStream) &&
      this.localMicStream!.getAudioTracks().some((tr) => tr.readyState === 'live');

    if (!hasLiveTrack) {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Browser tidak mendukung akses mikrofon untuk Voice Chat.');
      }
      if (this.localMicStream) {
        this.localMicStream.getTracks().forEach((t) => t.stop());
        this.localMicStream = null;
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
      if (this.localAudioCtx) {
        void this.localAudioCtx.close().catch(() => undefined);
        this.localAudioCtx = null;
      }
      this.setupLocalVad(stream);
    }

    this.localMicMuted = false;
    this.localMicStream!.getAudioTracks().forEach((tr) => {
      tr.enabled = true;
    });

    // Ensure every active peer connection has the live audio track bound & negotiated
    for (const peer of this.peers.values()) {
      void this.attachLocalMicToPeer(peer, this.localMicStream!);
    }
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
      if (ctx.state === 'suspended') {
        void ctx.resume().catch(() => undefined);
      }
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
      if (ctx.state === 'suspended') {
        void ctx.resume().catch(() => undefined);
      }
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

  private scheduleAudioPlayUnlock(): void {
    if (this.audioUnlockAttached || typeof window === 'undefined') return;
    this.audioUnlockAttached = true;
    const retryPlayback = () => {
      this.audioUnlockAttached = false;
      window.removeEventListener('pointerdown', retryPlayback);
      window.removeEventListener('keydown', retryPlayback);
      if (this.disposed) return;
      if (this.localAudioCtx?.state === 'suspended') {
        void this.localAudioCtx.resume().catch(() => undefined);
      }
      for (const peer of this.peers.values()) {
        if (peer.audioCtx?.state === 'suspended') {
          void peer.audioCtx.resume().catch(() => undefined);
        }
        if (peer.audioEl && peer.audioEl.paused && !this.muteAllPeers) {
          void peer.audioEl.play().catch(() => undefined);
        }
      }
    };
    window.addEventListener('pointerdown', retryPlayback, { passive: true });
    window.addEventListener('keydown', retryPlayback, { passive: true });
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

    const nowMs = Date.now();
    if (nowMs - this.lastHealthCheckMs >= 850) {
      this.lastHealthCheckMs = nowMs;
      this.checkPeerHealth(nowMs);
    }
  }

  private checkPeerHealth(nowMs: number): void {
    if (this.disposed) return;

    // Retry WebRTC connection for active Firestore room members whose P2P slot was closed for backoff
    for (const uid of this.memberMeta.keys()) {
      if (this.departedPeers.has(uid) || this.peers.has(uid)) continue;
      const retryAt = this.nextReconnectAtMs.get(uid) ?? 0;
      if (nowMs >= retryAt) {
        this.nextReconnectAtMs.delete(uid);
        this.createPeer(uid);
      }
    }

    for (const [uid, slot] of Array.from(this.peers.entries())) {
      if (this.departedPeers.has(uid)) continue;
      const pcState = slot.pc.connectionState;
      const dcOpen =
        (slot.dc && slot.dc.readyState === 'open') ||
        (slot.reliableDc && slot.reliableDc.readyState === 'open');
      const stillInRoom = this.memberMeta.has(uid);

      const scheduleRetry = () => {
        const attempts = (this.reconnectAttempts.get(uid) ?? 0) + 1;
        this.reconnectAttempts.set(uid, attempts);
        const delayMs = Math.min(25_000, 4000 * Math.pow(1.65, Math.min(attempts - 1, 4)));
        this.nextReconnectAtMs.set(uid, nowMs + delayMs);
        this.disconnectedSinceMs.delete(uid);
        this.closePeer(uid);
        this.emitConnectionStats();
      };

      if (pcState === 'failed' || pcState === 'closed') {
        if (stillInRoom) {
          scheduleRetry();
        } else {
          this.handlePeerDeparture(uid, undefined, 'timeout');
        }
        continue;
      }

      if (pcState === 'disconnected') {
        const discAt = this.disconnectedSinceMs.get(uid);
        if (!discAt) {
          this.disconnectedSinceMs.set(uid, nowMs);
          if (!this.isPoliteFor(uid) && slot.pc.signalingState === 'stable') {
            try {
              slot.pc.restartIce();
            } catch {
              // ignore unsupported restartIce
            }
          }
        } else if (nowMs - discAt >= 12_000) {
          if (stillInRoom) {
            scheduleRetry();
          } else {
            this.handlePeerDeparture(uid, undefined, 'timeout');
          }
          continue;
        }
      } else if (pcState === 'connected') {
        this.disconnectedSinceMs.delete(uid);
        if (dcOpen) {
          this.reconnectAttempts.delete(uid);
          this.nextReconnectAtMs.delete(uid);
        }
      }

      // Allow up to 24s for cross-continent ICE/SDP negotiation before retrying
      if (!dcOpen && stillInRoom && nowMs - slot.createdAtMs >= 24_000) {
        scheduleRetry();
        continue;
      }

      const lastAct = this.lastActivityMs.get(uid);
      if (
        !stillInRoom &&
        this.remoteStates.has(uid) &&
        typeof lastAct === 'number' &&
        nowMs - lastAct >= 8500
      ) {
        this.handlePeerDeparture(uid, undefined, 'timeout');
      }
    }
  }

  private handlePeerDeparture(
    uid: string,
    explicitName?: string,
    reason: 'left' | 'timeout' = 'left',
  ): void {
    if (this.departedPeers.has(uid)) return;
    const prevState = this.remoteStates.get(uid) ?? this.fallbackStates.get(uid);
    const meta = this.memberMeta.get(uid);
    const wasInWorld = Boolean(prevState) || this.everHadLiveState.has(uid);
    const displayName = (explicitName || prevState?.displayName || meta?.displayName || 'Rekan Tim').slice(0, 32);

    this.departedPeers.add(uid);
    this.departedAtMs.set(uid, Date.now());
    this.remoteStates.delete(uid);
    this.fallbackStates.delete(uid);
    this.lastActivityMs.delete(uid);
    this.disconnectedSinceMs.delete(uid);
    this.reconnectAttempts.delete(uid);
    this.nextReconnectAtMs.delete(uid);
    this.closePeer(uid);
    this.emitRemotePlayers();
    this.emitConnectionStats();

    if (wasInWorld) {
      this.callbacks.onPeerDeparted?.({ uid, displayName, reason });
    }
  }

  private isPoliteFor(remoteUid: string): boolean {
    return this.myUid < remoteUid;
  }

  private async runNegotiation(slot: PeerSlot): Promise<void> {
    if (this.disposed || slot.closing || this.peers.get(slot.uid) !== slot) return;
    const pc = slot.pc;
    if (slot.makingOffer || pc.signalingState !== 'stable') {
      slot.pendingNegotiation = true;
      return;
    }
    slot.pendingNegotiation = false;
    slot.makingOffer = true;
    try {
      await pc.setLocalDescription();
      if (this.disposed || slot.closing || this.peers.get(slot.uid) !== slot) return;
      if (pc.localDescription) {
        await sendWebRtcSignal({
          roomId: this.roomId,
          toUid: slot.uid,
          kind: pc.localDescription.type === 'answer' ? 'answer' : 'offer',
          payload: JSON.stringify(pc.localDescription),
        });
      }
    } catch {
      if (!this.disposed && !slot.closing && this.peers.get(slot.uid) === slot) {
        slot.pendingNegotiation = true;
      }
    } finally {
      slot.makingOffer = false;
      if (
        slot.pendingNegotiation &&
        !this.disposed &&
        !slot.closing &&
        this.peers.get(slot.uid) === slot &&
        pc.signalingState === 'stable'
      ) {
        void this.runNegotiation(slot);
      }
    }
  }

  private createPeer(remoteUid: string): PeerSlot {
    const pc = new RTCPeerConnection(RTC_ICE_CONFIG);
    const slot: PeerSlot = {
      uid: remoteUid,
      pc,
      dc: null,
      reliableDc: null,
      makingOffer: false,
      ignoreOffer: false,
      pendingNegotiation: false,
      remoteOriginSessionId: null,
      closing: false,
      audioEl: null,
      remoteStream: null,
      audioCtx: null,
      analyser: null,
      analyserBuf: null,
      speaking: false,
      pendingIce: [],
      pendingRemoteIce: [],
      iceFlushTimer: null,
      createdAtMs: Date.now(),
    };
    this.peers.set(remoteUid, slot);

    // Attach local mic if already active; otherwise impolite peer pre-allocates recvonly audio m-line
    if (this.localMicStream && this.localMicStream.getAudioTracks().some((t) => t.readyState === 'live')) {
      for (const tr of this.localMicStream.getAudioTracks()) {
        if (tr.readyState === 'live') {
          pc.addTrack(tr, this.localMicStream);
        }
      }
    } else if (!this.isPoliteFor(remoteUid)) {
      try {
        pc.addTransceiver('audio', { direction: 'recvonly' });
      } catch {
        // ignore if unsupported
      }
    }

    // Impolite peer creates the initial DataChannels so both sides converge cleanly
    if (!this.isPoliteFor(remoteUid)) {
      const dc = pc.createDataChannel('diglosa-sync', { ordered: false, maxRetransmits: 0 });
      this.bindDataChannel(slot, dc, 'sync');
      const rdc = pc.createDataChannel('diglosa-reliable', { ordered: true });
      this.bindDataChannel(slot, rdc, 'reliable');
    }

    pc.ondatachannel = (ev) => {
      if (this.disposed || slot.closing || this.peers.get(remoteUid) !== slot) return;
      const kind = ev.channel.label === 'diglosa-reliable' ? 'reliable' : 'sync';
      this.bindDataChannel(slot, ev.channel, kind);
    };

    pc.onsignalingstatechange = () => {
      if (this.disposed || slot.closing || this.peers.get(remoteUid) !== slot) return;
      if (pc.signalingState === 'stable' && slot.pendingNegotiation && !slot.makingOffer) {
        void this.runNegotiation(slot);
      }
    };

    pc.onnegotiationneeded = () => {
      if (this.disposed || slot.closing || this.peers.get(remoteUid) !== slot) return;
      slot.pendingNegotiation = true;
      void this.runNegotiation(slot);
    };

    pc.onicecandidate = (ev) => {
      if (this.disposed || slot.closing || this.peers.get(remoteUid) !== slot) return;
      if (ev.candidate) {
        const init: RTCIceCandidateInit =
          typeof ev.candidate.toJSON === 'function'
            ? ev.candidate.toJSON()
            : {
                candidate: ev.candidate.candidate,
                sdpMid: ev.candidate.sdpMid,
                sdpMLineIndex: ev.candidate.sdpMLineIndex,
                usernameFragment: ev.candidate.usernameFragment,
              };
        slot.pendingIce.push(init);
        if (slot.pendingIce.length >= 12) {
          void this.flushIceCandidates(slot);
        } else if (slot.iceFlushTimer === null) {
          slot.iceFlushTimer = window.setTimeout(() => {
            void this.flushIceCandidates(slot);
          }, 150);
        }
      } else {
        void this.flushIceCandidates(slot);
      }
    };

    pc.ontrack = (ev) => {
      if (this.disposed || slot.closing || this.peers.get(remoteUid) !== slot) return;
      const stream = ev.streams[0] ?? new MediaStream([ev.track]);
      slot.remoteStream = stream;
      if (!slot.audioEl) {
        const audio = document.createElement('audio');
        audio.autoplay = true;
        audio.setAttribute('playsinline', 'true');
        audio.style.display = 'none';
        audio.muted = this.muteAllPeers;
        audio.srcObject = stream;
        if (typeof document !== 'undefined' && document.body) {
          document.body.appendChild(audio);
        }
        slot.audioEl = audio;
      } else {
        slot.audioEl.srcObject = stream;
      }
      const tryPlay = () => {
        if (this.disposed || slot.closing || !slot.audioEl || this.muteAllPeers) return;
        void slot.audioEl.play().catch(() => {
          this.scheduleAudioPlayUnlock();
        });
      };
      tryPlay();
      ev.track.onunmute = () => {
        tryPlay();
      };
      if (slot.audioCtx) {
        void slot.audioCtx.close().catch(() => undefined);
        slot.audioCtx = null;
      }
      this.setupRemoteVad(slot, stream);
    };

    pc.onconnectionstatechange = () => {
      if (this.disposed || slot.closing || this.peers.get(remoteUid) !== slot) return;
      const state = pc.connectionState;
      if (state === 'connected') {
        this.disconnectedSinceMs.delete(remoteUid);
        this.reconnectAttempts.delete(remoteUid);
        this.nextReconnectAtMs.delete(remoteUid);
      } else if (state === 'disconnected') {
        if (!this.disconnectedSinceMs.has(remoteUid)) {
          this.disconnectedSinceMs.set(remoteUid, Date.now());
        }
      } else if (state === 'failed' || state === 'closed') {
        if (this.memberMeta.has(remoteUid)) {
          const attempts = (this.reconnectAttempts.get(remoteUid) ?? 0) + 1;
          this.reconnectAttempts.set(remoteUid, attempts);
          const delayMs = Math.min(25_000, 4000 * Math.pow(1.65, Math.min(attempts - 1, 4)));
          this.nextReconnectAtMs.set(remoteUid, Date.now() + delayMs);
          this.closePeer(remoteUid);
        } else if (this.remoteStates.has(remoteUid)) {
          this.handlePeerDeparture(remoteUid, undefined, 'timeout');
        }
      }
      this.emitConnectionStats();
    };

    return slot;
  }

  private bindDataChannel(
    slot: PeerSlot,
    dc: RTCDataChannel,
    kind: 'sync' | 'reliable',
  ): void {
    if (kind === 'reliable') {
      slot.reliableDc = dc;
    } else {
      slot.dc = dc;
    }
    dc.onopen = () => {
      if (this.disposed || slot.closing || this.peers.get(slot.uid) !== slot) return;
      this.departedPeers.delete(slot.uid);
      this.departedAtMs.delete(slot.uid);
      this.lastActivityMs.set(slot.uid, Date.now());
      this.disconnectedSinceMs.delete(slot.uid);
      this.emitConnectionStats();
      this.callbacks.onPeerChannelOpen?.(slot.uid);
    };
    dc.onclose = () => {
      if (this.disposed || slot.closing || this.peers.get(slot.uid) !== slot) return;
      const otherOpen =
        (slot.dc && slot.dc !== dc && slot.dc.readyState === 'open') ||
        (slot.reliableDc && slot.reliableDc !== dc && slot.reliableDc.readyState === 'open');
      if (!otherOpen && this.remoteStates.has(slot.uid) && !this.disconnectedSinceMs.has(slot.uid)) {
        this.disconnectedSinceMs.set(slot.uid, Date.now());
      }
      this.emitConnectionStats();
    };
    dc.onmessage = (ev) => {
      if (typeof ev.data !== 'string' || this.disposed || slot.closing || this.peers.get(slot.uid) !== slot) return;
      try {
        const parsed = JSON.parse(ev.data) as
          | LocalPlayerSyncPacket
          | { t: 'chat'; id?: string; nm?: string; tx?: string }
          | P2pReliableMessage;
        if (parsed.t === 'leave') {
          this.handlePeerDeparture(slot.uid, parsed.nm, 'left');
          return;
        }
        this.lastActivityMs.set(slot.uid, Date.now());
        this.disconnectedSinceMs.delete(slot.uid);
        if (parsed.t === 'state') {
          const meta = this.memberMeta.get(slot.uid);
          const prev = this.remoteStates.get(slot.uid);
          const wasDepartedOrReturning =
            !prev && (this.departedPeers.has(slot.uid) || this.everHadLiveState.has(slot.uid));
          this.departedPeers.delete(slot.uid);
          this.everHadLiveState.add(slot.uid);
          const cleanName = (parsed.nm || meta?.displayName || 'Teman').slice(0, 32);
          this.remoteStates.set(slot.uid, {
            uid: slot.uid,
            displayName: cleanName,
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
            hp: typeof parsed.hp === 'number' ? parsed.hp : prev?.hp,
            maxHp: typeof parsed.mhp === 'number' ? parsed.mhp : prev?.maxHp,
            inChallenge: typeof parsed.ic === 'boolean' ? parsed.ic : prev?.inChallenge,
            zoneName: typeof parsed.zn === 'string' ? parsed.zn : prev?.zoneName,
            speaking: slot.speaking,
            lastChatText: prev?.lastChatText,
            lastChatAt: prev?.lastChatAt,
            updatedAtMs: Date.now(),
          });
          this.emitRemotePlayers();
          if (wasDepartedOrReturning) {
            this.callbacks.onPeerJoined?.({ uid: slot.uid, displayName: cleanName });
          }
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
        } else if (
          parsed.t === 'wsync' ||
          parsed.t === 'msync' ||
          parsed.t === 'm_hit' ||
          parsed.t === 'm_kill' ||
          parsed.t === 'shot' ||
          parsed.t === 'heal' ||
          parsed.t === 'prog' ||
          parsed.t === 'stats' ||
          parsed.t === 'wreq'
        ) {
          this.callbacks.onWorldEvent?.(slot.uid, parsed);
        }
      } catch {
        // ignore malformed datagram
      }
    };
  }

  private async handleIncomingSignal(sig: WebRtcSignalDoc): Promise<void> {
    if (this.disposed || sig.fromUid === this.myUid) return;
    if (sig.kind === 'offer') {
      this.departedPeers.delete(sig.fromUid);
      this.departedAtMs.delete(sig.fromUid);
    }

    let description: RTCSessionDescriptionInit | null = null;
    let incomingOriginId: string | null = null;
    if (sig.kind === 'offer' || sig.kind === 'answer') {
      try {
        description = JSON.parse(sig.payload) as RTCSessionDescriptionInit;
        incomingOriginId = extractSdpOriginId(description.sdp);
      } catch {
        return;
      }
    }

    let slot = this.peers.get(sig.fromUid);
    if (sig.kind === 'offer' && slot) {
      const isDead =
        slot.closing ||
        slot.pc.connectionState === 'failed' ||
        slot.pc.connectionState === 'closed' ||
        (slot.pc.connectionState === 'disconnected' && Date.now() - slot.createdAtMs >= 3000);
      const isNewRemoteSession =
        Boolean(incomingOriginId) &&
        Boolean(slot.remoteOriginSessionId) &&
        incomingOriginId !== slot.remoteOriginSessionId;
      if (isDead || isNewRemoteSession) {
        this.closePeer(sig.fromUid);
        slot = undefined;
      }
    }
    if (!slot) {
      if (sig.kind !== 'offer') return;
      slot = this.createPeer(sig.fromUid);
    }

    const pc = slot.pc;
    const polite = this.isPoliteFor(sig.fromUid);

    try {
      if (description && (sig.kind === 'offer' || sig.kind === 'answer')) {
        const offerCollision =
          description.type === 'offer' &&
          (slot.makingOffer || pc.signalingState !== 'stable');
        slot.ignoreOffer = !polite && offerCollision;
        if (slot.ignoreOffer) return;

        if (incomingOriginId) {
          slot.remoteOriginSessionId = incomingOriginId;
        }

        await pc.setRemoteDescription(description);
        if (this.disposed || slot.closing || this.peers.get(sig.fromUid) !== slot) return;

        if (slot.pendingRemoteIce.length > 0) {
          const queued = slot.pendingRemoteIce.splice(0, slot.pendingRemoteIce.length);
          for (const cand of queued) {
            await pc.addIceCandidate(cand).catch(() => undefined);
          }
        }
        if (description.type === 'offer') {
          await pc.setLocalDescription();
          if (
            pc.localDescription &&
            !this.disposed &&
            !slot.closing &&
            this.peers.get(sig.fromUid) === slot
          ) {
            await sendWebRtcSignal({
              roomId: this.roomId,
              toUid: sig.fromUid,
              kind: 'answer',
              payload: JSON.stringify(pc.localDescription),
            });
          }
        }
        if (pc.signalingState === 'stable' && slot.pendingNegotiation && !slot.makingOffer) {
          void this.runNegotiation(slot);
        }
      } else if (sig.kind === 'ice') {
        const parsed = JSON.parse(sig.payload) as RTCIceCandidateInit | RTCIceCandidateInit[];
        const list = Array.isArray(parsed) ? parsed : [parsed];
        if (!pc.remoteDescription || !pc.remoteDescription.type) {
          for (const candidate of list) {
            if (slot.pendingRemoteIce.length < 64) {
              slot.pendingRemoteIce.push(candidate);
            }
          }
          return;
        }
        for (const candidate of list) {
          try {
            await pc.addIceCandidate(candidate);
          } catch (err) {
            if (!slot.ignoreOffer) throw err;
          }
        }
      }
    } catch {
      // ignore transient SDP/ICE race
    }
  }

  private async flushIceCandidates(slot: PeerSlot): Promise<void> {
    if (slot.iceFlushTimer !== null) {
      window.clearTimeout(slot.iceFlushTimer);
      slot.iceFlushTimer = null;
    }
    if (this.disposed || slot.closing || this.peers.get(slot.uid) !== slot || slot.pendingIce.length === 0) {
      slot.pendingIce.length = 0;
      return;
    }
    const batch = slot.pendingIce.splice(0, slot.pendingIce.length);
    const sendChunk = async (items: RTCIceCandidateInit[]): Promise<void> => {
      if (items.length === 0 || this.disposed || slot.closing || this.peers.get(slot.uid) !== slot) return;
      const serialized = JSON.stringify(items);
      if (serialized.length <= 8190 || items.length === 1) {
        await sendWebRtcSignal({
          roomId: this.roomId,
          toUid: slot.uid,
          kind: 'ice',
          payload: serialized,
        }).catch(() => undefined);
        return;
      }
      const mid = Math.ceil(items.length / 2);
      await sendChunk(items.slice(0, mid));
      await sendChunk(items.slice(mid));
    };
    await sendChunk(batch);
  }

  private closePeer(uid: string): void {
    const slot = this.peers.get(uid);
    if (!slot) return;
    slot.closing = true;
    this.peers.delete(uid);
    if (slot.iceFlushTimer !== null) {
      window.clearTimeout(slot.iceFlushTimer);
      slot.iceFlushTimer = null;
    }
    slot.pendingIce.length = 0;
    slot.pendingRemoteIce.length = 0;
    slot.pc.onnegotiationneeded = null;
    slot.pc.onsignalingstatechange = null;
    slot.pc.onicecandidate = null;
    slot.pc.ondatachannel = null;
    slot.pc.ontrack = null;
    slot.pc.onconnectionstatechange = null;
    try {
      slot.dc?.close();
    } catch {
      // ignore
    }
    try {
      slot.reliableDc?.close();
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
      slot.audioEl.remove();
      slot.audioEl = null;
    }
    if (slot.audioCtx) {
      void slot.audioCtx.close().catch(() => undefined);
      slot.audioCtx = null;
    }
  }

  private emitRemotePlayers(): void {
    const now = Date.now();
    const merged = new Map<string, RemotePlayerState>();

    for (const [uid, fb] of this.fallbackStates.entries()) {
      if (this.departedPeers.has(uid)) continue;
      merged.set(uid, fb);
    }

    for (const [uid, p2p] of this.remoteStates.entries()) {
      if (this.departedPeers.has(uid)) continue;
      const slot = this.peers.get(uid);
      const dcOpen =
        slot &&
        ((slot.dc && slot.dc.readyState === 'open') ||
          (slot.reliableDc && slot.reliableDc.readyState === 'open'));
      const lastAct = this.lastActivityMs.get(uid) ?? p2p.updatedAtMs ?? 0;
      const p2pFresh = dcOpen || (lastAct > 0 && now - lastAct < 4500) || !merged.has(uid);
      if (p2pFresh) {
        const fb = merged.get(uid);
        merged.set(uid, {
          ...p2p,
          lastChatText: p2p.lastChatText ?? fb?.lastChatText,
          lastChatAt: p2p.lastChatAt ?? fb?.lastChatAt,
        });
      }
    }

    this.callbacks.onRemotePlayersChange(Array.from(merged.values()));
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
    this.memberUpdatedAtMs.clear();
    this.memberJoinedAtMs.clear();
    this.remoteStates.clear();
    this.fallbackStates.clear();
    this.lastActivityMs.clear();
    this.disconnectedSinceMs.clear();
    this.reconnectAttempts.clear();
    this.nextReconnectAtMs.clear();
    this.departedPeers.clear();
    this.departedAtMs.clear();
    this.signalQueues.clear();
    this.everHadLiveState.clear();
  }
}
