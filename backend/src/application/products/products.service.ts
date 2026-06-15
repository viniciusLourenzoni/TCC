import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product } from '@core/domain/entities';
import type { IProductRepository } from '@core/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '@core/repositories/product.repository.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repo: IProductRepository,
  ) {}

  list(query: QueryProductsDto): Promise<Product[]> {
    return this.repo.findAll({
      search: query.search,
      categoryId: query.categoryId,
      activeOnly: query.includeInactive !== 'true',
      limit: query.limit ?? 100,
      offset: query.offset ?? 0,
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.repo.findById(id);
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    if (dto.barcode) {
      const exists = await this.repo.findByBarcode(dto.barcode);
      if (exists) throw new ConflictException('Código de barras já cadastrado');
    }
    return this.repo.create(new Product(dto));
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    await this.findOne(id);
    if (dto.barcode) {
      const existing = await this.repo.findByBarcode(dto.barcode);
      if (existing && existing.id !== id) {
        throw new ConflictException('Código de barras já cadastrado');
      }
    }
    return this.repo.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
