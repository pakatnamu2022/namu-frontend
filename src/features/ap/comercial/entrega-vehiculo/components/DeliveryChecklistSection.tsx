"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import FormSkeleton from "@/shared/components/FormSkeleton";
import {
  CheckCircle2,
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
}

const SOURCE_BADGE: Record<
  string,
  { label: string; color: "blue" | "orange" | "gray" }
> = {
  reception: { label: "Recepción", color: "blue" },
  purchase_order: { label: "Accesorio OC", color: "orange" },
  manual: { label: "Manual", color: "gray" },
};

interface ItemFormState {
  description: string;
  quantity: string;
  unit: string;
  observations: string;
}

const emptyItemForm: ItemFormState = {
  description: "",
  quantity: "1",
  unit: "",
  observations: "",
};

export function DeliveryChecklistSection({
  vehicleDeliveryId,
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
  const [addItemForm, setAddItemForm] = useState<ItemFormState>(emptyItemForm);

  const [editItemOpen, setEditItemOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<DeliveryChecklistItemResource | null>(null);
  const [editItemForm, setEditItemForm] = useState<ItemFormState>(emptyItemForm);

  // Initialize observations from fetched data
  if (checklist && !observationsInitialized) {
    setObservations(checklist.observations ?? "");
    setObservationsInitialized(true);
  }

  if (isLoading) return <FormSkeleton />;
  if (!checklist) return null;

  const isDraft = checklist.id !== null && checklist.status === "draft";
  const isConfirmed = checklist.id !== null && checklist.status === "confirmed";
  const hasChecklist = checklist.id !== null;

  const handleCreate = () => {
    const itemsToSend = checklist.items
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
    if (checklist.items.length === 0) return;
    confirmMutation.mutate(checklist.id);
  };

  const handleDownloadPdf = () => {
    if (!checklist.id) return;
    downloadPdfMutation.mutate(checklist.id);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Checklist de Entrega</h3>
          {!hasChecklist && (
            <Badge color="gray" className="text-xs">
              Sin checklist
            </Badge>
          )}
          {isDraft && (
            <Badge color="blue" className="text-xs">
              Borrador
            </Badge>
          )}
          {isConfirmed && (
            <Badge color="green" icon={CheckCircle2} className="text-xs">
              Confirmado
            </Badge>
          )}
        </div>
      </div>

      {/* Observations field */}
      {(hasChecklist || checklist.items.length > 0) && (
        <div className="space-y-2">
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

      {/* No checklist state — show suggested items */}
      {!hasChecklist && checklist.items.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center space-y-3">
          <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No existe un checklist de entrega para esta programación.
          </p>
          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Plus className="mr-2 h-4 w-4" />
            Crear Checklist
          </Button>
        </div>
      )}

      {/* Items table (suggested preview or real items) */}
      {checklist.items.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead className="w-28">Origen</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-20 text-center">Cantidad</TableHead>
                <TableHead className="w-20 text-center">Unidad</TableHead>
                <TableHead className="w-24 text-center">Conforme</TableHead>
                <TableHead>Observaciones</TableHead>
                {isDraft && (
                  <TableHead className="w-20 text-center">Acciones</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {checklist.items.map((item, index) => {
                const sourceBadge =
                  SOURCE_BADGE[item.source] ?? SOURCE_BADGE.manual;
                return (
                  <TableRow key={item.id ?? `suggested-${index}`}>
                    <TableCell className="text-muted-foreground text-xs">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <Badge color={sourceBadge.color} className="text-xs whitespace-nowrap">
                        {sourceBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {item.unit ?? "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {isDraft && item.id !== null ? (
                        <Checkbox
                          checked={item.is_confirmed}
                          onCheckedChange={() => handleToggleConfirmed(item)}
                          disabled={updateItemMutation.isPending}
                        />
                      ) : (
                        <Checkbox checked={item.is_confirmed} disabled />
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                      {item.observations ?? "—"}
                    </TableCell>
                    {isDraft && (
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="outline"
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
                            disabled={
                              item.id === null || deleteItemMutation.isPending
                            }
                          />
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        {/* No checklist with suggested items */}
        {!hasChecklist && checklist.items.length > 0 && (
          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending}
          >
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
                    disabled={
                      checklist.items.length === 0 || confirmMutation.isPending
                    }
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
          <div className="flex gap-2 ml-auto">
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

      {/* Confirmed by info */}
      {isConfirmed && checklist.confirmed_by_name && (
        <>
          <Separator />
          <p className="text-xs text-muted-foreground">
            Confirmado por{" "}
            <span className="font-medium">{checklist.confirmed_by_name}</span>
            {checklist.confirmed_at && (
              <>
                {" "}
                el{" "}
                {new Date(checklist.confirmed_at).toLocaleString("es-PE", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            )}
          </p>
        </>
      )}

      {/* Add item dialog */}
      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar ítem manual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-description">
                Descripción <span className="text-destructive">*</span>
              </Label>
              <Input
                id="add-description"
                value={addItemForm.description}
                onChange={(e) =>
                  setAddItemForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Ej. MANUAL DEL PROPIETARIO"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="add-quantity">Cantidad</Label>
                <Input
                  id="add-quantity"
                  type="number"
                  min={0}
                  step="0.01"
                  value={addItemForm.quantity}
                  onChange={(e) =>
                    setAddItemForm((f) => ({ ...f, quantity: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-unit">Unidad</Label>
                <Input
                  id="add-unit"
                  value={addItemForm.unit}
                  onChange={(e) =>
                    setAddItemForm((f) => ({ ...f, unit: e.target.value }))
                  }
                  placeholder="Ej. UND"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-observations">Observaciones</Label>
              <Textarea
                id="add-observations"
                value={addItemForm.observations}
                onChange={(e) =>
                  setAddItemForm((f) => ({
                    ...f,
                    observations: e.target.value,
                  }))
                }
                rows={2}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddItemOpen(false);
                setAddItemForm(emptyItemForm);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddSubmit}
              disabled={
                !addItemForm.description.trim() || addItemMutation.isPending
              }
            >
              {addItemMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit item dialog */}
      <Dialog open={editItemOpen} onOpenChange={setEditItemOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar ítem</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-description">
                Descripción <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-description"
                value={editItemForm.description}
                onChange={(e) =>
                  setEditItemForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Cantidad</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min={0}
                  step="0.01"
                  value={editItemForm.quantity}
                  onChange={(e) =>
                    setEditItemForm((f) => ({ ...f, quantity: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unidad</Label>
                <Input
                  id="edit-unit"
                  value={editItemForm.unit}
                  onChange={(e) =>
                    setEditItemForm((f) => ({ ...f, unit: e.target.value }))
                  }
                  placeholder="Ej. UND"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-observations">Observaciones</Label>
              <Textarea
                id="edit-observations"
                value={editItemForm.observations}
                onChange={(e) =>
                  setEditItemForm((f) => ({
                    ...f,
                    observations: e.target.value,
                  }))
                }
                rows={2}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItemOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={
                !editItemForm.description.trim() ||
                updateItemMutation.isPending
              }
            >
              {updateItemMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
