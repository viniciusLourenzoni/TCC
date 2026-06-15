import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category } from '@core/domain/entities';
import type { ICategoryRepository } from '@core/repositories/category.repository.interface';
import { CATEGORY_REPOSITORY } from '@core/repositories/category.repository.interface';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly repo: ICategoryRepository,
  ) {}

  findAll(): Promise<Category[]> {
    return this.repo.findAll();
  }

  async findOne(id: string): Promise<Category> {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException('Categoria não encontrada');
    return found;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const exists = await this.repo.findByName(dto.name);
    if (exists) throw new ConflictException('Categoria já existe');
    return this.repo.create(new Category({ name: dto.name, color: dto.color }));
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.findOne(id);
    return this.repo.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
