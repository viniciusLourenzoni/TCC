import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IPushSubscriptionRepository,
  PushSubscriptionData,
} from '@core/repositories/push-subscription.repository.interface';
import { PushSubscriptionEntity } from '../entities/push-subscription.typeorm.entity';

@Injectable()
export class PushSubscriptionTypeOrmRepository
  implements IPushSubscriptionRepository
{
  constructor(
    @InjectRepository(PushSubscriptionEntity)
    private readonly repo: Repository<PushSubscriptionEntity>,
  ) {}

  async upsert(userId: string, sub: PushSubscriptionData): Promise<void> {
    const existing = await this.repo.findOne({
      where: { endpoint: sub.endpoint },
    });
    if (existing) {
      await this.repo.update(
        { id: existing.id },
        { userId, p256dh: sub.p256dh, auth: sub.auth },
      );
      return;
    }
    await this.repo.save(
      this.repo.create({
        userId,
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
      }),
    );
  }

  async findByUser(userId: string): Promise<PushSubscriptionData[]> {
    const list = await this.repo.find({ where: { userId } });
    return list.map((e) => ({
      endpoint: e.endpoint,
      p256dh: e.p256dh,
      auth: e.auth,
    }));
  }

  async deleteByEndpoint(endpoint: string): Promise<void> {
    await this.repo.delete({ endpoint });
  }
}
