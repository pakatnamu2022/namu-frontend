import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VehicleResource } from "../lib/vehicles.interface";
import { VehicleSchema } from "../lib/vehicles.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { GeneralModal } from "@/src/shared/components/GeneralModal";
import { storeVehicle, updateVehicle } from "../lib/vehicles.actions";
import { useVehicleById } from "../lib/vehicles.hook";
import { VehicleForm } from "./VehicleForm";
import { VEHICLES } from "../lib/vehicles.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function VehicleModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { MODEL, EMPTY, QUERY_KEY } = VEHICLES;
  const {
    data: vehicle,
    isLoading: loadingVehicle,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useVehicleById(id!);

  function mapVehicleToForm(
    data: VehicleResource | VehicleSchema
  ): Partial<VehicleSchema> {
    return {
      vin: data.vin,
      year: data.year,
      engine_number: data.engine_number,
      ap_models_vn_id: String(data.ap_models_vn_id),
      vehicle_color_id: String(data.vehicle_color_id),
      engine_type_id: String(data.engine_type_id),
      warehouse_physical_id: data.warehouse_physical_id,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: VehicleSchema) =>
      mode === "create"
        ? storeVehicle(data as any)
        : updateVehicle(id!, data as any),
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

  const handleSubmit = (data: VehicleSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingVehicle || !vehicle;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="!max-w-(--breakpoint-md)"
    >
      {!isLoadingAny && vehicle ? (
        <VehicleForm
          defaultValues={mapVehicleToForm(vehicle)}
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
