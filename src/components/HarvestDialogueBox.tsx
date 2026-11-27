import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Languages, Volume2 } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { CharacterPresetId, MonsterType } from '../types/game';
import { DialoguePortraitCanvas, DialogueSpeakerKind } from './DialoguePortraitCanvas';

export interface HarvestDialogueBoxProps {
  speakerName: string;
  speakerRole?: string;
  speakerKind: DialogueSpeakerKind;
  characterId: CharacterPresetId;
  npcId?: string;
  villagerArchetypes?: string[];
  captiveKind?: 'girl' | 'mother' | 'fox_kit' | 'student' | 'spirit';
  captiveColor?: number;
  monsterType?: MonsterType;
  heroExpression?: 'neutral' | 'fierce';
  bossExpression?: 'laugh' | 'taunt' | 'menace' | 'shock' | 'angry';
  speakerSide?: 'npc' | 'hero';
  textId: string;
  textEn?: string;
  topAccessory?: React.ReactNode;
  footerActions?: React.ReactNode;
  canAdvance?: boolean;
  onAdvance?: () => void;
  onSkip?: () => void;
}

export const HarvestDialogueBox: React.FC<HarvestDialogueBoxProps> = ({
  speakerName,
  speakerRole,
  speakerKind,
  characterId,
  npcId,
  villagerArchetypes,
  captiveKind,
  captiveColor,
  monsterType,
  heroExpression = 'neutral',
  bossExpression,
  speakerSide = 'npc',
  textId,
  textEn,
  topAccessory,
  footerActions,
  canAdvance = true,
  onAdvance,
  onSkip,
}) => {
  const [showEn, setShowEn] = useState(false);
  const fullText = showEn && textEn ? textEn : textId;
  const [revealedCount, setRevealedCount] = useState(0);
  const timerRef = useRef<number | null>(null);
  const isTyping = revealedCount < fullText.length;

  useEffect(() => {
    setShowEn(false);
  }, [textId, textEn, speakerName]);

  useEffect(() => {
    setRevealedCount(0);
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!fullText) return;

    const pitchOffset =
      speakerKind === 'boss'
        ? -85
        : speakerKind === 'hero'
          ? 65
          : speakerKind === 'captive'
            ? 110
            : speakerKind === 'villagers'
              ? 45
              : -45;
    let cursor = 0;
    timerRef.current = window.setInterval(() => {
      cursor = Math.min(fullText.length, cursor + 2);
      setRevealedCount(cursor);
      const ch = fullText.charAt(cursor - 1);
      if (ch && ch !== ' ' && cursor % 4 === 2) {
        soundEngine.playDialogueBlip(pitchOffset);
      }
      if (cursor >= fullText.length) {
        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 36);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [fullText, speakerKind]);

  const handleBoxInteract = () => {
    if (isTyping) {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRevealedCount(fullText.length);
      return;
    }
    if (canAdvance && onAdvance) {
      onAdvance();
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
        e.preventDefault();
        if (isTyping) {
          if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setRevealedCount(fullText.length);
        } else if (canAdvance && onAdvance) {
          onAdvance();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isTyping, fullText.length, canAdvance, onAdvance]);

  const displayedText = fullText.slice(0, revealedCount);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center px-2.5 pb-2.5 sm:px-6 sm:pb-4">
      <div className="relative w-full max-w-3xl">
        {/* Optional floating drawer above box (e.g. vocab cards / ribbon badge) */}
        {topAccessory && (
          <div className="pointer-events-auto relative z-30 mb-2 flex justify-end">
            {topAccessory}
          </div>
        )}

        {/* 3D Bust-Up Portrait sitting cleanly above the left edge of the dialogue box */}
        <div
          className={`pointer-events-none relative z-10 -mb-7 ml-1 sm:-mb-9 sm:ml-2 ${
            speakerKind === 'villagers'
              ? 'h-[132px] w-[148px] sm:h-[170px] sm:w-[192px]'
              : 'h-[126px] w-[112px] sm:h-[164px] sm:w-[144px]'
          }`}
        >
          <DialoguePortraitCanvas
            speakerKind={speakerKind}
            characterId={characterId}
            npcId={npcId}
            villagerArchetypes={villagerArchetypes}
            captiveKind={captiveKind}
            captiveColor={captiveColor}
            monsterType={monsterType}
            heroExpression={heroExpression}
            bossExpression={bossExpression}
            isSpeaking={isTyping}
            className="h-full w-full"
          />
        </div>

        {/* Main Harvest-Moon-Style Bottom Cream Box */}
        <div className="pointer-events-auto relative z-20">
          {/* Speech Bubble Pointer Tail pointing toward the 3D speaker in the world */}
          <img
            src="./assets/ui/ui_dialogue_tail.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            className={`pointer-events-none absolute -top-[21px] z-20 h-7 w-7 select-none object-contain transition-all duration-300 sm:-top-[26px] sm:h-9 sm:w-9 ${
              speakerSide === 'hero'
                ? 'left-[53%] -scale-x-100 sm:left-[54%]'
                : 'left-[43%] sm:left-[45%]'
            }`}
            style={{
              filter: 'drop-shadow(0 -2px 4px rgba(15, 23, 42, 0.25))',
            }}
          />

          {/* Speaker Nameplate overlapping top-left corner of dialogue box */}
          <div
            style={{
              borderStyle: 'solid',
              borderColor: 'transparent',
              borderWidth: '9px 20px 9px 20px',
              borderImageSource: "url('./assets/ui/ui_dialogue_nameplate.png')",
              borderImageSlice: '115 260 115 260 fill',
              borderImageWidth: '9px 20px 9px 20px',
              borderImageRepeat: 'stretch',
            }}
            className="absolute -top-5 left-2.5 z-30 inline-flex max-w-[70%] items-center gap-2 drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] sm:-top-6 sm:left-4"
          >
            <span className="truncate px-1 text-xs font-black tracking-wide text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.85)] sm:text-sm">
              {speakerName}
            </span>
          </div>

          {/* Skip button on top-right edge for cutscenes */}
          {onSkip && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSkip();
              }}
              className="absolute -top-4 right-3 z-30 rounded-full border-2 border-amber-300/75 bg-[#1e325c]/95 px-3 py-0.5 text-[11px] font-extrabold text-amber-100 shadow-md transition hover:bg-[#274075] sm:-top-5 sm:right-4 sm:text-xs"
            >
              Lewati ⏭
            </button>
          )}

          {/* 9-slice Cream Parchment + Wood/Gold Border Panel */}
          <div
            role="button"
            tabIndex={0}
            data-no-click-sfx="true"
            onClick={handleBoxInteract}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleBoxInteract();
              }
            }}
            style={{
              borderStyle: 'solid',
              borderColor: 'transparent',
              borderWidth: '18px 22px 20px 22px',
              borderImageSource: "url('./assets/ui/ui_dialogue_box.png')",
              borderImageSlice: '110 165 125 165 fill',
              borderImageWidth: '18px 22px 20px 22px',
              borderImageRepeat: 'stretch',
            }}
            className="relative w-full cursor-pointer select-none text-left drop-shadow-[0_14px_30px_rgba(15,23,42,0.55)] focus:outline-none"
          >
            <div className="flex min-h-[82px] flex-col justify-between gap-2 px-1 py-0.5 sm:min-h-[96px] sm:px-2 sm:py-1">
              {/* Top micro bar: Speaker role + English toggle & Voice */}
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[10px] font-extrabold uppercase tracking-wider text-[#8c5a2b] sm:text-[11px]">
                  {speakerRole || ''}
                </span>

                {textEn && (
                  <div
                    className="flex shrink-0 items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setShowEn((prev) => !prev)}
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-extrabold transition sm:text-[11px] ${
                        showEn
                          ? 'border-[#1e3a8a] bg-[#1e3a8a] text-white'
                          : 'border-[#c29b61] bg-[#f3e4c3] text-[#5c3412] hover:bg-[#ebd4a6]'
                      }`}
                    >
                      <Languages className="h-3 w-3 shrink-0" />
                      <span>{showEn ? 'ID' : 'EN'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => soundEngine.speakEnglish(textEn)}
                      title="Dengarkan Bahasa Inggris"
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-[#c29b61] bg-[#f3e4c3] text-[#5c3412] transition hover:bg-[#ebd4a6]"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Main Dialogue Text */}
              <p className="min-h-[42px] text-[14px] font-extrabold leading-snug text-[#3b1b06] sm:min-h-[48px] sm:text-[17px] sm:leading-relaxed">
                {displayedText}
              </p>

              {/* Optional compact action pills shown on final choice turn */}
              {footerActions && !isTyping && (
                <div
                  className="flex flex-wrap items-center justify-end gap-2 pt-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {footerActions}
                </div>
              )}

              {/* Explicit Next / Reveal button for advancing dialogue beats */}
              {canAdvance && onAdvance && !footerActions && (
                <div className="flex items-center justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBoxInteract();
                    }}
                    className="inline-flex items-center gap-1 rounded-full border-2 border-[#b45309]/55 bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] px-3 py-1 text-[11px] font-black text-[#3b1b06] shadow-sm transition hover:brightness-105 active:scale-95 sm:px-3.5 sm:text-xs"
                  >
                    <span>{isTyping ? 'Tampilkan' : 'Lanjut'}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bouncing Gold Continue Triangle centered on bottom rim */}
          {!isTyping && canAdvance && !footerActions && (
            <img
              src="./assets/ui/ui_dialogue_arrow.png"
              alt="Lanjut"
              draggable={false}
              onClick={handleBoxInteract}
              className="pointer-events-auto absolute -bottom-2.5 left-1/2 z-30 h-5 w-6 -translate-x-1/2 animate-bounce cursor-pointer select-none object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)] sm:-bottom-3 sm:h-6 sm:w-7"
            />
          )}
        </div>
      </div>
    </div>
  );
};
