import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Sale, SaleItem } from '@core/domain/entities';
import type { ISaleRepository } from '@core/repositories/sale.repository.interface';
import { SALE_REPOSITORY } from '@core/repositories/sale.repository.interface';
import type { IProductRepository } from '@core/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '@core/repositories/product.repository.interface';
import type { ICustomerRepository } from '@core/repositories/customer.repository.interface';
import { CUSTOMER_REPOSITORY } from '@core/repositories/customer.repository.interface';
import { CreateSaleDto } from './dto/create-sale.dto';
import { QuerySalesDto } from './dto/query-sales.dto';
import { SyncResultDto, SyncSalesDto } from './dto/sync-sales.dto';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { SaleTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/sale-typeorm.repository';

@Injectable()
export class SalesService {
  constructor(
    @Inject(SALE_REPOSITORY)
    private readonly sales: ISaleRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: IProductRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: ICustomerRepository,
  ) {}

  list(query: QuerySalesDto): Promise<Sale[]> {
    return this.sales.findAll({
      status: query.status,
      customerId: query.customerId,
      startDate: query.from ? new Date(query.from) : undefined,
      endDate: query.to ? new Date(query.to) : undefined,
      limit: query.limit ?? 50,
      offset: query.offset ?? 0,
    });
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.sales.findById(id);
    if (!sale) throw new NotFoundException('Venda não encontrada');
    return sale;
  }

  async create(userId: string, dto: CreateSaleDto): Promise<Sale> {
    if (dto.offlineId) {
      const existing = await this.sales.findByOfflineId(dto.offlineId);
      if (existing) return existing; // idempotente
    }

    if (dto.customerId) {
      const customer = await this.customers.findById(dto.customerId);
      if (!customer) throw new NotFoundException('Cliente não encontrado');
    }

    if (!dto.items?.length) {
      throw new BadRequestException('A venda precisa de ao menos um item');
    }

    const items = dto.items.map(
      (i) =>
        new SaleItem({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        }),
    );

    const sale = new Sale({
      userId,
      customerId: dto.customerId,
      items,
      discount: dto.discount ?? 0,
      offlineId: dto.offlineId,
      syncedAt: dto.offlineId ? new Date() : undefined,
    });
    sale.calculateTotals();
    sale.finalize(dto.paymentMethod);

    const created = await this.sales.create(sale);

    // Baixa de estoque (best-effort)
    for (const item of items) {
      await this.products
        .updateStock(item.productId, -item.quantity)
        .catch(() => null);
    }

    return created;
  }

  async sync(userId: string, dto: SyncSalesDto): Promise<SyncResultDto[]> {
    const results: SyncResultDto[] = [];
    for (const saleDto of dto.sales) {
      if (!saleDto.offlineId) {
        results.push({
          offlineId: '',
          id: '',
          status: 'FAILED',
          error: 'offlineId obrigatório',
        });
        continue;
      }
      try {
        const existing = await this.sales.findByOfflineId(saleDto.offlineId);
        if (existing) {
          results.push({
            offlineId: saleDto.offlineId,
            id: existing.id,
            status: 'ALREADY_SYNCED',
          });
          continue;
        }
        const created = await this.create(userId, saleDto);
        results.push({
          offlineId: saleDto.offlineId,
          id: created.id,
          status: 'CREATED',
        });
      } catch (err: unknown) {
        results.push({
          offlineId: saleDto.offlineId ?? '',
          id: '',
          status: 'FAILED',
          error: err instanceof Error ? err.message : 'unknown',
        });
      }
    }
    return results;
  }

  async dashboard(): Promise<DashboardStatsDto> {
    const repo = this.sales as SaleTypeOrmRepository;
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const today = await repo.sumTotalsFrom(startOfToday);
    const month = await repo.sumTotalsFrom(startOfMonth);
    return { today, month };
  }

  async cancel(id: string): Promise<Sale> {
    const sale = await this.findOne(id);
    sale.cancel();
    return this.sales.update(id, {
      status: sale.status,
      updatedAt: sale.updatedAt,
    });
  }
}
