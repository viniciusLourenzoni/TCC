import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '@core/domain/entities';
import { ICategoryRepository } from '@core/repositories/category.repository.interface';
import { CategoryEntity } from '../entities/category.typeorm.entity';

@Injectable()
export class CategoryTypeOrmRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly repo: Repository<CategoryEntity>,
  ) {}

  async findById(id: string): Promise<Category | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<Category | null> {
    const entity = await this.repo.findOne({ where: { name } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Category[]> {
    const list = await this.repo.find({ order: { name: 'ASC' } });
    return list.map((e) => this.toDomain(e));
  }

  async create(category: Category): Promise<Category> {
    const entity = this.repo.create(this.toEntity(category));
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, partial: Partial<Category>): Promise<Category> {
    await this.repo.update(id, this.toEntity(partial));
    const updated = await this.repo.findOne({ where: { id } });
    if (!updated) throw new Error('Category not found after update');
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(e: CategoryEntity): Category {
    return new Category({
      id: e.id,
      name: e.name,
      color: e.color,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    });
  }

  private toEntity(c: Partial<Category>): Partial<CategoryEntity> {
    const out: Partial<CategoryEntity> = {};
    if (c.id !== undefined) out.id = c.id;
    if (c.name !== undefined) out.name = c.name;
    if (c.color !== undefined) out.color = c.color;
    return out;
  }
}
