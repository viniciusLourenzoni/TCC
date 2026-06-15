import { IsHexColor, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Alimentos' })
  @IsString()
  @Length(1, 80)
  name: string;

  @ApiPropertyOptional({ example: '#1E3A8A' })
  @IsOptional()
  @IsHexColor()
  color?: string;
}
