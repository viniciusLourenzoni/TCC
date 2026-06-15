import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Banknote,
  CreditCard,
  Wallet,
  Smartphone,
  Calendar,
  Loader2,
} from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { useCartStore } from '@/stores/cartStore';
import { listCustomers } from '@/lib/api/customers';
import { createSale } from '@/lib/api/sales';
import { pendingSalesRepo } from '@/lib/db/pendingSalesRepo';
import { useNetworkStatus } from '@/lib/sync/useNetworkStatus';
import { apiErrorMessage } from '@/lib/api/client';
import { formatCents } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { CreateSaleRequest, PaymentMethod } from '@/types/api';

interface PaymentOption {
  method: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  colorBg: string;
  colorText: string;
}

const PAYMENTS: PaymentOption[] = [
  {
    method: 'CASH',
    label: 'Dinheiro',
    icon: <Banknote className="h-5 w-5" />,
    colorBg: 'bg-payment-cash/15',
    colorText: 'text-payment-cash',
  },
  {
    method: 'CREDIT_CARD',
    label: 'Crédito',
    icon: <CreditCard className="h-5 w-5" />,
    colorBg: 'bg-payment-credit/15',
    colorText: 'text-payment-credit',
  },
  {
    method: 'DEBIT_CARD',
    label: 'Débito',
    icon: <Wallet className="h-5 w-5" />,
    colorBg: 'bg-payment-debit/15',
    colorText: 'text-payment-debit',
  },
  {
    method: 'PIX',
    label: 'PIX',
    icon: <Smartphone className="h-5 w-5" />,
    colorBg: 'bg-payment-pix/15',
    colorText: 'text-payment-pix',
  },
  {
    method: 'FIADO',
    label: 'Fiado',
    icon: <Calendar className="h-5 w-5" />,
    colorBg: 'bg-payment-fiado/15',
    colorText: 'text-payment-fiado',
  },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const online = useNetworkStatus();
  const qc = useQueryClient();

  const items = useCartStore((s) => s.items);
  const customerId = useCartStore((s) => s.customerId);
  const setCustomer = useCartStore((s) => s.setCustomer);
  const notes = useCartStore((s) => s.notes);
  const setNotes = useCartStore((s) => s.setNotes);
  const discount = useCartStore((s) => s.discount);
  const subtotalCents = useCartStore((s) => s.subtotalCents());
  const totalCents = useCartStore((s) => s.totalCents());
  const clear = useCartStore((s) => s.clear);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  const customersQ = useQuery({
    queryKey: ['customers', ''],
    queryFn: () => listCustomers(),
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!paymentMethod) throw new Error('Escolha uma forma de pagamento');
      if (items.length === 0) throw new Error('Carrinho vazio');

      const offlineId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `off-${Date.now()}`;

      const payload: CreateSaleRequest = {
        customerId: customerId || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        discount,
        paymentMethod,
        notes: notes || undefined,
        offlineId,
        createdAtLocal: new Date().toISOString(),
      };

      if (online) {
        try {
          return await createSale(payload);
        } catch (err) {
          // Falha de rede → cai pro offline
          await pendingSalesRepo.enqueue(payload);
          return { offline: true } as const;
        }
      }
      await pendingSalesRepo.enqueue(payload);
      return { offline: true } as const;
    },
    onSuccess: async (result) => {
      if ('offline' in result) {
        toast.warning(
          'Venda registrada offline — sincronizará quando a conexão voltar.',
        );
      } else {
        toast.success(`Venda finalizada — ${formatCents(totalCents)}`);
      }
      clear();
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      await qc.invalidateQueries({ queryKey: ['sales'] });
      await qc.invalidateQueries({ queryKey: ['products'] });
      navigate('/', { replace: true });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  return (
    <>
      <TopBar title="Finalizar Venda" back />

      <div className="px-4 py-3 flex flex-col gap-4">
        {/* Resumo */}
        <section className="card">
          <h2 className="text-sm font-semibold mb-2">Resumo do Pedido</h2>
          <ul className="flex flex-col gap-1">
            {items.map((i) => (
              <li
                key={i.productId}
                className="flex items-center justify-between text-sm text-muted-foreground"
              >
                <span>
                  {i.quantity}x {i.productName}
                </span>
                <span>{formatCents(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <hr className="my-2 border-border" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCents(subtotalCents)}</span>
          </div>
          {discount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Desconto</span>
              <span className="text-destructive">
                -{formatCents(discount)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm font-bold mt-1">
            <span>Total</span>
            <span className="text-accent">{formatCents(totalCents)}</span>
          </div>
        </section>

        {/* Cliente */}
        <section className="card">
          <h2 className="text-sm font-semibold mb-2">Cliente</h2>
          <select
            className="input-base"
            value={customerId ?? ''}
            onChange={(e) => setCustomer(e.target.value || null)}
          >
            <option value="">Sem cliente</option>
            {(customersQ.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </section>

        {/* Pagamento */}
        <section className="card">
          <h2 className="text-sm font-semibold mb-2">Forma de Pagamento</h2>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENTS.map((p) => {
              const active = paymentMethod === p.method;
              return (
                <button
                  key={p.method}
                  type="button"
                  onClick={() => setPaymentMethod(p.method)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 h-20 rounded-xl border-2 transition-colors',
                    active
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-muted',
                  )}
                >
                  <span
                    className={cn(
                      'h-9 w-9 rounded-lg inline-flex items-center justify-center',
                      p.colorBg,
                      p.colorText,
                    )}
                  >
                    {p.icon}
                  </span>
                  <span className="text-[11px] font-semibold">{p.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Observações */}
        <section className="card">
          <h2 className="text-sm font-semibold mb-2">Observações</h2>
          <textarea
            className="input-base h-20 py-2"
            placeholder="Adicione observações sobre a venda…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </section>

        <button
          type="button"
          className="btn-accent"
          disabled={
            submit.isPending || items.length === 0 || !paymentMethod
          }
          onClick={() => submit.mutate()}
        >
          {submit.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'CONFIRMAR VENDA'
          )}
        </button>
      </div>
    </>
  );
}
