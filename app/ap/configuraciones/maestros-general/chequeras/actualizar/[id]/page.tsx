"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import {
  findApBankById,
  updateApBank,
} from "@/src/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.actions";
import { ApBankSchema } from "@/src/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { ApBankResource } from "@/src/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.interface";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { ApBankForm } from "@/src/features/ap/configuraciones/maestros-general/chequeras/components/ApBankForm";
import FormWrapper from "@/src/shared/components/FormWrapper";
import { BANK_AP } from "@/src/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.constants";

export default function EditApBankPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { MODEL, QUERY_KEY, ROUTE } = BANK_AP;

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
      router.push("../");
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
