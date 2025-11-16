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
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { SEDE } from "@/features/gp/maestro-general/sede/lib/sede.constants";
import { storeSede } from "@/features/gp/maestro-general/sede/lib/sede.actions";
import { SedeSchema } from "@/features/gp/maestro-general/sede/lib/sede.schema";
import { SedeForm } from "@/features/gp/maestro-general/sede/components/SedeForm";
import NotFound from "@/app/not-found";


export default function CreateSedePage() {
  const router = useNavigate();
    const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = SEDE;

  const { mutate, isPending } = useMutation({
    mutationFn: storeSede,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: SedeSchema) => {
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
      <SedeForm
        defaultValues={{
          suc_abrev: "",
          abreviatura: "",
          direccion: "",
          empresa_id: "",
          district_id: "",
          province_id: "",
          department_id: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
