import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { useNetworkStatus } from '@/lib/sync/useNetworkStatus';
import { flushPendingSales } from '@/lib/sync/syncManager';
import { postConnectionEvent } from '@/lib/api/notifications';
import { showLocalNotification } from '@/lib/push/pushManager';
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
  const prevOnline = useRef<boolean | null>(null);

  useEffect(() => {
    const wasOnline = prevOnline.current;
    prevOnline.current = online;

    // Primeira montagem: não notifica, apenas sincroniza se já online
    if (wasOnline === null) {
      if (online) {
        flushPendingSales()
          .then(() => queryClient.invalidateQueries())
          .catch(() => null);
      }
      return;
    }

    if (online && !wasOnline) {
      toast.success('Conexão restaurada');
      showLocalNotification(
        'Conexão restaurada',
        'Você está online novamente. Sincronizando vendas…',
      );
      postConnectionEvent()
        .then(() =>
          queryClient.invalidateQueries({ queryKey: ['notifications'] }),
        )
        .catch(() => null);
      flushPendingSales()
        .then(() => queryClient.invalidateQueries())
        .catch(() => null);
    } else if (!online && wasOnline) {
      toast.warning('Você está offline');
      showLocalNotification(
        'Sem conexão',
        'As vendas serão salvas e sincronizadas quando a internet voltar.',
      );
    }
  }, [online, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
