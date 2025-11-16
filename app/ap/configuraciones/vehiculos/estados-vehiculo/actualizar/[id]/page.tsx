"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import {
  findVehicleStatusById,
  updateVehicleStatus,
} from "@/src/features/ap/configuraciones/vehiculos/estados-vehiculo/lib/vehicleStatus.actions";
import { VehicleStatusSchema } from "@/src/features/ap/configuraciones/vehiculos/estados-vehiculo/lib/vehicleStatus.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { VehicleStatusResource } from "@/src/features/ap/configuraciones/vehiculos/estados-vehiculo/lib/vehicleStatus.interface";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { VehicleStatusForm } from "@/src/features/ap/configuraciones/vehiculos/estados-vehiculo/components/VehicleStatusForm";
import FormWrapper from "@/src/shared/components/FormWrapper";
import { VEHICLE_STATUS } from "@/src/features/ap/configuraciones/vehiculos/estados-vehiculo/lib/vehicleStatus.constants";

export default function EditVehicleStatusPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL } = VEHICLE_STATUS;

  const { data: VehicleStatus, isLoading: loadingVehicleStatus } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findVehicleStatusById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: VehicleStatusSchema) =>
      updateVehicleStatus(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router.push("../");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    },
  });

  const handleSubmit = (data: VehicleStatusSchema) => {
    mutate(data);
  };

  function mapVehicleStatusToForm(
    data: VehicleStatusResource
  ): Partial<VehicleStatusSchema> {
    return {
      code: data.code,
      description: data.description,
      use: data.use,
      color: data.color,
    };
  }

  const isLoadingAny = loadingVehicleStatus || !VehicleStatus;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <VehicleStatusForm
        defaultValues={mapVehicleStatusToForm(VehicleStatus)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
