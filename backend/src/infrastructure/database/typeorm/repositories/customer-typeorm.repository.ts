import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Customer } from '@core/domain/entities';
import { ICustomerRepository } from '@core/repositories/customer.repository.interface';
import { CustomerEntity } from '../entities/customer.typeorm.entity';

@Injectable()
export class CustomerTypeOrmRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly repo: Repository<CustomerEntity>,
  ) {}

  async findById(id: string): Promise<Customer | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCpf(cpf: string): Promise<Customer | null> {
    const entity = await this.repo.findOne({ where: { cpf } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Customer[]> {
    const list = await this.repo.find({ order: { name: 'ASC' } });
    return list.map((e) => this.toDomain(e));
  }

  async search(query: string): Promise<Customer[]> {
    const list = await this.repo.find({
      where: [
        { name: ILike(`%${query}%`) },
        { cpf: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
        { phone: ILike(`%${query}%`) },
      ],
      take: 50,
      order: { name: 'ASC' },
    });
    return list.map((e) => this.toDomain(e));
  }

  async create(customer: Customer): Promise<Customer> {
    const entity = this.repo.create(this.toEntity(customer));
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, partial: Partial<Customer>): Promise<Customer> {
    await this.repo.update(id, this.toEntity(partial));
    const updated = await this.repo.findOne({ where: { id } });
    if (!updated) throw new Error('Customer not found after update');
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(e: CustomerEntity): Customer {
    return new Customer({
      id: e.id,
      name: e.name,
      cpf: e.cpf ?? undefined,
      email: e.email ?? undefined,
      phone: e.phone ?? undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    });
  }

  private toEntity(c: Partial<Customer>): Partial<CustomerEntity> {
    const out: Partial<CustomerEntity> = {};
    if (c.id !== undefined) out.id = c.id;
    if (c.name !== undefined) out.name = c.name;
    if (c.cpf !== undefined) out.cpf = c.cpf as string;
    if (c.email !== undefined) out.email = c.email as string;
    if (c.phone !== undefined) out.phone = c.phone as string;
    return out;
  }
}
