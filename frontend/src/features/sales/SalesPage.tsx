import { useQuery } from '@tanstack/react-query';
import { Receipt, CircleCheck, CircleAlert } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { listSales } from '@/lib/api/sales';
import { formatCents, formatDateTimeBR } from '@/lib/format';

const labelByPayment: Record<string, string> = {
  CASH: 'Dinheiro',
  CREDIT_CARD: 'Crédito',
  DEBIT_CARD: 'Débito',
  PIX: 'PIX',
  FIADO: 'Fiado',
};

export function SalesPage() {
  const salesQ = useQuery({
    queryKey: ['sales', 'all'],
    queryFn: () => listSales({ limit: 100 }),
  });

  return (
    <>
      <TopBar title="Vendas" />
      <div className="px-4 py-3 flex flex-col gap-2">
        {salesQ.isLoading && (
          <div className="card text-center text-sm text-muted-foreground">
            Carregando…
          </div>
        )}
        {!salesQ.isLoading && (salesQ.data?.length ?? 0) === 0 && (
          <div className="card flex flex-col items-center gap-1 py-8">
            <Receipt className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhuma venda registrada
            </p>
          </div>
        )}
        {(salesQ.data ?? []).map((sale) => (
          <div key={sale.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              {sale.status === 'COMPLETED' ? (
                <CircleCheck className="h-5 w-5 text-accent" />
              ) : (
                <CircleAlert className="h-5 w-5 text-payment-fiado" />
              )}
              <div>
                <p className="text-sm font-bold">{formatCents(sale.total)}</p>
                <p className="text-[11px] text-muted-foreground">
                  {sale.items.length} item(s) · {formatDateTimeBR(sale.createdAt)}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold uppercase text-muted-foreground">
              {labelByPayment[sale.paymentMethod ?? ''] ?? sale.paymentMethod ?? ''}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
