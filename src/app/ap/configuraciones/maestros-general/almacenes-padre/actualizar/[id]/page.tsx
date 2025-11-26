"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { PARENT_WAREHOUSE } from "@/features/ap/configuraciones/maestros-general/almacenes-padre/lib/parentWarehouse.constants";
import {
  findParentWarehouseById,
  updateParentWarehouse,
} from "@/features/ap/configuraciones/maestros-general/almacenes-padre/lib/parentWarehouse.actions";
import { ParentWarehouseSchema } from "@/features/ap/configuraciones/maestros-general/almacenes-padre/lib/parentWarehouse.schema";
import { ParentWarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes-padre/lib/parentWarehouse.interface";
import { ParentWarehouseForm } from "@/features/ap/configuraciones/maestros-general/almacenes-padre/components/ParentWarehouseForm";

export default function UpdateParentWarehousePage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = PARENT_WAREHOUSE;

  const { data: ParentWarehouse, isLoading: loadingParentWarehouse } = useQuery(
    {
      queryKey: [QUERY_KEY, id],
      queryFn: () => findParentWarehouseById(Number(id)),
      refetchOnWindowFocus: false,
    }
  );

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ParentWarehouseSchema) =>
      updateParentWarehouse(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    },
  });

  const handleSubmit = (data: ParentWarehouseSchema) => {
    mutate(data);
  };

  function mapParentWarehouseToForm(
    data: ParentWarehouseResource
  ): Partial<ParentWarehouseSchema> {
    return {
      dyn_code: data.dyn_code,
      type_operation_id: String(data.type_operation_id),
      sede_id: String(data.sede_id),
      is_received: Boolean(data.is_received),
    };
  }

  const isLoadingAny = loadingParentWarehouse || !ParentWarehouse;

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
      <ParentWarehouseForm
        defaultValues={mapParentWarehouseToForm(ParentWarehouse)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
