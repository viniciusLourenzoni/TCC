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
    const entity = this.userRepository.create(this.toEntity(user));
    const saved = await this.userRepository.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    await this.userRepository.update(id, this.toEntity(user));
    const updated = await this.userRepository.findOne({ where: { id } });
    if (!updated) throw new Error('User not found after update');
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  private toDomain(entity: UserEntity): User {
    return new User({
      id: entity.id,
      email: entity.email,
      password: entity.password,
      name: entity.name,
      role: entity.role,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toEntity(domain: Partial<User>): Partial<UserEntity> {
    const out: Partial<UserEntity> = {};
    if (domain.id !== undefined) out.id = domain.id;
    if (domain.email !== undefined) out.email = domain.email;
    if (domain.password !== undefined) out.password = domain.password;
    if (domain.name !== undefined) out.name = domain.name;
    if (domain.role !== undefined) out.role = domain.role;
    return out;
  }
}
