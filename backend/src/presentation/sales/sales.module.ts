import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from '@application/sales/sales.service';
import { SaleEntity } from '@infrastructure/database/typeorm/entities/sale.typeorm.entity';
import { SaleItemEntity } from '@infrastructure/database/typeorm/entities/sale-item.typeorm.entity';
import { SaleTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/sale-typeorm.repository';
import { SALE_REPOSITORY } from '@core/repositories/sale.repository.interface';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SaleEntity, SaleItemEntity]),
    ProductsModule,
    CustomersModule,
    NotificationsModule,
  ],
  controllers: [SalesController],
  providers: [
    SalesService,
    { provide: SALE_REPOSITORY, useClass: SaleTypeOrmRepository },
  ],
})
export class SalesModule {}
