import { api } from './client';
import type { Category } from '@/types/api';

export async function listCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories');
  return data;
}

export interface CategoryPayload {
  name: string;
  color?: string;
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  const { data } = await api.post<Category>('/categories', payload);
  return data;
}

export async function updateCategory(
  id: string,
  payload: Partial<CategoryPayload>,
): Promise<Category> {
  const { data } = await api.patch<Category>(`/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}
