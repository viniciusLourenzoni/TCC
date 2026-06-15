import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from '@application/notifications/notifications.service';
import { PushService } from '@application/notifications/push.service';
import { NotificationEntity } from '@infrastructure/database/typeorm/entities/notification.typeorm.entity';
import { PushSubscriptionEntity } from '@infrastructure/database/typeorm/entities/push-subscription.typeorm.entity';
import { NotificationTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/notification-typeorm.repository';
import { PushSubscriptionTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/push-subscription-typeorm.repository';
import { NOTIFICATION_REPOSITORY } from '@core/repositories/notification.repository.interface';
import { PUSH_SUBSCRIPTION_REPOSITORY } from '@core/repositories/push-subscription.repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity, PushSubscriptionEntity]),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    PushService,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationTypeOrmRepository,
    },
    {
      provide: PUSH_SUBSCRIPTION_REPOSITORY,
      useClass: PushSubscriptionTypeOrmRepository,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
