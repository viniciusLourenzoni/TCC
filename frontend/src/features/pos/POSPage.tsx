import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Minus, Search, Package } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { NotificationBell } from '@/components/NotificationBell';
import { listProducts } from '@/lib/api/products';
import { listCategories } from '@/lib/api/categories';
import { useCartStore } from '@/stores/cartStore';
import { formatCents } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useNetworkStatus } from '@/lib/sync/useNetworkStatus';
import type { Product } from '@/types/api';

export function POSPage() {
  const navigate = useNavigate();
  const online = useNetworkStatus();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const categoriesQ = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
  });

  const productsQ = useQuery({
    queryKey: ['products', search, categoryId],
    queryFn: () =>
      listProducts({
        search: search || undefined,
        categoryId: categoryId ?? undefined,
      }),
  });

  const items = useCartStore((s) => s.items);
  const addProduct = useCartStore((s) => s.addProduct);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const subtotalCents = useCartStore((s) => s.subtotalCents());
  const discount = useCartStore((s) => s.discount);
  const setDiscount = useCartStore((s) => s.setDiscount);
  const totalCents = useCartStore((s) => s.totalCents());

  const filters = useMemo(
    () => [
      { id: null, label: 'Todos' },
      ...(categoriesQ.data ?? []).map((c) => ({ id: c.id, label: c.name })),
    ],
    [categoriesQ.data],
  );

  const hasItems = items.length > 0;

  return (
    <>
      <TopBar
        title="Ponto de Venda"
        right={
          <div className="flex items-center gap-1">
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                online ? 'bg-accent' : 'bg-payment-fiado',
              )}
              role="img"
              aria-label={online ? 'online' : 'offline'}
            />
            <NotificationBell />
          </div>
        }
      />

      <div className="px-4 py-3 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="input-base pl-9"
            placeholder="Buscar produto ou código de barras…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          {filters.map((f) => (
            <button
              key={f.id ?? 'all'}
              type="button"
              onClick={() => setCategoryId(f.id)}
              className={cn(
                'shrink-0 px-4 h-9 rounded-full text-xs font-semibold border transition-colors',
                (categoryId ?? null) === f.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-surface text-muted-foreground border-border',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <section className="grid grid-cols-2 gap-3">
          {(productsQ.data ?? []).map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAdd={() => addProduct(p)}
            />
          ))}
        </section>

        {productsQ.isLoading && (
          <div className="text-center text-sm text-muted-foreground py-4">
            Carregando produtos…
          </div>
        )}

        <hr className="border-primary/30 my-2" />

        {/* Carrinho */}
        <section className="flex flex-col gap-2">
          {!hasItems && (
            <div className="text-center text-sm text-muted-foreground py-6">
              Carrinho vazio
            </div>
          )}

          {items.map((item) => (
            <div
              key={item.productId}
              className="card flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold">{item.productName}</p>
                <p className="text-[11px] text-muted-foreground">
                  {item.quantity} × {formatCents(item.unitPrice)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Diminuir"
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity - 1)
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center text-sm font-semibold">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  aria-label="Aumentar"
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity + 1)
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Totais */}
        <div className="card flex flex-col gap-2">
          <Row label="Subtotal:" value={formatCents(subtotalCents)} />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Desconto:</span>
            <input
              type="number"
              min={0}
              step={1}
              value={discount / 100}
              onChange={(e) =>
                setDiscount(
                  Math.max(0, Math.round(Number(e.target.value) * 100)),
                )
              }
              className="w-24 h-9 rounded-md border border-border px-2 text-right text-sm"
            />
          </div>
          <Row
            label="TOTAL:"
            value={formatCents(totalCents)}
            valueClassName="text-accent text-base"
            labelClassName="font-bold"
          />
        </div>

        <button
          type="button"
          disabled={!hasItems}
          className="btn-primary"
          onClick={() => navigate('/pdv/checkout')}
        >
          FINALIZAR VENDA
        </button>
      </div>
    </>
  );
}

function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex flex-col items-stretch text-left rounded-xl border border-border bg-surface shadow-card p-2 active:scale-[0.99] transition-transform"
    >
      <div className="aspect-square overflow-hidden rounded-lg bg-muted flex items-center justify-center text-muted-foreground/70 mb-2">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Package className="h-8 w-8" />
        )}
      </div>
      <p className="text-sm font-semibold leading-tight line-clamp-2">
        {product.name}
      </p>
      <p className="text-sm font-bold text-accent mt-1">
        {formatCents(product.price)}
      </p>
      <p className="text-[11px] text-muted-foreground">
        Estoque: {product.stock} UN
      </p>
    </button>
  );
}

function Row({
  label,
  value,
  labelClassName,
  valueClassName,
}: {
  label: string;
  value: string;
  labelClassName?: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-sm text-muted-foreground', labelClassName)}>
        {label}
      </span>
      <span className={cn('text-sm font-semibold', valueClassName)}>{value}</span>
    </div>
  );
}
