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
import FormWrapper from "@/src/shared/components/FormWrapper";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { SEDE } from "@/src/features/gp/maestro-general/sede/lib/sede.constants";
import { storeSede } from "@/src/features/gp/maestro-general/sede/lib/sede.actions";
import { SedeSchema } from "@/src/features/gp/maestro-general/sede/lib/sede.schema";
import { SedeForm } from "@/src/features/gp/maestro-general/sede/components/SedeForm";

export default function CreateSedePage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = SEDE;

  const { mutate, isPending } = useMutation({
    mutationFn: storeSede,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router.push("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: SedeSchema) => {
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
