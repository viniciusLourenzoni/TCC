export type NotificationType = 'STOCK_LOW' | 'FIADO' | 'SYNC' | 'CONNECTION';

export class Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;

  constructor(partial: Partial<Notification>) {
    Object.assign(this, partial);
    this.isRead = partial.isRead ?? false;
  }
}
