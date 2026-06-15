export class Product {
  id: string;
  name: string;
  description?: string;
  price: number; // venda, em centavos
  costPrice?: number; // custo, em centavos
  categoryId?: string;
  barcode?: string;
  imageUrl?: string; // foto em data URL (base64)
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Product>) {
    Object.assign(this, partial);
    this.isActive = partial.isActive ?? true;
  }

  // Business logic methods
  isAvailable(quantity: number = 1): boolean {
    return this.isActive && this.stock >= quantity;
  }

  updateStock(quantity: number): void {
    this.stock += quantity;
  }

  decreaseStock(quantity: number): void {
    if (!this.isAvailable(quantity)) {
      throw new Error('Insufficient stock');
    }
    this.stock -= quantity;
  }

  increaseStock(quantity: number): void {
    this.stock += quantity;
  }

  getPriceInReais(): number {
    return this.price / 100;
  }

  getCostPriceInReais(): number | undefined {
    return this.costPrice == null ? undefined : this.costPrice / 100;
  }
}
