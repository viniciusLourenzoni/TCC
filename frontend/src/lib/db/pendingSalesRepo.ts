import { db } from './dexie';
import type { CreateSaleRequest } from '@/types/api';
import type { PendingSale } from './dexie';

export const pendingSalesRepo = {
  async enqueue(payload: CreateSaleRequest): Promise<PendingSale> {
    const offlineId =
      payload.offlineId ??
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `off-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

    const entry: PendingSale = {
      offlineId,
      payload: { ...payload, offlineId },
      status: 'pending',
      createdAt: new Date().toISOString(),
      attempts: 0,
    };
    const id = await db.pendingSales.add(entry);
    return { ...entry, localId: id as number };
  },

  async list(): Promise<PendingSale[]> {
    return db.pendingSales.orderBy('createdAt').toArray();
  },

  async pending(): Promise<PendingSale[]> {
    return db.pendingSales.where('status').notEqual('syncing').toArray();
  },

  async markSyncing(localId: number) {
    await db.pendingSales.update(localId, { status: 'syncing' });
  },

  async markFailed(localId: number, error: string) {
    const item = await db.pendingSales.get(localId);
    await db.pendingSales.update(localId, {
      status: 'failed',
      lastError: error,
      attempts: (item?.attempts ?? 0) + 1,
    });
  },

  async remove(localId: number) {
    await db.pendingSales.delete(localId);
  },

  async count(): Promise<number> {
    return db.pendingSales.count();
  },
};
