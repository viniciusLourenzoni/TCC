import { Inject, Injectable } from '@nestjs/common';
import { Notification, NotificationType } from '@core/domain/entities';
import { NOTIFICATION_REPOSITORY } from '@core/repositories/notification.repository.interface';
import type { INotificationRepository } from '@core/repositories/notification.repository.interface';
import { PUSH_SUBSCRIPTION_REPOSITORY } from '@core/repositories/push-subscription.repository.interface';
import type { IPushSubscriptionRepository } from '@core/repositories/push-subscription.repository.interface';
import { PushService } from './push.service';
import { SubscribeDto } from './dto/subscribe.dto';

export interface NotifyInput {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  url?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repo: INotificationRepository,
    @Inject(PUSH_SUBSCRIPTION_REPOSITORY)
    private readonly subs: IPushSubscriptionRepository,
    private readonly push: PushService,
  ) {}

  /** Persiste a notificação e dispara o Web Push (best-effort). */
  async notify(userId: string, input: NotifyInput): Promise<Notification> {
    const created = await this.repo.create(
      new Notification({
        userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data,
      }),
    );
    await this.push
      .sendToUser(userId, {
        title: input.title,
        body: input.body,
        url: input.url ?? '/notificacoes',
      })
      .catch(() => null);
    return created;
  }

  list(userId: string, unreadOnly = false): Promise<Notification[]> {
    return this.repo.findByUser({ userId, unreadOnly, limit: 50 });
  }

  unreadCount(userId: string): Promise<number> {
    return this.repo.countUnread(userId);
  }

  markRead(id: string, userId: string): Promise<void> {
    return this.repo.markRead(id, userId);
  }

  markAllRead(userId: string): Promise<void> {
    return this.repo.markAllRead(userId);
  }

  subscribe(userId: string, dto: SubscribeDto): Promise<void> {
    return this.subs.upsert(userId, {
      endpoint: dto.endpoint,
      p256dh: dto.keys.p256dh,
      auth: dto.keys.auth,
    });
  }

  unsubscribe(endpoint: string): Promise<void> {
    return this.subs.deleteByEndpoint(endpoint);
  }

  getVapidPublicKey(): string | null {
    return this.push.getPublicKey();
  }
}
