import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useVehicleTypeById } from "../lib/vehicleType.hook";
import { VehicleTypeResource } from "../lib/vehicleType.interface";
import { VehicleTypeSchema } from "../lib/vehicleType.schema";
import {
  storeVehicleType,
  updateVehicleType,
} from "../lib/vehicleType.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { GeneralModal } from "@/src/shared/components/GeneralModal";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { VehicleTypeForm } from "./VehicleTypeForm";
import { VEHICLE_TYPE } from "../lib/vehicleType.constants";
import { AP_MASTER_COMERCIAL } from "@/src/features/ap/lib/ap.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function VehicleTypeModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = VEHICLE_TYPE;
  const {
    data: VehicleType,
    isLoading: loadingVehicleType,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useVehicleTypeById(id!);

  function mapRoleToForm(
    data: VehicleTypeResource
  ): Partial<VehicleTypeSchema> {
    return {
      code: data.code,
      description: data.description,
      type: AP_MASTER_COMERCIAL.VEHICLE_TYPE,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: VehicleTypeSchema) =>
      mode === "create" ? storeVehicleType(data) : updateVehicleType(id!, data),
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

  const handleSubmit = (data: VehicleTypeSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingVehicleType || !VehicleType;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && VehicleType ? (
        <VehicleTypeForm
          defaultValues={mapRoleToForm(VehicleType)}
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
