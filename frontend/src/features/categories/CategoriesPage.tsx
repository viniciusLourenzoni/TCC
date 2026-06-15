import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Check, X, Tag, Loader2 } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/api/categories';
import { apiErrorMessage } from '@/lib/api/client';
import type { Category } from '@/types/api';
import { toast } from 'sonner';

const DEFAULT_COLOR = '#1E3A8A';

export function CategoriesPage() {
  const qc = useQueryClient();
  const categoriesQ = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
  });

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(DEFAULT_COLOR);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(DEFAULT_COLOR);

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['categories'] });

  const createM = useMutation({
    mutationFn: () =>
      createCategory({ name: newName.trim(), color: newColor }),
    onSuccess: async () => {
      toast.success('Categoria criada');
      setNewName('');
      setNewColor(DEFAULT_COLOR);
      await invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const updateM = useMutation({
    mutationFn: () =>
      updateCategory(editingId as string, {
        name: editName.trim(),
        color: editColor,
      }),
    onSuccess: async () => {
      toast.success('Categoria atualizada');
      setEditingId(null);
      await invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: async () => {
      toast.success('Categoria excluída');
      await invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color ?? DEFAULT_COLOR);
  }

  function confirmDelete(cat: Category) {
    if (window.confirm(`Excluir a categoria "${cat.name}"?`)) {
      deleteM.mutate(cat.id);
    }
  }

  const categories = categoriesQ.data ?? [];

  return (
    <>
      <TopBar title="Categorias" back />

      <div className="px-4 py-3 flex flex-col gap-3">
        {/* Adicionar nova categoria */}
        <form
          className="card flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (newName.trim()) createM.mutate();
          }}
        >
          <label className="text-xs font-medium">Nova categoria</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-border bg-surface p-1"
              aria-label="Cor da categoria"
            />
            <input
              className="input-base"
              placeholder="Nome da categoria"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={80}
            />
            <button
              type="submit"
              disabled={!newName.trim() || createM.isPending}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
              aria-label="Adicionar"
            >
              {createM.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>

        {/* Lista */}
        {categoriesQ.isLoading && (
          <div className="card text-center text-sm text-muted-foreground">
            Carregando…
          </div>
        )}

        {!categoriesQ.isLoading && categories.length === 0 && (
          <div className="card flex flex-col items-center gap-1 py-8 text-center">
            <Tag className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhuma categoria cadastrada
            </p>
          </div>
        )}

        <ul className="flex flex-col gap-2">
          {categories.map((cat) =>
            editingId === cat.id ? (
              <li key={cat.id} className="card flex items-center gap-2">
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-border bg-surface p-1"
                  aria-label="Cor da categoria"
                />
                <input
                  className="input-base"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={80}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => editName.trim() && updateM.mutate()}
                  disabled={updateM.isPending}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-accent hover:bg-muted"
                  aria-label="Salvar"
                >
                  <Check className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                  aria-label="Cancelar"
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ) : (
              <li
                key={cat.id}
                className="card flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-5 w-5 shrink-0 rounded-full border border-border"
                    style={{ backgroundColor: cat.color ?? DEFAULT_COLOR }}
                  />
                  <span className="text-sm font-semibold">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(cat)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                    aria-label={`Editar ${cat.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDelete(cat)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-destructive hover:bg-muted"
                    aria-label={`Excluir ${cat.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      </div>
    </>
  );
}
