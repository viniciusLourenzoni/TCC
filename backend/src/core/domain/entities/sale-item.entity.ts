export class SaleItem {
  id: string;
  saleId: string;
  productId: string;
  productName: string; // Denormalized for historical purposes
  quantity: number;
  unitPrice: number; // in cents, price at the time of sale
  subtotal: number; // in cents

  constructor(partial: Partial<SaleItem>) {
    Object.assign(this, partial);
    if (this.quantity && this.unitPrice) {
      this.subtotal = this.calculateSubtotal();
    }
  }

  // Business logic methods
  calculateSubtotal(): number {
    return this.quantity * this.unitPrice;
  }

  updateQuantity(newQuantity: number): void {
    if (newQuantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    this.quantity = newQuantity;
    this.subtotal = this.calculateSubtotal();
  }

  getSubtotalInReais(): number {
    return this.subtotal / 100;
  }

  getUnitPriceInReais(): number {
    return this.unitPrice / 100;
  }
}
