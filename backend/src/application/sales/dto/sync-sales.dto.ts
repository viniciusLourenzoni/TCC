import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateSaleDto } from './create-sale.dto';

export class SyncSalesDto {
  @ApiProperty({ type: [CreateSaleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleDto)
  sales: CreateSaleDto[];
}

export class SyncResultDto {
  @ApiProperty()
  offlineId: string;

  @ApiProperty({ description: 'id real da venda no backend' })
  id: string;

  @ApiProperty({ enum: ['CREATED', 'ALREADY_SYNCED', 'FAILED'] })
  status: 'CREATED' | 'ALREADY_SYNCED' | 'FAILED';

  @ApiProperty({ required: false })
  error?: string;
}
