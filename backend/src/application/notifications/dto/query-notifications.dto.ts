import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsOptional } from 'class-validator';

export class QueryNotificationsDto {
  @ApiPropertyOptional({ description: "'true' para retornar apenas não lidas" })
  @IsOptional()
  @IsBooleanString()
  unreadOnly?: string;
}
