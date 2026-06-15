// Singleton para o prompt de instalação do PWA (Android/Chrome).
// Importado cedo em main.tsx para capturar o evento antes do React montar.

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((cb) => cb());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Impede o mini-infobar do Chrome; usamos nosso próprio tutorial
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

export function hasDeferredPrompt(): boolean {
  return deferredPrompt !== null;
}

/** Inscreve-se em mudanças de disponibilidade do prompt. Retorna o unsubscribe. */
export function onChange(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export async function promptInstall(): Promise<
  'accepted' | 'dismissed' | 'unavailable'
> {
  if (!deferredPrompt) return 'unavailable';
  await deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  notify();
  return choice.outcome;
}
