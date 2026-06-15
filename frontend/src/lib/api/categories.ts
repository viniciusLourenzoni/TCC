import { api } from './client';
import type { Category } from '@/types/api';

export async function listCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories');
  return data;
}

export async function createCategory(payload: { name: string; color?: string }) {
  const { data } = await api.post<Category>('/categories', payload);
  return data;
}
