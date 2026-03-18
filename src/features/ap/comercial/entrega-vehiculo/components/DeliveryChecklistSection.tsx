"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const downloadPdfMutation = useDownloadDeliveryChecklistPdf();

  const [observations, setObservations] = useState<string>("");
  const [observationsInitialized, setObservationsInitialized] = useState(false);

  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addItemForm, setAddItemForm] = useState<ChecklistItemFormState>(emptyItemForm);

  const [editItemOpen, setEditItemOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<DeliveryChecklistItemResource | null>(null);
  const [editItemForm, setEditItemForm] = useState<ChecklistItemFormState>(emptyItemForm);

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
    if (!checklist.id || !item.id) return;
    updateItemMutation.mutate({
      checklistId: checklist.id,
      itemId: item.id,
      vehicleDeliveryId,
      data: { is_confirmed: !item.is_confirmed },
    });
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
        <div className="space-y-1.5">
          {items.map((item, index) => {
            const sourceBadge = SOURCE_BADGE[item.source] ?? SOURCE_BADGE.manual;
            return (
              <div
                key={item.id ?? `suggested-${index}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors",
                  item.is_confirmed
                    ? "bg-green-50/60 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                    : "bg-background border-border"
                )}
              >
                {/* Número */}
                <span className="text-xs text-muted-foreground w-5 shrink-0 text-center">
                  {index + 1}
                </span>

                {/* Badge origen */}
                <Badge color={sourceBadge.color} className="text-xs shrink-0 whitespace-nowrap">
                  {sourceBadge.label}
                </Badge>

                {/* Descripción + cantidad/unidad + observaciones */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    item.is_confirmed && "text-green-800 dark:text-green-300"
                  )}>
                    {item.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity}{item.unit ? ` ${item.unit}` : ""}
                    {item.observations ? ` · ${item.observations}` : ""}
                  </p>
                </div>

                {/* Botón toggle conforme */}
                {isDraft && item.id !== null ? (
                  <Button
                    size="sm"
                    variant={item.is_confirmed ? "default" : "outline"}
                    className={cn(
                      "shrink-0 gap-1.5 text-xs h-7 px-2.5",
                      item.is_confirmed && "bg-green-600 hover:bg-green-700 border-green-600 text-white"
                    )}
                    onClick={() => handleToggleConfirmed(item)}
                    disabled={updateItemMutation.isPending}
                  >
                    {item.is_confirmed ? (
                      <><CheckCircle2 className="size-3.5" /> Conforme</>
                    ) : (
                      <><Circle className="size-3.5" /> Pendiente</>
                    )}
                  </Button>
                ) : (
                  <span className={cn(
                    "flex items-center gap-1 text-xs shrink-0 font-medium",
                    item.is_confirmed ? "text-green-600" : "text-muted-foreground"
                  )}>
                    {item.is_confirmed ? (
                      <><CheckCircle2 className="size-3.5" /> Conforme</>
                    ) : (
                      <><Circle className="size-3.5" /> Pendiente</>
                    )}
                  </span>
                )}

                {/* Editar / Eliminar */}
                {isDraft && (
                  <div className="flex items-center gap-1 shrink-0">
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
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {!hasChecklist && items.length > 0 && (
          <Button onClick={handleCreate} disabled={createMutation.isPending}>
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Plus className="mr-2 h-4 w-4" />
            Crear Checklist con estos ítems
          </Button>
        )}

        {isDraft && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddItemOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar ítem
            </Button>

            <div className="ml-auto">
              <ConfirmationDialog
                trigger={
                  <Button
                    size="sm"
                    disabled={items.length === 0 || confirmMutation.isPending}
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
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={downloadPdfMutation.isPending}
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
