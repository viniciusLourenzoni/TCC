import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { listCategories } from '@/lib/api/categories';
import {
  createProduct,
  getProduct,
  updateProduct,
} from '@/lib/api/products';
import { apiErrorMessage } from '@/lib/api/client';
import { parseReaisToCents } from '@/lib/format';

const schema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  categoryId: z.string().optional(),
  priceText: z.string().min(1, 'Informe o preço de venda'),
  costPriceText: z.string().optional(),
  stock: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v) || 0),
  barcode: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.input<typeof schema>;

export function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const categoriesQ = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
  });

  const productQ = useQuery({
    queryKey: ['products', id],
    queryFn: () => getProduct(id as string),
    enabled: isEdit,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      categoryId: '',
      priceText: '',
      costPriceText: '',
      stock: 0,
      barcode: '',
      description: '',
    },
  });

  const { register, handleSubmit, formState, reset } = form;

  useEffect(() => {
    if (productQ.data) {
      reset({
        name: productQ.data.name,
        categoryId: productQ.data.categoryId ?? '',
        priceText: ((productQ.data.price ?? 0) / 100).toFixed(2).replace('.', ','),
        costPriceText: productQ.data.costPrice
          ? (productQ.data.costPrice / 100).toFixed(2).replace('.', ',')
          : '',
        stock: productQ.data.stock,
        barcode: productQ.data.barcode ?? '',
        description: productQ.data.description ?? '',
      });
    }
  }, [productQ.data, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        price: parseReaisToCents(values.priceText),
        costPrice: values.costPriceText
          ? parseReaisToCents(values.costPriceText)
          : undefined,
        categoryId: values.categoryId || undefined,
        barcode: values.barcode || undefined,
        stock: Number(values.stock) || 0,
      };
      if (isEdit) return updateProduct(id as string, payload);
      return createProduct(payload);
    },
    onSuccess: async () => {
      toast.success(isEdit ? 'Produto atualizado' : 'Produto cadastrado');
      await qc.invalidateQueries({ queryKey: ['products'] });
      navigate('/produtos');
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  return (
    <>
      <TopBar title={isEdit ? 'Editar Produto' : 'Cadastrar Produto'} back />
      <form
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        className="px-4 py-3 flex flex-col gap-3"
      >
        <Field label="Nome" error={formState.errors.name?.message}>
          <input className="input-base" {...register('name')} />
        </Field>

        <Field label="Categoria">
          <select className="input-base" {...register('categoryId')}>
            <option value="">Sem categoria</option>
            {(categoriesQ.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Preço Venda (R$)"
            error={formState.errors.priceText?.message}
          >
            <input
              inputMode="decimal"
              className="input-base"
              placeholder="0,00"
              {...register('priceText')}
            />
          </Field>
          <Field label="Preço Custo (R$)">
            <input
              inputMode="decimal"
              className="input-base"
              placeholder="0,00"
              {...register('costPriceText')}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Estoque (UN)">
            <input
              type="number"
              min={0}
              className="input-base"
              {...register('stock')}
            />
          </Field>
          <Field label="Código de Barras">
            <input
              inputMode="numeric"
              className="input-base"
              placeholder="Opcional"
              {...register('barcode')}
            />
          </Field>
        </div>

        <Field label="Descrição">
          <textarea
            className="input-base h-20 py-2"
            placeholder="Opcional"
            {...register('description')}
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
            'Cadastrar Produto'
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
