import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '@core/repositories';
import { User } from '@core/domain/entities';
import { UserEntity } from '../entities/user.typeorm.entity';

@Injectable()
export class UserTypeOrmRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.userRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.userRepository.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<User[]> {
    const entities = await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async create(user: User): Promise<User> {
    const entity = this.toEntity(user);
    const saved = await this.userRepository.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    await this.userRepository.update(id, this.toEntity(user as User));
    const updated = await this.userRepository.findOne({ where: { id } });
    if (!updated) {
      throw new Error('User not found');
    }
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  private toDomain(entity: UserEntity): User {
    return new User(
      entity.id,
      entity.email,
      entity.password,
      entity.name,
      entity.role,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  private toEntity(domain: User): Partial<UserEntity> {
    return {
      id: domain.id,
      email: domain.email,
      password: domain.password,
      name: domain.name,
      role: domain.role,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }
}
