import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNetworkStatus } from './useNetworkStatus';
import { listProducts } from '@/lib/api/products';
import { listCategories } from '@/lib/api/categories';
import { listCustomers } from '@/lib/api/customers';
import { productsRepo } from '@/lib/db/productsRepo';
import { categoriesRepo } from '@/lib/db/categoriesRepo';
import { customersRepo } from '@/lib/db/customersRepo';

// Popula o IndexedDB com produtos/categorias/clientes para o app poder funcionar offline.
// Roda silenciosamente em background.
export function useHydrateOfflineCache() {
  const token = useAuthStore((s) => s.token);
  const online = useNetworkStatus();
  const lastHydratedAt = useRef<number>(0);

  useEffect(() => {
    if (!token || !online) return;
    // Throttle: 1x a cada 5 min
    const now = Date.now();
    if (now - lastHydratedAt.current < 5 * 60 * 1000) return;
    lastHydratedAt.current = now;

    Promise.allSettled([
      listProducts({ limit: 500 }).then((list) => productsRepo.putAll(list)),
      listCategories().then((list) => categoriesRepo.putAll(list)),
      listCustomers().then((list) => customersRepo.putAll(list)),
    ]).catch(() => null);
  }, [token, online]);
}
