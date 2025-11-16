"use client";

import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { DistrictForm } from "@/src/features/ap/configuraciones/maestros-general/ubigeos/components/DistrictForm";
import { storeDistrict } from "@/src/features/ap/configuraciones/maestros-general/ubigeos/lib/district.actions";
import { DISTRICT } from "@/src/features/ap/configuraciones/maestros-general/ubigeos/lib/district.constants";
import { DistrictSchema } from "@/src/features/ap/configuraciones/maestros-general/ubigeos/lib/district.schema";
import FormWrapper from "@/src/shared/components/FormWrapper";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import { notFound, useRouter } from "next/navigation";

export default function CreateDistrictPage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = DISTRICT;

  const { mutate, isPending } = useMutation({
    mutationFn: storeDistrict,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router.push("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: DistrictSchema) => {
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
