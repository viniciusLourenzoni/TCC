import { UserRole } from '../enums';

export class User {
  id: string;
  email: string;
  password: string; // Hashed
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  // Business logic methods
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isOperator(): boolean {
    return this.role === UserRole.OPERATOR;
  }
}
