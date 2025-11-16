"use client";

import { notFound, useRouter } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import FormWrapper from "@/src/shared/components/FormWrapper";
import { WAREHOUSE } from "@/src/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.constants";
import { storeWarehouse } from "@/src/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.actions";
import { WarehouseSchema } from "@/src/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.schema";
import { WarehouseForm } from "@/src/features/ap/configuraciones/maestros-general/almacenes/components/WarehouseForm";

export default function CreateWarehousePage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = WAREHOUSE;

  const { mutate, isPending } = useMutation({
    mutationFn: storeWarehouse,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router.push("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: WarehouseSchema) => {
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
