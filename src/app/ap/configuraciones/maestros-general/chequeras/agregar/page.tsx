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
import { storeApBank } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.actions";
import { ApBankSchema } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.schema";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { ApBankForm } from "@/features/ap/configuraciones/maestros-general/chequeras/components/ApBankForm";
import FormWrapper from "@/shared/components/FormWrapper";
import { BANK_AP } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.constants";
import NotFound from '@/app/not-found';


export default function CreateApBankPage() {
  const router = useNavigate();
    const { currentView, checkRouteExists } = useCurrentModule();
  const { MODEL, ROUTE } = BANK_AP;

  const { mutate, isPending } = useMutation({
    mutationFn: storeApBank,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    },
  });

  const handleSubmit = (data: ApBankSchema) => {
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
      <ApBankForm
        defaultValues={{
          code: "",
          account_number: "",
          cci: "",
          bank_id: "",
          currency_id: "",
          company_branch_id: "",
          sede_id: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
