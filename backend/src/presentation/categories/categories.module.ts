import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from '@application/categories/categories.service';
import { CategoryEntity } from '@infrastructure/database/typeorm/entities/category.typeorm.entity';
import { CategoryTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/category-typeorm.repository';
import { CATEGORY_REPOSITORY } from '@core/repositories/category.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    { provide: CATEGORY_REPOSITORY, useClass: CategoryTypeOrmRepository },
  ],
  exports: [CATEGORY_REPOSITORY],
})
export class CategoriesModule {}
