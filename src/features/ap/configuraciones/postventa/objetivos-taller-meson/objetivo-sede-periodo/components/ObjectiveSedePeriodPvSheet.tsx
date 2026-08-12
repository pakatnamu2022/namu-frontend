import { useMutation, useQueryClient } from "@tanstack/react-query";
import GeneralSheet from "@/shared/components/GeneralSheet.tsx";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import { ObjectiveSedePeriodPvForm } from "./ObjectiveSedePeriodPvForm.tsx";
import {
  storeObjectiveSedePeriodPv,
  updateObjectiveSedePeriodPv,
} from "../lib/objectiveSedePeriodPv.actions.ts";
import { OBJECTIVE_SEDE_PERIOD_PV } from "../lib/objectiveSedePeriodPv.constants.ts";
import { ObjectiveSedePeriodPvResource } from "../lib/objectiveSedePeriodPv.interface.ts";
import { ObjectiveSedePeriodPvSchema } from "../lib/objectiveSedePeriodPv.schema.ts";

interface Props {
  open: boolean;
  onClose: () => void;
  record?: ObjectiveSedePeriodPvResource | null;
  prefill?: { sede_id?: string; year?: string; month?: string };
  onSuccess?: (record: ObjectiveSedePeriodPvResource) => void;
}

export default function ObjectiveSedePeriodPvSheet({
  open,
  onClose,
  record,
  prefill,
  onSuccess,
}: Props) {
  const queryClient = useQueryClient();
  const { MODEL, QUERY_KEY } = OBJECTIVE_SEDE_PERIOD_PV;
  const mode = record ? "update" : "create";

  const defaultValues: Partial<ObjectiveSedePeriodPvSchema> = record
    ? {
        sede_id: record.sede_id.toString(),
        year: record.year.toString(),
        month: record.month.toString(),
      }
    : {
        sede_id: prefill?.sede_id,
        year: prefill?.year || new Date().getFullYear().toString(),
        month: prefill?.month || (new Date().getMonth() + 1).toString(),
      };

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ObjectiveSedePeriodPvSchema) => {
      const payload = {
        sede_id: Number(data.sede_id),
        year: Number(data.year),
        month: Number(data.month),
      };
      return mode === "update"
        ? updateObjectiveSedePeriodPv(record!.id, payload)
        : storeObjectiveSedePeriodPv(payload);
    },
    onSuccess: async (created) => {
      successToast(SUCCESS_MESSAGE(MODEL, mode));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      onSuccess?.(created);
      onClose();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, mode));
    },
  });

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={mode === "update" ? "Editar Objetivo de Sede" : "Crear Objetivo de Sede"}
      subtitle="Define el monto objetivo mensual para la sede seleccionada"
      icon="Target"
      size="md"
    >
      <ObjectiveSedePeriodPvForm
        defaultValues={defaultValues}
        onSubmit={(data) => mutate(data)}
        onCancel={onClose}
        isSubmitting={isPending}
        mode={mode}
      />
    </GeneralSheet>
  );
}
