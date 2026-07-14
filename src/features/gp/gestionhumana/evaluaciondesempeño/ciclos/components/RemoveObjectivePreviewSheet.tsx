"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2, Trash2, XCircle } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import {
  useRemoveObjectivePreview,
  useRemoveObjectiveFromCycle,
} from "../lib/cycle.hook";
import { toast } from "sonner";

interface RemoveObjectivePreviewSheetProps {
  open: boolean;
  onClose: () => void;
  cycleId: number;
  objectiveId: number | null;
  onRemoved?: () => void;
}

export default function RemoveObjectivePreviewSheet({
  open,
  onClose,
  cycleId,
  objectiveId,
  onRemoved,
}: RemoveObjectivePreviewSheetProps) {
  const { data, isLoading, isError, refetch } = useRemoveObjectivePreview(
    cycleId,
    objectiveId,
    open,
  );

  const removeMutation = useRemoveObjectiveFromCycle();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (open && objectiveId) {
      refetch();
    }
  }, [open, objectiveId, refetch]);

  useEffect(() => {
    if (data) {
      setSelectedIds(data.persons.map((person) => person.person_id));
    }
  }, [data]);

  const toggleSelected = (personId: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, personId] : prev.filter((id) => id !== personId),
    );
  };

  const allSelected =
    !!data && data.persons.length > 0 && selectedIds.length === data.persons.length;

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked && data ? data.persons.map((p) => p.person_id) : []);
  };

  const handleRemove = async () => {
    if (!objectiveId) return;
    try {
      await removeMutation.mutateAsync({
        cycleId,
        objectiveId,
        personIds: allSelected ? undefined : selectedIds,
      });
      toast.success("Objetivo eliminado del ciclo correctamente.");
      onRemoved?.();
      onClose();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al eliminar el objetivo del ciclo.";
      toast.error(message);
    }
  };

  const willBeRemovedCount =
    data?.persons.filter(
      (p) => selectedIds.includes(p.person_id) && p.will_be_removed_from_cycle,
    ).length ?? 0;

  const footer = (
    <div className="flex justify-end items-center gap-2">
      <Button variant="outline" onClick={onClose}>
        Cancelar
      </Button>
      <ConfirmationDialog
        trigger={
          <Button
            variant="destructive"
            disabled={
              !data || selectedIds.length === 0 || removeMutation.isPending
            }
          >
            {removeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 size-4" />
                Eliminar Objetivo
              </>
            )}
          </Button>
        }
        title="¿Eliminar objetivo del ciclo?"
        description={
          willBeRemovedCount > 0
            ? `Se eliminará el objetivo de ${selectedIds.length} persona(s). ${willBeRemovedCount} de ellas se quedarán sin objetivos y serán removidas por completo del ciclo. Esta acción no se puede deshacer.`
            : `Se eliminará el objetivo de ${selectedIds.length} persona(s). Esta acción no se puede deshacer.`
        }
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={handleRemove}
        icon="danger"
        variant="destructive"
      />
    </div>
  );

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Eliminar Objetivo del Ciclo"
      subtitle="Revisa a quiénes afecta antes de eliminar el objetivo por completo"
      size="4xl"
      icon="Trash2"
      childrenFooter={footer}
    >
      <div className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Cargando información...
            </span>
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <XCircle className="size-4" />
            <AlertDescription>
              Error al cargar la información. Por favor, intenta nuevamente.
            </AlertDescription>
          </Alert>
        )}

        {data && (
          <>
            <Alert variant="warning">
              <AlertTriangle />
              <AlertTitle>
                {data.total_affected} persona(s) afectada(s)
              </AlertTitle>
              <AlertDescription>
                Selecciona a las personas de las que deseas eliminar este
                objetivo. Si una persona se queda sin objetivos, será removida
                por completo del ciclo.
              </AlertDescription>
            </Alert>

            {data.persons.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => toggleAll(!!checked)}
                  />
                  <span className="text-sm font-medium">
                    Seleccionar todos ({selectedIds.length}/{data.persons.length})
                  </span>
                </div>

                <div className="space-y-2">
                  {data.persons.map((person) => (
                    <div
                      key={person.person_id}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedIds.includes(person.person_id)}
                          onCheckedChange={(checked) =>
                            toggleSelected(person.person_id, !!checked)
                          }
                        />
                        <div>
                          <p className="font-semibold text-sm">
                            {person.person_name}
                          </p>
                          {person.category && (
                            <p className="text-xs text-muted-foreground">
                              {person.category}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {person.remaining_objectives_after_removal} objetivo(s)
                          restante(s)
                        </span>
                        {person.will_be_removed_from_cycle && (
                          <Badge color="red">Se elimina del ciclo</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </GeneralSheet>
  );
}
