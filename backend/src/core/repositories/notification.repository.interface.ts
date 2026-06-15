import { Notification } from '../domain/entities';

export interface FindNotificationsOptions {
  userId: string;
  unreadOnly?: boolean;
  limit?: number;
}

export interface INotificationRepository {
  create(notification: Notification): Promise<Notification>;
  findByUser(options: FindNotificationsOptions): Promise<Notification[]>;
  countUnread(userId: string): Promise<number>;
  markRead(id: string, userId: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
}

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');
