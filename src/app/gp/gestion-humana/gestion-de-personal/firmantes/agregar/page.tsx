"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { SIGNER } from "@/features/gp/gestionhumana/gestion-de-personal/firmantes/lib/signer.constant";
import { storeSigner } from "@/features/gp/gestionhumana/gestion-de-personal/firmantes/lib/signer.actions";
import { SignerSchema } from "@/features/gp/gestionhumana/gestion-de-personal/firmantes/lib/signer.schema";
import { SignerForm } from "@/features/gp/gestionhumana/gestion-de-personal/firmantes/components/SignerForm";

export default function AddSignerPage() {
  const { MODEL, ABSOLUTE_ROUTE, ROUTE } = SIGNER;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeSigner,
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

  const handleSubmit = (data: SignerSchema) => {
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
      <SignerForm onSubmit={handleSubmit} isSubmitting={isPending} mode="create" defaultValues={{}} />
    </FormWrapper>
  );
}
