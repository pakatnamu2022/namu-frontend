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
import { ASSIGN_SALES_SERIES } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.constants";
import { storeAssignSalesSeries } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.actions";
import { AssignSalesSeriesSchema } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.schema";
import { AssignSalesSeriesForm } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-venta/components/AssignSalesSeriesForm";

export default function CreateAssignSalesSeriesPage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = ASSIGN_SALES_SERIES;

  const { mutate, isPending } = useMutation({
    mutationFn: storeAssignSalesSeries,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router.push("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: AssignSalesSeriesSchema) => {
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
      <AssignSalesSeriesForm
        defaultValues={{
          series: "",
          correlative_start: 0,
          type_receipt_id: "",
          type_operation_id: "",
          sede_id: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
