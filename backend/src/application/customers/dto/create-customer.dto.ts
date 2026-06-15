import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty()
  @IsString()
  @Length(1, 120)
  name: string;

  @ApiPropertyOptional({
    description: 'CPF (apenas dígitos ou no formato 000.000.000-00)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/, {
    message: 'CPF inválido',
  })
  cpf?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}
