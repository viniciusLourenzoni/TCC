import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ProductsPage } from '@/features/products/ProductsPage';
import { ProductFormPage } from '@/features/products/ProductFormPage';
import { CustomersPage } from '@/features/customers/CustomersPage';
import { CustomerFormPage } from '@/features/customers/CustomerFormPage';
import { POSPage } from '@/features/pos/POSPage';
import { CheckoutPage } from '@/features/pos/CheckoutPage';
import { SalesPage } from '@/features/sales/SalesPage';
import { NotificationsPage } from '@/features/notifications/NotificationsPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'produtos', element: <ProductsPage /> },
      { path: 'produtos/novo', element: <ProductFormPage /> },
      { path: 'produtos/:id', element: <ProductFormPage /> },
      { path: 'clientes', element: <CustomersPage /> },
      { path: 'clientes/novo', element: <CustomerFormPage /> },
      { path: 'clientes/:id', element: <CustomerFormPage /> },
      { path: 'pdv', element: <POSPage /> },
      { path: 'pdv/checkout', element: <CheckoutPage /> },
      { path: 'vendas', element: <SalesPage /> },
      { path: 'notificacoes', element: <NotificationsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
