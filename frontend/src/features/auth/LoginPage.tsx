import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Store, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { login } from '@/lib/api/auth';
import { apiErrorMessage } from '@/lib/api/client';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

type FormValues = z.infer<typeof schema>;

const storeName = (import.meta.env.VITE_STORE_NAME as string) ?? 'Gestão de Vendas';

export function LoginPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [show, setShow] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  if (token) return <Navigate to="/" replace />;

  const onSubmit = async (values: FormValues) => {
    try {
      const data = await login(values.email, values.password);
      setAuth(data);
      toast.success(`Bem-vindo(a), ${data.user.name}`);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err) || 'Não foi possível entrar');
    }
  };

  return (
    <div className="app-container relative overflow-hidden">
      {/* Brilho decorativo no topo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"
      />

      <div className="relative flex-1 flex flex-col px-6 pt-16 pb-8">
        {/* Marca */}
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-elevated">
            <Store className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-2xl font-bold text-center tracking-tight">{storeName}</h1>
            <p className="text-sm text-muted-foreground text-center">
              Entre com sua conta para continuar
            </p>
          </div>
        </div>

        {/* Formulário */}
        <div className="card shadow-elevated mt-10 p-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" htmlFor="email">
                E-mail
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  className="input-base pl-10"
                  placeholder="seu@email.com"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-destructive">{errors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="input-base pl-10 pr-11"
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-destructive">{errors.password.message}</span>
              )}
            </div>

            <button
              type="button"
              className="self-end text-xs font-medium text-primary hover:underline"
              onClick={() =>
                toast.info('Entre em contato com o administrador para redefinir a senha.')
              }
            >
              Esqueci minha senha
            </button>

            <button type="submit" className="btn-primary mt-1" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Rodapé */}
        <div className="mt-auto pt-8 text-center text-[11px] text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {storeName}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
