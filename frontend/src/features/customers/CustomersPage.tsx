import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, User } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { listCustomers } from '@/lib/api/customers';

export function CustomersPage() {
  const [search, setSearch] = useState('');
  const customersQ = useQuery({
    queryKey: ['customers', search],
    queryFn: () => listCustomers(search || undefined),
  });

  return (
    <>
      <TopBar
        title="Clientes"
        right={
          <Link
            to="/clientes/novo"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
            aria-label="Cadastrar cliente"
          >
            <Plus className="h-5 w-5" />
          </Link>
        }
      />

      <div className="px-4 py-3 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="input-base pl-9"
            placeholder="Buscar por nome, CPF ou telefone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {customersQ.isLoading && (
          <div className="card text-center text-sm text-muted-foreground">
            Carregando…
          </div>
        )}

        {!customersQ.isLoading && (customersQ.data?.length ?? 0) === 0 && (
          <div className="card flex flex-col items-center gap-1 py-8">
            <User className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhum cliente cadastrado
            </p>
          </div>
        )}

        <ul className="flex flex-col gap-2">
          {(customersQ.data ?? []).map((c) => (
            <li key={c.id}>
              <Link
                to={`/clientes/${c.id}`}
                className="card flex items-center gap-3"
              >
                <div className="h-11 w-11 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {c.cpf ?? c.phone ?? c.email ?? 'sem contato'}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
