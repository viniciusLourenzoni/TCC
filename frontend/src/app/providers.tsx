import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { useNetworkStatus } from '@/lib/sync/useNetworkStatus';
import { flushPendingSales } from '@/lib/sync/syncManager';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: { retry: 0 },
        },
      }),
  );

  const online = useNetworkStatus();

  useEffect(() => {
    if (online) {
      flushPendingSales()
        .then(() => queryClient.invalidateQueries())
        .catch(() => null);
    }
  }, [online, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
