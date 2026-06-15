import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SalesService } from '@application/sales/sales.service';
import { CreateSaleDto } from '@application/sales/dto/create-sale.dto';
import { QuerySalesDto } from '@application/sales/dto/query-sales.dto';
import { SyncSalesDto } from '@application/sales/dto/sync-sales.dto';
import type { AuthUser } from '../auth/current-user.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('sales')
@ApiBearerAuth()
@Controller('sales')
export class SalesController {
  constructor(private readonly svc: SalesService) {}

  @Get()
  list(@Query() query: QuerySalesDto) {
    return this.svc.list(query);
  }

  @Get('stats/dashboard')
  dashboard() {
    return this.svc.dashboard();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateSaleDto) {
    return this.svc.create(user.id, dto);
  }

  @Post('sync')
  @HttpCode(200)
  sync(@CurrentUser() user: AuthUser, @Body() dto: SyncSalesDto) {
    return this.svc.sync(user.id, dto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.cancel(id);
  }
}
