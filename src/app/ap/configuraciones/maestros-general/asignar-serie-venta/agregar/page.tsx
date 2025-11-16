"use client";

import { useNavigate } from 'react-router-dom';
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
import { ASSIGN_SALES_SERIES } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.constants";
import { storeAssignSalesSeries } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.actions";
import { AssignSalesSeriesSchema } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.schema";
import { AssignSalesSeriesForm } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/components/AssignSalesSeriesForm";
import NotFound from "@/app/not-found";


export default function CreateAssignSalesSeriesPage() {
  const router = useNavigate();
    const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = ASSIGN_SALES_SERIES;

  const { mutate, isPending } = useMutation({
    mutationFn: storeAssignSalesSeries,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: AssignSalesSeriesSchema) => {
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
