import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UnsubscribeDto {
  @ApiProperty({ description: 'Endpoint do PushSubscription a remover' })
  @IsString()
  @IsNotEmpty()
  endpoint: string;
}
