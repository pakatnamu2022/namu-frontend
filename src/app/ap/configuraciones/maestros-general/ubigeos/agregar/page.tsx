"use client";

import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DistrictForm } from "@/features/ap/configuraciones/maestros-general/ubigeos/components/DistrictForm";
import { storeDistrict } from "@/features/ap/configuraciones/maestros-general/ubigeos/lib/district.actions";
import { DISTRICT } from "@/features/ap/configuraciones/maestros-general/ubigeos/lib/district.constants";
import { DistrictSchema } from "@/features/ap/configuraciones/maestros-general/ubigeos/lib/district.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import NotFound from "@/app/not-found";

export default function CreateDistrictPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = DISTRICT;

  const { mutate, isPending } = useMutation({
    mutationFn: storeDistrict,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: DistrictSchema) => {
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
      <DistrictForm
        defaultValues={{
          name: "",
          ubigeo: "",
          province_id: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
