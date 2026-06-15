import { UserRole } from '@core/domain/enums';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
}
