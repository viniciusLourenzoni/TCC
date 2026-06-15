import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from '@application/products/products.service';
import { ProductEntity } from '@infrastructure/database/typeorm/entities/product.typeorm.entity';
import { ProductTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/product-typeorm.repository';
import { PRODUCT_REPOSITORY } from '@core/repositories/product.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    { provide: PRODUCT_REPOSITORY, useClass: ProductTypeOrmRepository },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}
