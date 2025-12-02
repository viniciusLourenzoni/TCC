import { Product } from '../domain/entities';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByBarcode(barcode: string): Promise<Product | null>;
  findAll(activeOnly?: boolean): Promise<Product[]>;
  search(query: string): Promise<Product[]>;
  create(product: Product): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>; // soft delete
  updateStock(id: string, quantity: number): Promise<void>;
}

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
