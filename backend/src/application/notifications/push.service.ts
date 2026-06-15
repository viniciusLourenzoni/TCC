import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PUSH_SUBSCRIPTION_REPOSITORY } from '@core/repositories/push-subscription.repository.interface';
import type { IPushSubscriptionRepository } from '@core/repositories/push-subscription.repository.interface';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private enabled = false;

  constructor(
    private readonly config: ConfigService,
    @Inject(PUSH_SUBSCRIPTION_REPOSITORY)
    private readonly subs: IPushSubscriptionRepository,
  ) {
    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.config.get<string>(
      'VAPID_SUBJECT',
      'mailto:admin@example.com',
    );
    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.enabled = true;
    } else {
      this.logger.warn('VAPID keys ausentes — Web Push desativado');
    }
  }

  getPublicKey(): string | null {
    return this.config.get<string>('VAPID_PUBLIC_KEY') ?? null;
  }

  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    if (!this.enabled) return;
    const subs = await this.subs.findByUser(userId);
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            JSON.stringify(payload),
          );
        } catch (err) {
          const statusCode = (err as { statusCode?: number })?.statusCode;
          // 404/410 = inscrição expirada ou cancelada no navegador
          if (statusCode === 404 || statusCode === 410) {
            await this.subs.deleteByEndpoint(s.endpoint);
          } else {
            this.logger.error(
              `Falha ao enviar push: ${(err as Error)?.message ?? String(err)}`,
            );
          }
        }
      }),
    );
  }
}
