import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { OfflineBanner } from './OfflineBanner';
import { useHydrateOfflineCache } from '@/lib/sync/useHydrateOfflineCache';
import { registerPush } from '@/lib/push/pushManager';

export function AppShell() {
  useHydrateOfflineCache();

  // Pede permissão e assina o Web Push ao entrar na área autenticada
  useEffect(() => {
    registerPush().catch(() => undefined);
  }, []);

  return (
    <div className="app-container">
      <OfflineBanner />
      <main className="flex-1 flex flex-col pb-20 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
