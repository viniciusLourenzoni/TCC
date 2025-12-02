export class Customer {
  id: string;
  name: string;
  cpf?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Customer>) {
    Object.assign(this, partial);
  }

  // Business logic methods
  hasDocument(): boolean {
    return !!this.cpf;
  }

  hasContact(): boolean {
    return !!this.email || !!this.phone;
  }
}
