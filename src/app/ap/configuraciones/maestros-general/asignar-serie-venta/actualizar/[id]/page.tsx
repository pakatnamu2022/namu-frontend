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
import { ASSIGN_SALES_SERIES } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.constants";
import {
  findAssignSalesSeriesById,
  updateAssignSalesSeries,
} from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.actions";
import { AssignSalesSeriesSchema } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.schema";
import { AssignSalesSeriesResource } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.interface";
import { AssignSalesSeriesForm } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/components/AssignSalesSeriesForm";
import NotFound from "@/app/not-found";

export default function UpdateAssignSalesSeriesPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = ASSIGN_SALES_SERIES;

  const { data: AssignSalesSeries, isLoading: loadingAssignSalesSeries } =
    useQuery({
      queryKey: [QUERY_KEY, id],
      queryFn: () => findAssignSalesSeriesById(Number(id)),
      refetchOnWindowFocus: false,
    });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: AssignSalesSeriesSchema) =>
      updateAssignSalesSeries(Number(id), data),
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

  const handleSubmit = (data: AssignSalesSeriesSchema) => {
    mutate(data);
  };

  function mapAssignSalesSeriesToForm(
    data: AssignSalesSeriesResource
  ): Partial<AssignSalesSeriesSchema> {
    return {
      series: data.series,
      correlative_start: data.correlative_start,
      type_receipt_id: String(data.type_receipt_id),
      type_operation_id: String(data.type_operation_id),
      sede_id: String(data.sede_id),
    };
  }

  const isLoadingAny = loadingAssignSalesSeries || !AssignSalesSeries;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <AssignSalesSeriesForm
        defaultValues={mapAssignSalesSeriesToForm(AssignSalesSeries)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
