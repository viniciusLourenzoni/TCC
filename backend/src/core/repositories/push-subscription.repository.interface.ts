export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface IPushSubscriptionRepository {
  upsert(userId: string, sub: PushSubscriptionData): Promise<void>;
  findByUser(userId: string): Promise<PushSubscriptionData[]>;
  deleteByEndpoint(endpoint: string): Promise<void>;
}

export const PUSH_SUBSCRIPTION_REPOSITORY = Symbol('PUSH_SUBSCRIPTION_REPOSITORY');
