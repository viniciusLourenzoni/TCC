import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import {
  createCustomer,
  getCustomer,
  updateCustomer,
} from '@/lib/api/customers';
import { apiErrorMessage } from '@/lib/api/client';

const schema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  cpf: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/.test(v),
      'CPF deve ter 11 dígitos',
    ),
  email: z
    .string()
    .optional()
    .refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), 'E-mail inválido'),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CustomerFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const customerQ = useQuery({
    queryKey: ['customers', id],
    queryFn: () => getCustomer(id as string),
    enabled: isEdit,
  });

  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', cpf: '', email: '', phone: '' },
  });

  useEffect(() => {
    if (customerQ.data) {
      reset({
        name: customerQ.data.name,
        cpf: customerQ.data.cpf ?? '',
        email: customerQ.data.email ?? '',
        phone: customerQ.data.phone ?? '',
      });
    }
  }, [customerQ.data, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        name: values.name,
        cpf: values.cpf || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
      };
      return isEdit
        ? updateCustomer(id as string, payload)
        : createCustomer(payload);
    },
    onSuccess: async () => {
      toast.success(isEdit ? 'Cliente atualizado' : 'Cliente cadastrado');
      await qc.invalidateQueries({ queryKey: ['customers'] });
      navigate('/clientes');
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  return (
    <>
      <TopBar title={isEdit ? 'Editar Cliente' : 'Cadastrar Cliente'} back />
      <form
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        className="px-4 py-3 flex flex-col gap-3"
      >
        <Field label="Nome" error={formState.errors.name?.message}>
          <input className="input-base" {...register('name')} />
        </Field>
        <Field label="CPF" error={formState.errors.cpf?.message}>
          <input
            className="input-base"
            inputMode="numeric"
            placeholder="000.000.000-00"
            {...register('cpf')}
          />
        </Field>
        <Field label="E-mail" error={formState.errors.email?.message}>
          <input
            className="input-base"
            type="email"
            placeholder="cliente@email.com"
            {...register('email')}
          />
        </Field>
        <Field label="Telefone">
          <input
            className="input-base"
            inputMode="tel"
            placeholder="(11) 99999-9999"
            {...register('phone')}
          />
        </Field>

        <button
          type="submit"
          className="btn-primary mt-3"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEdit ? (
            'Salvar Alterações'
          ) : (
            'Salvar Cliente'
          )}
        </button>
      </form>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium">{label}</label>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
