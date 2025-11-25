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
import { notFound } from "@/shared/hooks/useNotFound";
import { PARENT_WAREHOUSE } from "@/features/ap/configuraciones/maestros-general/almacenes-padre/lib/parentWarehouse.constants";
import { storeParentWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes-padre/lib/parentWarehouse.actions";
import { ParentWarehouseSchema } from "@/features/ap/configuraciones/maestros-general/almacenes-padre/lib/parentWarehouse.schema";
import { ParentWarehouseForm } from "@/features/ap/configuraciones/maestros-general/almacenes-padre/components/ParentWarehouseForm";

export default function AddParentWarehousePage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = PARENT_WAREHOUSE;

  const { mutate, isPending } = useMutation({
    mutationFn: storeParentWarehouse,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: ParentWarehouseSchema) => {
    mutate(data);
  };
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <ParentWarehouseForm
        defaultValues={{
          dyn_code: "",
          type_operation_id: "",
          sede_id: "",
          is_received: true,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
