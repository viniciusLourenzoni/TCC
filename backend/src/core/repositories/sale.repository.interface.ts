import { Sale } from '../domain/entities';
import { SaleStatus } from '../domain/enums';

export interface FindSalesOptions {
  userId?: string;
  customerId?: string;
  status?: SaleStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface ISaleRepository {
  findById(id: string): Promise<Sale | null>;
  findByOfflineId(offlineId: string): Promise<Sale | null>;
  findAll(options?: FindSalesOptions): Promise<Sale[]>;
  findPendingSync(): Promise<Sale[]>;
  create(sale: Sale): Promise<Sale>;
  update(id: string, sale: Partial<Sale>): Promise<Sale>;
  delete(id: string): Promise<void>;
  count(options?: FindSalesOptions): Promise<number>;
}

export const SALE_REPOSITORY = Symbol('SALE_REPOSITORY');
