import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Sale, SaleItem } from '@core/domain/entities';
import {
  FindSalesOptions,
  ISaleRepository,
} from '@core/repositories/sale.repository.interface';
import { SaleEntity } from '../entities/sale.typeorm.entity';
import { SaleItemEntity } from '../entities/sale-item.typeorm.entity';

@Injectable()
export class SaleTypeOrmRepository implements ISaleRepository {
  constructor(
    @InjectRepository(SaleEntity)
    private readonly repo: Repository<SaleEntity>,
    @InjectRepository(SaleItemEntity)
    private readonly itemsRepo: Repository<SaleItemEntity>,
  ) {}

  async findById(id: string): Promise<Sale | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['items'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByOfflineId(offlineId: string): Promise<Sale | null> {
    const entity = await this.repo.findOne({
      where: { offlineId },
      relations: ['items'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(options: FindSalesOptions = {}): Promise<Sale[]> {
    const qb = this.buildQuery(options);
    qb.leftJoinAndSelect('sale.items', 'items');
    qb.orderBy('sale.created_at', 'DESC');
    if (options.limit !== undefined) qb.take(options.limit);
    if (options.offset !== undefined) qb.skip(options.offset);
    const list = await qb.getMany();
    return list.map((e) => this.toDomain(e));
  }

  async findPendingSync(): Promise<Sale[]> {
    const list = await this.repo.find({
      where: { syncedAt: IsNull(), offlineId: Not(IsNull()) },
      relations: ['items'],
    });
    return list.map((e) => this.toDomain(e));
  }

  async count(options: FindSalesOptions = {}): Promise<number> {
    return this.buildQuery(options).getCount();
  }

  async create(sale: Sale): Promise<Sale> {
    const entity = this.repo.create(this.toEntity(sale));
    entity.items = sale.items.map((i) => {
      const item = new SaleItemEntity();
      item.productId = i.productId;
      item.productName = i.productName;
      item.quantity = i.quantity;
      item.unitPrice = i.unitPrice;
      item.subtotal = i.subtotal;
      return item;
    });
    const saved = await this.repo.save(entity);
    const reloaded = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['items'],
    });
    return this.toDomain(reloaded ?? saved);
  }

  async update(id: string, partial: Partial<Sale>): Promise<Sale> {
    const data = this.toEntity(partial);
    if (Object.keys(data).length > 0) {
      await this.repo.update(id, data);
    }
    const updated = await this.repo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!updated) throw new Error('Sale not found after update');
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  // Helpers extras úteis para o dashboard.
  // `start` é inclusivo; sem upper bound (consideramos até "agora").
  async sumTotalsFrom(
    start: Date,
  ): Promise<{ totalCents: number; count: number }> {
    const { totalCents, count } = (await this.repo
      .createQueryBuilder('sale')
      .select('COALESCE(SUM(sale.total),0)', 'totalCents')
      .addSelect('COUNT(sale.id)', 'count')
      .where('sale.status = :status', { status: 'COMPLETED' })
      .andWhere('sale.created_at >= :start', { start })
      .getRawOne<{ totalCents: string; count: string }>()) ?? {
      totalCents: '0',
      count: '0',
    };
    return {
      totalCents: Number(totalCents) || 0,
      count: Number(count) || 0,
    };
  }

  private buildQuery(options: FindSalesOptions) {
    const qb = this.repo.createQueryBuilder('sale');
    if (options.userId) qb.andWhere('sale.user_id = :userId', options);
    if (options.customerId)
      qb.andWhere('sale.customer_id = :customerId', options);
    if (options.status)
      qb.andWhere('sale.status = :status', { status: options.status });
    if (options.startDate && options.endDate) {
      qb.andWhere('sale.created_at BETWEEN :startDate AND :endDate', {
        startDate: options.startDate,
        endDate: options.endDate,
      });
    } else if (options.startDate) {
      qb.andWhere('sale.created_at >= :startDate', {
        startDate: options.startDate,
      });
    }
    return qb;
  }

  private toDomain(e: SaleEntity): Sale {
    const items = (e.items ?? []).map(
      (i) =>
        new SaleItem({
          id: i.id,
          saleId: i.saleId,
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          subtotal: i.subtotal,
        }),
    );
    return new Sale({
      id: e.id,
      userId: e.userId,
      customerId: e.customerId ?? undefined,
      items,
      subtotal: e.subtotal,
      discount: e.discount,
      total: e.total,
      paymentMethod: e.paymentMethod ?? undefined,
      status: e.status,
      offlineId: e.offlineId ?? undefined,
      syncedAt: e.syncedAt ?? undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    });
  }

  private toEntity(s: Partial<Sale>): Partial<SaleEntity> {
    const out: Partial<SaleEntity> = {};
    if (s.id !== undefined) out.id = s.id;
    if (s.userId !== undefined) out.userId = s.userId;
    if (s.customerId !== undefined) out.customerId = s.customerId as string;
    if (s.subtotal !== undefined) out.subtotal = s.subtotal;
    if (s.discount !== undefined) out.discount = s.discount;
    if (s.total !== undefined) out.total = s.total;
    if (s.paymentMethod !== undefined) out.paymentMethod = s.paymentMethod;
    if (s.status !== undefined) out.status = s.status;
    if (s.offlineId !== undefined) out.offlineId = s.offlineId as string;
    if (s.syncedAt !== undefined) out.syncedAt = s.syncedAt as Date;
    return out;
  }
}
