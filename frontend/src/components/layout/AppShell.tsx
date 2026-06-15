import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { OfflineBanner } from './OfflineBanner';
import { useHydrateOfflineCache } from '@/lib/sync/useHydrateOfflineCache';

export function AppShell() {
  useHydrateOfflineCache();
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
