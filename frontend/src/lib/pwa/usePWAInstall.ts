import { useEffect, useState } from 'react';
import {
  hasDeferredPrompt,
  onChange,
  promptInstall as triggerPrompt,
} from './pwaInstall';
import { useOnboardingStore } from '@/stores/onboardingStore';

export type Platform = 'ios' | 'android' | 'other';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  // iPad moderno se identifica como Macintosh com touch
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return 'ios';
  return 'other';
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function usePWAInstall() {
  const platform = detectPlatform();
  const isMobile = platform === 'ios' || platform === 'android';
  const isStandalone = detectStandalone();

  const pwaTutorialSeen = useOnboardingStore((s) => s.pwaTutorialSeen);
  const markSeen = useOnboardingStore((s) => s.markPwaTutorialSeen);

  const [hasNativePrompt, setHasNativePrompt] = useState(hasDeferredPrompt());

  useEffect(() => {
    setHasNativePrompt(hasDeferredPrompt());
    return onChange(() => setHasNativePrompt(hasDeferredPrompt()));
  }, []);

  const shouldShow = isMobile && !isStandalone && !pwaTutorialSeen;

  async function promptInstall() {
    const outcome = await triggerPrompt();
    markSeen();
    return outcome;
  }

  function dismiss() {
    markSeen();
  }

  return {
    platform,
    isMobile,
    isStandalone,
    hasNativePrompt,
    shouldShow,
    promptInstall,
    dismiss,
  };
}
