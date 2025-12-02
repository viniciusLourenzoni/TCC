import { Customer } from '../domain/entities';

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByCpf(cpf: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  search(query: string): Promise<Customer[]>;
  create(customer: Customer): Promise<Customer>;
  update(id: string, customer: Partial<Customer>): Promise<Customer>;
  delete(id: string): Promise<void>;
}

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');
