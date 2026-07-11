"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import {
  ChecklistItemDialog,
  type ChecklistItemFormState,
} from "./ChecklistItemDialog";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import FormSkeleton from "@/shared/components/FormSkeleton";
import {
  CheckCircle2,
  Circle,
  ClipboardList,
  Download,
  Loader2,
  Pencil,
  Plus,
} from "lucide-react";
import {
  useDeliveryChecklist,
  useCreateDeliveryChecklist,
  useUpdateDeliveryChecklist,
  useUpdateDeliveryChecklistItem,
  useAddDeliveryChecklistItem,
  useDeleteDeliveryChecklistItem,
  useConfirmDeliveryChecklist,
  useConfirmAllDeliveryChecklistItems,
  useDownloadDeliveryChecklistPdf,
} from "../lib/deliveryChecklist.hook";
import type { DeliveryChecklistItemResource } from "../lib/vehicleDelivery.interface";

interface DeliveryChecklistSectionProps {
  vehicleDeliveryId: number;
  hideHeader?: boolean;
  onChecklistConfirmed?: () => void;
}

const SOURCE_BADGE: Record<
  string,
  { label: string; color: "blue" | "orange" | "gray" }
> = {
  reception: { label: "Recepción", color: "blue" },
  purchase_order: { label: "Accesorio OC", color: "orange" },
  manual: { label: "Manual", color: "gray" },
};

const emptyItemForm: ChecklistItemFormState = {
  description: "",
  quantity: "1",
  unit: "",
  observations: "",
};

