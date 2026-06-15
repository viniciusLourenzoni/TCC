import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './presentation/auth/auth.module';
import { UsersModule } from './presentation/users/users.module';
import { ProductsModule } from './presentation/products/products.module';
import { CustomersModule } from './presentation/customers/customers.module';
import { CategoriesModule } from './presentation/categories/categories.module';
import { SalesModule } from './presentation/sales/sales.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'pwa_varejo'),
        entities: [
          join(
            __dirname,
            'infrastructure/database/typeorm/entities/**/*.typeorm.entity{.ts,.js}',
          ),
        ],
        migrations: [
          join(
            __dirname,
            'infrastructure/database/typeorm/migrations/**/*{.ts,.js}',
          ),
        ],
        synchronize: false,
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),

    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev-secret'),
        // expiresIn aceita number ou string formato ms (ex: '24h'); cast por causa do template literal type
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRATION', '24h') as unknown as number,
        },
      }),
    }),

    AuthModule,
    UsersModule,
    ProductsModule,
    CustomersModule,
    CategoriesModule,
    SalesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
