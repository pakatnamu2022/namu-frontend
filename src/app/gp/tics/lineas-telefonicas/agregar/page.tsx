"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { PhoneLineForm } from "@/features/gp/tics/phoneLine/components/PhoneLineForm";
import { PhoneLineSchema } from "@/features/gp/tics/phoneLine/lib/phoneLine.schema";
import { storePhoneLine } from "@/features/gp/tics/phoneLine/lib/phoneLine.actions";
import {
  useAllTelephoneAccounts,
  useAllTelephonePlans,
} from "@/features/gp/tics/phoneLine/lib/phoneLine.hook";
import { ERROR_MESSAGE, errorToast, successToast } from "@/core/core.function";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { PHONE_LINE } from "@/features/gp/tics/phoneLine/lib/phoneLine.constants";
import FormSkeleton from "@/shared/components/FormSkeleton";

export default function AddPhoneLinePage() {
  const router = useNavigate();
  const { ABSOLUTE_ROUTE, EMPTY, MODEL } = PHONE_LINE;
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: telephoneAccounts, isLoading: loadingAccounts } =
    useAllTelephoneAccounts();
  const { data: telephonePlans, isLoading: loadingPlans } =
    useAllTelephonePlans();

  const { mutate, isPending } = useMutation({
    mutationFn: storePhoneLine,
    onSuccess: () => {
      successToast("Línea telefónica creada exitosamente");
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message || ERROR_MESSAGE(MODEL, "create"),
      );
    },
  });

  const handleSubmit = (data: PhoneLineSchema) => {
    mutate({
      ...data,
      telephone_account_id: Number(data.telephone_account_id),
      telephone_plan_id: Number(data.telephone_plan_id),
    });
  };

  if (loadingAccounts || loadingPlans) return <FormSkeleton />;
  if (!checkRouteExists("lineas-telefonicas")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <PhoneLineForm
        defaultValues={EMPTY!}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        telephoneAccounts={telephoneAccounts ?? []}
        telephonePlans={telephonePlans ?? []}
      />
    </FormWrapper>
  );
}
