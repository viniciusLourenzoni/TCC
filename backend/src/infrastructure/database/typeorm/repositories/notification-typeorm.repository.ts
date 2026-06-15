import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '@core/domain/entities';
import {
  FindNotificationsOptions,
  INotificationRepository,
} from '@core/repositories/notification.repository.interface';
import { NotificationEntity } from '../entities/notification.typeorm.entity';

@Injectable()
export class NotificationTypeOrmRepository implements INotificationRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
  ) {}

  async create(notification: Notification): Promise<Notification> {
    const entity = this.repo.create({
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data ?? null,
      isRead: notification.isRead ?? false,
    });
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async findByUser(options: FindNotificationsOptions): Promise<Notification[]> {
    const where: { userId: string; isRead?: boolean } = {
      userId: options.userId,
    };
    if (options.unreadOnly) where.isRead = false;
    const list = await this.repo.find({
      where,
      order: { createdAt: 'DESC' },
      take: options.limit ?? 50,
    });
    return list.map((e) => this.toDomain(e));
  }

  countUnread(userId: string): Promise<number> {
    return this.repo.count({ where: { userId, isRead: false } });
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.repo.update({ id, userId }, { isRead: true });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
  }

  private toDomain(e: NotificationEntity): Notification {
    return new Notification({
      id: e.id,
      userId: e.userId,
      type: e.type as NotificationType,
      title: e.title,
      body: e.body,
      data: e.data ?? undefined,
      isRead: e.isRead,
      createdAt: e.createdAt,
    });
  }
}
