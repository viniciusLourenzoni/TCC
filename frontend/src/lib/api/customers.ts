import { api } from './client';
import type { Customer } from '@/types/api';

export async function listCustomers(search?: string): Promise<Customer[]> {
  const { data } = await api.get<Customer[]>('/customers', {
    params: search ? { search } : undefined,
  });
  return data;
}

export async function getCustomer(id: string): Promise<Customer> {
  const { data } = await api.get<Customer>(`/customers/${id}`);
  return data;
}

export interface CreateCustomerPayload {
  name: string;
  cpf?: string;
  email?: string;
  phone?: string;
}

export async function createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
  const { data } = await api.post<Customer>('/customers', payload);
  return data;
}

export async function updateCustomer(
  id: string,
  payload: Partial<CreateCustomerPayload>,
): Promise<Customer> {
  const { data } = await api.patch<Customer>(`/customers/${id}`, payload);
  return data;
}
