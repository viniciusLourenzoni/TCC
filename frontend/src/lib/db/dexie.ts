import Dexie from 'dexie';
import type { Table } from 'dexie';
import type {
  Category,
  CreateSaleRequest,
  Customer,
  Product,
} from '@/types/api';

export interface PendingSale {
  localId?: number;
  offlineId: string;
  payload: CreateSaleRequest;
  status: 'pending' | 'syncing' | 'failed';
  createdAt: string;
  lastError?: string;
  attempts: number;
}

class AppDB extends Dexie {
  products!: Table<Product, string>;
  categories!: Table<Category, string>;
  customers!: Table<Customer, string>;
  pendingSales!: Table<PendingSale, number>;

  constructor() {
    super('pwa-varejo-db');
    this.version(1).stores({
      products: 'id, name, categoryId, barcode',
      categories: 'id, name',
      customers: 'id, name, cpf',
      pendingSales: '++localId, offlineId, status, createdAt',
    });
  }
}

export const db = new AppDB();
