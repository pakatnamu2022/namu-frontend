import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VehicleCategoryResource } from "../lib/vehicleCategory.interface";
import { VehicleCategorySchema } from "../lib/vehicleCategory.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { GeneralModal } from "@/shared/components/GeneralModal";
import {
  storeVehicleCategory,
  updateVehicleCategory,
} from "../lib/vehicleCategory.actions";
import { useVehicleCategoryById } from "../lib/vehicleCategory.hook";
import { VehicleCategoryForm } from "./VehicleCategoryForm";
import { VEHICLE_CATEGORY } from "../lib/vehicleCategory.constants";
import { AP_MASTER_TYPE } from "@/features/ap/comercial/ap-master/lib/apMaster.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function VehicleCategoryModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { MODEL, EMPTY, QUERY_KEY } = VEHICLE_CATEGORY;
  const {
    data: vehicleCategoryData,
    isLoading: loadingVehicleCategory,
    refetch,
  } = useVehicleCategoryById(id);

  const vehicleCategory = mode === "create" ? EMPTY : vehicleCategoryData;

  function mapVehicleCategoryToForm(
    data: VehicleCategoryResource
  ): Partial<VehicleCategorySchema> {
    return {
      description: data.description,
      type: AP_MASTER_TYPE.VEHICLE_CATEGORY,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: VehicleCategorySchema) =>
      mode === "create"
        ? storeVehicleCategory(data)
        : updateVehicleCategory(id!, data),
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

  const handleSubmit = (data: VehicleCategorySchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingVehicleCategory || !vehicleCategory;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && vehicleCategory ? (
        <VehicleCategoryForm
          defaultValues={mapVehicleCategoryToForm(vehicleCategory)}
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
