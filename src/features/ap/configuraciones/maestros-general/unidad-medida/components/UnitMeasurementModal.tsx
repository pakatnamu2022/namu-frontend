import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UnitMeasurementResource } from "../lib/unitMeasurement.interface";
import { UnitMeasurementSchema } from "../lib/unitMeasurement.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { GeneralModal } from "@/shared/components/GeneralModal";
import {
  storeUnitMeasurement,
  updateUnitMeasurement,
} from "../lib/unitMeasurement.actions";
import { useUnitMeasurementById } from "../lib/unitMeasurement.hook";
import { UnitMeasurementForm } from "./UnitMeasurementForm";
import { UNIT_MEASUREMENT } from "../lib/unitMeasurement.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function UnitMeasurementModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { MODEL, EMPTY, QUERY_KEY } = UNIT_MEASUREMENT;
  const {
    data: unitMeasurement,
    isLoading: loadingUnitMeasurement,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useUnitMeasurementById(id!);

  function mapUnitMeasurementToForm(
    data: UnitMeasurementResource
  ): Partial<UnitMeasurementSchema> {
    return {
      dyn_code: data.dyn_code,
      nubefac_code: data.nubefac_code,
      description: data.description,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UnitMeasurementSchema) =>
      mode === "create"
        ? storeUnitMeasurement(data)
        : updateUnitMeasurement(id!, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, mode));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
      await refetch();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, mode));
    },
  });

  const handleSubmit = (data: UnitMeasurementSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingUnitMeasurement || !unitMeasurement;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && unitMeasurement ? (
        <UnitMeasurementForm
          defaultValues={mapUnitMeasurementToForm(unitMeasurement)}
          onCancel={onClose}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          mode={mode}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
