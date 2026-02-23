"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PhoneLineForm } from "@/features/gp/tics/phoneLine/components/PhoneLineForm";
import { PhoneLineSchema } from "@/features/gp/tics/phoneLine/lib/phoneLine.schema";
import {
  findPhoneLineById,
  updatePhoneLine,
} from "@/features/gp/tics/phoneLine/lib/phoneLine.actions";
import { errorToast, successToast } from "@/core/core.function";
import { PhoneLineResource } from "@/features/gp/tics/phoneLine/lib/phoneLine.interface";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { PHONE_LINE } from "@/features/gp/tics/phoneLine/lib/phoneLine.constants";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useAllTelephoneAccounts } from "@/features/gp/tics/telephoneAccount/lib/telephoneAccount.hook";
import { useAllTelephonePlans } from "@/features/gp/tics/telephonePlan/lib/telephonePlan.hook";

export default function UpdatePhoneLinePage() {
  const { ABSOLUTE_ROUTE, QUERY_KEY } = PHONE_LINE;
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: phoneLine, isLoading: loadingPhoneLine } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findPhoneLineById(Number(id as string)),
    refetchOnWindowFocus: false,
  });

  const { data: telephoneAccounts, isLoading: loadingAccounts } =
    useAllTelephoneAccounts();
  const { data: telephonePlans, isLoading: loadingPlans } =
    useAllTelephonePlans();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PhoneLineSchema) =>
      updatePhoneLine(Number(id as string), data),
    onSuccess: async () => {
      successToast("Línea telefónica actualizada correctamente");
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE);
    },
    onError: () => {
      errorToast("No se pudo actualizar la línea telefónica");
    },
  });

  const handleSubmit = (data: PhoneLineSchema) => {
    mutate({
      ...data,
      telephone_account_id: Number(data.telephone_account_id),
      telephone_plan_id: Number(data.telephone_plan_id),
    } as any);
  };

  function mapPhoneLineToForm(
    data: PhoneLineResource,
  ): Partial<PhoneLineSchema> {
    return {
      telephone_account_id: data.telephone_account_id?.toString() || "",
      telephone_plan_id: data.telephone_plan_id?.toString() || "",
      line_number: data.line_number ?? "",
      is_active: data.is_active ?? false,
    };
  }

  const isLoadingAny =
    loadingPhoneLine ||
    !phoneLine ||
    loadingAccounts ||
    !telephoneAccounts ||
    loadingPlans ||
    !telephonePlans;

  if (isLoadingAny) return <FormSkeleton />;
  if (!checkRouteExists("lineas-telefonicas")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <PhoneLineForm
        defaultValues={mapPhoneLineToForm(phoneLine)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        telephoneAccounts={telephoneAccounts ?? []}
        telephonePlans={telephonePlans ?? []}
      />
    </FormWrapper>
  );
}
