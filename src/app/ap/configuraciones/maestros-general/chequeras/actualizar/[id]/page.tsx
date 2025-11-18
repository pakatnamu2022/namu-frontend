"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  findApBankById,
  updateApBank,
} from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.actions";
import { ApBankSchema } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { ApBankResource } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.interface";
import FormSkeleton from "@/shared/components/FormSkeleton";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { ApBankForm } from "@/features/ap/configuraciones/maestros-general/chequeras/components/ApBankForm";
import FormWrapper from "@/shared/components/FormWrapper";
import { BANK_AP } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.constants";
import { notFound } from "@/shared/hooks/useNotFound";

export default function UpdateApBankPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { MODEL, QUERY_KEY, ROUTE, ABSOLUTE_ROUTE } = BANK_AP;

  const { data: ApBank, isLoading: loadingApBank } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findApBankById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ApBankSchema) => updateApBank(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: ApBankSchema) => {
    mutate(data);
  };

  function mapApBankToForm(data: ApBankResource): Partial<ApBankSchema> {
    return {
      code: data.code,
      account_number: data.account_number,
      cci: data.cci,
      bank_id: String(data.bank_id),
      currency_id: String(data.currency_id),
      company_branch_id: String(data.company_branch_id),
      sede_id: String(data.sede_id),
    };
  }

  const isLoadingAny = loadingApBank || !ApBank;

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
      <ApBankForm
        defaultValues={mapApBankToForm(ApBank)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
