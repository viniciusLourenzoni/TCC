import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Customer } from '@core/domain/entities';
import type { ICustomerRepository } from '@core/repositories/customer.repository.interface';
import { CUSTOMER_REPOSITORY } from '@core/repositories/customer.repository.interface';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly repo: ICustomerRepository,
  ) {}

  list(search?: string): Promise<Customer[]> {
    return search ? this.repo.search(search) : this.repo.findAll();
  }

  async findOne(id: string): Promise<Customer> {
    const c = await this.repo.findById(id);
    if (!c) throw new NotFoundException('Cliente não encontrado');
    return c;
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    if (dto.cpf) {
      const exists = await this.repo.findByCpf(dto.cpf);
      if (exists) throw new ConflictException('CPF já cadastrado');
    }
    return this.repo.create(new Customer(dto));
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    await this.findOne(id);
    if (dto.cpf) {
      const existing = await this.repo.findByCpf(dto.cpf);
      if (existing && existing.id !== id) {
        throw new ConflictException('CPF já cadastrado');
      }
    }
    return this.repo.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
