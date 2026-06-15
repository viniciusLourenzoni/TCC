import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Product } from '@core/domain/entities';
import {
  FindProductsOptions,
  IProductRepository,
} from '@core/repositories/product.repository.interface';
import { ProductEntity } from '../entities/product.typeorm.entity';

@Injectable()
export class ProductTypeOrmRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repo: Repository<ProductEntity>,
  ) {}

  async findById(id: string): Promise<Product | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    const entity = await this.repo.findOne({ where: { barcode } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(options: FindProductsOptions = {}): Promise<Product[]> {
    const qb = this.buildQuery(options);
    if (options.limit !== undefined) qb.take(options.limit);
    if (options.offset !== undefined) qb.skip(options.offset);
    qb.orderBy('product.name', 'ASC');
    const list = await qb.getMany();
    return list.map((e) => this.toDomain(e));
  }

  async count(options: FindProductsOptions = {}): Promise<number> {
    return this.buildQuery(options).getCount();
  }

  async search(query: string): Promise<Product[]> {
    const list = await this.repo.find({
      where: [
        { name: ILike(`%${query}%`), isActive: true },
        { barcode: ILike(`%${query}%`), isActive: true },
      ],
      take: 50,
    });
    return list.map((e) => this.toDomain(e));
  }

  async create(product: Product): Promise<Product> {
    const entity = this.repo.create(this.toEntity(product));
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, partial: Partial<Product>): Promise<Product> {
    await this.repo.update(id, this.toEntity(partial));
    const updated = await this.repo.findOne({ where: { id } });
    if (!updated) throw new Error('Product not found after update');
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    // soft delete: marca como inativo
    await this.repo.update(id, { isActive: false });
  }

  async updateStock(id: string, quantity: number): Promise<void> {
    await this.repo.increment({ id }, 'stock', quantity);
  }

  private buildQuery(options: FindProductsOptions) {
    const qb = this.repo.createQueryBuilder('product');
    if (options.activeOnly !== false) {
      qb.andWhere('product.is_active = :active', { active: true });
    }
    if (options.search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.barcode ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }
    if (options.categoryId) {
      qb.andWhere('product.category_id = :categoryId', {
        categoryId: options.categoryId,
      });
    }
    return qb;
  }

  private toDomain(e: ProductEntity): Product {
    return new Product({
      id: e.id,
      name: e.name,
      description: e.description ?? undefined,
      price: e.price,
      costPrice: e.costPrice ?? undefined,
      categoryId: e.categoryId ?? undefined,
      barcode: e.barcode ?? undefined,
      stock: e.stock,
      isActive: e.isActive,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    });
  }

  private toEntity(p: Partial<Product>): Partial<ProductEntity> {
    const out: Partial<ProductEntity> = {};
    if (p.id !== undefined) out.id = p.id;
    if (p.name !== undefined) out.name = p.name;
    if (p.description !== undefined)
      out.description = p.description as string;
    if (p.price !== undefined) out.price = p.price;
    if (p.costPrice !== undefined) out.costPrice = p.costPrice as number;
    if (p.categoryId !== undefined) out.categoryId = p.categoryId as string;
    if (p.barcode !== undefined) out.barcode = p.barcode as string;
    if (p.stock !== undefined) out.stock = p.stock;
    if (p.isActive !== undefined) out.isActive = p.isActive;
    return out;
  }
}
