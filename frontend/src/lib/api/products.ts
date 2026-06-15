import { api } from './client';
import type { Product } from '@/types/api';

export interface ListProductsParams {
  search?: string;
  categoryId?: string;
  limit?: number;
  offset?: number;
}

export async function listProducts(params: ListProductsParams = {}): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/products', { params });
  return data;
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  categoryId?: string;
  barcode?: string;
  imageUrl?: string; // foto em data URL (base64)
  stock: number;
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const { data } = await api.post<Product>('/products', payload);
  return data;
}

export async function updateProduct(
  id: string,
  payload: Partial<CreateProductPayload>,
): Promise<Product> {
  const { data } = await api.patch<Product>(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}
