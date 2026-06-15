// Tipos que espelham o contrato da API NestJS

export type UserRole = 'ADMIN' | 'OPERATOR';

export type PaymentMethod =
  | 'CASH'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'PIX'
  | 'FIADO';

export type SaleStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number; // centavos
  costPrice?: number; // centavos
  categoryId?: string;
  barcode?: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  cpf?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number; // centavos
  subtotal: number; // centavos
}

export interface Sale {
  id: string;
  userId: string;
  customerId?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod?: PaymentMethod;
  status: SaleStatus;
  offlineId?: string;
  syncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  today: { totalCents: number; count: number };
  month: { totalCents: number; count: number };
}

export interface CreateSaleRequest {
  customerId?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  discount?: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  offlineId?: string;
  createdAtLocal?: string;
}

export interface SyncResult {
  offlineId: string;
  id: string;
  status: 'CREATED' | 'ALREADY_SYNCED' | 'FAILED';
  error?: string;
}
