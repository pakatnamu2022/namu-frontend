"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { updateLiquidacionBbss } from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/lib/liquidacion-bbss.actions";
import { LiquidacionBbssSchema } from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/lib/liquidacion-bbss.schema";
import { LiquidacionBbssResource } from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/lib/liquidacion-bbss.interface";
import { LiquidacionBbssForm } from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/components/LiquidacionBbssForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { LIQUIDACION_BBSS } from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/lib/liquidacion-bbss.constant";
import { useLiquidacionBbssById } from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/lib/liquidacion-bbss.hook";

export default function UpdateLiquidacionBbssPage() {
  const { MODEL, ABSOLUTE_ROUTE, QUERY_KEY, ROUTE } = LIQUIDACION_BBSS;
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: liquidacion, isLoading: loadingLiquidacion } =
    useLiquidacionBbssById(Number(id));

  const { mutate, isPending } = useMutation({
    mutationFn: (data: LiquidacionBbssSchema) =>
      updateLiquidacionBbss(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "update"),
      );
    },
  });

  const handleSubmit = (data: LiquidacionBbssSchema) => {
    mutate(data);
  };

  function mapToForm(
    data: LiquidacionBbssResource,
  ): Partial<LiquidacionBbssSchema> {
    return {
      worker_id: String(data.worker_id),
      period_id: String(data.period_id),
      amount: String(data.amount),
      type_id: String(data.type_id), // Assuming you have a way to map type to type_id
    };
  }

  const isLoadingAny = loadingLiquidacion || !liquidacion;

  if (isLoadingAny) {
    return <div className="p-4 text-muted">Cargando liquidación BBSS...</div>;
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
      <LiquidacionBbssForm
        defaultValues={mapToForm(liquidacion)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </FormWrapper>
  );
}
