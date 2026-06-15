import { db } from './dexie';
import type { Product } from '@/types/api';

export const productsRepo = {
  async putAll(list: Product[]) {
    await db.transaction('rw', db.products, async () => {
      await db.products.clear();
      await db.products.bulkPut(list);
    });
  },
  async getAll(): Promise<Product[]> {
    return db.products.orderBy('name').toArray();
  },
  async search(q: string): Promise<Product[]> {
    const lower = q.toLowerCase();
    return db.products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          (p.barcode ?? '').toLowerCase().includes(lower),
      )
      .toArray();
  },
};
