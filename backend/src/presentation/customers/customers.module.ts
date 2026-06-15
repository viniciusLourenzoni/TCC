import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomersService } from '@application/customers/customers.service';
import { CustomerEntity } from '@infrastructure/database/typeorm/entities/customer.typeorm.entity';
import { CustomerTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/customer-typeorm.repository';
import { CUSTOMER_REPOSITORY } from '@core/repositories/customer.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity])],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    { provide: CUSTOMER_REPOSITORY, useClass: CustomerTypeOrmRepository },
  ],
  exports: [CUSTOMER_REPOSITORY],
})
export class CustomersModule {}