export function DeliveryChecklistSection({
  vehicleDeliveryId,
  hideHeader = false,
  onChecklistConfirmed,
}: DeliveryChecklistSectionProps) {
  const { data: checklist, isLoading } = useDeliveryChecklist(vehicleDeliveryId);

  const createMutation = useCreateDeliveryChecklist();
  const updateHeaderMutation = useUpdateDeliveryChecklist();
  const updateItemMutation = useUpdateDeliveryChecklistItem();
  const addItemMutation = useAddDeliveryChecklistItem();
  const deleteItemMutation = useDeleteDeliveryChecklistItem();
  const confirmMutation = useConfirmDeliveryChecklist();
  const confirmAllMutation = useConfirmAllDeliveryChecklistItems();
  const downloadPdfMutation = useDownloadDeliveryChecklistPdf();

  const [observations, setObservations] = useState<string>("");
  const [observationsInitialized, setObservationsInitialized] = useState(false);

  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addItemForm, setAddItemForm] = useState<ChecklistItemFormState>(emptyItemForm);

  const [editItemOpen, setEditItemOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<DeliveryChecklistItemResource | null>(null);
  const [editItemForm, setEditItemForm] = useState<ChecklistItemFormState>(emptyItemForm);

  // Toggle de ítems: cada ítem lleva su propio estado optimista/pending,
  // así el usuario puede seguir marcando el siguiente mientras el anterior
  // todavía se está enviando al backend (sin bloquear toda la lista).
  const [pendingItemIds, setPendingItemIds] = useState<Set<number>>(new Set());
  const [optimisticConfirmed, setOptimisticConfirmed] = useState<
    Record<number, boolean>
  >({});

  // Initialize observations from fetched data
  if (checklist && !observationsInitialized) {
    setObservations(checklist.observations ?? "");
    setObservationsInitialized(true);
  }

  if (isLoading) return <FormSkeleton />;
  if (!checklist) return null;

  const items = checklist.items ?? [];
  const isDraft = checklist.id !== null && checklist.status === "draft";
  const isConfirmed = checklist.id !== null && checklist.status === "confirmed";
  const hasChecklist = checklist.id !== null;

  const handleCreate = () => {
    const itemsToSend = items
      .filter((item) => item.id !== null || !hasChecklist)
      .map((item) => ({
        description: item.description,
        quantity: parseFloat(item.quantity) || 1,
        unit: item.unit ?? null,
        source: item.source,
        source_id: item.source_id ?? null,
        is_confirmed: item.is_confirmed,
        observations: item.observations ?? null,
      }));

    createMutation.mutate({
      vehicle_delivery_id: vehicleDeliveryId,
      observations: observations || null,
      items: itemsToSend.length > 0 ? itemsToSend : undefined,
    });
  };

  const handleSaveObservations = () => {
    if (!checklist.id) return;
    updateHeaderMutation.mutate({
      id: checklist.id,
      vehicleDeliveryId,
      data: { observations: observations || null },
    });
  };

  const handleToggleConfirmed = (item: DeliveryChecklistItemResource) => {
    if (!checklist.id || !item.id || pendingItemIds.has(item.id)) return;
    const checklistId = checklist.id;
    const itemId = item.id;
    const currentValue = optimisticConfirmed[itemId] ?? item.is_confirmed;
    const nextValue = !currentValue;

    setOptimisticConfirmed((prev) => ({ ...prev, [itemId]: nextValue }));
    setPendingItemIds((prev) => new Set(prev).add(itemId));

    updateItemMutation.mutate(
      {
        checklistId,
        itemId,
        vehicleDeliveryId,
        data: { is_confirmed: nextValue },
      },
      {
        onError: () => {
          setOptimisticConfirmed((prev) => {
            const next = { ...prev };
            delete next[itemId];
            return next;
          });
        },
        onSettled: () => {
          setPendingItemIds((prev) => {
            const next = new Set(prev);
            next.delete(itemId);
            return next;
          });
        },
      },
    );
  };

  const handleOpenEdit = (item: DeliveryChecklistItemResource) => {
    setEditingItem(item);
    setEditItemForm({
      description: item.description,
      quantity: item.quantity,
      unit: item.unit ?? "",
      observations: item.observations ?? "",
    });
    setEditItemOpen(true);
  };

  const handleEditSubmit = () => {
    if (!checklist.id || !editingItem?.id) return;
    updateItemMutation.mutate(
      {
        checklistId: checklist.id,
        itemId: editingItem.id,
        vehicleDeliveryId,
        data: {
          description: editItemForm.description,
          quantity: parseFloat(editItemForm.quantity) || 1,
          unit: editItemForm.unit || null,
          observations: editItemForm.observations || null,
        },
      },
      {
        onSuccess: () => setEditItemOpen(false),
      },
    );
  };

  const handleDelete = (item: DeliveryChecklistItemResource) => {
    if (!checklist.id || !item.id) return;
    deleteItemMutation.mutate({
      checklistId: checklist.id,
      itemId: item.id,
      vehicleDeliveryId,
    });
  };

  const handleAddSubmit = () => {
    if (!checklist.id) return;
    addItemMutation.mutate(
      {
        checklistId: checklist.id,
        vehicleDeliveryId,
        data: {
          description: addItemForm.description,
          quantity: parseFloat(addItemForm.quantity) || 1,
          unit: addItemForm.unit || null,
          observations: addItemForm.observations || null,
        },
      },
      {
        onSuccess: () => {
          setAddItemOpen(false);
          setAddItemForm(emptyItemForm);
        },
      },
    );
  };

  const handleConfirm = () => {
    if (!checklist.id) return;
    if (items.length === 0) return;
    confirmMutation.mutate(checklist.id, {
      onSuccess: () => onChecklistConfirmed?.(),
    });
  };

  const handleConfirmAll = () => {
    if (!checklist.id) return;
    const pendingItems = items.filter((i) => !i.is_confirmed && i.id !== null) as Array<{ id: number }>;
    if (pendingItems.length === 0) return;
    confirmAllMutation.mutate({
      checklistId: checklist.id,
      vehicleDeliveryId,
      items: pendingItems,
    });
  };

  const handleDownloadPdf = () => {
    if (!checklist.id) return;
    downloadPdfMutation.mutate(checklist.id);
  };

  const confirmedCount = items.filter((i) => i.is_confirmed).length;
  const totalCount = items.length;

  return (
    <div className="space-y-4">
      {/* Header — ocultable cuando el padre ya lo muestra */}
      {!hideHeader && (
        <>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary shrink-0" />
            <span className="font-semibold text-sm">Checklist de Entrega</span>
            {!hasChecklist && (
              <Badge color="gray" className="text-xs">Sin checklist</Badge>
            )}
            {isDraft && (
              <Badge color="blue" className="text-xs">Borrador</Badge>
            )}
            {isConfirmed && (
              <Badge color="green" icon={CheckCircle2} className="text-xs">Confirmado</Badge>
            )}
            {hasChecklist && totalCount > 0 && (
              <span className="ml-auto text-xs text-muted-foreground font-medium">
                {confirmedCount}/{totalCount} conformes
              </span>
            )}
          </div>
          {hasChecklist && totalCount > 0 && (
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(confirmedCount / totalCount) * 100}%` }}
              />
            </div>
          )}
        </>
      )}

      {/* No checklist empty state */}
      {!hasChecklist && items.length === 0 && (
        <div className="rounded-lg border border-dashed p-10 text-center space-y-3">
          <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No existe un checklist de entrega para esta programación.
          </p>
          <Button onClick={handleCreate} disabled={createMutation.isPending}>
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Plus className="mr-2 h-4 w-4" />
            Crear Checklist
          </Button>
        </div>
      )}

      {/* Items — filas interactivas */}
      {items.length > 0 && (
        <ScrollArea className="max-h-[60vh] sm:max-h-[420px] pr-2 sm:pr-3 overflow-auto">
        <div className="space-y-1">
          {items.map((item, index) => {
            const sourceBadge = SOURCE_BADGE[item.source] ?? SOURCE_BADGE.manual;
            const isConfirmedValue =
              item.id !== null
                ? optimisticConfirmed[item.id] ?? item.is_confirmed
                : item.is_confirmed;
            const isItemPending = item.id !== null && pendingItemIds.has(item.id);
            const canToggle = isDraft && item.id !== null;

            return (
              <div
                key={item.id ?? `suggested-${index}`}
                onClick={canToggle ? () => handleToggleConfirmed(item) : undefined}
                className={cn(
                  "flex items-center gap-2 sm:gap-3 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border transition-colors",
                  canToggle && "cursor-pointer active:scale-[0.99]",
                  isConfirmedValue
                    ? "bg-green-50/60 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                    : "bg-background border-border"
                )}
              >
                {/* Toggle / estado */}
                <span className="shrink-0 flex items-center justify-center size-6 sm:size-5">
                  {isItemPending ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  ) : isConfirmedValue ? (
                    <CheckCircle2 className="size-5 sm:size-4 text-green-600" />
                  ) : (
                    <Circle className="size-5 sm:size-4 text-muted-foreground" />
                  )}
                </span>

                {/* Cantidad | Descripción + observaciones */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      isConfirmedValue && "text-green-800 dark:text-green-300"
                    )}>
                      <span className="text-muted-foreground font-normal">
                        {item.quantity}{item.unit ? ` ${item.unit}` : ""}
                      </span>
                      <span className="mx-1 text-muted-foreground">|</span>
                      {item.description}
                    </p>
                    <Badge color={sourceBadge.color} className="text-[10px] shrink-0 whitespace-nowrap hidden sm:inline-flex">
                      {sourceBadge.label}
                    </Badge>
                  </div>
                  {item.observations && (
                    <p className="text-xs text-muted-foreground truncate">
                      {item.observations}
                    </p>
                  )}
                </div>

                {/* Editar / Eliminar */}
                {isDraft && (
                  <div
                    className="flex items-center gap-0.5 sm:gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      tooltip="Editar ítem"
                      onClick={() => handleOpenEdit(item)}
                      disabled={item.id === null}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <DeleteButton
                      onClick={() => handleDelete(item)}
                      disabled={item.id === null || deleteItemMutation.isPending}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </ScrollArea>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
        {!hasChecklist && items.length > 0 && (
          <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full sm:w-auto">
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Plus className="mr-2 h-4 w-4" />
            Crear Checklist con estos ítems
          </Button>
        )}

        {isDraft && (
          <>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddItemOpen(true)}
                className="flex-1 sm:flex-none"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar ítem
              </Button>

              {confirmedCount < totalCount && totalCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleConfirmAll}
                  disabled={confirmAllMutation.isPending}
                  className="flex-1 sm:flex-none"
                >
                  {confirmAllMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Confirmar todos
                </Button>
              )}
            </div>

            <div className="sm:ml-auto">
              <ConfirmationDialog
                trigger={
                  <Button
                    size="sm"
                    disabled={items.length === 0 || confirmMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {confirmMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirmar Checklist
                  </Button>
                }
                title="¿Confirmar checklist?"
                description="Una vez confirmado no podrás modificar los ítems ni las observaciones. Esta acción no se puede deshacer."
                confirmText="Sí, confirmar"
                cancelText="Cancelar"
                icon="warning"
                onConfirm={handleConfirm}
              />
            </div>
          </>
        )}

        {isConfirmed && (
          <div className="sm:ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={downloadPdfMutation.isPending}
              className="w-full sm:w-auto"
            >
              {downloadPdfMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Descargar PDF
            </Button>
          </div>
        )}
      </div>

      {/* Observations — al fondo */}
      {(hasChecklist || items.length > 0) && (
        <div className="space-y-2 pt-1">
          <Label htmlFor="checklist-obs">Observaciones generales</Label>
          <Textarea
            id="checklist-obs"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Observaciones del checklist..."
            rows={2}
            disabled={isConfirmed}
            className="resize-none"
          />
          {isDraft && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveObservations}
              disabled={updateHeaderMutation.isPending}
            >
              {updateHeaderMutation.isPending && (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              )}
              Guardar observaciones
            </Button>
          )}
        </div>
      )}

      {/* Confirmed by */}
      {isConfirmed && checklist.confirmed_by_name && (
        <div className="rounded-lg border bg-muted/40 px-4 py-3 space-y-0.5">
          <p className="text-xs text-muted-foreground">Confirmado por</p>
          <p className="text-sm font-medium">{checklist.confirmed_by_name}</p>
          {checklist.confirmed_at && (
            <p className="text-xs text-muted-foreground">
              {new Date(checklist.confirmed_at).toLocaleString("es-PE", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      )}

      <ChecklistItemDialog
        open={addItemOpen}
        onClose={() => {
          setAddItemOpen(false);
          setAddItemForm(emptyItemForm);
        }}
        mode="add"
        form={addItemForm}
        onChange={setAddItemForm}
        onSubmit={handleAddSubmit}
        isPending={addItemMutation.isPending}
      />

      <ChecklistItemDialog
        open={editItemOpen}
        onClose={() => setEditItemOpen(false)}
        mode="edit"
        form={editItemForm}
        onChange={setEditItemForm}
        onSubmit={handleEditSubmit}
        isPending={updateItemMutation.isPending}
      />
    </div>
  );
}
