"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { updateBonus } from "@/features/gp/gestionhumana/planillas/bonuses/lib/bonus.actions";
import { BonusSchema } from "@/features/gp/gestionhumana/planillas/bonuses/lib/bonus.schema";
import { BonusResource } from "@/features/gp/gestionhumana/planillas/bonuses/lib/bonus.interface";
import { BonusForm } from "@/features/gp/gestionhumana/planillas/bonuses/components/BonusForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { BONUS } from "@/features/gp/gestionhumana/planillas/bonuses/lib/bonus.constant";
import { useBonusById } from "@/features/gp/gestionhumana/planillas/bonuses/lib/bonus.hook";

export default function UpdateBonusPage() {
  const { MODEL, ABSOLUTE_ROUTE, QUERY_KEY, ROUTE } = BONUS;
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: bonus, isLoading: loadingBonus } = useBonusById(Number(id));

  const { mutate, isPending } = useMutation({
    mutationFn: (data: BonusSchema) => updateBonus(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "update"),
      );
    },
  });

  const handleSubmit = (data: BonusSchema) => {
    mutate(data);
  };

  function mapToForm(data: BonusResource): Partial<BonusSchema> {
    return {
      worker_id: String(data.worker_id),
      period_id: String(data.period_id),
      amount: String(data.amount),
      type_id: String(data.type_id),
    };
  }

  if (loadingBonus || !bonus) {
    return <div className="p-4 text-muted">Cargando bonificación...</div>;
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
      <BonusForm
        defaultValues={mapToForm(bonus)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </FormWrapper>
  );
}
