"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { storeLiquidacionBbss } from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/lib/liquidacion-bbss.actions";
import { LiquidacionBbssForm } from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/components/LiquidacionBbssForm";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { LiquidacionBbssSchema } from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/lib/liquidacion-bbss.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { LIQUIDACION_BBSS } from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/lib/liquidacion-bbss.constant";

export default function AddLiquidacionBbssPage() {
  const { MODEL, ABSOLUTE_ROUTE, ROUTE } = LIQUIDACION_BBSS;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeLiquidacionBbss,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "create"),
      );
    },
  });

  const handleSubmit = (data: LiquidacionBbssSchema) => {
    mutate({ ...data, status: 1 });
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
      <LiquidacionBbssForm
        defaultValues={{
          amount: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </FormWrapper>
  );
}
