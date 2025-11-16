import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFuelTypeById } from "../lib/fuelType.hook";
import { FuelTypeResource } from "../lib/fuelType.interface";
import { FuelTypeSchema } from "../lib/fuelType.schema";
import { storeFuelType, updateFuelType } from "../lib/fuelType.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { GeneralModal } from "@/src/shared/components/GeneralModal";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { FuelTypeForm } from "./FuelTypeForm";
import { FUEL_TYPE } from "../lib/fuelType.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function FuelTypeModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = FUEL_TYPE;
  const {
    data: FuelType,
    isLoading: loadingFuelType,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useFuelTypeById(id!);

  function mapRoleToForm(data: FuelTypeResource): Partial<FuelTypeSchema> {
    return {
      code: data.code,
      description: data.description,
      electric_motor: data.electric_motor,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FuelTypeSchema) =>
      mode === "create" ? storeFuelType(data) : updateFuelType(id!, data),
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

  const handleSubmit = (data: FuelTypeSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingFuelType || !FuelType;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && FuelType ? (
        <FuelTypeForm
          defaultValues={mapRoleToForm(FuelType)}
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
