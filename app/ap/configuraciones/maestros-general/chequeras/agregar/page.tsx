"use client";

import { notFound, useRouter } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { storeApBank } from "@/src/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.actions";
import { ApBankSchema } from "@/src/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.schema";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { ApBankForm } from "@/src/features/ap/configuraciones/maestros-general/chequeras/components/ApBankForm";
import FormWrapper from "@/src/shared/components/FormWrapper";
import { BANK_AP } from "@/src/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.constants";

export default function CreateApBankPage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { MODEL, ROUTE } = BANK_AP;

  const { mutate, isPending } = useMutation({
    mutationFn: storeApBank,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router.push("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    },
  });

  const handleSubmit = (data: ApBankSchema) => {
    mutate(data);
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
