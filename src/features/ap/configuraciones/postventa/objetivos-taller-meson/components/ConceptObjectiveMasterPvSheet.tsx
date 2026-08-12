import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import GeneralSheet from "@/shared/components/GeneralSheet.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog.tsx";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import { ConceptObjectivePvForm } from "./ConceptObjectiveMasterPvForm.tsx";
import ConceptObjectivePvList from "./ConceptObjectiveMasterPvList.tsx";
import {
  deleteConceptObjectivePv,
  updateOrCreateConceptObjectivePv,
} from "../lib/conceptObjectiveMasterPv.actions.ts";
import { useAllConceptObjectivePv } from "../lib/conceptObjectiveMasterPv.hook.ts";
import {
  CONCEPT_OBJECTIVE_PV,
  CONCEPT_OBJECTIVE_PV_AREA_OPTIONS,
} from "../lib/conceptObjectiveMasterPv.constants.ts";
import { ConceptObjectivePvResource } from "../lib/conceptObjectiveMasterPv.interface.ts";
import { ConceptObjectivePvSchema } from "../lib/conceptObjectiveMasterPv.schema.ts";

interface Props {
  open: boolean;
  onClose: () => void;
}

const EMPTY_VALUES: Partial<ConceptObjectivePvSchema> = {
  area_id: CONCEPT_OBJECTIVE_PV_AREA_OPTIONS[0]?.value,
  description: "",
  is_vehicular_crossing: false,
  type_planning_ids: [],
};

export default function ConceptObjectivePvSheet({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const { MODEL, QUERY_KEY } = CONCEPT_OBJECTIVE_PV;
  const [editRecord, setEditRecord] =
    useState<ConceptObjectivePvResource | null>(null);
  const [deleteRecord, setDeleteRecord] =
    useState<ConceptObjectivePvResource | null>(null);

  const { data = [], isLoading } = useAllConceptObjectivePv();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });

  const { mutate, isPending } = useMutation({
    mutationFn: updateOrCreateConceptObjectivePv,
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
    mutationFn: updateOrCreateConceptObjectivePv,
    onSuccess: async () => {
      successToast("Estado actualizado correctamente.");
      await invalidate();
    },
    onError: () => {
      errorToast("Error al actualizar el estado.");
    },
  });

  const handleSubmit = (data: ConceptObjectivePvSchema) => {
    mutate({
      ...data,
      id: editRecord?.id,
      area_id: Number(data.area_id),
      status: true,
    });
  };

  const handleToggleStatus = (
    record: ConceptObjectivePvResource,
    status: boolean,
  ) => {
    toggleStatus({
      id: record.id,
      area_id: record.area_id,
      description: record.description,
      is_vehicular_crossing: record.is_vehicular_crossing,
      type_planning_ids: record.type_planning_ids,
      order: record.order,
      status,
    });
  };

  const handleUpdateOrder = (id: number, order: number) => {
    const record = data.find((item) => item.id === id);
    if (!record) return;
    toggleStatus({
      id: record.id,
      area_id: record.area_id,
      description: record.description,
      is_vehicular_crossing: record.is_vehicular_crossing,
      type_planning_ids: record.type_planning_ids,
      status: record.status,
      order,
    });
  };

  const handleDelete = async () => {
    if (!deleteRecord) return;
    try {
      await deleteConceptObjectivePv(deleteRecord.id);
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

  const defaultValues: Partial<ConceptObjectivePvSchema> = editRecord
    ? {
        id: editRecord.id,
        area_id: editRecord.area_id.toString(),
        description: editRecord.description,
        is_vehicular_crossing: editRecord.is_vehicular_crossing,
        type_planning_ids: editRecord.type_planning_ids,
      }
    : EMPTY_VALUES;

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Actualizar Conceptos Maestros"
      subtitle="Gestiona los conceptos objetivo de Taller y Mesón"
      icon="Target"
      size="xl"
    >
      <div className="space-y-6">
        <ConceptObjectivePvForm
          key={editRecord?.id ?? "create"}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          mode={editRecord ? "update" : "create"}
          onCancelEdit={() => setEditRecord(null)}
        />

        <Separator />

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Conceptos registrados</h4>
          <ConceptObjectivePvList
            data={data}
            isLoading={isLoading}
            editingId={editRecord?.id}
            onEdit={setEditRecord}
            onToggleStatus={handleToggleStatus}
            onDelete={setDeleteRecord}
            onUpdateOrder={handleUpdateOrder}
          />
        </div>
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
