import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types/api';

export interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number; // centavos
  quantity: number;
}

interface CartState {
  items: CartItem[];
  discount: number; // centavos
  customerId: string | null;
  notes: string;
  addProduct: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDiscount: (cents: number) => void;
  setCustomer: (id: string | null) => void;
  setNotes: (notes: string) => void;
  clear: () => void;
  subtotalCents: () => number;
  totalCents: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discount: 0,
      customerId: null,
      notes: '',
      addProduct: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                productName: product.name,
                unitPrice: product.price,
                quantity,
              },
            ],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i,
                ),
        })),
      setDiscount: (cents) => set({ discount: Math.max(0, cents) }),
      setCustomer: (id) => set({ customerId: id }),
      setNotes: (notes) => set({ notes }),
      clear: () =>
        set({ items: [], discount: 0, customerId: null, notes: '' }),
      subtotalCents: () =>
        get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      totalCents: () => Math.max(0, get().subtotalCents() - get().discount),
    }),
    {
      name: 'pwa-cart',
    },
  ),
);
