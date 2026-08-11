import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import GeneralSheet from "@/shared/components/GeneralSheet.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { EditableCell } from "@/shared/components/EditableCell.tsx";
import {
  DeleteButton,
  SimpleDeleteDialog,
} from "@/shared/components/SimpleDeleteDialog.tsx";
import { cn } from "@/lib/utils.ts";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import { ConceptObjectivePeriodPvForm } from "./ConceptObjectivePeriodPvForm.tsx";
import {
  deleteConceptObjectivePeriodPv,
  storeConceptObjectivePeriodPv,
  updateConceptObjectivePeriodPv,
} from "../lib/conceptObjectivePeriodPv.actions.ts";
import { useAllConceptObjectivePeriodPv } from "../lib/conceptObjectivePeriodPv.hook.ts";
import { CONCEPT_OBJECTIVE_PERIOD_PV } from "../lib/conceptObjectivePeriodPv.constants.ts";
import { ConceptObjectivePeriodPvResource } from "../lib/conceptObjectivePeriodPv.interface.ts";
import { ConceptObjectivePeriodPvSchema } from "../lib/conceptObjectivePeriodPv.schema.ts";
import { ObjectiveSedePeriodPvResource } from "../../objetivo-sede-periodo/lib/objectiveSedePeriodPv.interface.ts";
import { OBJECTIVE_SEDE_PERIOD_PV } from "../../objetivo-sede-periodo/lib/objectiveSedePeriodPv.constants.ts";

interface Props {
  open: boolean;
  onClose: () => void;
  objective: ObjectiveSedePeriodPvResource;
  initialConceptId?: number;
}

const EMPTY_VALUES: Partial<ConceptObjectivePeriodPvSchema> = {
  master_concept_id: "",
  area_id: "",
  description: "",
  is_vehicular_crossing: false,
  sub_amount: 0,
  type_planning_ids: [],
  advisors: [],
};

