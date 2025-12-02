import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  UserEntity,
  ProductEntity,
  CustomerEntity,
  SaleEntity,
  SaleItemEntity,
} from './typeorm/entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'pwa_varejo'),
        entities: [UserEntity, ProductEntity, CustomerEntity, SaleEntity, SaleItemEntity],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      ProductEntity,
      CustomerEntity,
      SaleEntity,
      SaleItemEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
