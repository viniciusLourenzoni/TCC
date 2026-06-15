import { api } from './client';
import type { AppNotification } from '@/types/api';

export async function listNotifications(): Promise<AppNotification[]> {
  const { data } = await api.get<AppNotification[]>('/notifications');
  return data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get<{ count: number }>(
    '/notifications/unread-count',
  );
  return data.count;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post('/notifications/read-all');
}

export async function getVapidPublicKey(): Promise<string | null> {
  const { data } = await api.get<{ publicKey: string | null }>(
    '/notifications/vapid-public-key',
  );
  return data.publicKey;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function subscribePush(
  payload: PushSubscriptionPayload,
): Promise<void> {
  await api.post('/notifications/subscribe', payload);
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  await api.delete('/notifications/subscribe', { data: { endpoint } });
}

export async function postConnectionEvent(): Promise<void> {
  await api.post('/notifications/connection');
}
