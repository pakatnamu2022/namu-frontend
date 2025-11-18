"use client";

import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { WAREHOUSE } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.constants";
import { storeWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.actions";
import { WarehouseSchema } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.schema";
import { WarehouseForm } from "@/features/ap/configuraciones/maestros-general/almacenes/components/WarehouseForm";
import NotFound from "@/app/not-found";

export default function CreateWarehousePage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = WAREHOUSE;

  const { mutate, isPending } = useMutation({
    mutationFn: storeWarehouse,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: WarehouseSchema) => {
    mutate(data);
  };
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <WarehouseForm
        defaultValues={{
          dyn_code: "",
          description: "",
          type_operation_id: "",
          sede_id: "",
          article_class_id: "",
          inventory_account: "",
          counterparty_account: "",
          is_received: true,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
