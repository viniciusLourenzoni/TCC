import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@core/domain/enums';

export class AuthUserDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty({ enum: UserRole })
  role: UserRole;
}

export class AuthResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}
