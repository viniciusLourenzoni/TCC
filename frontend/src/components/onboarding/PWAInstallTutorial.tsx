import type { ReactNode } from 'react';
import { Smartphone, Share, Plus, MoreVertical, Check, X } from 'lucide-react';
import { usePWAInstall } from '@/lib/pwa/usePWAInstall';

export function PWAInstallTutorial() {
  const { shouldShow, platform, hasNativePrompt, promptInstall, dismiss } =
    usePWAInstall();

  if (!shouldShow) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Instalar o app"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
    >
      <div className="w-full max-w-[480px] rounded-t-2xl bg-surface p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Smartphone className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold leading-tight">
                Instale o app no seu celular
              </h2>
              <p className="text-xs text-muted-foreground">
                Acesso rápido pela tela inicial e funciona offline.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={dismiss}
            className="-mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <Steps platform={platform} hasNativePrompt={hasNativePrompt} />
        </div>

        <div className="mt-5 flex flex-col gap-1">
          {hasNativePrompt ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                void promptInstall();
              }}
            >
              Instalar agora
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={dismiss}>
              Entendi
            </button>
          )}
          <button
            type="button"
            className="py-2 text-xs font-medium text-muted-foreground"
            onClick={dismiss}
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}

function Steps({
  platform,
  hasNativePrompt,
}: {
  platform: 'ios' | 'android' | 'other';
  hasNativePrompt: boolean;
}) {
  if (hasNativePrompt) {
    return (
      <p className="text-sm text-muted-foreground">
        É rápido: toque em <strong className="text-foreground">Instalar agora</strong>{' '}
        e confirme a instalação. O app vai aparecer junto com os outros no seu
        celular.
      </p>
    );
  }

  if (platform === 'ios') {
    return (
      <>
        <Step n={1} icon={<Share className="h-4 w-4" />}>
          Toque no botão <strong>Compartilhar</strong> na barra do Safari.
        </Step>
        <Step n={2} icon={<Plus className="h-4 w-4" />}>
          Role e escolha <strong>“Adicionar à Tela de Início”</strong>.
        </Step>
        <Step n={3} icon={<Check className="h-4 w-4" />}>
          Confirme em <strong>“Adicionar”</strong> — o ícone vai para a tela
          inicial.
        </Step>
      </>
    );
  }

  // Android sem prompt nativo / outros navegadores
  return (
    <>
      <Step n={1} icon={<MoreVertical className="h-4 w-4" />}>
        Toque no menu <strong>⋮</strong> do navegador.
      </Step>
      <Step n={2} icon={<Plus className="h-4 w-4" />}>
        Escolha <strong>“Instalar app”</strong> ou{' '}
        <strong>“Adicionar à tela inicial”</strong>.
      </Step>
      <Step n={3} icon={<Check className="h-4 w-4" />}>
        Confirme em <strong>“Adicionar”</strong>.
      </Step>
    </>
  );
}

function Step({
  n,
  icon,
  children,
}: {
  n: number;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {n}
      </span>
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <p className="text-sm leading-snug">{children}</p>
    </div>
  );
}
