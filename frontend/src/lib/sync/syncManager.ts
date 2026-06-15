import { syncSales } from '@/lib/api/sales';
import { pendingSalesRepo } from '@/lib/db/pendingSalesRepo';
import type { SyncResult } from '@/types/api';

let inFlight = false;

export async function flushPendingSales(): Promise<SyncResult[]> {
  if (inFlight) return [];
  inFlight = true;
  try {
    const pending = await pendingSalesRepo.pending();
    if (pending.length === 0) return [];

    // Marca como syncing
    await Promise.all(
      pending
        .filter((p) => p.localId != null)
        .map((p) => pendingSalesRepo.markSyncing(p.localId as number)),
    );

    const payload = pending.map((p) => ({
      ...p.payload,
      offlineId: p.offlineId,
    }));

    try {
      const results = await syncSales(payload);

      // Remove os bem-sucedidos (CREATED ou ALREADY_SYNCED)
      const byOffline = new Map(results.map((r) => [r.offlineId, r]));
      for (const item of pending) {
        if (item.localId == null) continue;
        const result = byOffline.get(item.offlineId);
        if (result?.status === 'CREATED' || result?.status === 'ALREADY_SYNCED') {
          await pendingSalesRepo.remove(item.localId);
        } else if (result?.status === 'FAILED') {
          await pendingSalesRepo.markFailed(
            item.localId,
            result.error ?? 'falha desconhecida',
          );
        }
      }

      return results;
    } catch (err) {
      // erro de rede ou servidor: re-marca como pending
      const message = err instanceof Error ? err.message : String(err);
      for (const item of pending) {
        if (item.localId == null) continue;
        await pendingSalesRepo.markFailed(item.localId, message);
      }
      throw err;
    }
  } finally {
    inFlight = false;
  }
}
