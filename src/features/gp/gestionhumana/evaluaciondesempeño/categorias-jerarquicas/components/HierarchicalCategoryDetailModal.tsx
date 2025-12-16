"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2, Trash2 } from "lucide-react";
import { HierarchicalCategoryDetail } from "../lib/hierarchicalCategory.interface";
import { PositionResource } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.interface";
import { AnimatePresence, motion } from "framer-motion";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { errorToast, successToast } from "@/core/core.function";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { deleteHierarchicalCategoryDetail } from "../lib/hierarchicalCategory.actions";
import GeneralSheet from "@/shared/components/GeneralSheet";

interface Props {
  queryClient: any;
  open: boolean;
  setOpen: (open: boolean) => void;
  name: string;
  data: HierarchicalCategoryDetail[];
  positions: PositionResource[];
  onAddPositions?: (positions: { position_id: number }[]) => Promise<any>;
}

export function HierarchicalCategoryDetailModal({
  queryClient,
  open,
  setOpen,
  name,
  data,
  positions,
  onAddPositions,
}: Props) {
  // existentes renderizados
  const [items, setItems] = useState<HierarchicalCategoryDetail[]>(data ?? []);

  // modo agregar (muestra el bloque animado con select + botón agregar)
  const [adding, setAdding] = useState(false);

  // selección actual del select
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    setItems(data ?? []);
  }, [data]);

  // lista de nuevos (pendientes de guardar) — solo guarda position_id
  const [pending, setPending] = useState<{ position_id: number }[]>([]);
  const [deleteDetailId, setDeleteDetailId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const positionsMap = useMemo(
    () =>
      new Map<number, PositionResource>(
        positions.map((p) => [p.id, p] as const)
      ),
    [positions]
  );

  const isDuplicate = (posId: number) => {
    const inPending = pending.some((p) => p.position_id === posId);
    const inItems = items.some((i) => i.position_id === posId);
    return inPending || inItems;
  };

  const startAdd = () => {
    setAdding(true);
    setSelectedId(null);
  };

  const cancelAdd = () => {
    setAdding(false);
    setSelectedId(null);
  };

  const addOneToPending = () => {
    if (!selectedId) return;
    if (isDuplicate(selectedId)) return; // evita duplicados
    setPending((prev) => [{ position_id: selectedId }, ...prev]);
    setSelectedId(null); // deja listo para elegir otra
  };

  const removePending = (posId: number) => {
    setPending((prev) => prev.filter((p) => p.position_id !== posId));
  };

  // en el modal, reemplaza todo el if/else del fetch por una sola línea
  const saveAll = async () => {
    if (pending.length === 0) return;
    try {
      setSaving(true);
      await onAddPositions?.(pending); // el padre llama a storeHierarchicalCategoryDetails(...)
      // inserción optimista local (igual que ya tienes)
      const optimistic: HierarchicalCategoryDetail[] = pending.map((p) => {
        const pos = positionsMap.get(p.position_id);
        return {
          id: Date.now() + Math.random(),
          position: pos?.name || "Posición",
          area: pos?.area || "",
          leadership: "",
          hierarchical_category_id: 0, // si quieres, úsalo = selectedCategory.id y pásalo como prop
          position_id: p.position_id,
        };
      });
      setItems((prev) => [...optimistic, ...prev]);
      setPending([]);
      setAdding(false);
      setSelectedId(null);
    } finally {
      setSaving(false);
      setOpen(false);
    }
  };

  const handleDeleteDetail = async () => {
    if (!deleteDetailId) return;
    try {
      await deleteHierarchicalCategoryDetail(deleteDetailId);
      successToast("Posición eliminada correctamente.");
      setOpen(false);
    } catch (error) {
      errorToast("Error al eliminar la posición.");
    } finally {
      await queryClient.invalidateQueries({
        queryKey: ["hierarchicalCategory"],
      });
    }
  };

  return (
    <GeneralSheet
      title={`Posiciones de ${name}`}
      subtitle={`Gestiona las posiciones asignadas a la categoría jerárquica`}
      icon="Users2"
      open={open}
      onClose={() => setOpen(false)}
      size="2xl"
    >
      <div className="mt-4 space-y-4 overflow-auto max-h-[80vh] h-full">
        <div className="w-full flex justify-end mb-2 gap-2">
          {!adding ? (
            <Button variant="outline" size="sm" onClick={startAdd}>
              Agregar Posición
              <Plus className="size-5 ml-2" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={cancelAdd}>
              <X className="size-4 mr-2" />
              Cancelar agregado
            </Button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {adding && (
            <motion.div
              key="adder"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="border rounded-md p-3 bg-muted"
            >
              <div className="flex items-center gap-2 w-full">
                <SearchableSelect
                  onChange={(val) => setSelectedId(Number(val))}
                  options={positions.map((p) => ({
                    value: p.id.toString(),
                    label: p.name,
                    description: p.area || "",
                  }))}
                  value={selectedId ? String(selectedId) : ""}
                  placeholder="Selecciona una posición"
                  className="w-full! truncate text-xs"
                  classNameDiv="flex-1"
                />

                <Button
                  className="w-fit aspect-square"
                  variant="outline"
                  size="icon"
                  onClick={addOneToPending}
                  disabled={!selectedId || isDuplicate(selectedId)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              {/* vista previa de lo seleccionado actualmente (opcional) */}
              {selectedId && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {positionsMap.get(selectedId)?.area
                    ? `Área: ${positionsMap.get(selectedId)?.area}`
                    : null}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de pendientes (arriba, con borde diferenciado) */}
        <AnimatePresence initial={false}>
          {pending.map((p) => {
            const pos = positionsMap.get(p.position_id);
            const letter = pos?.name?.[0] ?? "-";
            return (
              <motion.div
                key={`pending-${p.position_id}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-3 border-2 border-dashed rounded-md p-2"
              >
                <Avatar>
                  <AvatarFallback>{letter}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="font-semibold text-sm">
                    {pos?.name ?? `#${p.position_id}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pos?.area || "—"}
                  </p>
                </div>
                <div className="ml-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Quitar"
                    onClick={() => removePending(p.position_id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Lista existente */}
        {items && items.length > 0 ? (
          items.map((child: HierarchicalCategoryDetail) => (
            <div key={String(child.id)} className="flex justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {String(child.position)?.[0] ?? "-"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="font-semibold text-sm">{child.position}</p>
                  <p className="text-xs text-muted-foreground">
                    {child.area || "—"}
                  </p>
                </div>
              </div>

              <Button
                variant={"outline"}
                size={"icon"}
                onClick={() => setDeleteDetailId(child.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No hay datos.</p>
        )}
      </div>
      {/* Footer homogéneo: Guardar / Cerrar */}
      <div className="w-full flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={() => setOpen(false)}>
          Cerrar
        </Button>
        <Button onClick={saveAll} disabled={pending.length === 0 || saving}>
          {saving ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Guardando
            </>
          ) : (
            "Guardar"
          )}
        </Button>
      </div>
      {deleteDetailId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteDetailId(null)}
          onConfirm={handleDeleteDetail}
        />
      )}
    </GeneralSheet>
  );
}
