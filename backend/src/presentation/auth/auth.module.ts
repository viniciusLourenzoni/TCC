import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from '@application/auth/auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserEntity } from '@infrastructure/database/typeorm/entities/user.typeorm.entity';
import { UserTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/user.typeorm.repository';
import { USER_REPOSITORY } from '@core/repositories/user.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [AuthService, USER_REPOSITORY],
})
export class AuthModule {}
