import { Product } from '../domain/entities';

export interface FindProductsOptions {
  search?: string;
  categoryId?: string;
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByBarcode(barcode: string): Promise<Product | null>;
  findAll(options?: FindProductsOptions): Promise<Product[]>;
  count(options?: FindProductsOptions): Promise<number>;
  search(query: string): Promise<Product[]>;
  create(product: Product): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>; // soft delete
  updateStock(id: string, quantity: number): Promise<void>;
}

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
