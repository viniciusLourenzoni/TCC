import { db } from './dexie';
import type { Category } from '@/types/api';

export const categoriesRepo = {
  async putAll(list: Category[]) {
    await db.transaction('rw', db.categories, async () => {
      await db.categories.clear();
      await db.categories.bulkPut(list);
    });
  },
  async getAll(): Promise<Category[]> {
    return db.categories.orderBy('name').toArray();
  },
};
