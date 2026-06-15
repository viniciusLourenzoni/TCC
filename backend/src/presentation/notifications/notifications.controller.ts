import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from '@application/notifications/notifications.service';
import { SubscribeDto } from '@application/notifications/dto/subscribe.dto';
import { UnsubscribeDto } from '@application/notifications/dto/unsubscribe.dto';
import { QueryNotificationsDto } from '@application/notifications/dto/query-notifications.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { Public } from '../auth/public.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get('vapid-public-key')
  @Public()
  vapidPublicKey() {
    return { publicKey: this.svc.getVapidPublicKey() };
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: QueryNotificationsDto) {
    return this.svc.list(user.id, query.unreadOnly === 'true');
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: AuthUser) {
    return { count: await this.svc.unreadCount(user.id) };
  }

  @Patch(':id/read')
  @HttpCode(204)
  markRead(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.svc.markRead(id, user.id);
  }

  @Post('read-all')
  @HttpCode(204)
  markAllRead(@CurrentUser() user: AuthUser) {
    return this.svc.markAllRead(user.id);
  }

  @Post('subscribe')
  @HttpCode(204)
  subscribe(@CurrentUser() user: AuthUser, @Body() dto: SubscribeDto) {
    return this.svc.subscribe(user.id, dto);
  }

  @Delete('subscribe')
  @HttpCode(204)
  unsubscribe(@Body() dto: UnsubscribeDto) {
    return this.svc.unsubscribe(dto.endpoint);
  }

  @Post('connection')
  @HttpCode(204)
  async connection(@CurrentUser() user: AuthUser) {
    await this.svc.notify(user.id, {
      type: 'CONNECTION',
      title: 'Conexão restaurada',
      body: 'Você está online novamente. As vendas pendentes serão sincronizadas.',
    });
  }
}
