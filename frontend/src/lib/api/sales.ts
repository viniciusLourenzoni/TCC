import { api } from './client';
import type {
  CreateSaleRequest,
  DashboardStats,
  Sale,
  SyncResult,
} from '@/types/api';

export async function createSale(payload: CreateSaleRequest): Promise<Sale> {
  const { data } = await api.post<Sale>('/sales', payload);
  return data;
}

export async function listSales(params: {
  from?: string;
  to?: string;
  limit?: number;
} = {}): Promise<Sale[]> {
  const { data } = await api.get<Sale[]>('/sales', { params });
  return data;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/sales/stats/dashboard');
  return data;
}

export async function syncSales(sales: CreateSaleRequest[]): Promise<SyncResult[]> {
  const { data } = await api.post<SyncResult[]>('/sales/sync', { sales });
  return data;
}
