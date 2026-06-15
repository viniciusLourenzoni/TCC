import { db } from './dexie';
import type { Customer } from '@/types/api';

export const customersRepo = {
  async putAll(list: Customer[]) {
    await db.transaction('rw', db.customers, async () => {
      await db.customers.clear();
      await db.customers.bulkPut(list);
    });
  },
  async getAll(): Promise<Customer[]> {
    return db.customers.orderBy('name').toArray();
  },
};
