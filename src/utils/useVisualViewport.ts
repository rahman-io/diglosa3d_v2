import { useEffect, useState } from 'react';

export interface VisualViewportState {
  height: number;
  offsetTop: number;
  isKeyboardOpen: boolean;
}

const TEXT_INPUT_TYPES = new Set([
  'text',
  'search',
  'email',
  'url',
  'tel',
  'password',
  'number',
  '',
]);

function isTextEditableElement(el: Element | null): boolean {
  if (!el) return false;
  if (el.tagName === 'TEXTAREA') return true;
  if (el.tagName === 'INPUT') {
    const type = ((el as HTMLInputElement).type || '').toLowerCase();
    return TEXT_INPUT_TYPES.has(type);
  }
  return (el as HTMLElement).isContentEditable === true;
}

/**
 * Tracks `window.visualViewport` height and `offsetTop` while a modal is open,
 * so modals on mobile browsers (especially Chrome Android / iOS Safari in landscape)
 * shrink strictly above the on-screen soft keyboard and remain smoothly scrollable.
 */
export function useVisualViewport(active: boolean): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>(() => {
    if (typeof window === 'undefined') {
      return { height: 720, offsetTop: 0, isKeyboardOpen: false };
    }
    const vv = window.visualViewport;
    return {
      height: Math.round(vv?.height ?? window.innerHeight),
      offsetTop: Math.round(vv?.offsetTop ?? 0),
      isKeyboardOpen: false,
    };
  });

  useEffect(() => {
    if (!active || typeof window === 'undefined') return;

    let maxHeightSeen = Math.max(
      window.innerHeight,
      window.visualViewport?.height ?? window.innerHeight,
    );

    const update = () => {
      const vv = window.visualViewport;
      const height = Math.round(vv?.height ?? window.innerHeight);
      const offsetTop = Math.round(vv?.offsetTop ?? 0);
      if (height > maxHeightSeen) maxHeightSeen = height;

      const layoutDiff = window.innerHeight - height;
      const peakDiff = maxHeightSeen - height;
      const focusedText = isTextEditableElement(document.activeElement);
      const isCoarse =
        window.matchMedia?.('(pointer: coarse)').matches ?? false;

      const isKeyboardOpen =
        layoutDiff > 90 ||
        peakDiff > 100 ||
        (focusedText && (isCoarse || height <= 360));

      setState((prev) => {
        if (
          prev.height === height &&
          prev.offsetTop === offsetTop &&
          prev.isKeyboardOpen === isKeyboardOpen
        ) {
          return prev;
        }
        return { height, offsetTop, isKeyboardOpen };
      });
    };

    update();
    const vv = window.visualViewport;
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);
    window.addEventListener('resize', update);

    const onFocusChange = () => {
      update();
      window.setTimeout(update, 120);
      window.setTimeout(update, 320);
    };
    document.addEventListener('focusin', onFocusChange);
    document.addEventListener('focusout', onFocusChange);

    return () => {
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      document.removeEventListener('focusin', onFocusChange);
      document.removeEventListener('focusout', onFocusChange);
    };
  }, [active]);

  return state;
}

/**
 * Scrolls a focused text field safely into view inside its nearest scrollable
 * modal container after the mobile soft keyboard finishes animating open.
 */
export function scrollFieldIntoView(el: HTMLElement | null): void {
  if (!el) return;
  const run = () => {
    if (!el.isConnected) return;
    try {
      el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
    } catch {
      el.scrollIntoView(false);
    }
  };
  run();
  window.setTimeout(run, 140);
  window.setTimeout(run, 340);
}
