import { IsInt, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaleItemDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Nome do produto no momento da venda' })
  @IsString()
  productName: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Preço unitário em centavos no momento da venda' })
  @IsInt()
  @Min(0)
  unitPrice: number;
}
