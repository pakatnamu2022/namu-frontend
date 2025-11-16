"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import FormWrapper from "@/src/shared/components/FormWrapper";
import { ASSIGN_SALES_SERIES } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.constants";
import {
  findAssignSalesSeriesById,
  updateAssignSalesSeries,
} from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.actions";
import { AssignSalesSeriesSchema } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.schema";
import { AssignSalesSeriesResource } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.interface";
import { AssignSalesSeriesForm } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-venta/components/AssignSalesSeriesForm";

export default function EditAssignSalesSeriesPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL } = ASSIGN_SALES_SERIES;

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
      router.push("../");
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
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

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
