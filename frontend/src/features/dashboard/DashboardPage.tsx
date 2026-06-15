import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  Package,
  ShoppingCart,
  UserPlus,
  TrendingUp,
  CircleCheck,
  CircleAlert,
} from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { useAuthStore } from '@/stores/authStore';
import { getDashboardStats, listSales } from '@/lib/api/sales';
import { formatCents, formatTimeBR } from '@/lib/format';
import { useNetworkStatus } from '@/lib/sync/useNetworkStatus';

const storeName = (import.meta.env.VITE_STORE_NAME as string) ?? 'Loja';

export function DashboardPage() {
  const online = useNetworkStatus();
  const logout = useAuthStore((s) => s.logout);

  const statsQ = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardStats,
  });

  const latestQ = useQuery({
    queryKey: ['sales', 'latest'],
    queryFn: () => listSales({ limit: 5 }),
  });

  return (
    <>
      <TopBar
        title={storeName}
        right={
          <div className="flex items-center gap-1">
            <span
              className={
                online
                  ? 'h-2.5 w-2.5 rounded-full bg-accent'
                  : 'h-2.5 w-2.5 rounded-full bg-payment-fiado'
              }
              aria-label={online ? 'online' : 'offline'}
            />
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
              aria-label="Sair"
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
            >
              <Bell className="h-5 w-5" />
            </button>
          </div>
        }
      />

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Hoje"
            valueCents={statsQ.data?.today.totalCents ?? 0}
            count={statsQ.data?.today.count ?? 0}
            loading={statsQ.isLoading}
          />
          <MetricCard
            label="Mês"
            valueCents={statsQ.data?.month.totalCents ?? 0}
            count={statsQ.data?.month.count ?? 0}
            loading={statsQ.isLoading}
          />
        </div>

        {/* Ações rápidas */}
        <div className="flex flex-col gap-2">
          <QuickAction
            to="/pdv"
            color="bg-accent text-accent-foreground"
            icon={<ShoppingCart className="h-5 w-5" />}
            label="Nova Venda"
          />
          <QuickAction
            to="/produtos/novo"
            color="bg-primary text-primary-foreground"
            icon={<Package className="h-5 w-5" />}
            label="Cadastrar Produto"
          />
          <QuickAction
            to="/clientes/novo"
            color="bg-payment-credit text-white"
            icon={<UserPlus className="h-5 w-5" />}
            label="Cadastrar Cliente"
          />
        </div>

        {/* Últimas vendas */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Últimas Vendas
            </h2>
            <Link to="/vendas" className="text-xs text-primary font-medium">
              ver todas
            </Link>
          </div>

          {latestQ.isLoading && (
            <div className="card flex items-center justify-center h-24 text-sm text-muted-foreground">
              Carregando…
            </div>
          )}

          {!latestQ.isLoading && (latestQ.data?.length ?? 0) === 0 && (
            <div className="card flex flex-col items-center gap-1 py-6 text-center">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhuma venda ainda hoje
              </p>
              <Link
                to="/pdv"
                className="text-xs font-medium text-primary mt-1"
              >
                Abrir PDV
              </Link>
            </div>
          )}

          {(latestQ.data ?? []).map((sale) => (
            <div
              key={sale.id}
              className="card flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {sale.status === 'COMPLETED' ? (
                  <CircleCheck className="h-5 w-5 text-accent" />
                ) : (
                  <CircleAlert className="h-5 w-5 text-payment-fiado" />
                )}
                <div>
                  <div className="text-sm font-semibold">
                    {formatCents(sale.total)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {sale.items.length} item(s) •{' '}
                    {formatTimeBR(sale.createdAt)}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                {sale.paymentMethod ?? '—'}
              </span>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

function MetricCard({
  label,
  valueCents,
  count,
  loading,
}: {
  label: string;
  valueCents: number;
  count: number;
  loading?: boolean;
}) {
  return (
    <div className="card">
      <p className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wide">
        {label}
      </p>
      <p className="text-xl font-bold mt-1">
        {loading ? '...' : formatCents(valueCents)}
      </p>
      <p className="text-[11px] text-muted-foreground mt-0.5">
        {loading ? '' : `${count} venda${count === 1 ? '' : 's'}`}
      </p>
    </div>
  );
}

function QuickAction({
  to,
  color,
  icon,
  label,
}: {
  to: string;
  color: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-xl px-4 h-14 font-semibold ${color} shadow-card active:scale-[0.99] transition-transform`}
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
        {icon}
      </span>
      {label}
    </Link>
  );
}