export default function ConceptObjectivePeriodPvSheet({
  open,
  onClose,
  objective,
  initialConceptId,
}: Props) {
  const queryClient = useQueryClient();
  const { MODEL, QUERY_KEY } = CONCEPT_OBJECTIVE_PERIOD_PV;
  const [editRecord, setEditRecord] =
    useState<ConceptObjectivePeriodPvResource | null>(null);
  const [deleteRecord, setDeleteRecord] =
    useState<ConceptObjectivePeriodPvResource | null>(null);

  const { data = [] } = useAllConceptObjectivePeriodPv({
    objective_sede_period_pv_id: objective.id,
  });

  useEffect(() => {
    if (!initialConceptId) return;
    const record = data.find((item) => item.id === initialConceptId);
    if (record) setEditRecord(record);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConceptId, data.length]);

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
      queryClient.invalidateQueries({
        queryKey: [OBJECTIVE_SEDE_PERIOD_PV.QUERY_KEY],
      }),
    ]);

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: ConceptObjectivePeriodPvSchema) => {
      const payload = {
        objective_sede_period_pv_id: objective.id,
        area_id: Number(formData.area_id),
        description: formData.description,
        is_vehicular_crossing: formData.is_vehicular_crossing,
        status: true,
        sub_amount: Number(formData.sub_amount),
        order: editRecord?.order ?? data.length,
        type_planning_ids: formData.type_planning_ids,
        advisors: (formData.advisors || []).map((advisor) => ({
          ...(advisor.id ? { id: advisor.id } : {}),
          worker_id: Number(advisor.worker_id),
          amount: Number(advisor.amount),
        })),
      };
      return editRecord
        ? updateConceptObjectivePeriodPv(editRecord.id, payload)
        : storeConceptObjectivePeriodPv(payload);
    },
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, editRecord ? "update" : "create"));
      await invalidate();
      setEditRecord(null);
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message,
        ERROR_MESSAGE(MODEL, editRecord ? "update" : "create"),
      );
    },
  });

  const { mutate: toggleStatus } = useMutation({
    mutationFn: ({
      record,
      status,
    }: {
      record: ConceptObjectivePeriodPvResource;
      status: boolean;
    }) =>
      updateConceptObjectivePeriodPv(record.id, {
        objective_sede_period_pv_id: objective.id,
        area_id: record.area_id,
        description: record.description,
        is_vehicular_crossing: record.is_vehicular_crossing,
        status,
        sub_amount: Number(record.sub_amount),
        order: record.order,
        type_planning_ids: record.type_planning_ids,
        advisors: record.advisors.map((advisor) => ({
          id: advisor.id,
          worker_id: advisor.worker_id,
          amount: Number(advisor.amount),
        })),
      }),
    onSuccess: async () => {
      successToast("Estado actualizado correctamente.");
      await invalidate();
    },
    onError: () => {
      errorToast("Error al actualizar el estado.");
    },
  });

  const { mutate: updateOrder } = useMutation({
    mutationFn: ({
      record,
      order,
    }: {
      record: ConceptObjectivePeriodPvResource;
      order: number;
    }) =>
      updateConceptObjectivePeriodPv(record.id, {
        objective_sede_period_pv_id: objective.id,
        area_id: record.area_id,
        description: record.description,
        is_vehicular_crossing: record.is_vehicular_crossing,
        status: record.status,
        sub_amount: Number(record.sub_amount),
        order,
        type_planning_ids: record.type_planning_ids,
        advisors: record.advisors.map((advisor) => ({
          id: advisor.id,
          worker_id: advisor.worker_id,
          amount: Number(advisor.amount),
        })),
      }),
    onSuccess: async () => {
      successToast("Orden actualizado correctamente.");
      await invalidate();
    },
    onError: () => {
      errorToast("Error al actualizar el orden.");
    },
  });

  const handleDelete = async () => {
    if (!deleteRecord) return;
    try {
      await deleteConceptObjectivePeriodPv(deleteRecord.id);
      await invalidate();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
      if (editRecord?.id === deleteRecord.id) setEditRecord(null);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteRecord(null);
    }
  };

  const handleClose = () => {
    setEditRecord(null);
    onClose();
  };

  const defaultValues: Partial<ConceptObjectivePeriodPvSchema> = editRecord
    ? {
        area_id: editRecord.area_id.toString(),
        description: editRecord.description,
        is_vehicular_crossing: editRecord.is_vehicular_crossing,
        sub_amount: Number(editRecord.sub_amount),
        type_planning_ids: editRecord.type_planning_ids,
        advisors: editRecord.advisors.map((advisor) => ({
          id: advisor.id,
          worker_id: advisor.worker_id.toString(),
          amount: Number(advisor.amount),
        })),
      }
    : EMPTY_VALUES;

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title={editRecord ? "Editar Concepto" : "Nuevo Concepto"}
      subtitle={`${objective.sede?.abreviatura} · ${objective.month}/${objective.year}`}
      icon="Target"
      size="2xl"
    >
      <div className="space-y-6">
        {editRecord && (
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm text-muted-foreground">
              Estado del concepto
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Orden</span>
                <EditableCell
                  id={editRecord.id}
                  value={editRecord.order}
                  isNumber
                  min={0}
                  widthClass="w-14"
                  onUpdate={(_, newOrder) => {
                    setEditRecord({ ...editRecord, order: newOrder });
                    updateOrder({ record: editRecord, order: newOrder });
                  }}
                />
              </div>
              <Switch
                checked={editRecord.status}
                onCheckedChange={(checked) => {
                  setEditRecord({ ...editRecord, status: checked });
                  toggleStatus({ record: editRecord, status: checked });
                }}
                className={cn(
                  editRecord.status ? "bg-primary" : "bg-secondary",
                )}
              />
              <DeleteButton onClick={() => setDeleteRecord(editRecord)} />
            </div>
          </div>
        )}

        <ConceptObjectivePeriodPvForm
          key={editRecord?.id ?? "create"}
          defaultValues={defaultValues}
          onSubmit={(formData) => mutate(formData)}
          isSubmitting={isPending}
          mode={editRecord ? "update" : "create"}
          onCancel={handleClose}
          sedeId={objective.sede_id}
        />
      </div>

      {deleteRecord !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteRecord(null)}
          onConfirm={handleDelete}
        />
      )}
    </GeneralSheet>
  );
}
