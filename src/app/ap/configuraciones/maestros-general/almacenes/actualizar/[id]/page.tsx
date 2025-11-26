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
import { WAREHOUSE } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.constants";
import {
  findWarehouseById,
  updateWarehouse,
} from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.actions";
import { WarehouseSchema } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.schema";
import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface";
import { WarehouseForm } from "@/features/ap/configuraciones/maestros-general/almacenes/components/WarehouseForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function UpdateWarehousePage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = WAREHOUSE;

  const { data: Warehouse, isLoading: loadingWarehouse } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findWarehouseById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: WarehouseSchema) => updateWarehouse(Number(id), data),
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

  const handleSubmit = (data: WarehouseSchema) => {
    mutate(data);
  };

  function mapWarehouseToForm(
    data: WarehouseResource
  ): Partial<WarehouseSchema> {
    return {
      dyn_code: data.dyn_code,
      description: data.description,
      type_operation_id: String(data.type_operation_id),
      sede_id: String(data.sede_id),
      article_class_id: String(data.article_class_id),
      inventory_account: String(data.inventory_account),
      counterparty_account: String(data.counterparty_account),
      parent_warehouse_id: String(data.parent_warehouse_id),
      is_received: Boolean(data.is_received),
    };
  }

  const isLoadingAny = loadingWarehouse || !Warehouse;

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
      <WarehouseForm
        defaultValues={mapWarehouseToForm(Warehouse)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
