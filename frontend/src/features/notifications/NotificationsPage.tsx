import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Package,
  Receipt,
  RefreshCw,
  Wifi,
  CheckCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import {
  listNotifications,
  markAllNotificationsRead,
} from '@/lib/api/notifications';
import { formatDateTimeBR } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { NotificationType } from '@/types/api';

const META: Record<NotificationType, { icon: LucideIcon; color: string }> = {
  STOCK_LOW: { icon: Package, color: 'text-payment-fiado' },
  FIADO: { icon: Receipt, color: 'text-payment-fiado' },
  SYNC: { icon: RefreshCw, color: 'text-accent' },
  CONNECTION: { icon: Wifi, color: 'text-primary' },
};

export function NotificationsPage() {
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: listNotifications,
  });

  const markAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      qc.invalidateQueries({ queryKey: ['notifications', 'list'] });
    },
  });

  // Ao abrir a central, marca tudo como lido (zera o badge)
  useEffect(() => {
    markAll.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <TopBar
        title="Notificações"
        back
        right={
          data.length > 0 ? (
            <button
              type="button"
              aria-label="Marcar todas como lidas"
              onClick={() => markAll.mutate()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
            >
              <CheckCheck className="h-5 w-5" />
            </button>
          ) : undefined
        }
      />

      <div className="px-4 py-4 flex flex-col gap-2">
        {isLoading && (
          <div className="card flex items-center justify-center h-24 text-sm text-muted-foreground">
            Carregando…
          </div>
        )}

        {!isLoading && data.length === 0 && (
          <div className="card flex flex-col items-center gap-1 py-10 text-center">
            <Bell className="h-7 w-7 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhuma notificação por aqui
            </p>
          </div>
        )}

        {data.map((n) => {
          const meta = META[n.type] ?? { icon: Bell, color: 'text-primary' };
          const Icon = meta.icon;
          return (
            <div
              key={n.id}
              className={cn(
                'card flex items-start gap-3',
                !n.isRead && 'border-l-4 border-l-primary',
              )}
            >
              <div
                className={cn(
                  'mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted',
                  meta.color,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.body}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatDateTimeBR(n.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
