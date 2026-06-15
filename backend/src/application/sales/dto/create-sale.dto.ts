import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@core/domain/enums';
import { SaleItemDto } from './sale-item.dto';

export class CreateSaleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ type: [SaleItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiPropertyOptional({ default: 0, description: 'Desconto em centavos' })
  @IsOptional()
  @IsInt()
  @Min(0)
  discount?: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'UUID gerado no cliente para sincronização offline idempotente',
  })
  @IsOptional()
  @IsString()
  offlineId?: string;

  @ApiPropertyOptional({ description: 'Data ISO da criação local (offline)' })
  @IsOptional()
  @IsString()
  createdAtLocal?: string;
}
