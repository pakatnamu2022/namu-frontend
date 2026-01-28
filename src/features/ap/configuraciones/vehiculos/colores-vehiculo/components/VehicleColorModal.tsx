import { useMutation, useQueryClient } from "@tanstack/react-query";
import FormSkeleton from "@/shared/components/FormSkeleton";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { useVehicleColorById } from "../lib/vehicleColor.hook";
import { VehicleColorResource } from "../lib/vehicleColor.interface";
import { VehicleColorSchema } from "../lib/vehicleColor.schema";
import {
  storeVehicleColor,
  updateVehicleColor,
} from "../lib/vehicleColor.actions";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { VehicleColorForm } from "./VehicleColorForm";
import { VEHICLE_COLOR } from "../lib/vehicleColor.constants";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

const { EMPTY, QUERY_KEY, MODEL } = VEHICLE_COLOR;

export default function VehicleColorModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const {
    data: VehicleColor,
    isLoading: loadingVehicleColor,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useVehicleColorById(id!);

  function mapRoleToForm(
    data: VehicleColorResource,
  ): Partial<VehicleColorSchema> {
    return {
      description: data.description,
      type: AP_MASTER_TYPE.VEHICLE_COLOR,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: VehicleColorSchema) =>
      mode === "create"
        ? storeVehicleColor(data)
        : updateVehicleColor(id!, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, mode));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
      await refetch();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, mode, msg));
    },
  });

  const handleSubmit = (data: VehicleColorSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingVehicleColor || !VehicleColor;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && VehicleColor ? (
        <VehicleColorForm
          defaultValues={mapRoleToForm(VehicleColor)}
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
