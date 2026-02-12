import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VEHICLEASSIGNMENTCONTROL } from "../lib/vehicleAssignment.constants";
import {
  useFormData,
  useVehicleAssignmentById,
} from "../lib/vehicleAssignment.hook";
import { VehicleAssignmentControlResource } from "../lib/vehicleAssignment.interface";
import { VehicleAssignmentSchema } from "../lib/vehicleAssignment.schema";
import {
  storeVehicleAssignment,
  updateVehicleAssignment,
} from "../lib/vehicleAssignment.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { VehicleAssignmentForm } from "./VehicleAssignmentForm";
import FormSkeleton from "@/shared/components/FormSkeleton";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function VehicleAssignmentModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const { EMPTY, MODEL, QUERY_KEY } = VEHICLEASSIGNMENTCONTROL;
  const queryClient = useQueryClient();

  const { data: formData, isLoading: loadingFormData } = useFormData();

  const {
    data: vehicleAssignment,
    isLoading: loadingVehicleAssignment,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useVehicleAssignmentById(id!);

  function mapVehicleAssignmentToFrom(
    data: VehicleAssignmentControlResource,
  ): Partial<VehicleAssignmentSchema> {
    return {
      driver: data.driver_id,
      vehicle: data.tracto_id,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: VehicleAssignmentSchema) =>
      mode === "create"
        ? storeVehicleAssignment(data)
        : updateVehicleAssignment(id!, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, mode));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      await queryClient.invalidateQueries({
        queryKey: ["opVehicleAssignment"],
      });
      if (mode === "update") {
        await refetch();
      }
      onClose();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? ERROR_MESSAGE(MODEL, mode));
    },
  });

  const handleSubmit = (data: VehicleAssignmentSchema) => {
    mutate(data);
  };

  const isLoadingAny = loadingVehicleAssignment || loadingFormData || !formData;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {isLoadingAny ? (
        <FormSkeleton />
      ) : (
        <VehicleAssignmentForm
          onCancel={onClose}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          mode={mode}
          drivers={formData?.drivers || []}
          tractors={formData?.tractors || []}
          defaultValues={
            vehicleAssignment
              ? mapVehicleAssignmentToFrom(vehicleAssignment)
              : {}
          }
        />
      )}
    </GeneralModal>
  );
}
