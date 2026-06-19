import { NavLink } from 'react-router-dom';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/', icon: Home, label: 'Início', exact: true },
  { to: '/produtos', icon: Package, label: 'Produtos' },
  { to: '/pdv', icon: ShoppingCart, label: 'PDV', highlight: true },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/vendas', icon: Receipt, label: 'Vendas' },
];

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-[480px] bg-surface z-10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="h-px w-full bg-border" aria-hidden />
      <ul className="flex h-16 items-stretch justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    'flex h-full flex-col items-center justify-center gap-0.5 px-1 pt-0.5 text-[11px]',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                    item.highlight && !isActive && 'text-primary',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                        item.highlight && isActive && 'bg-primary text-white',
                        item.highlight && !isActive && 'ring-1 ring-primary/25 bg-primary/5',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-medium leading-none">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
