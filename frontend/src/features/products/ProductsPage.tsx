import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Package, Tags } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { listProducts } from '@/lib/api/products';
import { listCategories } from '@/lib/api/categories';
import { formatCents } from '@/lib/format';
import { cn } from '@/lib/utils';

export function ProductsPage() {
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

  const filters = useMemo(
    () => [
      { id: null, label: 'Todos' },
      ...(categoriesQ.data ?? []).map((c) => ({ id: c.id, label: c.name })),
    ],
    [categoriesQ.data],
  );

  return (
    <>
      <TopBar
        title="Produtos"
        right={
          <div className="flex items-center gap-1">
            <Link
              to="/produtos/categorias"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
              aria-label="Gerenciar categorias"
            >
              <Tags className="h-5 w-5" />
            </Link>
            <Link
              to="/produtos/novo"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
              aria-label="Cadastrar produto"
            >
              <Plus className="h-5 w-5" />
            </Link>
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

        {productsQ.isLoading && (
          <div className="card text-center text-sm text-muted-foreground">
            Carregando…
          </div>
        )}

        {!productsQ.isLoading && (productsQ.data?.length ?? 0) === 0 && (
          <div className="card flex flex-col items-center gap-1 py-8">
            <Package className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhum produto encontrado
            </p>
          </div>
        )}

        <ul className="flex flex-col gap-2">
          {(productsQ.data ?? []).map((p) => (
            <li key={p.id}>
              <Link
                to={`/produtos/${p.id}`}
                className="card flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 overflow-hidden rounded-lg bg-primary/10 text-primary inline-flex items-center justify-center">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Estoque: {p.stock} UN
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-accent">
                  {formatCents(p.price)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
