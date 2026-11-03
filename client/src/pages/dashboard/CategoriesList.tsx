import { useState } from "react";
import { Plus, Pencil, Trash2, Tags, Check, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/categories";
import type { Category } from "@/lib/types";

export default function CategoriesList() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      setNewName("");
      invalidate();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; name: string }) =>
      updateCategory(vars.id, vars.name),
    onSuccess: () => {
      setEditingId(null);
      setEditingName("");
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      setDeleteId(null);
      invalidate();
    },
  });

  const categories = data?.items ?? [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      createMutation.mutate(newName.trim());
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      updateMutation.mutate({ id: editingId, name: editingName.trim() });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorías"
        description="Organizá tus productos en categorías para tu catálogo."
      />

      <form onSubmit={handleCreate} className="flex max-w-md gap-2">
        <Input
          placeholder="Nueva categoría (ej: Electrónica)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          maxLength={100}
        />
        <Button
          type="submit"
          disabled={createMutation.isPending || !newName.trim()}
        >
          <Plus className="mr-1.5 size-4" />
          Agregar
        </Button>
      </form>

      {isLoading ? (
        <LoadingSkeleton variant="table" />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No hay categorías"
          description="Crea tu primera categoría para organizar tus productos."
        />
      ) : (
        <div className="max-w-2xl space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3"
            >
              {editingId === cat.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    autoFocus
                    maxLength={100}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSaveEdit}
                    disabled={updateMutation.isPending}
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Tags className="size-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">
                      /{cat.slug}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(cat)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteId(cat.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Borrar categoría"
        description="¿Estás seguro de borrar esta categoría? Los productos que la usen quedarán sin categoría."
        confirmText="Borrar"
        variant="danger"
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
      />
    </div>
  );
}
